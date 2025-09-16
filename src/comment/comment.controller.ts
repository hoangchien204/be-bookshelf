import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req,
    @Body() body: { bookId: string; content: string },
  ) {
    const userId = req.user.userId; 
    return this.commentService.create(userId, body.bookId, body.content);
  }
  @Get('book/:bookId')
  async findByBook(@Param('bookId') bookId: string) {
    return this.commentService.findByBook(bookId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.commentService.remove(id, userId);
  }
}
