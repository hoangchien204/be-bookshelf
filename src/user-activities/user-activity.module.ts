import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from '../entitis/user_activities.entity';
import { UserActivityService } from './user-activity.service';
import { UserActivityController } from './user-activity.controller';
import { UserModule } from 'src/user/user.module';
import { BookModule } from 'src/books/book.module';
@Module({
  imports: [TypeOrmModule.forFeature([UserActivity]),
  UserModule,
  BookModule
],
  providers: [UserActivityService],
  controllers: [UserActivityController],
})
export class UserActivityModule {}
