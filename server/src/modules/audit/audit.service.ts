import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Queue } from "bullmq";
import { User } from "../users/entities/user.entity";
import { AuditLog } from "./entities/audit-log.entity";
import { AuditActionFilter, AuditFilterDto } from "./dto/audit-filter.dto";

@Injectable()
export class AuditService {
  constructor(
    @InjectQueue("audit-processing") private readonly auditQueue: Queue,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
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

  async findAll(user: User, filter: AuditFilterDto) {
    const { page, limit, action, entity, startDate, endDate } = filter;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.user", "user")
      .where("user.id = :userId", { userId: user.id });

    if (action && action !== AuditActionFilter.ALL) {
      queryBuilder.andWhere("audit.action = :action", { action });
    }

    if (entity) {
      queryBuilder.andWhere("audit.entity = :entity", { entity });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere("audit.createdAt BETWEEN :start AND :end", {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere("audit.createdAt >= :start", {
        start: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere("audit.createdAt <= :end", {
        end: new Date(endDate),
      });
    }

    const [logs, total] = await queryBuilder
      .orderBy("audit.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
