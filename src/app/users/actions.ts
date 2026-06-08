'use server';

import { query } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/lib/auth/server';
import { hasPermission } from '@/lib/auth/authorization';

async function assertPermissionForAction(permission: string) {
  const { data: session } = await auth.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  const hasPerm = await hasPermission(session.user.id, permission);
  if (!hasPerm) throw new Error('Forbidden');
}

export async function updateUserRole(userId: string, role: string) {
  await assertPermissionForAction('user:manage');
  await query('UPDATE neon_auth.user SET role = $1 WHERE id = $2', [role, userId]);
  revalidateTag(`user_role_${userId}`, 'max');
  revalidatePath('/users');
}

export async function addUserPermission(userId: string, permission: string) {
  await assertPermissionForAction('user:manage');
  await query(
    'INSERT INTO public.user_permissions (user_id, permission) VALUES ($1, $2) ON CONFLICT (user_id, permission) DO NOTHING',
    [userId, permission]
  );
  revalidateTag(`user_permissions_${userId}`, 'max');
  revalidatePath('/users');
}

export async function removeUserPermission(userId: string, permission: string) {
  await assertPermissionForAction('user:manage');
  await query('DELETE FROM public.user_permissions WHERE user_id = $1 AND permission = $2', [
    userId,
    permission,
  ]);
  revalidateTag(`user_permissions_${userId}`, 'max');
  revalidatePath('/users');
}
