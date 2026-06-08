import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { query } from '@/lib/db';
import {
  getUserRole,
  getRolePermissions,
  getUserPermissions,
  hasPermission,
  isFeatureEnabled,
} from './authorization';

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

describe('Dynamic Authorization Helpers Integration Tests', () => {
  const testUserId = '99999999-9999-9999-9999-999999999999';

  beforeAll(async () => {
    try {
      // Clean up if left over from a failed run
      await query('DELETE FROM public.user_permissions WHERE user_id = $1', [testUserId]);
      await query('DELETE FROM neon_auth.user WHERE id = $1', [testUserId]);

      // Insert test user in neon_auth.user with role 'peminjam'
      await query(
        `INSERT INTO neon_auth.user (id, name, email, role, "emailVerified", "createdAt", "updatedAt") 
         VALUES ($1, 'Test Auth User', 'testauth@example.com', 'peminjam', false, NOW(), NOW())`,
        [testUserId]
      );
    } catch (err) {
      console.error('[beforeAll Setup Failed]:', err);
      throw err;
    }
  });

  afterAll(async () => {
    // Clean up
    await query('DELETE FROM public.user_permissions WHERE user_id = $1', [testUserId]);
    await query('DELETE FROM neon_auth.user WHERE id = $1', [testUserId]);
  });

  it('should retrieve default user role', async () => {
    const role = await getUserRole(testUserId);
    expect(role).toBe('peminjam');
  });

  it('should retrieve role default permissions', async () => {
    const permissions = await getRolePermissions('peminjam');
    expect(permissions).toContain('loan:apply');
    expect(permissions).toContain('loan:view_own');
    expect(permissions).not.toContain('loan:review');
  });

  it('should resolve base role permissions correctly', async () => {
    const hasApply = await hasPermission(testUserId, 'loan:apply');
    const hasReview = await hasPermission(testUserId, 'loan:review');

    expect(hasApply).toBe(true);
    expect(hasReview).toBe(false);
  });

  it('should resolve user-specific custom permission overrides', async () => {
    // Direct permission override
    await query(
      'INSERT INTO public.user_permissions (user_id, permission) VALUES ($1, $2)',
      [testUserId, 'loan:review']
    );

    const directPermissions = await getUserPermissions(testUserId);
    expect(directPermissions).toContain('loan:review');

    const hasReview = await hasPermission(testUserId, 'loan:review');
    expect(hasReview).toBe(true);

    // Clean up custom permission override for the next tests
    await query('DELETE FROM public.user_permissions WHERE user_id = $1 AND permission = $2', [
      testUserId,
      'loan:review',
    ]);
  });

  it('should resolve superuser access wildcard', async () => {
    // Update user role to superuser
    await query('UPDATE neon_auth.user SET role = $1 WHERE id = $2', ['superuser', testUserId]);

    const hasRandomPermission = await hasPermission(testUserId, 'any:random:permission');
    expect(hasRandomPermission).toBe(true);
  });

  it('should retrieve feature flags status', async () => {
    const loanEnabled = await isFeatureEnabled('loan_module');
    expect(loanEnabled).toBe(true);

    const nonExistent = await isFeatureEnabled('non_existent_flag');
    expect(nonExistent).toBe(false);
  });
});
