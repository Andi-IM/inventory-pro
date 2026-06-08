'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/server';
import { getUserRole } from '@/lib/auth/authorization';

// Helper to assert that the caller is a superuser
async function assertSuperuser() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const role = await getUserRole(session.user.id);
  if (role !== 'superuser') {
    throw new Error('Forbidden');
  }
}

export async function updateUserRole(userId: string, role: string) {
  await assertSuperuser();
  await query('UPDATE neon_auth.user SET role = $1 WHERE id = $2', [role, userId]);
  revalidatePath('/admin/users');
}

export async function addUserPermission(userId: string, permission: string) {
  await assertSuperuser();
  await query(
    'INSERT INTO public.user_permissions (user_id, permission) VALUES ($1, $2) ON CONFLICT (user_id, permission) DO NOTHING',
    [userId, permission]
  );
  revalidatePath('/admin/users');
}

export async function removeUserPermission(userId: string, permission: string) {
  await assertSuperuser();
  await query('DELETE FROM public.user_permissions WHERE user_id = $1 AND permission = $2', [
    userId,
    permission,
  ]);
  revalidatePath('/admin/users');
}

export async function addRolePermission(role: string, permission: string) {
  await assertSuperuser();
  await query(
    'INSERT INTO public.role_permissions (role, permission) VALUES ($1, $2) ON CONFLICT (role, permission) DO NOTHING',
    [role, permission]
  );
  revalidatePath('/admin/roles');
}

export async function removeRolePermission(role: string, permission: string) {
  await assertSuperuser();
  await query('DELETE FROM public.role_permissions WHERE role = $1 AND permission = $2', [
    role,
    permission,
  ]);
  revalidatePath('/admin/roles');
}

export async function toggleFeatureFlag(key: string, enabled: boolean) {
  await assertSuperuser();
  await query(
    'INSERT INTO public.feature_flags (key, enabled) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET enabled = $2',
    [key, enabled]
  );
  revalidatePath('/admin/flags');
  revalidatePath('/admin');
  revalidatePath('/');
}
