import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import type { Platform } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { getAuthorizeUrl, oauthConfigured } from '@/lib/audience-simulator/oauth';

const PLATFORMS: Platform[] = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'];

function pkceVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function pkceChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform: raw } = await context.params;
  const platform = raw as Platform;

  if (!PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'Unsupported platform.' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/?auth=login', request.url));
  }

  if (!oauthConfigured(platform)) {
    return NextResponse.json(
      {
        error: `Official OAuth is not configured for ${platform}. Add the platform credentials to the server environment, or use Demo Mode.`,
        oauthConfigured: false,
      },
      { status: 501 }
    );
  }

  const state = crypto.randomBytes(16).toString('hex');
  const verifier = pkceVerifier();
  const cookieStore = await cookies();
  cookieStore.set(`oauth_${platform}_state`, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
  cookieStore.set(`oauth_${platform}_verifier`, verifier, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
  cookieStore.set(`oauth_${platform}_uid`, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });

  const url = getAuthorizeUrl(platform, state, pkceChallenge(verifier));
  if (!url) {
    return NextResponse.json({ error: 'Could not build authorization URL.' }, { status: 500 });
  }

  return NextResponse.redirect(url);
}
