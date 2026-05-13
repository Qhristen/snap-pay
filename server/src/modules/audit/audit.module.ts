import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AuditLog } from './entities/audit-log.entity';
import { AuditService } from './audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    BullModule.registerQueue({ name: 'audit-processing' }),
  ],
  providers: [AuditService],
  exports: [AuditService, TypeOrmModule],
})
export class AuditModule {}
