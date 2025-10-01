// src/books/book.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entitis/book.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { UploadModule } from 'src/upload/upload.module';
import { SeriesModule } from 'src/series/series.module';
import { GenreModule } from 'src/genres/genre.module';
import { Genre } from 'src/entitis/genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Genre]),
  UploadModule,
  SeriesModule,
  GenreModule
  ],
  providers: [BookService],
  controllers: [BookController],
  exports: [TypeOrmModule]
})
export class BookModule {}
