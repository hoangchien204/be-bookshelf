import {
  Controller, Get, Post, Body, Param, Delete, NotFoundException,
  Put, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Request
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entitis/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, Public } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateUserDto } from './create-user.dto';
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
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
  async updateProfile(@Param('id') id: string, @Body() updateData: Partial<User>): Promise<User> {
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
  ) {
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