import { Controller, Get, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entitis/user.entity';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}