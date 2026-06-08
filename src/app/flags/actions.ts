'use server';

// ADR: Adopt Redis Cache for Feature Flags
// See: docs/decisions/0011-adopt-redis-cache-for-feature-flags.md

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

export async function toggleFeatureFlag(key: string, enabled: boolean) {
  await assertPermissionForAction('flag:manage');
  await query(
    'INSERT INTO public.feature_flags (key, enabled) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET enabled = $2',
    [key, enabled]
  );
  revalidateTag('feature_flags', 'max');
  revalidatePath('/flags');
  revalidatePath('/');
}
