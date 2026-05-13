import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { WithdrawalProcessor } from './withdrawal.processor';
import { AuditProcessor } from './audit.processor';
import { MailProcessor } from './mail.processor';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { AuditModule } from '../audit/audit.module';
import { GatewayModule } from '../gateway/gateway.module';
import { WebhookProcessor } from './webhook.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({ name: 'withdrawal-processing' }),
    BullModule.registerQueue({ name: 'audit-processing' }),
    BullModule.registerQueue({ name: 'mail-processing' }),
    BullModule.registerQueue({ name: 'webhooks' }),
    WalletModule,
    TransactionsModule,
    AuditModule,
    GatewayModule,
  ],
  providers: [WithdrawalProcessor, AuditProcessor, MailProcessor, WebhookProcessor],
})
export class QueuesModule { }
