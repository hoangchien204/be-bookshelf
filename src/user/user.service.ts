import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entitis/user.entity';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';
import { CreateUserDto } from './create-user.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
  private otpCache = new Map<string, { code: string; expireAt: number }>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly uploadService: UploadService,
    private readonly mailService: MailService

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
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
  async update(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
  async sendVerifyCode(email: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Tạo OTP 6 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = Date.now() + 5 * 60 * 1000; // 5 phút

    this.otpCache.set(email, { code, expireAt });

    await this.mailService.sendMail(
      email,
      'Mã xác minh tài khoản',
      `Mã của bạn là: ${code}`, // plain text
      `<p>Mã xác minh của bạn là: <b>${code}</b></p>` // HTML
    );

    return { message: 'Đã gửi mã xác minh' };
  }


  async create(userData: CreateUserDto & { code: string }, creatorRole: string): Promise<User> {
    const record = this.otpCache.get(userData.email);
    if (!record) {
      throw new BadRequestException('Mã xác minh đã hết hạn hoặc không tồn tại');
    }
    if (record.code !== userData.code) {
      throw new BadRequestException('Mã xác minh không đúng');
    }
    if (record.expireAt < Date.now()) {
      this.otpCache.delete(userData.email);
      throw new BadRequestException('Mã xác minh đã hết hạn');
    }

    // Check username trùng
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: userData.username },
    });
    if (existingUserByUsername) {
      throw new BadRequestException('Username đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    let role = 'user';
    if (creatorRole === 'admin' && (userData.role === 'admin' || userData.role === '1')) {
      role = 'admin';
    }

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role,
      isVerified: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Xoá OTP sau khi dùng
    this.otpCache.delete(userData.email);

    return savedUser;
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
