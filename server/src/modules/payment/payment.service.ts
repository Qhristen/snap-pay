import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import Decimal from "decimal.js";
import { DataSource } from "typeorm";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PaystackService } from "./paystack.service";
import { WalletService } from "../wallet/wallet.service";
import {
  TransactionStatus,
  TransactionType,
} from "../../common/enums/transaction.enum";
import { User } from "../users/entities/user.entity";
import { Transaction } from "../transactions/entities/transaction.entity";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paystackService: PaystackService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
    @InjectQueue("withdrawal-processing")
    private readonly withdrawalQueue: Queue,
  ) {}

  async initializeFunding(
    user: User,
    amount: number,
    callbackUrl?: string,
  ) {
    const reference = this.paystackService.generateReference("FUND");
    const amountKobo = Math.round(amount * 100);
    console.log("callbackUrl", callbackUrl);

    // Create a pending transaction record
    await this.dataSource.getRepository(Transaction).save({
      userId: user.id,
      amount: amountKobo,
      reference,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      description: "Deposit via Paystack",
      metadata: {
        userId: user.id,
        type: "wallet_funding",
      },
    });

    const result = await this.paystackService.initializeTransaction(
      user.email,
      amount,
      reference,
      {
        type: "wallet_funding",
        userId: user.id,
      },
      callbackUrl,
    );

    return {
      authorizationUrl: result.authorization_url,
      accessCode: result.access_code,
      reference: result.reference,
    };
  }

  async verifyFunding(user: User, reference: string) {
    const result = await this.paystackService.verifyTransaction(reference);

    if (result.status !== "success") {
      throw new BadRequestException("Payment was not successful");
    }

    // Verify metadata
    const metadata = result.metadata;
    if (metadata?.userId !== user.id) {
      throw new BadRequestException("Payment does not belong to this user");
    }

    // Credit wallet (amount is in kobo, convert to naira)
    const amountInNaira = new Decimal(result.amount).dividedBy(100).toNumber();

    const transaction = await this.walletService.creditWallet(
      user.id,
      amountInNaira,
      reference,
    );

    const { balance } = await this.walletService.getBalance(user.id);

    return {
      transaction,
      balance,
      amount: amountInNaira,
    };
  }

  async addBankAccount(
    user: User,
    accountNumber: string,
    bankCode: string,
  ) {
    // Verify bank account with Paystack
    const accountDetails = await this.paystackService.verifyBankAccount(
      accountNumber,
      bankCode,
    );

    // Get bank name from bank list
    const banks = await this.paystackService.listBanks();
    const bank = banks.find((b) => b.code === bankCode);

    // Create transfer recipient for future withdrawals
    const recipientCode = await this.paystackService.createTransferRecipient(
      accountNumber,
      bankCode,
      accountDetails.account_name,
    );

    // Update wallet with bank details (saves to BankAccount entity)
    const bankAccount = await this.walletService.updateBankAccount(
      user.id,
      accountNumber,
      bankCode,
      bank?.name || "Unknown Bank",
      accountDetails.account_name,
    );

    // Store recipient code
    await this.walletService.updatePaystackRecipientCode(
      user.id,
      recipientCode,
    );

    return bankAccount;
  }

  async initiateWithdrawal(
    user: User,
    amount: number,
  ) {
    // Get wallet and verify balance/bank details
    const wallet = await this.walletService.getWallet(user.id);

    if (wallet.availableBalance < amount) {
      throw new BadRequestException("Insufficient balance");
    }

    if (!wallet.bankAccount || !wallet.bankAccount.paystackRecipientCode) {
      throw new BadRequestException(
        "Please add a bank account before withdrawing",
      );
    }

    const reference = this.paystackService.generateReference("WD");

    // Debit wallet first (creates pending transaction)
    const transaction = await this.walletService.debitWallet(
      user.id,
      amount,
      reference,
      TransactionType.WITHDRAWAL,
      "Wallet withdrawal",
    );

    // Queue for background processing
    await this.withdrawalQueue.add("process-withdrawal", {
      withdrawalId: transaction.id,
      userId: user.id,
      amount,
      recipientCode: wallet.bankAccount.paystackRecipientCode,
      reference,
    });

    const { balance } = await this.walletService.getBalance(user.id);

    return {
      reference,
      amount,
      balance,
    };
  }
}
