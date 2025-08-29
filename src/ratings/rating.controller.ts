import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RatingService } from './rating.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async upsert(
    @Req() req,
    @Body() body: { bookId: string; score: number; content?: string },
  ) {
    const userId = req.user.userId; 
    return this.ratingService.upsertRating(userId, body.bookId, body.score, body.content);
  }

  @Get('book/:bookId')
  async getRatings(@Param('bookId') bookId: string) {
    return this.ratingService.getRatingsForBook(bookId);
  }

  @Get('book/:bookId/average')
  async getAverage(@Param('bookId') bookId: string) {
    return this.ratingService.getAverageRating(bookId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
 async remove(@Req() req, @Param('bookId') bookId: string) {
    const userId = req.user.userId;
    return this.ratingService.removeRating(userId, bookId);
  }
}
