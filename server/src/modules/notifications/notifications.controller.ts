import { Controller, Get, Post, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get all notifications for current user" })
  async findAll(@CurrentUser() user: User) {
    return this.notificationsService.findAll(user.id);
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notifications count" })
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.findUnreadCount(user.id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  async markAsRead(@CurrentUser() user: User, @Param("id") id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
