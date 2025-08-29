import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 🟢 Tạo comment (cần login)
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.commentService.remove(id, userId);
  }
}
