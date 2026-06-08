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

export async function addRolePermission(role: string, permission: string) {
  await assertPermissionForAction('role:manage');
  await query(
    'INSERT INTO public.role_permissions (role, permission) VALUES ($1, $2) ON CONFLICT (role, permission) DO NOTHING',
    [role, permission]
  );
  revalidateTag(`role_permissions_${role}`, 'max');
  revalidatePath('/roles');
}

export async function removeRolePermission(role: string, permission: string) {
  await assertPermissionForAction('role:manage');
  await query('DELETE FROM public.role_permissions WHERE role = $1 AND permission = $2', [
    role,
    permission,
  ]);
  revalidateTag(`role_permissions_${role}`, 'max');
  revalidatePath('/roles');
}
