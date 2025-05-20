import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/generate'; // Default redirect after confirmation

  if (code) {
    const cookieStore = cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Check if profile needs to be created (e.g., if signup action didn't create it due to pending confirmation)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to not error if not found

        if (profileError) {
          console.error("Error checking profile:", profileError);
          // Allow redirect but log error
        } else if (!profile) {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({ user_id: user.id, weekly_generations_remaining: 50, last_generation_reset_at: new Date().toISOString() });
          if (insertError) {
            console.error("Error creating profile on callback:", insertError);
            // Allow redirect but log error
          }
        }
      }
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } else {
        console.error("Error exchanging code for session:", exchangeError.message);
    }
  }

  // If no code or error, redirect to an error page or login
  const redirectUrl = requestUrl.origin + '/login';
  return NextResponse.redirect(`${redirectUrl}?error=Email confirmation failed. Please try again.`);
}
