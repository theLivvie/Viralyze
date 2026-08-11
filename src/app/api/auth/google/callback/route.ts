import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/google/callback
 * Handles the OAuth callback from Google via Supabase.
 * Exchanges the code for a session and sets cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Create a response to attach cookies to
  const redirectUrl = new URL(redirectTo, request.url);
  let supabaseResponse = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.redirect(redirectUrl);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Google OAuth exchange error:', error.message);
      return NextResponse.redirect(new URL('/?auth=error', request.url));
    }

    // Ensure profile exists
    const admin = await createAdminClient();
    if (data.user) {
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        await admin.from('profiles').insert({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
          avatar_url: data.user.user_metadata?.avatar_url || null,
        });
      } else {
        // Update avatar and name if changed
        const avatar = data.user.user_metadata?.avatar_url;
        const userName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
        if (avatar || userName) {
          const updateData: Record<string, unknown> = {};
          if (avatar) updateData.avatar_url = avatar;
          if (userName) updateData.name = userName;
          await admin
            .from('profiles')
            .update(updateData)
            .eq('id', data.user.id);
        }
      }
    }

    // Redirect to app — frontend will detect ?auth=google and sync session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const finalUrl = new URL(`${redirectTo}?auth=google`, baseUrl || request.url);
    return NextResponse.redirect(finalUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/?auth=error', request.url));
  }
}
