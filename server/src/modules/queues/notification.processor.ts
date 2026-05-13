import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../notifications/entities/notification.entity';
import { WalletGatewayService } from '../gateway/wallet-gateway.service';

interface NotificationJobData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

@Processor('notification-processing')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly gatewayService: WalletGatewayService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>) {
    const { userId, title, message, type } = job.data;
    this.logger.log(`[Job] Starting notification processing for user: ${userId}, Job ID: ${job.id}`);

    try {
      const notification = this.notificationRepository.create({
        userId,
        title,
        message,
        type,
      });

      const savedNotification = await this.notificationRepository.save(notification);
      this.logger.log(`[Database] Notification saved with ID: ${savedNotification.id}`);

      // Emit socket event via service
      this.gatewayService.emitNotification(userId, savedNotification);
      this.logger.log(`[Socket] Emission requested for user: ${userId}`);

      return savedNotification;
    } catch (error) {
      this.logger.error(`[Error] Failed to process notification for user ${userId}: ${error.message}`);
      throw error;
    }
  }
}
