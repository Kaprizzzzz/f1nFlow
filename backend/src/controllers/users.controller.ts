import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() data: { telegramId: string; userName: string }) {
    return this.usersService.findOrCreateUser(data.telegramId, data.userName);
  }
}