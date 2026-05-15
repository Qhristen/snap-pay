import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export enum AuditActionFilter {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER = "TRANSFER",
  PROFILE_UPDATE = "PROFILE_UPDATE",
  ALL = "ALL",
}

export class AuditFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: AuditActionFilter,
    default: AuditActionFilter.ALL,
  })
  @IsOptional()
  @IsEnum(AuditActionFilter)
  action?: AuditActionFilter;

  @ApiPropertyOptional({ description: "Entity name to filter by" })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
