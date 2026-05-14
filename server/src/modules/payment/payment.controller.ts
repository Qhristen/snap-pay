import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  Delete,
  Param,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";
import { TransactionType } from "../../common/enums/transaction.enum";
import { PaystackService } from "./paystack.service";
import { PaymentService } from "./payment.service";
import { WalletService } from "../wallet/wallet.service";
import {
  InitializeFundingDto,
  VerifyPaymentDto,
  AddBankAccountDto,
  InitiateWithdrawalDto,
  VerifyAccountDto,
  BankAccountResponseDto,
} from "./dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { TransactionsService } from "../transactions/transactions.service";

@ApiTags("Payment")
@Controller("payment")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  private readonly HIGH_VALUE_THRESHOLD = 50000; // ₦50,000

  constructor(
    private readonly paystackService: PaystackService,
    private readonly paymentService: PaymentService,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionsService,
  ) {}

  @Get("banks")
  @ApiOperation({ summary: "List all Nigerian banks" })
  @ApiResponse({
    status: 200,
    description: "List of banks retrieved successfully",
    schema: {
      example: {
        success: true,
        data: [
          { name: "Access Bank", code: "044" },
          { name: "GTBank", code: "058" },
          { name: "First Bank of Nigeria", code: "011" },
        ],
      },
    },
  })
  async listBanks() {
    const banks = await this.paystackService.listBanks();
    return {
      success: true,
      data: banks,
    };
  }

  @Post("verify-account")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify bank account number" })
  @ApiResponse({
    status: 200,
    description: "Account verified successfully",
    schema: {
      example: {
        success: true,
        data: {
          accountNumber: "0123456789",
          accountName: "JOHN DOE",
          bankCode: "058",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid bank account details",
  })
  async verifyAccount(@Body() dto: VerifyAccountDto) {
    const accountDetails = await this.paystackService.verifyBankAccount(
      dto.accountNumber,
      dto.bankCode,
    );

    return {
      success: true,
      data: {
        accountNumber: dto.accountNumber,
        accountName: accountDetails.account_name,
        bankCode: dto.bankCode,
      },
    };
  }

  @Post("fund/initialize")
  @ApiOperation({ summary: "Initialize wallet funding via Paystack" })
  @ApiResponse({
    status: 201,
    description: "Payment initialized successfully",
    schema: {
      example: {
        success: true,
        data: {
          authorizationUrl: "https://checkout.paystack.com/abc123",
          accessCode: "abc123xyz",
          reference: "FUND_1234567890",
        },
        message: "Payment initialized successfully",
      },
    },
  })
  async initializeFunding(
    @CurrentUser() user: User,
    @Body() dto: InitializeFundingDto,
  ) {
    const result = await this.paymentService.initializeFunding(
      user,
      dto.amount,
      dto.callbackUrl,
    );

    return {
      success: true,
      data: {
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
        reference: result.reference,
      },
      message: "Payment initialized successfully",
    };
  }

  @Post("fund/verify")
  @ApiOperation({ summary: "Verify payment and credit wallet" })
  @ApiResponse({
    status: 200,
    description: "Payment verified and wallet credited",
    schema: {
      example: {
        success: true,
        data: {
          transaction: {
            id: "uuid",
            type: "DEPOSIT",
            amount: 5000,
            balanceAfter: 15000,
          },
          balance: 15000,
        },
        message: "₦5,000 has been added to your wallet",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Payment failed or does not belong to user",
  })
  @HttpCode(HttpStatus.OK)
  async verifyFunding(
    @CurrentUser() user: User,
    @Body() dto: VerifyPaymentDto,
  ) {
    const result = await this.paystackService.verifyTransaction(dto.reference);

    if (result.status !== "success") {
      throw new BadRequestException("Payment was not successful");
    }

    // Verify metadata
    const metadata = result.metadata;
    if (metadata?.userId !== user.id) {
      throw new BadRequestException("Payment does not belong to this user");
    }

    // Credit wallet (amount is in kobo, convert to naira)
    const amountInNaira = result.amount / 100;

    const transaction = await this.walletService.getTransactionByReference(
      dto.reference,
    );

    const { balance } = await this.walletService.getBalance(user.id);

    return {
      success: true,
      data: {
        transaction,
        balance,
      },
      message: `₦${amountInNaira.toLocaleString()} has been added to your wallet`,
    };
  }

  @Post("bank-account")
  @ApiOperation({ summary: "Add bank account for withdrawals" })
  @ApiResponse({
    status: 201,
    description: "Bank account added successfully",
    type: BankAccountResponseDto,
  })
  async addBankAccount(
    @CurrentUser() user: User,
    @Body() dto: AddBankAccountDto,
  ) {
    // Verify bank account with Paystack
    const accountDetails = await this.paystackService.verifyBankAccount(
      dto.accountNumber,
      dto.bankCode,
    );

    // Get bank name from bank list
    const banks = await this.paystackService.listBanks();
    const bank = banks.find((b) => b.code === dto.bankCode);

    // Create transfer recipient for future withdrawals
    const recipientCode = await this.paystackService.createTransferRecipient(
      dto.accountNumber,
      dto.bankCode,
      accountDetails.account_name,
    );

    // Update wallet with bank details (saves to BankAccount entity)
    const bankAccount = await this.walletService.updateBankAccount(
      user.id,
      dto.accountNumber,
      dto.bankCode,
      bank?.name || "Unknown Bank",
      accountDetails.account_name,
    );

    // Store recipient code
    await this.walletService.updatePaystackRecipientCode(
      user.id,
      recipientCode,
    );

    return {
      success: true,
      data: bankAccount,
      message: "Bank account added successfully",
    };
  }

  @Get("bank-accounts")
  @ApiOperation({ summary: "List all user bank accounts" })
  @ApiResponse({
    status: 200,
    description: "List of bank accounts retrieved successfully",
    type: [BankAccountResponseDto],
  })
  async listBankAccounts(@CurrentUser() user: User) {
    const bankAccounts = await this.walletService.listBankAccounts(user.id);
    return {
      success: true,
      data: bankAccounts,
    };
  }

  @Delete("bank-account/:id")
  @ApiOperation({ summary: "Deactivate/Remove a bank account" })
  @ApiResponse({
    status: 200,
    description: "Bank account removed successfully",
  })
  async deleteBankAccount(@CurrentUser() user: User, @Param("id") id: string) {
    await this.walletService.deleteBankAccount(user.id, id);
    return {
      success: true,
      message: "Bank account removed successfully",
    };
  }

  @Post("withdraw")
  @ApiOperation({ summary: "Initiate withdrawal to bank account" })
  @ApiResponse({
    status: 201,
    description: "Withdrawal initiated successfully",
    schema: {
      example: {
        success: true,
        data: {
          reference: "WD_1234567890",
          amount: 10000,
          status: "pending",
          balance: 5000,
        },
        message:
          "Withdrawal initiated successfully. You will receive the funds shortly.",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Insufficient balance, no bank account, or invalid OTP",
  })
  async initiateWithdrawal(
    @CurrentUser() user: User,
    @Body() dto: InitiateWithdrawalDto,
  ) {
    // Get wallet and verify balance
    const wallet = await this.walletService.getWallet(user.id);

    if (wallet.availableBalance < dto.amount) {
      throw new BadRequestException("Insufficient balance");
    }

    if (!wallet.bankAccount || !wallet.bankAccount.paystackRecipientCode) {
      throw new BadRequestException(
        "Please add a bank account before withdrawing",
      );
    }

    // High-value threshold check (can be expanded later)
    if (dto.amount >= this.HIGH_VALUE_THRESHOLD) {
      this.logger.warn(
        `High value withdrawal requested by user ${user.id}: ₦${dto.amount}`,
      );
    }

    const reference = this.paystackService.generateReference("WD");

    await this.paymentService.initiateWithdrawal(
      user,
      dto.amount,
      wallet.bankAccount.paystackRecipientCode,
      reference,
    );

    const { balance } = await this.walletService.getBalance(user.id);

    return {
      success: true,
      data: {
        reference,
        amount: dto.amount,
        status: "pending",
        balance,
      },
      message:
        "Withdrawal initiated successfully. You will receive the funds shortly.",
    };
  }
}
