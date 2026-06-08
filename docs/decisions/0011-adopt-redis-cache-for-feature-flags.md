---
title: Adopt Redis Cache for Feature Flags
date: 2026-06-08
status: superseded
---

# Adopt Redis Cache for Feature Flags

## Status

**Superseded** by ADR-0012 (Adopt Stateless JWT Authorization) and Next.js internal Server Caching (`unstable_cache`).

## Context and Problem Statement

`isFeatureEnabled(key)` in `src/lib/auth/authorization.ts` queries the Neon
Postgres database on **every page render** to check whether a feature flag is
active. Feature flags change very infrequently — only when an admin explicitly
toggles one via `/flags`. This makes them ideal cache candidates.

Prior to this decision, profiling showed that each dashboard page load issued
up to 18 sequential DB round-trips (see ADR-0006 consequences: *"introduces
additional database queries during permission checks, requiring caching or
optimized lookups"*). React.cache() was added to reduce `getUserRole` calls
within a single request, but feature flag queries still hit Postgres every time
because they are not user-scoped and React.cache() is per-request only.

The `REDIS_URL` environment variable is already declared in `.env.example`,
indicating Redis infrastructure was anticipated.

## Decision

We will cache feature flag state in Redis using `ioredis`:

- **Cache key schema**: `feature_flag:{key}` (e.g. `feature_flag:tool_management`)
- **TTL**: 60 seconds — a safety net; the primary freshness mechanism is
  explicit invalidation on mutation.
- **Invalidation strategy**: when `toggleFeatureFlag(key, enabled)` is called,
  immediately `DEL feature_flag:{key}` from Redis before the function returns.
  This ensures the new value is reflected on the very next request.
- **Graceful degradation**: if `REDIS_URL` is not set or the Redis connection
  fails, `isFeatureEnabled` falls back silently to the Postgres query. The
  application continues to function; only the caching benefit is lost.
- **Singleton client**: a single `ioredis` client is created at module load
  time in `src/lib/redis.ts` and reused across all requests. This matches the
  singleton pattern already used for the Postgres pool in `src/lib/db.ts`.
- **User Role Cache**: `getUserRole` is also cached in Redis (key: `user_role:{userId}`,
  TTL: 3600s) to eliminate the ~1s Postgres cold-start latency when resolving
  superuser bypasses and initial role checks on every request.

## Non-goals

- We are NOT implementing a distributed cache-aside pattern or cache stampede
  protection. The flag table is tiny and infrequently written; simple GET/SET
  is sufficient.
- We are NOT using Next.js `unstable_cache` or the `revalidateTag` API for
  this. Those operate at the HTTP response layer and do not persist across
  server restarts or multiple instances.

## Alternatives Considered

- **Next.js `unstable_cache` with `revalidateTag`**: Rejected because it is
  tied to a single server instance and does not survive restarts. Multi-instance
  deployments (e.g. Vercel) would not share the cache.
- **In-process `Map` with TTL**: Rejected for the same reason — not shared
  across instances, lost on restart.
- **Upstash Redis via `@upstash/redis`**: Rejected to keep the connection
  string format standard (`redis://` or `rediss://`). `ioredis` supports both
  and is more widely used for self-hosted Redis; the team can switch to Upstash
  by simply changing `REDIS_URL` without code changes, since ioredis is
  compatible with Upstash's Redis API.

## Consequences

- Good, because feature flag lookups that previously hit Postgres on every
  render now resolve from Redis in < 1 ms for the 60-second TTL window.
- Good, because explicit invalidation ensures toggles take effect immediately
  with zero stale-read risk in practice.
- Good, because graceful degradation means no operational risk if Redis is
  unavailable during deployment or maintenance.
- Good, because the singleton pattern in `src/lib/redis.ts` is easy to extend
  if other data is cached later.
- Bad, because the application now has an optional runtime dependency on Redis.
  Operators must provision and monitor a Redis instance.
- Bad, because if Redis is unavailable AND requests are very high, Postgres
  flag queries may become a bottleneck again.

## Implementation Plan

- **Affected paths**:
  - `src/lib/redis.ts` [NEW] — ioredis singleton + cache helpers
  - `src/lib/auth/authorization.ts` — wrap `isFeatureEnabled` with Redis cache
  - `src/app/flags/actions.ts` — call `invalidateFlagCache(key)` after DB update
  - `.env.example` — add comment to `REDIS_URL` entry
  - `docs/decisions/0011-adopt-redis-cache-for-feature-flags.md` [this file]
- **Dependencies**: `ioredis` (add to `dependencies` in `package.json`)
- **Patterns to follow**:
  - Singleton export matching `src/lib/db.ts` pattern.
  - Graceful null-export when env var is absent (check `process.env.REDIS_URL`
    before creating the client).
  - Add ADR reference comment at the top of `src/lib/redis.ts`.
  - Cache logic must NOT leak into callers — `isFeatureEnabled` signature stays
    identical; the cache is an internal implementation detail.
- **Patterns to avoid**:
  - Do NOT use `ioredis` cluster mode — single-node client only.
  - Do NOT throw or propagate Redis errors to the user; always catch and fall
    back to the DB query.
  - Do NOT cache superuser bypass — the superuser short-circuit in
    `isFeatureEnabled` runs before any Redis interaction and stays untouched.

### Verification

- [x] `npm run build` succeeds with `ioredis` installed.
- [x] `npm test` passes (unit tests must not require a live Redis connection).
- [x] `REDIS_URL` unset → application starts, feature flags resolve from DB,
      no errors logged.
- [x] `REDIS_URL` set and Redis running → `redis-cli GET feature_flag:tool_management`
      returns a value after the first request.
- [x] Admin toggles a flag at `/flags` → `redis-cli GET feature_flag:{key}`
      returns `(nil)` immediately after toggle (cache evicted).
- [x] Next request after toggle → correct new value returned; Redis repopulated.

## More Information

- Relates to ADR-0006: `docs/decisions/0006-adopt-dynamic-role-and-permission-based-authorization.md`
  (the "bad" consequence of extra DB queries, now partially addressed)
- Revisit this decision if: the team adopts Vercel KV or Upstash as the
  standard Redis provider, as the connection approach may benefit from their
  specific SDK.
