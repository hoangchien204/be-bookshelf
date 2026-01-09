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
  Query,
  UseGuards,
  UploadedFile
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { MulterExceptionFilter } from '../multer/multer-exception.filter';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';



@Controller('books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
  ) { }

  @Get()
  async findAll() {
    return this.bookService.findAll();
  }
  @Get('hot')
  async getHotBook() {
    return this.bookService.getHotBooks();
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseFilters(MulterExceptionFilter)
  @Roles('admin')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'bookFile', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]))
  async createBook(
    @UploadedFiles() files: { bookFile?: Express.Multer.File[]; cover?: Express.Multer.File[] },
    @Body() body: any,
  ) {
    return this.bookService.createBook(files, body);
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  updateBook(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: any,
  ) {
    return this.bookService.updateBook(id, file, body);
  }

  @Get('suggest/:id')
  async suggest(@Param('id') id: string, @Query('limit') limit?: string) {
    const n = parseInt(limit || '10', 10);
    return this.bookService.suggestBooks(id, n);
  }

  @Get('author/:author')
  async getBooksByAuthor(@Param('author') author: string) {
    return this.bookService.findByAuthor(author);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }


}
