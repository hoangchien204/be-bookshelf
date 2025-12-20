import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entitis/rating.entity';
import { User } from '../entitis/user.entity';
import { Book } from '../entitis/book.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  // Tạo mới hoặc cập nhật rating cho 1 user + 1 book
  async upsertRating(
    userId: string,
    bookId: string,
    score: number,
    content?: string,
  ): Promise<Rating> {
    if (score < 1 || score > 5) {
      throw new BadRequestException('Score must be between 1 and 5');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    let rating = await this.ratingRepo.findOne({
      where: { userId, bookId },
      relations: ['user'],
    });

    if (rating) {
      // update
      rating.score = score;
      rating.content = content ?? rating.content;
    } else {
      // tạo mới
      rating = this.ratingRepo.create({ score, content, user, book });
    }

    return this.ratingRepo.save(rating);
  }

  // Lấy danh sách rating theo sách (mới nhất trước)
  async getRatingsForBook(bookId: string): Promise<Rating[]> {
    return this.ratingRepo.find({
      where: { bookId },
      relations: ['user'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getAverageRating(bookId: string): Promise<number> {
    const result = await this.ratingRepo
      .createQueryBuilder('r')
      .select('AVG(r.score)', 'avg')
      .where('r.bookId = :bookId', { bookId })
      .getRawOne();

    return parseFloat(result?.avg) || 0;
  }

  // Xóa rating của 1 user cho 1 sách
  async removeRating(userId: string, bookId: string): Promise<void> {
    const rating = await this.ratingRepo.findOne({ where: { userId, bookId } });
    if (!rating) throw new NotFoundException('Rating not found');
    await this.ratingRepo.remove(rating);
  }
}
