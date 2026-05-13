import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditModule } from '../audit/audit.module';
import { GatewayModule } from '../gateway/gateway.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { WalletModule } from '../wallet/wallet.module';
import { AuditProcessor } from './audit.processor';
import { MailProcessor } from './mail.processor';
import { NotificationProcessor } from './notification.processor';
import { WebhookProcessor } from './webhook.processor';
import { WithdrawalProcessor } from './withdrawal.processor';
import { WalletProcessor } from './wallet.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: 'withdrawal-processing' }),
    BullModule.registerQueue({ name: 'audit-processing' }),
    BullModule.registerQueue({ name: 'mail-processing' }),
    BullModule.registerQueue({ name: 'webhooks' }),
    BullModule.registerQueue({ name: 'notification-processing' }),
    BullModule.registerQueue({ name: 'wallet-updates' }),
    WalletModule,
    TransactionsModule,
    AuditModule,
    GatewayModule,
    NotificationsModule,
  ],
  providers: [
    WithdrawalProcessor, 
    AuditProcessor, 
    MailProcessor, 
    WebhookProcessor, 
    NotificationProcessor,
    WalletProcessor
  ],
})
export class QueuesModule { }
