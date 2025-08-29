import {
  Controller, Post, Body, Get, Param, Delete, Request, UseGuards,
} from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('activities')
export class UserActivityController {
  constructor(private readonly activityService: UserActivityService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('read')
  async updateReadingProgress(
    @Request() req,
    @Body() body: { bookId: string; page: number },
  ) {
    const userId = req.user.userId;
    return this.activityService.upsertActivity(userId, body.bookId, body.page);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('read/:bookId')
  async getReadingProgress(@Request() req, @Param('bookId') bookId: string) {
    const userId = req.user.userId;
    const activity = await this.activityService.findReadingActivity(userId, bookId);
    return { page: activity?.lastPage ?? 1 };
  }

  @Get()
  findAll() {
    return this.activityService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('favorites')
  async toggleFavorite(@Request() req, @Body() body: { bookId: string }) {
    const userId = req.user.userId;
    return this.activityService.toggleFavorite(userId, body.bookId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('favorites')
  async getFavorites(@Request() req) {
    const userId = req.user.userId;
    return this.activityService.findFavoritesByUser(userId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.activityService.findByUser(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(id);
  }
}
