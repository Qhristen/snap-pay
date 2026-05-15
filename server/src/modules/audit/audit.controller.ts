import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { AuditFilterDto } from "./dto/audit-filter.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Audit")
@ApiBearerAuth()
@Controller("audit-logs")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({
    summary: "Get audit logs",
    description:
      "Returns a paginated list of audit log entries for the authenticated user.",
  })
  @ApiOkResponse({
    description: "Audit logs retrieved successfully",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  async getAuditLogs(
    @CurrentUser() user: User,
    @Query() filter: AuditFilterDto,
  ) {
    return this.auditService.findAll(user, filter);
  }
}
