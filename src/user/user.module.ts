import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entitis/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UploadModule } from 'src/upload/upload.module';


@Module({
  imports: [TypeOrmModule.forFeature([User]),UploadModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService,TypeOrmModule], 
})
export class UserModule {}
