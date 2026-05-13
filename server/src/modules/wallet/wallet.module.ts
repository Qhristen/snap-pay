import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { Wallet } from "./entities/wallet.entity";
import { BankAccount } from "./entities/bank-account.entity";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";
import { UsersModule } from "../users/users.module";
import { GatewayModule } from "../gateway/gateway.module";
import { AuditModule } from "../audit/audit.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, BankAccount]),
    BullModule.registerQueue({ name: "withdrawal-processing" }),
    BullModule.registerQueue({ name: "wallet-updates" }),
    forwardRef(() => UsersModule),
    GatewayModule,
    AuditModule,
    TransactionsModule,
    NotificationsModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
