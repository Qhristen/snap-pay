import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { TransactionStatus } from 'src/common/enums';

export enum TransactionTypeFilter {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  TRANSFER_SENT = 'TRANSFER_SENT',
  TRANSFER_RECEIVED = 'TRANSFER_RECEIVED',
  ALL = 'ALL',
}

export class TransactionFilterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TransactionTypeFilter, default: TransactionTypeFilter.ALL })
  @IsOptional()
  @IsEnum(TransactionTypeFilter)
  type?: TransactionTypeFilter;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
