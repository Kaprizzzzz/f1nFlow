import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() data: { telegramId: string; userName: string }) {
    return this.usersService.findOrCreateUser(data.telegramId, data.userName);
  }


  @Get(':telegramId/state')
  async getState(@Param('telegramId') telegramId: string) {
    return this.usersService.getUserState(telegramId);
  }

  @Put(':telegramId/state')
  async saveState(
    @Param('telegramId') telegramId: string,
    @Body()
    payload: {
      currency?: string;
      incomeCategories?: Array<{ name: string; amount: number; icon?: string }>;
      expenseCategories?: Array<{ name: string; amount: number; icon?: string }>;
      sphereLayout?: Record<'income' | 'expense' | 'saving' | 'news', { left: number; top: number }>;
      transactions?: Array<{
        amount: number;
        category: string;
        type: 'plus' | 'minus';
        date: string;
        label?: string;
      }>;
    }
  ) {
    return this.usersService.saveUserState(telegramId, payload);
  }

  @Patch(':telegramId/presence')
  async setPresence(@Param('telegramId') telegramId: string, @Body() payload: { isOnline: boolean }) {
    return this.usersService.updatePresence(telegramId, payload.isOnline);
  }
}