// auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    let user;
    if (email.includes('@')) {
      user = await this.userService.findByEmail(email);
    } else {
      user = await this.userService.findByUsername(email);
    }

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const token = this.jwtService.sign(
      {
        sub: user.id,
        role: user.role,
      },
      {
        expiresIn: '3d',
      },
    );

    return {
      accessToken: token,
      userId: user.id,
      userName: user.username,
      role: user.role,
    };
  }
}
