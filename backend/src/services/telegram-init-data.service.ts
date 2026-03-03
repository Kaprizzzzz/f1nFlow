import { Injectable } from '@nestjs/common';

export interface TelegramProfileFromInitData {
  telegramId: string;
  userName?: string;
}

@Injectable()
export class TelegramInitDataService {
  parse(initData?: string | null): TelegramProfileFromInitData | null {
    if (!initData) {
      return null;
    }

    const normalized = initData.trim();
    if (!normalized) {
      return null;
    }

    const params = new URLSearchParams(normalized);
    const userRaw = params.get('user');

    if (!userRaw) {
      return null;
    }

    try {
      const user = JSON.parse(userRaw) as {
        id?: number | string;
        username?: string;
        first_name?: string;
      };

      if (!user?.id) {
        return null;
      }

      return {
        telegramId: String(user.id),
        userName: user.username ? `@${user.username}` : user.first_name || undefined
      };
    } catch {
      return null;
    }
  }
}