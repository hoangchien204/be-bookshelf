import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entitis/user.entity';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';


@Injectable()
export class UserService {
  constructor(

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly uploadService: UploadService,
  ) { }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findByUsername(username: string) {
    return this.userRepository.findOneBy({ username });
  }
  async create(userData: Partial<User>) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    let role = 'user';
    if (userData.role === '1' || userData.role === 'admin') {
      role = 'admin';
    }

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  async updateProfile(id: string, updateData: Partial<User>) {
    await this.userRepository.update(id, {
      fullName: updateData.fullName,
      avatarUrl: updateData.avatarUrl,
      gender: updateData.gender,
      dateOfBirth: updateData.dateOfBirth,
    });
    return this.userRepository.findOneBy({ id });
  }
  async updateAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const uploadResult = await this.uploadService.uploadFile(
      file,
      "avatars",
      `${userId}_avatar`
    );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    user.avatarUrl = uploadResult.url;
    return this.userRepository.save(user);
  }
  async remove(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Không tìm thấy user');
    return this.userRepository.remove(user);
  }
}
