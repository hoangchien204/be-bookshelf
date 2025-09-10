// src/books/book.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
  UseFilters,
  Delete,
  Param,
  Put,
  Query
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { MulterExceptionFilter } from '../multer/multer-exception.filter';



@Controller('books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
  ) { }

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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'bookFile', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]))
  async createBook(
    @UploadedFiles() files: { bookFile?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Body() body: any,
  ) {
    console.log("Controller files:", files);
    console.log("Controller body:", body);
    return this.bookService.createBook(files, body);
  }


  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  updateBook(
    @Param('id') id: string,
    @UploadedFiles() file?: Express.Multer.File,
    @Body() body?: any,
  ) {
    return this.bookService.updateBook(id, file, body);
  }


  @Get('suggest/:id')
  async suggest(@Param('id') id: string, @Query('limit') limit?: string) {
    const n = parseInt(limit || '10', 10);
    return this.bookService.suggestBooks(id, n);
  }
  //lấy ds tác giả
  @Get('author/:author')
  async getBooksByAuthor(@Param('author') author: string) {
    return this.bookService.findByAuthor(author);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
