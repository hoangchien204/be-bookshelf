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

  async sendVerifyCode(email: string, purpose: 'signup' | 'reset') {
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (purpose === 'signup' && existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    if (purpose === 'reset' && !existingUser) {
      throw new BadRequestException('Email không tồn tại');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = Date.now() + 5 * 60 * 1000;
    this.otpCache.set(email, { code, expireAt });

    await this.mailService.sendMail(
      email,
      purpose === 'signup' ? 'Mã xác minh tài khoản' : 'Mã đặt lại mật khẩu',
      `Mã của bạn là: ${code}`,
      `<p>Mã của bạn là: <b>${code}</b></p>`
    );

    return { message: 'Đã gửi mã xác minh' };
  }
  //Đổi mật khẩu
  async resetPassword(email: string, code: string, newPassword: string) {
    const record = this.otpCache.get(email);
    if (!record) {
      throw new BadRequestException('Mã xác minh đã hết hạn hoặc không tồn tại');
    }
    if (record.code !== code) {
      throw new BadRequestException('Mã xác minh không đúng');
    }
    if (record.expireAt < Date.now()) {
      this.otpCache.delete(email);
      throw new BadRequestException('Mã xác minh đã hết hạn');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    this.otpCache.delete(email);

    return { message: 'Đặt lại mật khẩu thành công' };
  }
  //Quên mật khẩu
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Tìm user theo ID từ payload JWT
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Kiểm tra mật khẩu hiện tại có đúng không
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    //  Không cho đặt lại mật khẩu giống mật khẩu cũ
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw new BadRequestException('Mật khẩu mới không được trùng mật khẩu cũ');
    }

    // Hash mật khẩu mới và cập nhật
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }


  async create(userData: CreateUserDto & { code?: string }, creatorRole: string): Promise<User> {
    // Check username trùng
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: userData.username },
    });
    if (existingUserByUsername) {
      throw new BadRequestException('Username đã tồn tại');
    }

    if (creatorRole !== 'admin') {
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
      isVerified: true, // admin tạo trực tiếp thì verified luôn
    });

    const savedUser = await this.userRepository.save(user);

    // Nếu không phải admin → xóa OTP
    if (creatorRole !== 'admin') {
      this.otpCache.delete(userData.email);
    }

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
