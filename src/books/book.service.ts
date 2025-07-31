// src/books/book.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entitis/book.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  findAll() {
    return this.bookRepository.find();
  }

  findOne(id: string) {
    return this.bookRepository.findOneBy({ id });
  }

  create(bookData: Partial<Book>) {
    const book = this.bookRepository.create(bookData);
    return this.bookRepository.save(book);
  }

  async update(id: string, updateData: Partial<Book>) {
  const book = await this.bookRepository.findOneBy({ id });
  if (!book) throw new Error('Không tìm thấy sách');
  Object.assign(book, updateData);
  return this.bookRepository.save(book);
}

  remove(id: string) {
    return this.bookRepository.delete(id);
  }
}