import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entitis/comment.entity';
import { User } from '../entitis/user.entity';
import { Book } from '../entitis/book.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  async create(userId: string, bookId: string, content: string): Promise<Comment> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    const comment = this.commentRepo.create({ content, user, book });
    return this.commentRepo.save(comment);
  }

  async findByBook(bookId: string): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { bookId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(commentId: string, userId: string): Promise<void> {
  const comment = await this.commentRepo.findOne({
    where: { id: commentId },
    relations: ['user'],
  });

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }
  if (comment.user.id !== userId) {
    throw new UnauthorizedException('Bạn không có quyền xóa comment này');
  }

  await this.commentRepo.remove(comment);
}

}
