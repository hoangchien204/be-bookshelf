import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from '../entitis/user_activities.entity';
import { User } from 'src/entitis/user.entity';
import { Book } from 'src/entitis/book.entity';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private activityRepo: Repository<UserActivity>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,
  ) {}

  // ✅ Ghi nhận hoặc cập nhật tiến độ đọc sách
  async upsertActivity(userId: string, bookId: string, lastPage: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const book = await this.bookRepo.findOneBy({ id: bookId });

    if (!user || !book) throw new NotFoundException('User or Book not found');

    let activity = await this.activityRepo.findOne({
      where: { user: { id: userId }, book: { id: bookId } },
      relations: ['user', 'book'],
    });

    if (!activity) {
      activity = this.activityRepo.create({ user, book, lastPage });
    } else {
      activity.lastPage = lastPage;
    }

    return this.activityRepo.save(activity);
  }

  // ✅ Tìm tiến độ đọc của user trên book
  async findReadingActivity(userId: string, bookId: string) {
    return this.activityRepo.findOne({
      where: {
        user: { id: userId },
        book: { id: bookId },
      },
    });
  }

  // ✅ Lấy toàn bộ hoạt động (admin)
  findAll() {
    return this.activityRepo.find({ relations: ['user', 'book'] });
  }

  // ✅ Lấy toàn bộ sách mà user đã đọc
  findByUser(userId: string) {
    return this.activityRepo.find({
      where: { user: { id: userId } },
      relations: ['book'],
    });
  }
async markAsFavorite(userId: string, bookId: string) {
  const user = await this.userRepo.findOneBy({ id: userId });
  const book = await this.bookRepo.findOneBy({ id: bookId });

  if (!user || !book) throw new NotFoundException('User or Book not found');

  let activity = await this.activityRepo.findOne({
    where: { user: { id: userId }, book: { id: bookId } },
    relations: ['user', 'book'],
  });

  if (!activity) {
    activity = this.activityRepo.create({ user, book, isFavorite: true });
  } else {
    activity.isFavorite = true;
  }

  return this.activityRepo.save(activity);
}
async unmarkFavorite(userId: string, bookId: string) {
  const activity = await this.activityRepo.findOne({
    where: { user: { id: userId }, book: { id: bookId } },
    relations: ['user', 'book'],
  });

  if (!activity) throw new NotFoundException('Activity not found');

  activity.isFavorite = false;
  return this.activityRepo.save(activity);
}
  // ✅ Xoá hoạt động (admin hoặc xoá khi huỷ sách)
  remove(id: string) {
    return this.activityRepo.delete(id);
  }
}
