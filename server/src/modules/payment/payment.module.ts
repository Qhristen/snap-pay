import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { PaymentController } from './payment.controller';
import { WebhookController } from './webhook.controller';
import { PaystackService } from './paystack.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    BullModule.registerQueue({
      name: 'webhooks',
    }),
    WalletModule,
  ],
  controllers: [PaymentController, WebhookController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaymentModule {}
