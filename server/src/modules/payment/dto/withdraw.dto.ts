import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddBankAccountDto {
  @ApiProperty({
    description: 'Nigerian bank account number (10 digits)',
    example: '0123456789',
    minLength: 10,
    maxLength: 10,
  })
  @IsString()
  @Length(10, 10)
  accountNumber: string;

  @ApiProperty({
    description: 'Bank code from Paystack',
    example: '058',
  })
  @IsString()
  bankCode: string;
}

export class VerifyAccountDto {
  @ApiProperty({
    description: 'Nigerian bank account number (10 digits)',
    example: '0123456789',
    minLength: 10,
    maxLength: 10,
  })
  @IsString()
  @Length(10, 10)
  accountNumber: string;

  @ApiProperty({
    description: 'Bank code from Paystack',
    example: '058',
  })
  @IsString()
  bankCode: string;
}

export class InitiateWithdrawalDto {
  @ApiProperty({
    description: 'Amount to withdraw in Naira',
    example: 10000,
    minimum: 500,
    maximum: 5000000,
  })
  @IsNumber()
  @Min(500) // Minimum ₦500 withdrawal
  @Max(5000000) // Maximum ₦5,000,000
  amount: number;
}

export class BankAccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  accountName: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  bankCode: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

