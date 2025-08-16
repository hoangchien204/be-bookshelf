import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UserActivityService } from './user-activity.service';

@Controller('activities')
export class UserActivityController {
  constructor(private readonly activityService: UserActivityService) {}

  // 🟡 Ghi nhận hoặc cập nhật tiến độ đọc
  @Post('read')
async updateReadingProgress(
  @Request() req,
  @Body() body: { bookId: string; page: number },
) {
  const userId = req.headers['x-user-id']; // 🔑 luôn từ header
  return this.activityService.upsertActivity(
    userId,
    body.bookId,
    body.page,
  );
}

  // 🟢 Lấy tiến độ đọc sách của user
  @Get('read/:bookId')
  async getReadingProgress(@Request() req, @Param('bookId') bookId: string) {
    const userId = req.headers['x-user-id'];
    const activity = await this.activityService.findReadingActivity(userId, bookId);
    return { page: activity?.lastPage ?? 1 };
  }

  // 🔍 Admin: Lấy toàn bộ hoạt động
  @Get()
  findAll() {
    return this.activityService.findAll();
  }

  
@Post('favorites')
async toggleFavorite(@Request() req, @Body() body: { bookId: string }) {
  const userId = req.headers['x-user-id'];
  return this.activityService.toggleFavorite(userId, body.bookId);
}

  @Get('favorites')
async getFavorites(@Request() req) {
  const userId = req.headers['x-user-id']
  return this.activityService.findFavoritesByUser(userId);
}
  // 🔍 Lấy toàn bộ sách user đã đọc
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.activityService.findByUser(userId);
  }


  // ❌ Xoá một bản ghi
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(id);
  }
}
