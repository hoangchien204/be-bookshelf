// src/genres/genre.service.ts
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from '../entitis/genre.entity';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) { }

  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find({ order: { name: 'ASC' } });
  }

  async create(name: string): Promise<Genre> {
    const genre = this.genreRepository.create({ name });

    try {
      return await this.genreRepository.save(genre);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Tên thể loại đã tồn tại');
      }
      throw new InternalServerErrorException('Lỗi máy chủ khi tạo thể loại');
    }
  }


  async update(id: string, name: string): Promise<Genre> {
    const genre = await this.genreRepository.findOneBy({ id });
    if (!genre) throw new NotFoundException('Thể loại không tồn tại');
    genre.name = name;
    return this.genreRepository.save(genre);
  }

  async deactivate(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: { id },
      relations: ['books'], 
    });

    if (!genre) throw new NotFoundException('Không tìm thấy thể loại');
    if (genre.books && genre.books.length > 0) {
      throw new BadRequestException('Không thể xóa thể loại đang liên kết với sách');
    }

    genre.isActive = false;
    return this.genreRepository.save(genre);
  }

}
