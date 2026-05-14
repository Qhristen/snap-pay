import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { BullModule } from "@nestjs/bullmq";
import { PaymentController } from "./payment.controller";
import { WebhookController } from "./webhook.controller";
import { PaystackService } from "./paystack.service";
import { PaymentService } from "./payment.service";
import { WalletModule } from "../wallet/wallet.module";
import { TransactionsModule } from "../transactions/transactions.module";

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    BullModule.registerQueue(
      { name: "webhooks" },
      { name: "withdrawal-processing" },
    ),
    WalletModule,
    TransactionsModule,
  ],
  controllers: [PaymentController, WebhookController],
  providers: [PaystackService, PaymentService],
  exports: [PaystackService, PaymentService],
})
export class PaymentModule {}
