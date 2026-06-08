// ADR: Adopt Dynamic Role and Permission-Based Authorization
// See: docs/decisions/0006-adopt-dynamic-role-and-permission-based-authorization.md

import { cache } from 'react';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { verifyAuthState } from './jwt';

/**
 * Retrieve the parsed JWT authorization state from the user's cookie.
 * This completely bypasses the database for < 5ms latency.
 */
async function getCachedAuthState() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('inventory_auth_state')?.value;
    if (!token) return null;
    return await verifyAuthState(token);
  } catch {
    // cookies() throws if called outside a request context
    return null;
  }
}

/**
 * Get the base role of a user.
 * 1. Checks JWT Cookie (stateless, <5ms).
 * 2. Falls back to Next.js Data Cache (unstable_cache) + DB query.
 */
export const getUserRole = cache(async function getUserRole(userId: string): Promise<string> {
  const authState = await getCachedAuthState();
  if (authState) {
    return authState.role;
  }

  // --- Next.js Data Cache Fallback ---
  return unstable_cache(
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      return (!user || !user.role) ? 'peminjam' : user.role;
    },
    ['db_user_role', userId],
    { tags: [`user_role_${userId}`] }
  )();
});

/**
 * Retrieve all default permissions mapped to a role in the role_permissions table.
 */
export async function getRolePermissions(role: string): Promise<string[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.rolePermission.findMany({
        where: { role },
        select: { permission: true },
      });
      return rows.map((r) => r.permission);
    },
    ['db_role_permissions', role],
    { tags: [`role_permissions_${role}`] }
  )();
}

/**
 * Retrieve all custom, user-specific permission overrides from the user_permissions table.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.userPermission.findMany({
        where: { userId },
        select: { permission: true },
      });
      return rows.map((r) => r.permission);
    },
    ['db_user_permissions', userId],
    { tags: [`user_permissions_${userId}`] }
  )();
}

/**
 * Get all available roles dynamically.
 */
export async function getAvailableRoles(): Promise<string[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.rolePermission.findMany({
        select: { role: true },
        distinct: ['role'],
        orderBy: { role: 'asc' },
      });
      const roles = rows.map((r) => r.role);
      if (!roles.includes('superuser')) {
        roles.push('superuser');
      }
      return roles;
    },
    ['db_available_roles'],
    { tags: ['available_roles'] }
  )();
}

/**
 * Get all known permissions from the system.
 */
export async function getAvailablePermissions(): Promise<string[]> {
  return unstable_cache(
    async () => {
      const [rolePerms, userPerms] = await Promise.all([
        prisma.rolePermission.findMany({ select: { permission: true }, distinct: ['permission'] }),
        prisma.userPermission.findMany({ select: { permission: true }, distinct: ['permission'] })
      ]);
      const allPerms = new Set([...rolePerms.map(r => r.permission), ...userPerms.map(r => r.permission)]);
      return Array.from(allPerms).sort();
    },
    ['db_available_permissions'],
    { tags: ['available_permissions'] }
  )();
}

/**
 * Check if a user belongs to a specific role.
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole === role || userRole === 'superuser';
}

/**
 * Determine if a user has access to a specific permission.
 * 1. Checks JWT Cookie (stateless, <5ms).
 * 2. Falls back to Next.js Data Cache / DB queries.
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const authState = await getCachedAuthState();
  if (authState) {
    if (authState.role === 'superuser') return true;
    return authState.permissions.includes(permission);
  }

  // Fallback DB logic
  const role = await getUserRole(userId);
  if (role === 'superuser') {
    return true;
  }

  const userPermissions = await getUserPermissions(userId);
  if (userPermissions.includes(permission)) {
    return true;
  }

  const rolePermissions = await getRolePermissions(role);
  if (rolePermissions.includes(permission)) {
    return true;
  }

  return false;
}

/**
 * Check if a dynamic feature flag is active.
 * 1. Checks JWT Cookie (stateless, <5ms).
 * 2. Falls back to Next.js Data Cache.
 */
export async function isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
  const authState = await getCachedAuthState();
  if (authState) {
    if (userId && authState.role === 'superuser') return true;
    return authState.flags[key] === true;
  }

  if (userId) {
    const role = await getUserRole(userId);
    if (role === 'superuser') {
      return true;
    }
  }

  // --- Next.js Data Cache Fallback ---
  return unstable_cache(
    async () => {
      const flag = await prisma.featureFlag.findUnique({
        where: { key },
        select: { enabled: true },
      });
      return flag ? flag.enabled : false;
    },
    ['db_feature_flag', key],
    { tags: ['feature_flags'] }
  )();
}
