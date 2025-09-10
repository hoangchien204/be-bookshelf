// src/highlight/highlight.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { HighlightService } from './highlight.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHighlightDto, UpdateHighlightDto } from './highlight.dto';

@Controller('highlights')
@UseGuards(JwtAuthGuard)
export class HighlightController {
  constructor(private readonly highlightService: HighlightService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateHighlightDto) {
    return this.highlightService.create(req.user.userId, dto);
  }

  @Get(':bookId')
  findByBook(@Request() req, @Param('bookId') bookId: string) {
    return this.highlightService.findByBook(req.user.userId, bookId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateHighlightDto,
  ) {
    return this.highlightService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.highlightService.remove(req.user.userId, id);
  }
}
