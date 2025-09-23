import {
  Controller, Get, Post, Body, Param, Delete, NotFoundException,
  Put, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Request
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entitis/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, Public } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateUserDto } from './create-user.dto';
import { VerifyEmailDto } from './VerifyEmailDto';
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
    @Body() userData: CreateUserDto,
    @Request() req
  ): Promise<User> {
    const creatorRole = req?.user?.role || 'user';
    return this.userService.create(userData, creatorRole);
  }

  @Post('verifymail')
  @Public()
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return this.userService.verifyEmail(body.email, body.code);
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