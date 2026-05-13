import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import Decimal from 'decimal.js';
import { Wallet } from './entities/wallet.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionStatus, TransactionType } from '../../common/enums/transaction.enum';
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet.dto';
import { User } from '../users/entities/user.entity';
import { WalletGatewayService } from '../gateway/wallet-gateway.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly gatewayService: WalletGatewayService,
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
    @InjectQueue('withdrawal-processing') private readonly withdrawalQueue: Queue,
  ) {}

  private generateReference(prefix: string = 'TXN'): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  async deposit(user: User, dto: DepositDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: user.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      const amountKobo = new Decimal(dto.amount).times(100);
      wallet.balance = new Decimal(wallet.balance).plus(amountKobo).toNumber();
      await queryRunner.manager.save(wallet);

      const transaction = queryRunner.manager.create(Transaction, {
        userId: user.id,
              reference: this.generateReference('DEP'),
        amount: amountKobo.toNumber(),
        description: "Deposit to wallet",
        status: TransactionStatus.SUCCESSFUL,
        type: TransactionType.DEPOSIT,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      const balanceNaira = new Decimal(wallet.balance).dividedBy(100).toFixed(2);
      this.gatewayService.emitBalanceUpdate(user.id, balanceNaira, wallet.currency);
      await this.auditService.log(user, 'DEPOSIT', 'Wallet', wallet.id, { balance: balanceNaira });

      return {
        balance: parseFloat(balanceNaira),
        transaction: {
          id: transaction.id,
          amount: parseFloat(new Decimal(transaction.amount).dividedBy(100).toFixed(2)),
          createdAt: transaction.createdAt,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(user: User, dto: WithdrawDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: user.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      const amountKobo = new Decimal(dto.amount).times(100);
      if (new Decimal(wallet.balance).lessThan(amountKobo)) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = new Decimal(wallet.balance).minus(amountKobo).toNumber();
      await queryRunner.manager.save(wallet);

      const transaction = queryRunner.manager.create(Transaction, {
        userId: user.id,
        reference: this.generateReference('WTH'),
        amount: amountKobo.toNumber(),
        description: "Withdrawal from wallet",
        status: TransactionStatus.PENDING,
        type: TransactionType.WITHDRAWAL,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      // Push to withdrawal queue for background processing
      await this.withdrawalQueue.add('process-withdrawal', {
        withdrawalId: transaction.id,
        userId: user.id,
        amount: amountKobo.toNumber(),
      });

      const balanceNaira = new Decimal(wallet.balance).dividedBy(100).toFixed(2);
      this.gatewayService.emitBalanceUpdate(user.id, balanceNaira, wallet.currency);
      await this.auditService.log(user, 'WITHDRAWAL_INITIATED', 'Wallet', wallet.id, { balance: balanceNaira });

      return {
        balance: parseFloat(balanceNaira),
        transaction: {
          id: transaction.id,
          status: transaction.status,
          amount: parseFloat(new Decimal(transaction.amount).dividedBy(100).toFixed(2)),
          createdAt: transaction.createdAt,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(user: User, dto: TransferDto) {
    if (user.id === dto.recipientId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const recipient = await this.usersService.findById(dto.recipientId);
    if (!recipient) throw new NotFoundException('Recipient not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingTx = await queryRunner.manager.findOne(Transaction, {
        where: { userId: user.id },
      });

      if (existingTx) {
        await queryRunner.commitTransaction();
        const wallet = await this.dataSource.getRepository(Wallet).findOneBy({ userId: user.id });
        return {
          transaction: {
            id: existingTx.id,
            amount: new Decimal(existingTx.amount).dividedBy(100).toFixed(2),
            createdAt: existingTx.createdAt,
          },
          senderBalance: new Decimal(wallet?.balance || 0).dividedBy(100).toFixed(2),
        };
      }

      const [firstUserId, secondUserId] = user.id < recipient.id 
        ? [user.id, recipient.id] 
        : [recipient.id, user.id];

      const firstWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: firstUserId },
        lock: { mode: 'pessimistic_write' },
      });
      const secondWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: secondUserId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!firstWallet || !secondWallet) throw new NotFoundException('Wallet not found');

      const senderWallet = firstUserId === user.id ? firstWallet : secondWallet;
      const receiverWallet = firstUserId === user.id ? secondWallet : firstWallet;

      const amountKobo = new Decimal(dto.amount).times(100);
      if (new Decimal(senderWallet.balance).lessThan(amountKobo)) {
        throw new BadRequestException('Insufficient balance');
      }

      senderWallet.balance = new Decimal(senderWallet.balance).minus(amountKobo).toNumber();
      receiverWallet.balance = new Decimal(receiverWallet.balance).plus(amountKobo).toNumber();

      await queryRunner.manager.save(senderWallet);
      await queryRunner.manager.save(receiverWallet);

      const senderTx = queryRunner.manager.create(Transaction, {
        userId: user.id,
        reference: this.generateReference('TRF_S'),
        amount: amountKobo.toNumber(),
        description: "Transfer to " + recipient.username,
        status: TransactionStatus.SUCCESSFUL,
        type: TransactionType.TRANSFER,
      });

      const receiverTx = queryRunner.manager.create(Transaction, {
        userId: recipient.id,
        reference: this.generateReference('TRF_R'),
        amount: amountKobo.toNumber(),
        description: "Received from " + user.username,
        status: TransactionStatus.SUCCESSFUL,
        type: TransactionType.TRANSFER,
      });

      await queryRunner.manager.save(senderTx);
      await queryRunner.manager.save(receiverTx);

      await queryRunner.commitTransaction();

      const senderBalanceNaira = new Decimal(senderWallet.balance).dividedBy(100).toFixed(2);
      const receiverBalanceNaira = new Decimal(receiverWallet.balance).dividedBy(100).toFixed(2);
      const amountNaira = amountKobo.dividedBy(100).toFixed(2);

      this.gatewayService.emitBalanceUpdate(user.id, senderBalanceNaira, senderWallet.currency);
      this.gatewayService.emitBalanceUpdate(recipient.id, receiverBalanceNaira, receiverWallet.currency);
      this.gatewayService.emitTransferNotification(recipient.id, user.username, amountNaira, senderTx.id);

      await this.auditService.log(user, 'TRANSFER_SENT', 'Wallet', senderWallet.id, { balance: senderBalanceNaira });
      await this.auditService.log(recipient, 'TRANSFER_RECEIVED', 'Wallet', receiverWallet.id, { balance: receiverBalanceNaira });

      return {
        transaction: {
          id: senderTx.id,
          amount: parseFloat(amountNaira),
          createdAt: senderTx.createdAt,
        },
        senderBalance: parseFloat(senderBalanceNaira),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getBalance(userId: string) {
    const wallet = await this.dataSource.getRepository(Wallet).findOneBy({ userId });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return { 
      balance: parseFloat(new Decimal(wallet.balance).dividedBy(100).toFixed(2)), 
      currency: wallet.currency,
      userId: wallet.userId
    };
  }

  async getWallet(userId: string) {
    const wallet = await this.dataSource.getRepository(Wallet).findOneBy({ userId });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const bankAccount = await this.dataSource.getRepository(BankAccount).findOne({
      where: { userId, isActive: true },
    });

    return {
      ...wallet,
      availableBalance: parseFloat(new Decimal(wallet.balance).dividedBy(100).toFixed(2)),
      bankAccount: bankAccount || null,
    };
  }

  async updateBankAccount(
    userId: string,
    accountNumber: string,
    bankCode: string,
    bankName: string,
    accountName: string,
  ) {
    const repo = this.dataSource.getRepository(BankAccount);
    
    // Deactivate existing bank accounts
    await repo.update({ userId }, { isActive: false });

    let bankAccount = await repo.findOne({
      where: { userId, accountNumber, bankCode },
    });

    if (bankAccount) {
      bankAccount.isActive = true;
      bankAccount.accountName = accountName;
      bankAccount.bankName = bankName;
    } else {
      bankAccount = repo.create({
        userId,
        accountNumber,
        bankCode,
        bankName,
        accountName,
        isActive: true,
      });
    }

    return repo.save(bankAccount);
  }

  async updatePaystackRecipientCode(userId: string, recipientCode: string) {
    const repo = this.dataSource.getRepository(BankAccount);
    const bankAccount = await repo.findOne({
      where: { userId, isActive: true },
    });

    if (!bankAccount) throw new NotFoundException('Active bank account not found');

    bankAccount.paystackRecipientCode = recipientCode;
    return repo.save(bankAccount);
  }

  async listBankAccounts(userId: string) {
    return this.dataSource.getRepository(BankAccount).find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteBankAccount(userId: string, id: string) {
    const repo = this.dataSource.getRepository(BankAccount);
    const bankAccount = await repo.findOne({
      where: { id, userId },
    });

    if (!bankAccount) throw new NotFoundException('Bank account not found');

    return repo.remove(bankAccount);
  }

  async getTransactionByReference(reference: string) {
    return this.dataSource.getRepository(Transaction).findOneBy({ reference });
  }

  async creditWallet(
    userId: string,
    amount: number,
    reference: string,
    type: TransactionType,
    description?: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      const amountKobo = new Decimal(amount).times(100);
      wallet.balance = new Decimal(wallet.balance).plus(amountKobo).toNumber();
      await queryRunner.manager.save(wallet);

      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        reference,
        amount: amountKobo.toNumber(),
        description: description || "Wallet credit",
        status: TransactionStatus.SUCCESSFUL,
        type,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      const balanceNaira = new Decimal(wallet.balance).dividedBy(100).toFixed(2);
      this.gatewayService.emitBalanceUpdate(userId, balanceNaira, wallet.currency);
      
      return transaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async debitWallet(
    userId: string,
    amount: number,
    reference: string,
    type: TransactionType,
    description?: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      const amountKobo = new Decimal(amount).times(100);
      if (new Decimal(wallet.balance).lessThan(amountKobo)) {
        throw new BadRequestException('Insufficient balance');
      }

      wallet.balance = new Decimal(wallet.balance).minus(amountKobo).toNumber();
      await queryRunner.manager.save(wallet);

      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        reference,
        amount: amountKobo.toNumber(),
        description: description || "Wallet debit",
        status: TransactionStatus.PENDING,
        type,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      const balanceNaira = new Decimal(wallet.balance).dividedBy(100).toFixed(2);
      this.gatewayService.emitBalanceUpdate(userId, balanceNaira, wallet.currency);
      
      return transaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmWithdrawal(reference: string) {
    const transaction = await this.dataSource.getRepository(Transaction).findOneBy({ reference });
    if (!transaction) return;

    transaction.status = TransactionStatus.SUCCESSFUL;
    await this.dataSource.getRepository(Transaction).save(transaction);
  }

  async reverseWithdrawal(reference: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { reference },
        lock: { mode: 'pessimistic_write' },
      });

      if (!transaction || transaction.status !== TransactionStatus.PENDING) {
        await queryRunner.rollbackTransaction();
        return;
      }

      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: transaction.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      wallet.balance = new Decimal(wallet.balance).plus(transaction.amount).toNumber();
      await queryRunner.manager.save(wallet);

      transaction.status = TransactionStatus.FAILED;
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      const balanceNaira = new Decimal(wallet.balance).dividedBy(100).toFixed(2);
      this.gatewayService.emitBalanceUpdate(transaction.userId, balanceNaira, wallet.currency);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
