import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseBoolPipe
} from '@nestjs/common';
import { SeriesService } from './series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  create(@Body() body: any) {
    return this.seriesService.create(body);
  }

  @Get()
  findAll(
    @Query('includeBooks', ParseBoolPipe) includeBooks = false,
    @Query('q') q?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.seriesService.findAll({
      includeBooks,
      q,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeBooks', ParseBoolPipe) includeBooks = false,
  ) {
    return this.seriesService.findOne(id, includeBooks);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.seriesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seriesService.remove(id);
  }
}
