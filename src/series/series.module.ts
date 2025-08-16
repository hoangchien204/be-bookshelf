import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Series } from '../entitis/series.entity';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { Book } from 'src/entitis/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Series, Book])],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
