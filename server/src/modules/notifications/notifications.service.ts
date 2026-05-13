import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectQueue('notification-processing') private readonly notificationQueue: Queue,
  ) {}

  async create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
  ) {
    // Offload to background queue
    await this.notificationQueue.add('send-notification', {
      userId,
      title,
      message,
      type,
    });
  }

  async findAll(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findUnreadCount(userId: string) {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: string, id: string) {
    await this.notificationRepository.update({ id, userId }, { isRead: true });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }
}
