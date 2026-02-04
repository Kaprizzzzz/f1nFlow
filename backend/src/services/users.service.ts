import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid'; // Не забудь: npm install uuid

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOrCreateUser(telegramId: string, userName: string): Promise<User> {
    // Шукаємо за telegramId
    let user = await this.usersRepository.findOne({ where: { telegramId } });

    if (!user) {
      user = this.usersRepository.create({
        telegramId,
        userName,
        // Генеруємо короткий код для рефералки або використовуємо UUID
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
      await this.usersRepository.save(user);
    }
    return user;
  }
}