import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Series } from '../entitis/series.entity';
import { Book } from 'src/entitis/book.entity';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private readonly seriesRepo: Repository<Series>,
    
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>
  ) {}

  // body: { title: string; description?: string; coverUrl?: string }
  async create(body: any) {
    const { title, description, coverUrl } = body ?? {};
    if (!title || typeof title !== 'string') {
      throw new ConflictException('title is required');
    }

    const exists = await this.seriesRepo.findOne({ where: { title } });
    if (exists) throw new ConflictException('Series title already exists');

    const entity = this.seriesRepo.create({ title, description, coverUrl });
    return this.seriesRepo.save(entity);
  }

  async findAll(params: {
    includeBooks?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const { includeBooks = false, q, page = 1, limit = 20 } = params ?? {};
    const where = q ? { title: ILike(`%${q}%`) } : undefined;

    const [items, total] = await this.seriesRepo.findAndCount({
      where,
      relations: includeBooks ? { books: true } : undefined,
      order: includeBooks ? ({ title: 'ASC', books: { volumeNumber: 'ASC' } } as any) : { title: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findOne(id: string, includeBooks = false) {
    const s = await this.seriesRepo.findOne({
      where: { id },
      relations: includeBooks ? { books: true } : undefined,
      order: includeBooks ? ({ books: { volumeNumber: 'ASC' } } as any) : undefined,
    });
    if (!s) throw new NotFoundException('Series not found');
    return s;
  }

  async findBooks(seriesId: string) {
  return this.bookRepo.find({
    where: { seriesId },
    order: { volumeNumber: 'ASC' },
    relations: ['series'],
  });
}
  async update(id: string, body: any) {
    const found = await this.seriesRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Series not found');

    if (body?.title && body.title !== found.title) {
      const dup = await this.seriesRepo.findOne({ where: { title: body.title } });
      if (dup) throw new ConflictException('Series title already exists');
    }

    const merged = this.seriesRepo.merge(found, {
      title: body?.title ?? found.title,
      description: body?.description ?? found.description,
      coverUrl: body?.coverUrl ?? found.coverUrl,
    });
    return this.seriesRepo.save(merged);
  }

  async remove(id: string) {
    const found = await this.seriesRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Series not found');
    await this.seriesRepo.remove(found); // onDelete: SET NULL sẽ gỡ seriesId ở books
    return { success: true };
  }
}
