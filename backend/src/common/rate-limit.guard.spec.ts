import { ExecutionContext, Logger } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.THROTTLE_LIMIT = '2';
    process.env.THROTTLE_TTL_MS = '10000';
    delete process.env.RATE_LIMIT_FAIL_OPEN;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  function createContext(ip = '127.0.0.1', userId = 'u1'): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ ip, user: { id: userId } })
      })
    } as ExecutionContext;
  }

  it('allows requests when Redis is available', async () => {
    const guard = new RateLimitGuard();
    const redisCommand = jest.fn().mockResolvedValue(1);
    (guard as any).redis.command = redisCommand;

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(redisCommand).toHaveBeenCalledTimes(1);
  });

  it('falls back to in-memory counters when Redis times out', async () => {
    const guard = new RateLimitGuard();
    const redisCommand = jest.fn().mockRejectedValue(new Error('Redis socket timeout'));
    (guard as any).redis.command = redisCommand;
    const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    await expect(guard.canActivate(createContext())).resolves.toBe(true);

    expect(redisCommand).toHaveBeenCalledTimes(2);
    expect(loggerWarn).toHaveBeenCalledTimes(1);
  });

  it('blocks when fallback counter exceeds the limit', async () => {
    const guard = new RateLimitGuard();
    (guard as any).redis.command = jest.fn().mockRejectedValue(new Error('Redis socket timeout'));

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    await expect(guard.canActivate(createContext())).rejects.toMatchObject({ status: 429 });
  });
});
