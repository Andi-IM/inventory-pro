'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  await auth.signOut();
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.delete('inventory_auth_state');
  redirect('/');
}
