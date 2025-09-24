import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

interface JwtPayload {
  sub: string;
  role: string;
}

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

    const tokens = await this.getTokens(user.id, user.role);

    // hash refresh token trước khi lưu
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userService.update(user);

    return {
      ...tokens,
      userId: user.id,
      userName: user.username,
      role: user.role,
    };
  }

  private async getTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '1d',
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      }) as JwtPayload;

      const user = await this.userService.findById(payload.sub);
      if (!user || !user.refreshToken) throw new UnauthorizedException();

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) throw new UnauthorizedException();

      const tokens = await this.getTokens(user.id, user.role);
      user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      await this.userService.update(user);

      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }
}
