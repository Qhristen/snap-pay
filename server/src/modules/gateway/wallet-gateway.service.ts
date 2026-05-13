import { Injectable } from "@nestjs/common";
import { WalletGateway } from "./wallet.gateway";

@Injectable()
export class WalletGatewayService {
  constructor(private readonly walletGateway: WalletGateway) {}

  emitBalanceUpdate(userId: string, balance: string, currency: string) {
    if (!this.walletGateway.server) return;
    console.log(`[Socket] Emitting balance:updated to user:${userId}`);
    this.walletGateway.emitBalanceUpdate(userId, { balance, currency });
  }

  emitTransferNotification(
    userId: string,
    fromUsername: string,
    amount: string,
    transactionId: string,
  ) {
    if (!this.walletGateway.server) return;
    console.log(`[Socket] Emitting transfer:received to user:${userId}`);
    this.walletGateway.emitTransferNotification(userId, {
      from: fromUsername,
      amount,
      transactionId,
    });
  }

  emitNotification(userId: string, notification: any) {
    if (!this.walletGateway.server) return;
    console.log(`[Socket] Emitting notification:received to user:${userId}`);
    this.walletGateway.server
      .to(`user:${userId}`)
      .emit("notification:received", notification);
  }
}
