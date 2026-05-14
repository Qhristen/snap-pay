import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { DataSource } from "typeorm";
import { Transaction } from "../transactions/entities/transaction.entity";
import { TransactionStatus } from "../../common/enums/transaction.enum";
import { WalletGatewayService } from "../gateway/wallet-gateway.service";
import { PaystackService } from "../payment/paystack.service";
import { WalletService } from "../wallet/wallet.service";
import Decimal from "decimal.js";

@Processor("withdrawal-processing")
export class WithdrawalProcessor extends WorkerHost {
  private readonly logger = new Logger(WithdrawalProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly gatewayService: WalletGatewayService,
    private readonly paystackService: PaystackService,
    private readonly walletService: WalletService,
  ) {
    super();
  }

  async process(
    job: Job<{
      withdrawalId: string;
      userId: string;
      amount: number;
      recipientCode: string;
      reference: string;
    }>,
  ) {
    const { withdrawalId, userId, amount, recipientCode, reference } = job.data;
    this.logger.log({ event: "processing_withdrawal", withdrawalId, reference });

    try {
      const transaction = await this.dataSource
        .getRepository(Transaction)
        .findOne({ where: { id: withdrawalId } });

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

      // Call Paystack Transfer API
      this.logger.log({ event: "payout_api_call", withdrawalId, amount });

      try {
        await this.paystackService.initiateTransfer(
          recipientCode,
          amount, // amount in Naira? PaymentController passes Naira.
          reference,
          "Wallet withdrawal",
        );

        // Withdrawal is initiated successfully on Paystack.
        // We keep it as PENDING because we'll wait for the webhook to finalize it.
        // Or we can mark it as success if the API call was successful?
        // Paystack initiateTransfer returns status "otp" or "pending" or "success".
        // Usually it's better to wait for webhook for final success.
  
        this.logger.log({ event: "withdrawal_initiated_on_paystack", withdrawalId });
        
      } catch (error) {
        this.logger.error({
          event: "withdrawal_failed_on_paystack",
          withdrawalId,
          error: error.message,
        });

        // Reverse the debit if transfer initiation fails
        await this.walletService.reverseWithdrawal(reference);
        
        this.logger.log({
          event: "withdrawal_refunded",
          withdrawalId,
          reference,
        });
      }
    } catch (error) {
      this.logger.error({
        event: "withdrawal_processor_error",
        withdrawalId,
        error: error.message,
      });
      throw error; // Retry
    }
  }
}
