// ADR: Adopt Redis Cache for Feature Flags
// See: docs/decisions/0011-adopt-redis-cache-for-feature-flags.md

import Redis from 'ioredis';

/**
 * Singleton ioredis client.
 * Exports null when REDIS_URL is not configured — callers must handle null
 * gracefully (fall back to Postgres). This keeps Redis optional at runtime.
 */
export const redis: Redis | null = (() => {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client = new Redis(url, {
    // Disable auto-reconnect retry storm on startup failures
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  client.on('error', (err) => {
    // Log but never propagate — callers fall back to DB silently
    console.warn('[Redis] connection error:', err.message);
  });

  return client;
})();

/** Cache key for a feature flag entry */
export function flagCacheKey(key: string): string {
  return `feature_flag:${key}`;
}

/**
 * Evict a feature flag key from Redis.
 * Called by toggleFeatureFlag after updating the DB so the next request
 * reads the fresh value instead of a stale cached one.
 * Fails silently if Redis is unavailable.
 */
export async function invalidateFlagCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(flagCacheKey(key));
  } catch (err) {
    console.warn(`[Redis] failed to invalidate cache for "${key}":`, (err as Error).message);
  }
}

/** Cache key for a user's role */
export function userRoleCacheKey(userId: string): string {
  return `user_role:${userId}`;
}

/**
 * Evict a user's role from Redis.
 * Called when an admin changes a user's role.
 */
export async function invalidateUserRoleCache(userId: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(userRoleCacheKey(userId));
  } catch (err) {
    console.warn(`[Redis] failed to invalidate role cache for user "${userId}":`, (err as Error).message);
  }
}
