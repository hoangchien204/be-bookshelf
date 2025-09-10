// src/highlight/highlight.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Highlight } from 'src/entitis/highlights.entity';
import { CreateHighlightDto, UpdateHighlightDto } from './highlight.dto';

@Injectable()
export class HighlightService {
  constructor(
    @InjectRepository(Highlight)
    private readonly highlightRepo: Repository<Highlight>,
  ) {}

  async create(userId: string, dto: CreateHighlightDto) {
    const highlight = this.highlightRepo.create({
      cfiRange: dto.cfiRange,
      color: dto.color,
      note: dto.note,
      locationIndex: dto.locationIndex,
      user: { id: userId },
      book: { id: dto.bookId },
    });
    return this.highlightRepo.save(highlight);
  }

  async findByBook(userId: string, bookId: string) {
    return this.highlightRepo.find({
      where: { user: { id: userId }, book: { id: bookId } },
      order: { createdAt: 'ASC' },
    });
  }

  async update(userId: string, id: string, dto: UpdateHighlightDto) {
    const hl = await this.highlightRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!hl) throw new NotFoundException('Highlight not found');
    Object.assign(hl, dto);
    return this.highlightRepo.save(hl);
  }

  async remove(userId: string, id: string) {
    const hl = await this.highlightRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!hl) throw new NotFoundException('Highlight not found');
    return this.highlightRepo.remove(hl);
  }
}
