// src/genres/genre.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { GenreService } from './genre.service';

@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  async findAll() {
    return this.genreService.findAll();
  }

  @Post()
  async create(@Body('name') name: string) {
    if (!name || !name.trim()) {
      throw new BadRequestException('Tên thể loại không được bỏ trống');
    }
    return this.genreService.create(name.trim());
  }
 
  @Patch(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {
    if (!name || !name.trim()) {
      throw new BadRequestException('Tên thể loại không được bỏ trống');
    }
    return this.genreService.update(id, name.trim());
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    return this.genreService.deactivate(id);
  }
}
