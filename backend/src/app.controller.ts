import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity'; // ПЕРЕВІР, щоб файл був у папці entities

@Controller('users') 
export class AppController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get() // Шлях: http://localhost:3000/users
  findAll() {
    return this.userRepository.find();
  }

  @Get('add-test-user') // Шлях: http://localhost:3000/users/add-test-user
  async addUser() {
    const newUser = this.userRepository.create({
      firstName: 'Ulas',
      isActive: true,
    });
    await this.userRepository.save(newUser);
    return { message: 'User added!', user: newUser };
  }
}