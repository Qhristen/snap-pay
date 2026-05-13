import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { DataSource } from "typeorm";
import { Transaction } from "../transactions/entities/transaction.entity";
import { Wallet } from "../wallet/entities/wallet.entity";
import { TransactionStatus } from "../../common/enums/transaction.enum";
import { WalletGatewayService } from "../gateway/wallet-gateway.service";
import Decimal from "decimal.js";

@Processor("withdrawal-processing")
export class WithdrawalProcessor extends WorkerHost {
  private readonly logger = new Logger(WithdrawalProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly gatewayService: WalletGatewayService,
  ) {
    super();
  }

  async process(
    job: Job<{ withdrawalId: string; userId: string; amount: number }>,
  ) {
    const { withdrawalId, userId, amount } = job.data;
    this.logger.log({ event: "processing_withdrawal", withdrawalId });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: withdrawalId },
      });

      if (!transaction) {
        this.logger.error(`Transaction ${withdrawalId} not found`);
        return;
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        this.logger.warn(
          `Transaction ${withdrawalId} is already ${transaction.status}`,
        );
        return;
      }

      // SIMULATION: Call External Payout API (e.g. Paystack Transfer)
      this.logger.log({ event: "payout_api_call", withdrawalId, amount });

      // Assume success for now. In a real app, you'd check response from Paystack
      const isSuccess = true;

      if (isSuccess) {
        transaction.status = TransactionStatus.SUCCESSFUL;
        await queryRunner.manager.save(transaction);

        await queryRunner.commitTransaction();
        this.logger.log({ event: "withdrawal_success", withdrawalId });

        this.gatewayService.emitTransferNotification(
          userId,
          "System",
          new Decimal(amount).dividedBy(100).toFixed(2),
          withdrawalId,
        );
      } else {
        // REFUND logic if payout failed
        const wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId },
          lock: { mode: "pessimistic_write" },
        });

        if (wallet) {
          wallet.balance = new Decimal(wallet.balance).plus(amount).toNumber();
          await queryRunner.manager.save(wallet);
        }

        transaction.status = TransactionStatus.FAILED;
        await queryRunner.manager.save(transaction);

        await queryRunner.commitTransaction();
        this.logger.error({
          event: "withdrawal_failed_and_refunded",
          withdrawalId,
        });

        const balanceNaira = new Decimal(wallet?.balance || 0)
          .dividedBy(100)
          .toFixed(2);
        this.gatewayService.emitBalanceUpdate(
          userId,
          balanceNaira,
          wallet?.currency || "NGN",
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error({
        event: "withdrawal_processor_error",
        withdrawalId,
        error: error.message,
      });
      throw error; // Retry
    } finally {
      await queryRunner.release();
    }
  }
}
