import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Platform } from '@/lib/types';
import { exchangeCode, fetchAuthorizedAudience, getSiteUrl } from '@/lib/audience-simulator/oauth';
import { saveAudienceProfile, upsertConnectedAccount } from '@/lib/audience-simulator/persist';

const PLATFORMS: Platform[] = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ platform: string }> }
) {
  const { platform: raw } = await context.params;
  const platform = raw as Platform;
  const site = getSiteUrl();
  const fail = (msg: string) =>
    NextResponse.redirect(`${site}/?audience_oauth=error&platform=${platform}&reason=${encodeURIComponent(msg)}`);

  if (!PLATFORMS.includes(platform)) {
    return fail('Unsupported platform.');
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const oauthError = request.nextUrl.searchParams.get('error');
  if (oauthError) {
    return fail(oauthError);
  }
  if (!code || !state) {
    return fail('Missing authorization code.');
  }

  const cookieStore = await cookies();
  const expected = cookieStore.get(`oauth_${platform}_state`)?.value;
  const verifier = cookieStore.get(`oauth_${platform}_verifier`)?.value;
  const userId = cookieStore.get(`oauth_${platform}_uid`)?.value;

  cookieStore.delete(`oauth_${platform}_state`);
  cookieStore.delete(`oauth_${platform}_verifier`);
  cookieStore.delete(`oauth_${platform}_uid`);

  if (!expected || expected !== state || !userId) {
    return fail('OAuth state mismatch. Please try connecting again.');
  }

  try {
    const tokens = await exchangeCode(platform, code, verifier);
    const snapshot = await fetchAuthorizedAudience(platform, tokens.accessToken);
    await upsertConnectedAccount({
      userId,
      platform,
      status: 'connected',
      platformUserId: snapshot.platformUserId,
      platformUsername: snapshot.username,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || null,
    });
    await saveAudienceProfile({ userId, platform, dna: snapshot.dna });
    return NextResponse.redirect(`${site}/?audience_oauth=success&platform=${platform}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth failed.';
    await upsertConnectedAccount({
      userId,
      platform,
      status: 'error',
      lastError: message,
    }).catch(() => {});
    return fail(message);
  }
}
