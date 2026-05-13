import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WalletGateway } from './wallet.gateway';
import { WalletGatewayService } from './wallet-gateway.service';

@Module({
  imports: [JwtModule],
  providers: [WalletGateway, WalletGatewayService],
  exports: [WalletGatewayService],
})
export class GatewayModule {}
