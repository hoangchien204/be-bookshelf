import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../entitis/user.entity';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';
import { CreateUserDto } from './create-user.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly uploadService: UploadService,
    private readonly mailerService: MailerService
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

  async create(userData: CreateUserDto, creatorRole: string): Promise<User> {
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: userData.username },
    });
    if (existingUserByUsername) {
      throw new BadRequestException('Username đã tồn tại');
    }

    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existingUserByEmail) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    let role = 'user';
    if (
      creatorRole === 'admin' &&
      (userData.role === 'admin' || userData.role === '1')
    ) {
      role = 'admin';
    }

    let isVerified = role === 'admin';
    let verificationCode: string | null = null;
    let verificationExpires: Date | null = null;

    if (!isVerified) {
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      verificationExpires = new Date(Date.now() + 5 * 60 * 1000);
    }

    // ép kiểu để TS hiểu đúng object
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role,
      isVerified,
      verificationCode,
      verificationExpires,
    } as DeepPartial<User>);

    const savedUser = await this.userRepository.save(user);

    // 👇 gửi mail xác thực
    if (!isVerified && verificationCode) {
      await this.mailerService.sendMail({
        to: savedUser.email,
        subject: 'Mã xác minh tài khoản',
        text: `Mã xác minh của bạn là: ${verificationCode}`,
        html: `<p>Xin chào <b>${savedUser.username}</b>,</p>
             <p>Mã xác minh của bạn là: <b>${verificationCode}</b></p>
             <p>Mã này có hiệu lực trong 5 phút.</p>`,
      });
    }

    return savedUser;
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new BadRequestException('Email không tồn tại');
    if (user.isVerified) throw new BadRequestException('Tài khoản đã được xác minh');

    if (
      user.verificationCode !== code ||
      !user.verificationExpires ||
      user.verificationExpires < new Date()
    ) {
      throw new BadRequestException('Mã xác minh không hợp lệ hoặc đã hết hạn');
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;

    await this.userRepository.save(user);
    return { message: 'Xác minh email thành công' };
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
