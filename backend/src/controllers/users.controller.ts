import { BadRequestException, Body, Controller, Get, Headers, Param, Patch, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { TelegramInitDataService } from '../services/telegram-init-data.service';

interface LoginPayload {
  telegramId?: string;
  userName?: string;
  initData?: string;
}

@Controller('users')
export class UsersController {
 constructor(
    private readonly usersService: UsersService,
    private readonly telegramInitDataService: TelegramInitDataService
  ) {}

  @Post('login')
  async login(
    @Body() data: LoginPayload,
    @Headers('authorization') authorization?: string,
    @Headers('x-telegram-init-data') headerInitData?: string
  ) {
    const authInitData = authorization?.startsWith('tma ') ? authorization.slice(4) : undefined;
    const parsedTelegramProfile = this.telegramInitDataService.parse(data?.initData || headerInitData || authInitData);

    const telegramId = parsedTelegramProfile?.telegramId || data.telegramId;
    const userName = parsedTelegramProfile?.userName || data.userName;

    if (!telegramId) {
      throw new BadRequestException('telegramId is required for login');
    }

    return this.usersService.findOrCreateUser(telegramId, userName || `Guest ${telegramId.slice(-4)}`);
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