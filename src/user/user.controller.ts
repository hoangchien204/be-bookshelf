import { Controller, Get, Post, Body, Param, Delete, NotFoundException,
          Put, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entitis/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@Controller('users')
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
  create(@Body() userData: Partial<User>): Promise<User> {

    let role = 'user';
    if (userData.role === '1') {
      role = 'admin';
    }

    return this.userService.create({
      ...userData,
      role,
    });
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
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    const currentUserId = req.user.userId; // 👈 id user hiện tại từ token
    if (id === currentUserId) {
      throw new BadRequestException('Bạn không thể tự xoá tài khoản của mình');
    }
    return this.userService.remove(id);
  }

}