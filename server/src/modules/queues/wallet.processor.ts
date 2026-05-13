import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { WalletGatewayService } from "../gateway/wallet-gateway.service";

interface BalanceUpdateData {
  userId: string;
  balance: string;
  currency: string;
}

interface TransferNotificationData {
  userId: string;
  fromUsername: string;
  amount: string;
  transactionId: string;
}

@Processor("wallet-updates")
export class WalletProcessor extends WorkerHost {
  private readonly logger = new Logger(WalletProcessor.name);

  constructor(private readonly gatewayService: WalletGatewayService) {
    super();
  }

  async process(job: Job<any>) {
    const { userId } = job.data;
    this.logger.log(
      `[Job] Starting wallet update processing: ${job.name} for user: ${userId}`,
    );

    switch (job.name) {
      case "balance-update": {
        const { balance, currency } = job.data as BalanceUpdateData;
        this.gatewayService.emitBalanceUpdate(userId, balance, currency);
        this.logger.log(`[Socket] Balance update emitted for user: ${userId}`);
        break;
      }
      case "transfer-notification": {
        const { fromUsername, amount, transactionId } =
          job.data as TransferNotificationData;
        this.gatewayService.emitTransferNotification(
          userId,
          fromUsername,
          amount,
          transactionId,
        );
        this.logger.log(
          `[Socket] Transfer notification emitted for user: ${userId}`,
        );
        break;
      }
      default:
        this.logger.warn(`[Warning] Unknown job name: ${job.name}`);
    }
  }
}
