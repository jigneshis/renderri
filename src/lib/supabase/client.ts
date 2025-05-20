"use client";

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types'; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you might want to show a more user-friendly error or have a fallback state.
  // For this context, throwing an error during development is acceptable to highlight misconfiguration.
  console.error("Supabase URL or Anon Key is missing. Check .env.local file. App functionality will be limited.");
  // throw new Error("Supabase URL or Anon Key is missing. Check .env.local file.");
}

export const createSupabaseBrowserClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client or handle the absence of keys gracefully
    // This is a simplified mock to prevent crashes if keys are not set during development/build.
    console.warn("Supabase client is not initialized due to missing environment variables.");
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: "Supabase not configured" } }) }) }),
        insert: async () => ({ error: { message: "Supabase not configured" } }),
        update: () => ({ eq: async () => ({ error: { message: "Supabase not configured" } }) }),
      }),
      // Add other Supabase methods as needed for mock
    } as any; // Cast to any to satisfy Supabase client type for mocked parts
  }
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
};

// Singleton instance for client-side usage
let supabaseBrowserClientInstance: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export const getSupabaseBrowserClient = () => {
  if (!supabaseBrowserClientInstance) {
    supabaseBrowserClientInstance = createSupabaseBrowserClient();
  }
  return supabaseBrowserClientInstance;
};
