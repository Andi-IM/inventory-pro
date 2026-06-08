'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { signAuthState } from '@/lib/auth/jwt';
import { query } from '@/lib/db';
import {
  getUserRole,
  getUserPermissions,
  getRolePermissions,
} from '@/lib/auth/authorization';

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  if (process.env.NEXT_PUBLIC_ALLOW_SIGN_UP === 'false') {
    return { error: "Registration is currently disabled." };
  }

  const email = formData.get('email') as string;

  if (!email) {
    return { error: "Email address must be provided." };
  }

  const { error, data } = await auth.signUp.email({
    email,
    name: formData.get('name') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message || 'Failed to create account' };
  }

  // --- Stateless JWT Authorization Generation ---
  if (data?.user) {
    const userId = data.user.id;
    const role = await getUserRole(userId);
    
    const customPerms = await getUserPermissions(userId);
    const rolePerms = await getRolePermissions(role);
    const permissions = Array.from(new Set([...customPerms, ...rolePerms]));

    const flagsRows = await query<{ key: string; enabled: boolean }>(
      'SELECT key, enabled FROM public.feature_flags WHERE enabled = true'
    );
    const flags: Record<string, boolean> = {};
    for (const r of flagsRows) {
      flags[r.key] = true;
    }

    const token = await signAuthState({ role, permissions, flags });

    const cookieStore = await cookies();
    cookieStore.set('inventory_auth_state', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });
  }

  redirect('/');
}
