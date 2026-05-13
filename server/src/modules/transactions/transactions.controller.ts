import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";
import { TransactionFilterDto } from "./dto/transaction-filter.dto";
import { TransactionPaginationResponseDto } from "./dto/transaction-response.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Transactions")
@ApiBearerAuth()
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({
    summary: "Get transaction history",
    description:
      "Returns a paginated list of transactions for the authenticated user.",
  })
  @ApiOkResponse({
    description: "Transactions retrieved successfully",
    type: TransactionPaginationResponseDto,
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  async getTransactions(
    @CurrentUser() user: User,
    @Query() filter: TransactionFilterDto,
  ) {
    return this.transactionsService.findAll(user, filter);
  }
}
