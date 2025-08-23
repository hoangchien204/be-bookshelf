import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { RatingService } from './rating.service';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  async upsert(
    @Body() body: { userId: string; bookId: string; score: number },
  ) {
    return this.ratingService.upsertRating(body.userId, body.bookId, body.score);
  }

  @Get('book/:bookId')
  async getRatings(@Param('bookId') bookId: string) {
    return this.ratingService.getRatingsForBook(bookId);
  }

  @Get('book/:bookId/average')
  async getAverage(@Param('bookId') bookId: string) {
    return this.ratingService.getAverageRating(bookId);
  }

  // 🔴 Xóa đánh giá của user trên sách
  @Delete()
  async remove(@Body() body: { userId: string; bookId: string }) {
    return this.ratingService.removeRating(body.userId, body.bookId);
  }
}
