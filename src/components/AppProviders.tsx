"use client";

import type React from 'react';
// import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'; // Example if using context

// This component can be expanded to include other global providers
export default function AppProviders({ children }: { children: React.ReactNode }) {
  // If Supabase client-side auth context is needed, wrap children with it here
  // For now, it's a simple pass-through. Server-side auth will be primary.
  return <>{children}</>;
}
