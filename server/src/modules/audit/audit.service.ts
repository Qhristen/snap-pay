import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { User } from "../users/entities/user.entity";

@Injectable()
export class AuditService {
  constructor(
    @InjectQueue("audit-processing") private readonly auditQueue: Queue,
  ) {}

  async log(
    user: User,
    action: string,
    entity: string,
    entityId: string,
    newValue?: any,
    oldValue?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Push to audit queue instead of direct DB save
    await this.auditQueue.add("log-audit", {
      user: { id: user.id }, // Send only necessary user info
      action,
      entity,
      entityId,
      newValue,
      oldValue,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }
}
