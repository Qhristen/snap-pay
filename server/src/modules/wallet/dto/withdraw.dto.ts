import { IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({
    description: 'Withdrawal amount in kobo. Minimum 500,000 kobo (5,000 NGN). Amounts over 10,000,000 kobo (100,000 NGN) require admin review',
    example: 500000,
    minimum: 500000,
  })
  @IsInt()
  @Min(500000)
  amount: number;
}
