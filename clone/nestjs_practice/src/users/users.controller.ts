import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('api/user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  @Get('get_User')
  @UseGuards(OptionalJwtAuthGuard)
  async getUser(@GetUser() user: any) {
    return this.usersService.findAll(user);
  }

  @Post('delete_user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUserPost(@Body() body: any, @GetUser() admin: any) {
    return this.usersService.removeUser(body, admin);
  }

  @Delete('delete_user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Body() body: any, @GetUser() admin: any) {
    return this.usersService.removeUser(body, admin);
  }

  @Delete('delete_user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUserById(@Param('id') id: string, @GetUser() admin: any) {
    return this.usersService.removeUser({ id }, admin);
  }

  @Post('remove_user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async removeUserPost(@Body() body: any, @GetUser() admin: any) {
    return this.usersService.removeUser(body, admin);
  }

  @Delete('remove_user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async removeUser(@Body() body: any, @GetUser() admin: any) {
    return this.usersService.removeUser(body, admin);
  }

  @Delete('remove_user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async removeUserById(@Param('id') id: string, @GetUser() admin: any) {
    return this.usersService.removeUser({ id }, admin);
  }

  @Get('session_logs')
  @UseGuards(OptionalJwtAuthGuard)
  async getSessionLogs(@GetUser() user: any) {
    return this.usersService.getSessionLogs(user);
  }

  @Get('activities')
  @UseGuards(OptionalJwtAuthGuard)
  async getActivities(@GetUser() user: any) {
    return this.usersService.getSessionLogs(user);
  }

  @Get('roles_based_access')
  @UseGuards(OptionalJwtAuthGuard)
  async getRolesBasedAccess(@Query('username') username: string, @GetUser() user: any) {
    return this.usersService.getAccess(username, user);
  }

  @Get('access')
  @UseGuards(OptionalJwtAuthGuard)
  async getAccess(@Query('username') username: string, @GetUser() user: any) {
    return this.usersService.getAccess(username, user);
  }

  @Get('activity_logs')
  @UseGuards(OptionalJwtAuthGuard)
  async getActivityLogs(
    @Query('sessionId') sessionId?: string,
    @Query('username') username?: string,
    @Query('action') action?: string,
  ) {
    return this.activityLogsService.findAll({ sessionId, username, action });
  }

  @Get('activity_logs/:sessionId')
  @UseGuards(OptionalJwtAuthGuard)
  async getActivityLogsBySession(@Param('sessionId') sessionId: string) {
    return this.activityLogsService.findAll({ sessionId });
  }
}
