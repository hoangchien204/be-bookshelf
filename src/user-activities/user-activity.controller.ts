import {
  Controller, Post, Body, Get, Param, Delete, Request, UseGuards,
} from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('activities')
export class UserActivityController {
  constructor(private readonly activityService: UserActivityService) { }

  @UseGuards(JwtAuthGuard)
  @Post('read')
  async updateReadingProgress(
    @Request() req,
    @Body() body: { bookId: string; lastPage?: number; lastLocation?: string; progressPct?: number },
  ) {
    const userId = req.user.userId;
    return this.activityService.upsertActivity(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('read/:bookId')
  async getReadingProgress(@Request() req, @Param('bookId') bookId: string) {
    const userId = req.user.userId;
    const activity = await this.activityService.findReadingActivity(userId, bookId);
    return { 
      page: activity?.lastPage ?? 1 ,
      lastLocation: activity?.lastLocation,
      process: activity?.progressPct
    };
  }

  @Get()
  findAll() {
    return this.activityService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites')
  async toggleFavorite(@Request() req, @Body() body: { bookId: string }) {
    const userId = req.user.userId;
    return this.activityService.toggleFavorite(userId, body.bookId);
  }

  @UseGuards(JwtAuthGuard)
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
