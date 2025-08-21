import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  Request,
} from '@nestjs/common';
import { HighlightService } from './highlight.service';

@Controller('highlights')
export class HighlightController {
  constructor(private readonly highlightService: HighlightService) {}

  // 🟢 Thêm highlight
  @Post()
  async createHighlight(@Body() body: any, @Request() req: any) {
    const userId = req.headers['x-user-id']; // hoặc lấy từ JWT
    return this.highlightService.createHighlight({ ...body, userId });
  }

  // 🟢 Lấy toàn bộ highlight của user cho 1 book
  @Get(':bookId')
  async getHighlights(@Request() req: any, @Param('bookId') bookId: string) {
    const userId = req.headers['x-user-id'];
    return this.highlightService.getHighlights(userId, bookId);
  }
  @Patch(':id')
  async updateHighlight(@Param('id') id: string, @Body() body: any) {
    return this.highlightService.updateHighlight(id, body);
  }

  // 🟢 Xóa highlight
  @Delete(':id')
  async deleteHighlight(@Param('id') id: string) {
    return this.highlightService.deleteHighlight(id);
  }
}
