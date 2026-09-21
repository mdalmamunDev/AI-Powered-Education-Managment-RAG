import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Cache entries expire after this many seconds (SET EX).
const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '300', 10);

// Dedicated plain connection for cache reads/writes. Kept separate from the
// BullMQ queue connections in modules/assistant & modules/embedding, which
// require maxRetriesPerRequest: null for blocking workers.
export const redis = new IORedis(REDIS_URL);

// Generic cache-aside helper: returns the cached value for `key` when present,
// otherwise runs `callback`, stores its result under `key` with a TTL, and
// returns it. The `cached` flag lets callers (e.g. HTTP responses) report
// whether the payload came from the cache.
export const getOrSetCache = async <T>(
  key: string,
  callback: () => Promise<T>,
  ttl = CACHE_TTL,
): Promise<{ data: T; cached: boolean }> => {
  const cached = await redis.get(key);

  if (cached) {
    return {
      data: JSON.parse(cached),
      cached: true,
    };
  }

  const freshData = await callback();

  await redis.setex(key, ttl, JSON.stringify(freshData));

  return {
    data: freshData,
    cached: false,
  };
};

export const removeRedisKey = async (key: string) => {
  if(!key || typeof key !== 'string') return;
  const keys = await redis.keys(key);
  if (!keys || keys.length === 0) return;

  await redis.del(...keys);
};

