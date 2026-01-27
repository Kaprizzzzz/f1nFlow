import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Controller() // Порожньо, отже префікса немає
export class AppController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('add-test-user') // Шлях: localhost:3000/add-test-user
  async addUser() {
    const newUser = this.userRepository.create({
      firstName: 'Ulas',
      isActive: true,
    });
    await this.userRepository.save(newUser);
    return { message: 'User added to Supabase!', user: newUser };
  }
}