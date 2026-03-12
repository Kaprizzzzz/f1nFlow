import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../services/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: { id: string; telegramId: string };
    }>();

    const authHeader = request.headers['authorization'];
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    const fallback = request.headers['x-auth-token']?.trim();
    const token = bearer || fallback;

    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    const user = await this.usersService.findBySessionToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid auth token');
    }

    request.user = { id: user.id, telegramId: user.telegramId };
    return true;
  }
}