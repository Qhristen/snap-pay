import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../audit/entities/audit-log.entity';

@Processor('audit-processing')
export class AuditProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditProcessor.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {
    super();
  }

  async process(job: Job<any>) {
    const data = job.data;
    try {
      const auditLog = this.auditLogRepository.create(data);
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error({ event: 'audit_processing_failed', error: error.message, data });
      throw error;
    }
  }
}
