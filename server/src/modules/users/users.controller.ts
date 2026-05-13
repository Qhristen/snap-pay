import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SearchUserDto } from './dto/search-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the authenticated user.',
  })
  @ApiOkResponse({ description: 'User profile retrieved', type: User })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async getMe(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search users',
    description: 'Search for users by username or email. Excludes the requesting user.',
  })
  @ApiOkResponse({ description: 'List of users matching the query', type: [User] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async search(
    @CurrentUser() user: User,
    @Query() dto: SearchUserDto,
  ) {
    return this.usersService.search(dto.query, dto.limit, user.id);
  }

  @Get('by-email')
  @ApiOperation({
    summary: 'Get user by email',
    description: 'Find a user by their exact email address.',
  })
  @ApiOkResponse({ description: 'User found', type: User })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async getUserByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }
}
