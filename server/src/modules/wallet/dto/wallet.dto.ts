import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  @Max(1000000)
  amount: number;
}

export class WithdrawDto {
  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;
}

export class TransferDto {
  @ApiProperty({ example: 'uuid-of-recipient' })
  @IsUUID()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({ example: 20.0 })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;

  }

export class WalletTransactionShortDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  createdAt: Date;
}

export class WalletResponseDto {
  @ApiProperty()
  balance: number;

  @ApiProperty({ type: WalletTransactionShortDto })
  transaction: WalletTransactionShortDto;
}

export class TransferResponseDto {
  @ApiProperty({ type: WalletTransactionShortDto })
  transaction: WalletTransactionShortDto;
}

export class BalanceResponseDto {
  @ApiProperty()
  balance: number;

  @ApiProperty()
  currency: string; 
  
  @ApiProperty()
  userId: string;
}
