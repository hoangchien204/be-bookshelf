import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entitis/user.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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
   async create(userData: Partial<User>) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  remove(id: string) {
    return this.userRepository.delete(id);
  }
}
