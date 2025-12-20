import {
  Controller, Get, Post, Body, Param, Delete, NotFoundException,
  Put, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Request,
  ForbiddenException
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entitis/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, Public } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateUserDto } from './create-user.dto';
import { RolesGuard } from 'src/auth/roles.guard';
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles('admin')
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @Post()
  @Public()
  async create(
    @Body() userData: CreateUserDto & { code: string },
    @Request() req
  ) {
    const creatorRole = req?.user?.role || 'user';
    return this.userService.create(userData, creatorRole);
  }

  @Post('admin')
  @Roles('admin')
  async createByAdmin(@Body() userData: CreateUserDto) {
    return this.userService.create(userData, 'admin');
  }
  @Post('verifymail')
  @Public()
  async sendVerifyCode(@Body('email') email: string, @Body('purpose') purpose: 'signup' | 'reset') {
    return this.userService.sendVerifyCode(email, purpose);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.userService.resetPassword(email, code, newPassword);
  }
  @Post('changePassword')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.userService.changePassword(req.user.userId, currentPassword, newPassword);
  }
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @Request() req
  ) {
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    if (requesterId !== id && requesterRole !== 'admin') {
      throw new ForbiddenException(
        'Bạn không có quyền sửa thông tin của người khác'
      );
    }

    const updated = await this.userService.updateProfile(id, updateData);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updated;
  }


  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    if (requesterId !== id && requesterRole !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền đổi avatar của người khác');
    }

    return this.userService.updateAvatar(id, file);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string, @Request() req) {
    const currentUserId = req.user.userId;
    if (id === currentUserId) {
      throw new BadRequestException('Bạn không thể tự xoá tài khoản của mình');
    }
    return this.userService.remove(id);
  }

}