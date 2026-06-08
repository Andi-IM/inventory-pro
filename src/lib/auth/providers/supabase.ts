import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AuthAdapter, AuthSession, AuthResponse } from '@/types/auth';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  );
}

export const supabaseAdapter: AuthAdapter = {
  getSession: async (): Promise<AuthResponse<AuthSession>> => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { data: null, error: error ? { message: error.message } : null };
    }

    const authSession: AuthSession = {
      user: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
        role: user.user_metadata?.role,
      }
    };
    return { data: authSession, error: null };
  },
  
  signOut: async (): Promise<void> => {
    const supabase = await createClient();
    await supabase.auth.signOut();
  },
  
  signUp: {
    email: async (credentials): Promise<AuthResponse<{ user: { id: string } }>> => {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          }
        }
      });
      
      if (!error && data.user) {
        // Create user in public.users to keep Prisma schema relations intact
        try {
          const { prisma } = await import('@/lib/db');
          await prisma.user.upsert({
            where: { id: data.user.id },
            update: { name: credentials.name, email: credentials.email },
            create: { id: data.user.id, email: credentials.email, name: credentials.name },
          });
        } catch (dbError) {
          console.error("Failed to sync user to public.users:", dbError);
        }
      }

      return { data: data.user ? { user: { id: data.user.id } } : null, error: error ? { message: error.message } : null };
    }
  },
  
  signIn: {
    email: async (credentials): Promise<AuthResponse<{ session: { user: { id: string } } }>> => {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      return { 
        data: data.session ? { session: { user: { id: data.session.user.id } } } : null, 
        error: error ? { message: error.message } : null 
      };
    }
  },
  
  handler: () => {
    return {
      GET: async () => new Response("Supabase SSR does not need this handler", { status: 200 }),
      POST: async () => new Response("Supabase SSR does not need this handler", { status: 200 }),
    };
  },
};
