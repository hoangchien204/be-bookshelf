import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from '../entitis/user_activities.entity';
import { User } from 'src/entitis/user.entity';
import { Book } from 'src/entitis/book.entity';

export interface UpsertActivityDto {
  bookId: string;
  lastPage?: number;     
  lastLocation?: string;   
  progressPct?: number;    
}

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private activityRepo: Repository<UserActivity>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,
  ) { }

  // Ghi nhận hoặc cập nhật tiến độ đọc sách
  async upsertActivity(
  userId: string,
  body: { bookId: string; lastPage?: number; lastLocation?: string; progressPct?: number }
) {
  const { bookId, lastPage, lastLocation, progressPct } = body;

  const user = await this.userRepo.findOneBy({ id: userId });
  const book = await this.bookRepo.findOneBy({ id: bookId });

  if (!user || !book) {
    throw new NotFoundException('User or Book not found');
  }

  let activity = await this.activityRepo.findOne({
    where: { user: { id: userId }, book: { id: bookId } },
    relations: ['user', 'book'],
  });

  if (!activity) {
    activity = this.activityRepo.create({
      user,
      book,
      lastPage,
      lastLocation,
      progressPct,
    });
  } else {
    if (lastPage !== undefined) activity.lastPage = lastPage;
    if (lastLocation !== undefined) activity.lastLocation = lastLocation;
    if (progressPct !== undefined) activity.progressPct = progressPct;
  }
  return this.activityRepo.save(activity);
}


  async findReadingActivity(userId: string, bookId: string) {
    return this.activityRepo.findOne({
      where: {
        user: { id: userId },
        book: { id: bookId },
      },
    });
  }

  //  Lấy toàn bộ hoạt động (admin)
  findAll() {
    return this.activityRepo.find({ relations: ['user', 'book'] });
  }

 findByUser(userId: string) {
  return this.activityRepo.find({
    where: { 
      user: { id: userId },
    },
    relations: ['book'],
    order: { updatedAt: 'DESC' }
  });
}
  async findFavoritesByUser(userId: string) {
    const activities = await this.activityRepo.find({
      where: {
        user: { id: userId },
        isFavorite: true,
      },
      relations: ['book'],
    });

    return activities.map(activity => activity.book);
  }

  async toggleFavorite(userId: string, bookId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const book = await this.bookRepo.findOneBy({ id: bookId });

    if (!user || !book) {
      throw new NotFoundException('User or Book not found');
    }

    let activity = await this.activityRepo.findOne({
      where: { user: { id: userId }, book: { id: bookId } },
      relations: ['user', 'book'],
    });

    if (activity) {
      activity.isFavorite = !activity.isFavorite;
    } else {
      activity = this.activityRepo.create({
        user,
        book,
        isFavorite: true,
        lastPage: 1,
      });
    }

    const saved = await this.activityRepo.save(activity);

    return {
      isFavorite: saved.isFavorite,
    };
  }

  remove(id: string) {
    return this.activityRepo.delete(id);
  }
}
