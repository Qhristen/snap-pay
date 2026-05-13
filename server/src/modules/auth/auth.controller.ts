import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account and associated wallet.',
  })
  @ApiCreatedResponse({ description: 'User successfully registered', type: AuthResponseDto })
  @ApiConflictResponse({ description: 'Email or username already in use' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req.ip, req.headers['user-agent']);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate with email and password to receive access and refresh tokens.',
  })
  @ApiOkResponse({ description: 'Successfully authenticated', type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip, req.headers['user-agent']);
  }
}
