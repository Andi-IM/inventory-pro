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

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const { error, data } = await auth.signIn.email({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message || 'Failed to sign in. Try again' };
  }

  // --- Stateless JWT Authorization Generation ---
  // If the user signed in successfully, generate the auth state JWT
  if (data?.user) {
    const userId = data.user.id;
    const role = await getUserRole(userId);
    
    // Aggregate all permissions
    const customPerms = await getUserPermissions(userId);
    const rolePerms = await getRolePermissions(role);
    const permissions = Array.from(new Set([...customPerms, ...rolePerms]));

    // Fetch all active feature flags
    const flagsRows = await query<{ key: string; enabled: boolean }>(
      'SELECT key, enabled FROM public.feature_flags WHERE enabled = true'
    );
    const flags: Record<string, boolean> = {};
    for (const r of flagsRows) {
      flags[r.key] = true;
    }

    // Sign the JWT
    const token = await signAuthState({ role, permissions, flags });

    // Set HTTP-only secure cookie
    const cookieStore = await cookies();
    cookieStore.set('inventory_auth_state', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes TTL
      path: '/',
    });
  }

  redirect('/');
}
