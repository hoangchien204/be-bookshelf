import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../entitis/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Book } from '../entitis/book.entity';
import { User } from '../entitis/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Book, User])],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
