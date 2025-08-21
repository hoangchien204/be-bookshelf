import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Highlight } from '../entitis/highlights.entity';

@Injectable()
export class HighlightService {
  constructor(
    @InjectRepository(Highlight)
    private readonly highlightRepo: Repository<Highlight>,
  ) {}

  async createHighlight(data: {
    userId: string;
    bookId: string;
    page: number;
    rect: { x: number; y: number; width: number; height: number };
    note?: string;
  }) {
    const highlight = this.highlightRepo.create(data);
    return this.highlightRepo.save(highlight);
  }

  async getHighlights(userId: string, bookId: string) {
    return this.highlightRepo.find({
      where: { userId, bookId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateHighlight(id: string, data: { rect?: any; note?: string }) {
    const highlight = await this.highlightRepo.findOne({ where: { id } });
    if (!highlight) throw new NotFoundException('Highlight not found');
    Object.assign(highlight, data);
    return this.highlightRepo.save(highlight);
  }

  async deleteHighlight(id: string) {
    const result = await this.highlightRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Highlight not found');
    return { deleted: true };
  }
}
