import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, timingSafeEqual } from 'crypto';

export interface TelegramProfileFromInitData {
  telegramId: string;
  userName?: string;
}

@Injectable()
export class TelegramInitDataService {
  constructor(private readonly configService: ConfigService) {}

  validateAndParse(initData?: string | null): TelegramProfileFromInitData | null {
    if (!initData) {
      return null;
    }

    const normalized = initData.trim();
    if (!normalized) {
      return null;
    }

     const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      return null;
    }


    const params = new URLSearchParams(normalized);
    const hash = params.get('hash');
    if (!hash) {
      return null;
    }

    const entries = [...params.entries()]
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b));

    const checkString = entries.map(([key, value]) => `${key}=${value}`).join('\n');
    const secretKey = createHash('sha256').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey).update(checkString).digest('hex');

    const expectedBuffer = Buffer.from(computedHash, 'hex');
    const providedBuffer = Buffer.from(hash, 'hex');

    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      return null;
    }

    const authDateRaw = params.get('auth_date');
    const authDate = Number(authDateRaw);
    const maxAgeSeconds = Number(this.configService.get('TELEGRAM_INIT_DATA_MAX_AGE_SECONDS') ?? 86400);
    if (!Number.isFinite(authDate) || Math.abs(Date.now() / 1000 - authDate) > maxAgeSeconds) {
      return null;
    }

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