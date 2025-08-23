import { Controller, Post, Get, Delete, Body, Param, Req } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(
    @Req() req,
    @Body() body: { bookId: string; content: string },
  ) {
    const userId = req.headers['x-user-id'] as string;
    return this.commentService.create(userId, body.bookId, body.content);
  }

  @Get('book/:bookId')
  async findByBook(@Param('bookId') bookId: string) {
    return this.commentService.findByBook(bookId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
