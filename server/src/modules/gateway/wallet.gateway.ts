import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { Logger, UnauthorizedException } from "@nestjs/common";

export interface BalanceUpdatePayload {
  balance: string;
  currency: string;
}

export interface TransferNotificationPayload {
  from: string;
  amount: string;
  transactionId: string;
}

@WebSocketGateway({
  cors: { origin: "*", credentials: true },
  namespace: "/wallet",
})
export class WalletGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WalletGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        throw new UnauthorizedException("No token provided");
      }

      const payload: { sub: string; email: string } =
        await this.jwtService.verifyAsync(token);
      socket.data.user = payload;

      const userId = payload.sub;
      await socket.join(`user:${userId}`);

      this.logger.log(`Client connected: ${socket.id}, User: ${userId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      this.logger.error(`Connection rejected: ${errorMessage}`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  emitBalanceUpdate(userId: string, payload: BalanceUpdatePayload) {
    this.server.to(`user:${userId}`).emit("balance:updated", {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  emitTransferNotification(
    userId: string,
    payload: TransferNotificationPayload,
  ) {
    this.server.to(`user:${userId}`).emit("transfer:received", {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
