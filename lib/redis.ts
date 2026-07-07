import { Redis } from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  async set(key: string, value: unknown, ttlSeconds = 3600) {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  },
  async del(key: string) {
    await redis.del(key);
  },
};

export async function isRateLimited(userId: string, action: string, limitSeconds = 5): Promise<boolean> {
  try {
    const key = `rate_limit:${action}:${userId}`;
    const result = await redis.set(key, '1', 'EX', limitSeconds, 'NX');
    return result !== 'OK';
  } catch (error) {
    console.error('Rate limiter Redis error:', error);
    return false; // Fail open
  }
}
