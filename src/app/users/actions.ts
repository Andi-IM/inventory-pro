'use server';

import { prisma } from '@/lib/db';
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
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidateTag(`user_role_${userId}`, 'max');
  revalidatePath('/users');
}

export async function addUserPermission(userId: string, permission: string) {
  await assertPermissionForAction('user:manage');
  await prisma.userPermission.upsert({
    where: { userId_permission: { userId, permission } },
    update: {},
    create: { userId, permission }
  });
  revalidateTag(`user_permissions_${userId}`, 'max');
  revalidatePath('/users');
}

export async function removeUserPermission(userId: string, permission: string) {
  await assertPermissionForAction('user:manage');
  await prisma.userPermission.deleteMany({
    where: { userId, permission }
  });
  revalidateTag(`user_permissions_${userId}`, 'max');
  revalidatePath('/users');
}
