import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import { WalletService } from "./wallet.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";
import {
  DepositDto,
  WithdrawDto,
  TransferDto,
  WalletResponseDto,
  TransferResponseDto,
  BalanceResponseDto,
} from "./dto/wallet.dto";

@ApiTags("Wallet")
@ApiBearerAuth()
@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get("balance")
  @ApiOperation({
    summary: "Get wallet balance",
    description:
      "Returns the current balance and currency of the authenticated user's wallet.",
  })
  @ApiOkResponse({
    description: "Balance retrieved successfully",
    type: BalanceResponseDto,
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  async getBalance(@CurrentUser() user: User) {
    return this.walletService.getBalance(user.id);
  }

  @Post("deposit")
  @ApiOperation({
    summary: "Deposit funds",
    description: "Add funds to the authenticated user's wallet.",
  })
  @ApiOkResponse({ description: "Deposit successful", type: WalletResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  @ApiBadRequestResponse({ description: "Invalid deposit amount" })
  async deposit(@CurrentUser() user: User, @Body() dto: DepositDto) {
    return this.walletService.deposit(user, dto);
  }

  @Post("withdraw")
  @ApiOperation({
    summary: "Withdraw funds",
    description: "Withdraw funds from the authenticated user's wallet.",
  })
  @ApiOkResponse({
    description: "Withdrawal successful",
    type: WalletResponseDto,
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  @ApiBadRequestResponse({
    description: "Insufficient balance or invalid amount",
  })
  async withdraw(@CurrentUser() user: User, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(user, dto);
  }

  @Post("transfer")
  @ApiOperation({
    summary: "Transfer funds",
    description: "Transfer funds to another user's wallet.",
  })
  @ApiOkResponse({
    description: "Transfer successful",
    type: TransferResponseDto,
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  @ApiBadRequestResponse({
    description: "Insufficient balance or invalid recipient",
  })
  async transfer(@CurrentUser() user: User, @Body() dto: TransferDto) {
    return this.walletService.transfer(user, dto);
  }
}
