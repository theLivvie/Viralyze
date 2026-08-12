import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get('code');
  const redirectTo =
    requestUrl.searchParams.get('redirectTo') || '/';

  // If Google/Supabase did not return an OAuth code,
  // the login process failed.
  if (!code) {
    console.error('Google OAuth callback: missing code');

    return NextResponse.redirect(
      new URL('/?auth=error', requestUrl.origin)
    );
  }

  /*
   * IMPORTANT:
   * Create ONE response object first.
   * Supabase will attach the authentication cookies
   * to this response.
   */
  const redirectUrl = new URL(
    redirectTo,
    requestUrl.origin
  );

  redirectUrl.searchParams.set('auth', 'google');

  let response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          /*
           * Keep request cookies synchronized.
           */
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            }
          );

          /*
           * IMPORTANT:
           * Put the Supabase authentication cookies
           * on the response that will redirect the user.
           */
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  try {
    /*
     * Exchange the OAuth authorization code
     * for a Supabase session.
     */
    const {
      data,
      error,
    } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (error) {
      console.error(
        'Google OAuth exchange error:',
        error.message
      );

      return NextResponse.redirect(
        new URL(
          '/?auth=error',
          requestUrl.origin
        )
      );
    }

    console.log(
      'Google OAuth session created successfully:',
      data.user?.email
    );

    /*
     * Make sure the user's profile exists.
     */
    if (data.user) {
      try {
        const admin = await createAdminClient();

        const {
          data: existingProfile,
          error: profileLookupError,
        } = await admin
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileLookupError) {
          console.error(
            'Profile lookup error:',
            profileLookupError
          );
        }

        if (!existingProfile) {
          const { error: profileInsertError } =
            await admin
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email || '',
                name:
                  data.user.user_metadata
                    ?.full_name ||
                  data.user.user_metadata?.name ||
                  data.user.email?.split('@')[0] ||
                  '',
                avatar_url:
                  data.user.user_metadata
                    ?.avatar_url || null,
              });

          if (profileInsertError) {
            console.error(
              'Profile creation error:',
              profileInsertError
            );
          } else {
            console.log(
              'Profile created successfully.'
            );
          }
        } else {
          /*
           * Update profile information from Google
           * when available.
           */
          const avatar =
            data.user.user_metadata?.avatar_url;

          const userName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name;

          if (avatar || userName) {
            const updateData: Record<
              string,
              unknown
            > = {};

            if (avatar) {
              updateData.avatar_url = avatar;
            }

            if (userName) {
              updateData.name = userName;
            }

            const { error: updateError } =
              await admin
                .from('profiles')
                .update(updateData)
                .eq('id', data.user.id);

            if (updateError) {
              console.error(
                'Profile update error:',
                updateError
              );
            }
          }
        }
      } catch (profileError) {
        /*
         * A profile error should not destroy
         * an otherwise successful authentication.
         */
        console.error(
          'Profile processing error:',
          profileError
        );
      }
    }

    /*
     * OAuth login completed.
     *
     * The Supabase session cookies are already
     * attached to `response`.
     */
    return response;
  } catch (error) {
    console.error(
      'Google callback error:',
      error
    );

    return NextResponse.redirect(
      new URL(
        '/?auth=error',
        requestUrl.origin
      )
    );
  }
}