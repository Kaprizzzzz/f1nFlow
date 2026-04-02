import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleDestroy
} from '@nestjs/common';
import { Socket, connect as connectTcp } from 'node:net';
import { TLSSocket, connect as connectTls } from 'node:tls';

type RequestWithUser = {
  ip?: string;
  user?: { id?: string };
};

type RedisReply = string | number | null | RedisReply[];

@Injectable()
export class RateLimitGuard implements CanActivate, OnModuleDestroy {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly isProd = process.env.NODE_ENV === 'production';
  private readonly windowMs = Number(process.env.THROTTLE_TTL_MS ?? (this.isProd ? 60_000 : 15_000));
  private readonly limit = Number(process.env.THROTTLE_LIMIT ?? (this.isProd ? 60 : 300));
  private readonly redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
  private readonly redis = new TinyRedisClient(this.redisUrl);

 async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const ip = request.ip || 'unknown';
    const userId = request.user?.id || 'anonymous';
    const key = `rate_limit:${ip}:${userId}`;

    const current = await this.incrementWithTtl(key);

    if (current > this.limit) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
  async onModuleDestroy(): Promise<void> {
    await this.redis.close();
  }

  private async incrementWithTtl(key: string): Promise<number> {
    try {
      const result = await this.redis.command([
        'EVAL',
        "local current = redis.call('INCR', KEYS[1]) if current == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end return current",
        '1',
        key,
        String(this.windowMs)
      ]);

      return typeof result === 'number' ? result : Number(result);
    } catch (error) {
      this.logger.warn(`Rate-limit Redis unavailable, bypassing throttling. ${(error as Error).message}`);
      return 1;
    }
  }
}

class TinyRedisClient {
  private readonly logger = new Logger(TinyRedisClient.name);
  private readonly url: URL;

  constructor(url: string) {
    this.url = new URL(url);
  }

  async command(parts: string[]): Promise<RedisReply> {
    const socket = await this.openSocket();

    try {
      if (this.url.password) {
        await this.writeAndRead(socket, this.toResp(['AUTH', this.url.username, this.url.password]));
      }

      const db = this.url.pathname.replace('/', '');
      if (db) {
        await this.writeAndRead(socket, this.toResp(['SELECT', db]));
      }

      return await this.writeAndRead(socket, this.toResp(parts));
    } finally {
      socket.end();
      socket.destroy();
    }
  }

  async close(): Promise<void> {
    this.logger.debug('TinyRedisClient uses one-shot sockets; no persistent connection to close.');
  }

  private openSocket(): Promise<Socket | TLSSocket> {
    return new Promise((resolve, reject) => {
      const port = this.url.port ? Number(this.url.port) : 6379;
      const host = this.url.hostname;
      const useTls = this.url.protocol === 'rediss:';
      const socket = useTls
        ? connectTls({ host, port }, () => resolve(socket))
        : connectTcp({ host, port }, () => resolve(socket));
      socket.once('error', (error) => reject(error));
      socket.setTimeout(3000, () => {
        socket.destroy(new Error('Redis socket timeout'));
      });
    });
  }

  private toResp(parts: string[]): string {
    const encoded = parts.map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`).join('');
    return `*${parts.length}\r\n${encoded}`;
  }

  private writeAndRead(socket: Socket | TLSSocket, payload: string): Promise<RedisReply> {
    return new Promise((resolve, reject) => {
      let buffer = '';

      const onData = (chunk: Buffer): void => {
        buffer += chunk.toString('utf8');
        const parsed = this.parseResp(buffer);

        if (!parsed) {
          return;
        }

        cleanup();
        if (parsed.error) {
          reject(new Error(parsed.error));
          return;
        }

        resolve(parsed.value);
      };

      const onError = (error: Error): void => {
        cleanup();
        reject(error);
      };

      const cleanup = (): void => {
        socket.off('data', onData);
        socket.off('error', onError);
      };

      socket.on('data', onData);
      socket.once('error', onError);
      socket.write(payload);
    });
  }

  private parseResp(raw: string): { value: RedisReply; error?: string } | null {
    if (!raw.length) {
      return null;
    }

    const type = raw[0];
    if (type === '+') {
      const end = raw.indexOf('\r\n');
      if (end < 0) {
        return null;
      }

      return { value: raw.slice(1, end) };
    }

    if (type === '-') {
      const end = raw.indexOf('\r\n');
      if (end < 0) {
        return null;
      }

      return { value: null, error: raw.slice(1, end) };
    }

    if (type === ':') {
      const end = raw.indexOf('\r\n');
      if (end < 0) {
        return null;
      }

      return { value: Number(raw.slice(1, end)) };
    }

    if (type === '$') {
      const end = raw.indexOf('\r\n');
      if (end < 0) {
        return null;
      }

      const length = Number(raw.slice(1, end));
      if (length < 0) {
        return { value: null };
      }

      const start = end + 2;
      const finish = start + length;
      if (raw.length < finish + 2) {
        return null;
      }

      return { value: raw.slice(start, finish) };
    }

    return { value: null, error: `Unsupported RESP type: ${type}` };
  }
}
