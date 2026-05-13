import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { Notification } from "./entities/notification.entity";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { GatewayModule } from "../gateway/gateway.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    BullModule.registerQueue({ name: "notification-processing" }),
    GatewayModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService, TypeOrmModule],
})
export class NotificationsModule {}
