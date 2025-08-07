import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from '@contracts/user/user.contract';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(@Request() req) {
    const userId = req.user?.userId; // Will be set by JWT guard
    return this.userService.getUserProfile(userId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateUserProfile(@Request() req, @Body() dto: UpdateUserProfileDto) {
    const userId = req.user?.userId;
    return this.userService.updateUserProfile(userId, dto);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getUserStats(@Request() req) {
    const userId = req.user?.userId;
    return this.userService.getUserStats(userId);
  }

  @Get('documents')
  @HttpCode(HttpStatus.OK)
  async getUserDocuments(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('fileType') fileType?: string,
    @Query('isProcessed') isProcessed?: string,
  ) {
    const userId = req.user?.userId;
    return this.userService.getUserDocuments(
      userId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
      search,
      fileType,
      isProcessed,
    );
  }

  @Get('chats')
  @HttpCode(HttpStatus.OK)
  async getUserChats(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
  ) {
    const userId = req.user?.userId;
    return this.userService.getUserChats(
      userId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
      isActive,
    );
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deleteUserAccount(@Request() req) {
    const userId = req.user?.userId;
    return this.userService.deleteUserAccount(userId);
  }
}
