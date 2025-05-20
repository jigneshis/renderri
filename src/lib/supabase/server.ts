import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types'; 

const getSupabaseKeys = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey };
};

// Mock client factory to be used if keys are not available
const createMockSupabaseClient = (context: string) => {
  console.warn(`Supabase server client (${context}) is not initialized due to missing environment variables.`);
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null }),
      // Add other auth methods if needed by server actions
    },
    from: (tableName: string) => ({
      select: () => ({ 
        eq: () => ({ 
          single: async () => ({ data: null, error: { message: `Supabase not configured for table ${tableName}` } }),
          order: () => (async () => ({ data: [], error: { message: `Supabase not configured for table ${tableName}` } }))
        }),
        order: () => (async () => ({ data: [], error: { message: `Supabase not configured for table ${tableName}` } }))
      }),
      insert: async () => ({ error: { message: `Supabase not configured for table ${tableName}` } }),
      update: () => ({ 
        eq: async () => ({ error: { message: `Supabase not configured for table ${tableName}` } }),
        neq: () => ({ eq: async () => ({ error: { message: `Supabase not configured for table ${tableName}` } }) })
      }),
    }),
    // Add other Supabase methods as needed for mock
  } as any; // Cast to any to satisfy Supabase client type for mocked parts
};


export const createSupabaseServerClient = (cookieStoreParam?: ReturnType<typeof cookies>) => {
  const cookieStore = cookieStoreParam || cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseKeys();
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return createMockSupabaseClient("user context");
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) { /* The `set` method was called from a Server Component. Ignored. */ }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) { /* The `delete` method was called from a Server Component. Ignored. */ }
        },
      },
    }
  );
};


export const createSupabaseServiceRoleClient = () => {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseKeys();

  if (!supabaseUrl || !supabaseServiceKey) {
     return createMockSupabaseClient("service role");
  }
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: { 
        get() { return undefined; },
        set() {},
        remove() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );
}

