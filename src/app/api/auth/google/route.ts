import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/google
 * Initiates Google OAuth via Supabase Auth.
 * Redirects the user to Google's consent screen.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get('redirectTo') || '/';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/auth/google/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      console.error('Google OAuth init error:', error.message);
      return NextResponse.json({ error: 'Failed to initiate Google sign-in' }, { status: 500 });
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json({ error: 'Google sign-in failed' }, { status: 500 });
  }
}
