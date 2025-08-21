// src/books/book.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entitis/book.entity';
import { SeriesService } from '../series/series.service';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly seriesService: SeriesService, // inject để quản lý series
  ) {}

  findAll(filter?: { isSeries?: boolean }) {
  return this.bookRepository.find({
    where: filter?.isSeries !== undefined ? { isSeries: filter.isSeries } : {},
    relations: ['series'], // lấy luôn thông tin series
    order: { createdAt: 'DESC' },
  });
}


async findOne(id: string) {
  const book = await this.bookRepository.findOne({
    where: { id },
    relations: ['series'],
  });
  if (!book) throw new NotFoundException(`Book with id ${id} not found`);
  return book;
}

  async create(bookData: Partial<Book> & { seriesTitleNew?: string; isSeries?: boolean }) {
    let seriesId = bookData.seriesId || null;

    if (bookData.isSeries && !seriesId && bookData.seriesTitleNew) {
      const newSeries = await this.seriesService.create({
        title: bookData.seriesTitleNew.trim(),
      });
      seriesId = newSeries.id;
    }

    const book = this.bookRepository.create({
      ...bookData,
      seriesId,
    });
    return this.bookRepository.save(book);
  }

    async findBySeries(seriesId: string) {
    return this.bookRepository.find({
      where: { seriesId },
      order: { volumeNumber: 'ASC' },
    });
  }

  async update(id: string, updateData: Partial<Book>) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) throw new NotFoundException('Không tìm thấy sách');
    Object.assign(book, updateData);
    return this.bookRepository.save(book);
  }

  async remove(id: string) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) throw new NotFoundException('Không tìm thấy sách');
    return this.bookRepository.remove(book);
  }
}
