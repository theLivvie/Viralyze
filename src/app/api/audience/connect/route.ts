import { NextRequest, NextResponse } from 'next/server';
import type { Platform } from '@/lib/types';
import { getDemoAudienceDna } from '@/lib/audience-simulator/platform-intel';
import {
  disconnectAccount,
  listConnectedAccounts,
  loadAudienceDna,
  requireUserId,
  saveAudienceProfile,
  upsertConnectedAccount,
} from '@/lib/audience-simulator/persist';
import { oauthConfigured } from '@/lib/audience-simulator/oauth';

const PLATFORMS: Platform[] = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'];

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const platform = request.nextUrl.searchParams.get('platform') as Platform | null;
    const accounts = await listConnectedAccounts(userId);

    if (platform && PLATFORMS.includes(platform)) {
      const sourceParam = request.nextUrl.searchParams.get('source');
      const source = sourceParam === 'connected' ? 'connected' : 'demo';
      const { dna, warning } = await loadAudienceDna(userId, platform, source);
      return NextResponse.json({ accounts, dna, warning: warning || null });
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status: number }).status) : 500;
    const message = error instanceof Error ? error.message : 'Failed to load audience accounts.';
    return NextResponse.json({ error: message }, { status: status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const platform = body?.platform as Platform;
    const action = body?.action as string;

    if (!PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform.' }, { status: 400 });
    }

    if (action === 'demo') {
      const dna = getDemoAudienceDna(platform);
      await upsertConnectedAccount({
        userId,
        platform,
        status: 'demo',
        platformUsername: dna.connectedHandle || 'Demo Creator Account',
        platformUserId: `demo-${platform}`,
      });
      await saveAudienceProfile({ userId, platform, dna });
      const accounts = await listConnectedAccounts(userId);
      return NextResponse.json({
        accounts,
        dna,
        notice: 'Demo Data — Simulated for demonstration. This is not real account analytics.',
      });
    }

    if (action === 'disconnect') {
      await disconnectAccount(userId, platform);
      const accounts = await listConnectedAccounts(userId);
      return NextResponse.json({ accounts });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status: number }).status) : 500;
    const message = error instanceof Error ? error.message : 'Account update failed.';
    return NextResponse.json({ error: message, oauthConfigured: oauthConfigured('youtube') }, { status: status || 500 });
  }
}
