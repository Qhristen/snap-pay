import { Controller, Get, Patch, Body, Query, NotFoundException } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { SearchUserDto } from "./dto/search-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "./entities/user.entity";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Returns the profile of the authenticated user.",
  })
  @ApiOkResponse({ description: "User profile retrieved", type: User })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  async getMe(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Patch("profile")
  @ApiOperation({
    summary: "Update user profile",
    description: "Allows the authenticated user to update their profile information.",
  })
  @ApiOkResponse({ description: "Profile updated successfully", type: User })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.update(user.id, dto);
  }

  @Get("search")
  @ApiOperation({
    summary: "Search users",
    description:
      "Search for users by username or email. Excludes the requesting user.",
  })
  @ApiOkResponse({
    description: "List of users matching the query",
    type: [User],
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  async search(@CurrentUser() user: User, @Query() dto: SearchUserDto) {
    return this.usersService.search(dto.query, dto.limit, user.id);
  }

  @Get("by-email")
  @ApiOperation({
    summary: "Get user by email",
    description: "Find a user by their exact email address.",
  })
  @ApiOkResponse({ description: "User found", type: User })
  @ApiNotFoundResponse({ description: "User with this email not found" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid access token" })
  async getUserByEmail(@Query("email") email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
