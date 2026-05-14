import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { TransactionStatus, TransactionType } from "../../common/enums";

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: Record<string, unknown>;
    transfer_code?: string;
    recipient?: {
      recipient_code: string;
    };
  };
}

@Processor("webhooks")
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(private readonly walletService: WalletService) {
    super();
  }

  async process(job: Job<PaystackWebhookEvent, any, string>): Promise<any> {
    const { event, data } = job.data;
    this.logger.log(`Processing webhook job ${job.id} of type ${event}...`);

    try {
      switch (event) {
        case "charge.success":
          await this.handleChargeSuccess(data);
          break;

        case "transfer.success":
          await this.handleTransferSuccess(data);
          break;

        case "transfer.failed":
          await this.handleTransferFailed(data);
          break;

        case "transfer.reversed":
          await this.handleTransferReversed(data);
          break;

        default:
          this.logger.log(`Unhandled Paystack event in queue: ${event}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook job ${job.id}:`, error);
      throw error; // Let Bull handle retries
    }

    return { processed: true };
  }

  private async handleChargeSuccess(data: PaystackWebhookEvent["data"]) {
    let { reference, amount, metadata, status } = data;

    // Paystack might return metadata as a JSON string
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        this.logger.error(`Failed to parse metadata for transaction ${reference}`);
      }
    }

    // We only handle wallet funding (deposits) via this webhook
    if (metadata?.type !== "wallet_funding" && metadata?.type !== "deposit") {
      this.logger.log(
        `Charge ${reference} is not a wallet funding event. Type: ${metadata?.type}`,
      );
      return;
    }

    const userId = (metadata as any)?.userId as string;
    if (!userId) {
      this.logger.error(`No userId in charge metadata: ${reference}`);
      return;
    }

    // Check if already processed
    const existingTransaction =
      await this.walletService.getTransactionByReference(reference);
    if (
      existingTransaction &&
      existingTransaction.status !== TransactionStatus.PENDING
    ) {
      this.logger.log(
        `Transaction ${reference} already processed or in final state`,
      );
      return;
    }

    if (status === "success") {
      // Paystack amount is in kobo, WalletService.creditWallet expects Naira
      const amountInNaira = new Decimal(amount).dividedBy(100).toNumber();

      await this.walletService.creditWallet(
        userId,
        amountInNaira,
        reference,
      );

      this.logger.log(
        `Successfully credited ₦${amountInNaira.toLocaleString()} to user ${userId} for reference ${reference}`,
      );
    }
  }

  private async handleTransferSuccess(data: PaystackWebhookEvent["data"]) {
    const { reference } = data;

    const existingTransaction =
      await this.walletService.getTransactionByReference(reference);
    if (
      existingTransaction &&
      existingTransaction.status !== TransactionStatus.PENDING
    ) {
      this.logger.log(`Transfer ${reference} already processed`);
      return;
    }

    await this.walletService.confirmWithdrawal(reference);
    this.logger.log(`Transfer ${reference} confirmed successfully`);
  }

  private async handleTransferFailed(data: PaystackWebhookEvent["data"]) {
    const { reference } = data;

    const existingTransaction =
      await this.walletService.getTransactionByReference(reference);
    if (
      existingTransaction &&
      existingTransaction.status !== TransactionStatus.PENDING
    ) {
      this.logger.log(`Transfer failure ${reference} already processed`);
      return;
    }

    await this.walletService.reverseWithdrawal(reference);
    this.logger.log(
      `Transfer ${reference} failed, funds reversed to user wallet`,
    );
  }

  private async handleTransferReversed(data: PaystackWebhookEvent["data"]) {
    const { reference } = data;

    const existingTransaction =
      await this.walletService.getTransactionByReference(reference);
    if (
      existingTransaction &&
      existingTransaction.status !== TransactionStatus.PENDING
    ) {
      this.logger.log(`Transfer reversal ${reference} already processed`);
      return;
    }

    await this.walletService.reverseWithdrawal(reference);
    this.logger.log(
      `Transfer ${reference} was reversed, funds returned to user wallet`,
    );
  }

  @OnWorkerEvent("active")
  onActive(job: Job) {
    this.logger.log(`Webhook job ${job.id} started.`);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Webhook job ${job.id} completed.`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, error: Error) {
    this.logger.error(`Webhook job ${job.id} failed: ${error.message}`);
  }
}
