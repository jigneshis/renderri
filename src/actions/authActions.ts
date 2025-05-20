"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
// import { redirect } from 'next/navigation'; // redirect is not used here, client handles it

const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(values: z.infer<typeof AuthSchema>) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const validatedFields = AuthSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: { message: "Invalid fields." } };
  }
  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: { message: error.message || "Login failed." } };
  }
  return { error: null };
}

export async function signup(values: z.infer<typeof AuthSchema>) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  
  const validatedFields = AuthSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: { message: "Invalid fields." } };
  }
  const { email, password } = validatedFields.data;
  
  // Construct the site URL for email redirect
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002');


  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
       emailRedirectTo: `${siteUrl}/auth/callback`, 
    },
  });

  if (error) {
    return { error: { message: error.message || "Signup failed." } };
  }

  // Check if user needs confirmation. Supabase returns a user object even if confirmation is pending.
  // A common indicator is if `data.user.email_confirmed_at` is null/undefined, or `data.session` is null.
  const needsConfirmation = !data.session && data.user && !data.user.email_confirmed_at;

  if (data.user && !needsConfirmation) { // Profile only if user is confirmed or auto-confirmed
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({ user_id: data.user.id, weekly_generations_remaining: 50, last_generation_reset_at: new Date().toISOString() });

    if (profileError) {
      console.error("Error creating user profile:", profileError.message);
      // This is a critical error. We might want to inform the user or even attempt to delete the auth user.
      // For now, let's return an error that signup process couldn't complete fully.
      // await supabase.auth.admin.deleteUser(data.user.id); // Requires service_role and admin client.
      return { error: { message: "Signup succeeded but profile creation failed. Please contact support." } };
    }
  }
  
  return { error: null, data: { needsConfirmation } };
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    return { error: { message: error.message || "Logout failed." } };
  }
  return { error: null };
}

export async function getUserSession() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
