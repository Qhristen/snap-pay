import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { WalletGateway } from "./wallet.gateway";
import { WalletGatewayService } from "./wallet-gateway.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get("jwt.secret"),
        signOptions: { expiresIn: config.get("jwt.accessExpiry") || "7d" },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [WalletGateway, WalletGatewayService],
  exports: [WalletGatewayService],
})
export class GatewayModule {}
