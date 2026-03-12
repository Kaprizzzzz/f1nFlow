import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowMs = Number(process.env.THROTTLE_TTL_MS ?? 60_000);
  private readonly limit = Number(process.env.THROTTLE_LIMIT ?? 25);
  private readonly buckets = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ ip?: string; path?: string }>();
    const key = `${request.ip || 'unknown'}:${request.path || ''}`;
    const now = Date.now();

    const existing = this.buckets.get(key) ?? [];
    const next = existing.filter((timestamp) => now - timestamp <= this.windowMs);

    if (next.length >= this.limit) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    next.push(now);
    this.buckets.set(key, next);

    return true;
  }
}