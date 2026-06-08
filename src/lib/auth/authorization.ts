// ADR: Adopt Dynamic Role and Permission-Based Authorization
// See: docs/decisions/0006-adopt-dynamic-role-and-permission-based-authorization.md

import { cache } from 'react';
import { query } from '@/lib/db';
import { redis, flagCacheKey, userRoleCacheKey } from '@/lib/redis';


/**
 * Get the base role of a user from the neon_auth.user table.
 * Defaults to 'peminjam' if the user role is null or not found.
 *
 * Wrapped with React.cache() so that multiple callers within the same
 * server render (e.g. DashboardLayout → isFeatureEnabled → hasPermission)
 * share a single DB round-trip instead of each issuing their own query.
 *
 * Caches the role in Redis for 1 hour to prevent DB round-trips entirely.
 */
export const getUserRole = cache(async function getUserRole(userId: string): Promise<string> {
  // --- Redis cache layer ---
  if (redis) {
    try {
      const cached = await redis.get(userRoleCacheKey(userId));
      if (cached) {
        return cached;
      }
    } catch (err) {
      console.warn(`[Redis] cache read failed for user role "${userId}":`, (err as Error).message);
    }
  }

  // --- Postgres fallback ---
  const rows = await query<{ role: string | null }>(
    'SELECT role FROM neon_auth.user WHERE id = $1',
    [userId]
  );
  
  const role = (rows.length === 0 || !rows[0].role) ? 'peminjam' : rows[0].role;

  // Populate cache for subsequent requests (fire-and-forget; TTL = 1 hour)
  if (redis) {
    redis.set(userRoleCacheKey(userId), role, 'EX', 3600).catch((err) => {
      console.warn(`[Redis] cache write failed for user role "${userId}":`, (err as Error).message);
    });
  }

  return role;
});

/**
 * Retrieve all default permissions mapped to a role in the role_permissions table.
 */
export async function getRolePermissions(role: string): Promise<string[]> {
  const rows = await query<{ permission: string }>(
    'SELECT permission FROM public.role_permissions WHERE role = $1',
    [role]
  );
  return rows.map((r) => r.permission);
}

/**
 * Retrieve all custom, user-specific permission overrides from the user_permissions table.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const rows = await query<{ permission: string }>(
    'SELECT permission FROM public.user_permissions WHERE user_id = $1',
    [userId]
  );
  return rows.map((r) => r.permission);
}

/**
 * Get all available roles dynamically from the role_permissions table,
 * plus 'superuser' which is always present as a special built-in role.
 * This avoids hardcoding the role list in UI components.
 */
export async function getAvailableRoles(): Promise<string[]> {
  const rows = await query<{ role: string }>(
    'SELECT DISTINCT role FROM public.role_permissions ORDER BY role ASC'
  );
  const roles = rows.map((r) => r.role);
  // 'superuser' is a special built-in role; always include it last
  if (!roles.includes('superuser')) {
    roles.push('superuser');
  }
  return roles;
}

/**
 * Get all known permissions from the system — a union of permissions
 * assigned to roles and those granted directly to users.
 * Used to populate searchable datalist suggestions in admin UI.
 */
export async function getAvailablePermissions(): Promise<string[]> {
  const rows = await query<{ permission: string }>(
    `SELECT DISTINCT permission FROM public.role_permissions
     UNION
     SELECT DISTINCT permission FROM public.user_permissions
     ORDER BY permission ASC`
  );
  return rows.map((r) => r.permission);
}

/**
 * Check if a user belongs to a specific role (or is a superuser).
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole === role || userRole === 'superuser';
}

/**
 * Determine if a user has access to a specific permission.
 * Resolves to true if the user is a superuser, has the permission directly, 
 * or has the permission assigned via their base role.
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const role = await getUserRole(userId);
  if (role === 'superuser') {
    return true;
  }

  // Check custom/direct user permission overrides
  const userPermissions = await getUserPermissions(userId);
  if (userPermissions.includes(permission)) {
    return true;
  }

  // Check default role capabilities
  const rolePermissions = await getRolePermissions(role);
  if (rolePermissions.includes(permission)) {
    return true;
  }

  return false;
}

/**
 * Check if a dynamic feature flag is active in the database.
 *
 * Cache strategy (ADR-0011):
 *  1. Superuser bypass — checked first, no cache needed.
 *  2. Redis GET `feature_flag:{key}` — returns immediately on hit.
 *  3. Postgres query on miss → stored in Redis with 60s TTL.
 *  4. Redis errors are caught silently; Postgres remains the source of truth.
 */
export async function isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
  if (userId) {
    const role = await getUserRole(userId);
    if (role === 'superuser') {
      return true;
    }
  }

  // --- Redis cache layer ---
  if (redis) {
    try {
      const cached = await redis.get(flagCacheKey(key));
      if (cached !== null) {
        return cached === 'true';
      }
    } catch (err) {
      console.warn(`[Redis] cache read failed for flag "${key}":`, (err as Error).message);
    }
  }

  // --- Postgres fallback ---
  const rows = await query<{ enabled: boolean }>(
    'SELECT enabled FROM public.feature_flags WHERE key = $1',
    [key]
  );
  const enabled = rows.length > 0 ? rows[0].enabled : false;

  // Populate cache for subsequent requests (fire-and-forget; TTL = 60s)
  if (redis) {
    redis.set(flagCacheKey(key), String(enabled), 'EX', 60).catch((err) => {
      console.warn(`[Redis] cache write failed for flag "${key}":`, (err as Error).message);
    });
  }

  return enabled;
}
