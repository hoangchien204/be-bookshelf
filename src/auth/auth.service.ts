import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_TIME = 30 * 1000;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(emailOrUsername: string, password: string) {
    const key = emailOrUsername.toLowerCase();
    const now = Date.now();

    const attempts = this.loginAttempts.get(key);
    if (attempts && attempts.count >= this.MAX_ATTEMPTS && now - attempts.lastAttempt < this.LOCK_TIME) {
      throw new HttpException(
        `Bạn đã nhập sai quá ${this.MAX_ATTEMPTS} lần. Vui lòng thử lại sau 30s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // tìm user
    const user = emailOrUsername.includes('@')
      ? await this.userService.findByEmail(emailOrUsername)
      : await this.userService.findByUsername(emailOrUsername);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.loginAttempts.set(key, {
        count: attempts ? attempts.count + 1 : 1,
        lastAttempt: now,
      });
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    this.loginAttempts.delete(key);

    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '3h' },
    );

    return {
      accessToken,
      userId: user.id,
      userName: user.username,
      role: user.role,
    };
  }
}
