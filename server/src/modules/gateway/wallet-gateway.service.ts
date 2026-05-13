import { Injectable } from '@nestjs/common';
import { WalletGateway } from './wallet.gateway';

@Injectable()
export class WalletGatewayService {
  constructor(private readonly walletGateway: WalletGateway) {}

  emitBalanceUpdate(userId: string, balance: string, currency: string) {
    this.walletGateway.emitBalanceUpdate(userId, { balance, currency });
  }

  emitTransferNotification(userId: string, fromUsername: string, amount: string, transactionId: string) {
    this.walletGateway.emitTransferNotification(userId, {
      from: fromUsername,
      amount,
      transactionId,
    });
  }
}
