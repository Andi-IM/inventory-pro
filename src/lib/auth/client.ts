'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}

// Untuk backwards compatibility jika ada yang memanggil `authClient` langsung (seperti neon auth).
export const authClient = {
  // Mockup the minimal functions if other components rely on it directly.
  // Ideally, components should instantiate via createAuthClient() and use Supabase JS syntax.
};
