import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../entities/transaction.entity';

export class TransactionPaginationResponseDto {
  @ApiProperty({ type: [Transaction] })
  data: Transaction[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
