// src/books/book.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
  Get,
  UseFilters,
  Delete,
  Param,
  Put
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { UploadService } from '../upload/upload.service';
import { SeriesService } from '../series/series.service';
import { MulterExceptionFilter } from '../multer/multer-exception.filter';

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
}


@Controller('books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly uploadService: UploadService,
    private readonly seriesService: SeriesService, // ✅ thêm để tạo series mới
  ) {}

  @Get()
  async findAll() {
    return this.bookService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }
  @Get('series/:seriesId')
async findBySeries(@Param('seriesId') seriesId: string) {
  return this.bookService.findBySeries(seriesId);
}
  @Post()
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      { limits: { fileSize: 200 * 1024 * 1024 } },
    ),
  )
  async createBook(
    @UploadedFiles() files: { pdf?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Body() body: {
      name: string;
      author: string;
      description: string;
      genre: string;
      isSeries?: string; // form-data sẽ là string "true"/"false"
      seriesId?: string;
      seriesTitleNew?: string;
      volumeNumber?: string;
    }
  ) {
    const pdf = files.pdf?.[0];
    const cover = files.cover?.[0];
    if (!pdf || !cover) throw new BadRequestException('Thiếu file PDF hoặc ảnh bìa');

    // Xử lý series
    let seriesId = body.seriesId || null;
    const isSeries = String(body.isSeries).toLowerCase() === 'true';

    if (isSeries && !seriesId && body.seriesTitleNew?.trim()) {
      const newSeries = await this.seriesService.create({
        title: body.seriesTitleNew.trim(),
      });
      seriesId = newSeries.id;
    }

    // Upload file
    const rawName = body.name.trim().replace(/\s+/g, '_');
    const fileBaseName = removeVietnameseTones(rawName.replace(/\.[^/.]+$/, ''));

    const pdfUpload = await this.uploadService.uploadFile(pdf, 'books/pdf', `${fileBaseName}.pdf`);
    const coverUpload = await this.uploadService.uploadFile(cover, 'books/covers', `${fileBaseName}-cover.jpg`);

    // Tạo sách
    const newBook = await this.bookService.create({
      name: body.name,
      author: body.author,
      description: body.description || '',
      genre: body.genre,
      fileUrl: pdfUpload.url,
      coverUrl: coverUpload.url,
      fileType: 'pdf',
      isSeries,
      seriesId,
      volumeNumber: isSeries ? Number(body.volumeNumber) || 1 : null,
    });

    return newBook;
  }

  @Put(':id')
  async updateBook(
    @Param('id') id: string,
    @Body() body: { description?: string; genre?: string }
  ) {
    return this.bookService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
