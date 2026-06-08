// ADR: Adopt Dynamic Role and Permission-Based Authorization
// See: docs/decisions/0006-adopt-dynamic-role-and-permission-based-authorization.md

import { query } from '@/lib/db';

/**
 * Get the base role of a user from the neon_auth.user table.
 * Defaults to 'peminjam' if the user role is null or not found.
 */
export async function getUserRole(userId: string): Promise<string> {
  const rows = await query<{ role: string | null }>(
    'SELECT role FROM neon_auth.user WHERE id = $1',
    [userId]
  );
  if (rows.length === 0) {
    return 'peminjam';
  }
  return rows[0].role || 'peminjam';
}

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
 */
export async function isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
  if (userId) {
    const role = await getUserRole(userId);
    if (role === 'superuser') {
      return true;
    }
  }

  const rows = await query<{ enabled: boolean }>(
    'SELECT enabled FROM public.feature_flags WHERE key = $1',
    [key]
  );
  if (rows.length === 0) {
    return false;
  }
  return rows[0].enabled;
}
