import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  RegisterDto,
  LoginDto,
  AuthResponseDto,
} from "./dto/auth.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({
    summary: "Register a new user",
    description: "Create a new user account and associated wallet.",
  })
  @ApiCreatedResponse({
    description: "User successfully registered",
    type: AuthResponseDto,
  })
  @ApiConflictResponse({ description: "Email or username already in use" })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req.ip, req.headers["user-agent"]);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login",
    description:
      "Authenticate with email and password to receive access and refresh tokens.",
  })
  @ApiOkResponse({
    description: "Successfully authenticated",
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip, req.headers["user-agent"]);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset" })
  @ApiOkResponse({ description: "Reset code sent if email exists" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with OTP" })
  @ApiOkResponse({ description: "Password successfully updated" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh Access Token",
    description:
      "Get a new access token and refresh token using a valid refresh token.",
  })
  @ApiOkResponse({ description: "Tokens successfully refreshed" })
  @ApiUnauthorizedResponse({ description: "Invalid or expired refresh token" })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Logout",
    description: "Invalidate the refresh token.",
  })
  @ApiOkResponse({ description: "Successfully logged out" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);
    return { message: "Logged out successfully" };
  }
}

