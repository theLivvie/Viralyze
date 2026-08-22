import type { Platform } from '@/lib/types';
import type { AudienceDna, DnaField } from './types';
import { PLATFORM_LABELS } from './platform-intel';

export function oauthConfigured(platform: Platform): boolean {
  switch (platform) {
    case 'youtube':
      return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    case 'instagram':
      return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
    case 'tiktok':
      return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
    case 'x':
      return Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET);
    case 'linkedin':
      return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
    default:
      return false;
  }
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export function getRedirectUri(platform: Platform): string {
  return `${getSiteUrl()}/api/audience/oauth/${platform}/callback`;
}

export function getScopes(platform: Platform): string {
  switch (platform) {
    case 'youtube':
      return 'https://www.googleapis.com/auth/youtube.readonly';
    case 'instagram':
      return 'instagram_business_basic';
    case 'tiktok':
      return 'user.info.basic';
    case 'x':
      return 'users.read tweet.read offline.access';
    case 'linkedin':
      return 'openid profile email';
  }
}

export function getAuthorizeUrl(platform: Platform, state: string, codeChallenge?: string): string | null {
  if (!oauthConfigured(platform)) return null;
  const redirect = encodeURIComponent(getRedirectUri(platform));

  if (platform === 'youtube') {
    const cid = encodeURIComponent(process.env.GOOGLE_CLIENT_ID || '');
    const scope = encodeURIComponent(getScopes('youtube'));
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${cid}&redirect_uri=${redirect}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;
  }
  if (platform === 'instagram') {
    const cid = encodeURIComponent(process.env.META_APP_ID || '');
    const scope = encodeURIComponent(getScopes('instagram'));
    return `https://www.instagram.com/oauth/authorize?client_id=${cid}&redirect_uri=${redirect}&response_type=code&scope=${scope}&state=${encodeURIComponent(state)}`;
  }
  if (platform === 'tiktok') {
    const key = encodeURIComponent(process.env.TIKTOK_CLIENT_KEY || '');
    const scope = encodeURIComponent(getScopes('tiktok'));
    return `https://www.tiktok.com/v2/auth/authorize/?client_key=${key}&response_type=code&scope=${scope}&redirect_uri=${redirect}&state=${encodeURIComponent(state)}`;
  }
  if (platform === 'x') {
    const cid = encodeURIComponent(process.env.X_CLIENT_ID || '');
    const scope = encodeURIComponent(getScopes('x'));
    const challenge = encodeURIComponent(codeChallenge || '');
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${cid}&redirect_uri=${redirect}&scope=${scope}&state=${encodeURIComponent(state)}&code_challenge=${challenge}&code_challenge_method=S256`;
  }
  const cid = encodeURIComponent(process.env.LINKEDIN_CLIENT_ID || '');
  const scope = encodeURIComponent(getScopes('linkedin'));
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${cid}&redirect_uri=${redirect}&scope=${scope}&state=${encodeURIComponent(state)}`;
}

export async function exchangeCode(platform: Platform, code: string, codeVerifier?: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  if (platform === 'youtube') {
    const body = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: getRedirectUri('youtube'),
      grant_type: 'authorization_code',
    });
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) {
      throw new Error(data.error_description || 'YouTube token exchange failed.');
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  if (platform === 'instagram') {
    const body = new URLSearchParams({
      client_id: process.env.META_APP_ID || '',
      client_secret: process.env.META_APP_SECRET || '',
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUri('instagram'),
      code,
    });
    const res = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    const token = data.access_token || data?.data?.[0]?.access_token;
    if (!res.ok || !token) {
      throw new Error(data.error_message || 'Instagram token exchange failed.');
    }
    return { accessToken: token };
  }

  if (platform === 'tiktok') {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY || '',
        client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri('tiktok'),
      }),
    });
    const data = await res.json();
    const token = data.access_token || data?.data?.access_token;
    if (!res.ok || !token) {
      throw new Error(data.error_description || 'TikTok token exchange failed.');
    }
    return { accessToken: token, refreshToken: data.refresh_token || data?.data?.refresh_token };
  }

  if (platform === 'x') {
    const basic = Buffer.from(
      `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
    ).toString('base64');
    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri('x'),
        code_verifier: codeVerifier || 'challenge',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) {
      throw new Error(data.error_description || 'X token exchange failed.');
    }
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
  }

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri('linkedin'),
      client_id: process.env.LINKEDIN_CLIENT_ID || '',
      client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || 'LinkedIn token exchange failed.');
  }
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

function f(key: string, label: string, value: string, origin: DnaField['origin']): DnaField {
  return { key, label, value, origin };
}
function na(key: string, label: string): DnaField {
  return f(key, label, 'Not available from this platform.', 'unavailable');
}

export async function fetchAuthorizedAudience(
  platform: Platform,
  accessToken: string
): Promise<{ username: string; platformUserId: string; dna: AudienceDna }> {
  if (platform === 'youtube') {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    const item = data?.items?.[0];
    if (!res.ok || !item) {
      throw new Error(data?.error?.message || 'Could not load YouTube channel data.');
    }
    const stats = item.statistics || {};
    const snippet = item.snippet || {};
    const username = snippet.title || 'YouTube channel';
    const fields: DnaField[] = [
      f('channel', 'Channel', username, 'authorized'),
      f('subscribers', 'Subscribers', String(stats.subscriberCount ?? 'hidden'), 'authorized'),
      f('views', 'Lifetime views', String(stats.viewCount ?? 'Not available from this platform.'), stats.viewCount ? 'authorized' : 'unavailable'),
      f('videos', 'Public videos', String(stats.videoCount ?? '—'), 'authorized'),
      na('primaryAudience', 'Primary age group'),
      na('returning', 'Returning vs new viewers'),
      na('peak', 'Peak watch time'),
      f('note', 'Analytics note', 'Age, returning viewers, and peak times require YouTube Analytics (not requested).', 'ai'),
    ];
    return {
      username,
      platformUserId: item.id,
      dna: {
        platform,
        source: 'connected',
        label: `${PLATFORM_LABELS[platform]} · ${username}`,
        connectedHandle: username,
        summary: `Authorized channel snapshot for ${username}. Demographic and returning-viewer analytics are not included in this connection.`,
        fields,
      },
    };
  }

  if (platform === 'instagram') {
    const res = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${encodeURIComponent(accessToken)}`
    );
    const data = await res.json();
    if (!res.ok || !data.id) {
      throw new Error(data.error?.message || 'Could not load Instagram profile.');
    }
    const username = data.username || 'instagram_user';
    return {
      username,
      platformUserId: String(data.id),
      dna: {
        platform,
        source: 'connected',
        label: `${PLATFORM_LABELS[platform]} · @${username}`,
        connectedHandle: `@${username}`,
        summary: `Connected Instagram account @${username}. Audience demographics require Instagram Insights on a professional account and were not returned.`,
        fields: [
          f('username', 'Username', `@${username}`, 'authorized'),
          f('accountType', 'Account type', String(data.account_type || 'unknown'), 'authorized'),
          na('primaryAudience', 'Primary age group'),
          na('topInterest', 'Top interest'),
          na('peak', 'Peak engagement'),
          na('returning', 'Returning audience'),
        ],
      },
    };
  }

  if (platform === 'tiktok') {
    const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    const user = data?.data?.user || data?.user;
    if (!res.ok || !user) {
      throw new Error(data.error?.message || 'Could not load TikTok profile.');
    }
    const username = user.display_name || 'TikTok user';
    return {
      username,
      platformUserId: String(user.open_id || username),
      dna: {
        platform,
        source: 'connected',
        label: `${PLATFORM_LABELS[platform]} · ${username}`,
        connectedHandle: username,
        summary: `Connected TikTok profile ${username}. Creator analytics (age, watch time) are not exposed by this login scope.`,
        fields: [
          f('displayName', 'Display name', username, 'authorized'),
          na('primaryAudience', 'Primary age group'),
          na('topInterest', 'Top interest'),
          na('peak', 'Peak engagement'),
          na('rewatch', 'Rewatch rate'),
        ],
      },
    };
  }

  if (platform === 'x') {
    const res = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,public_metrics', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    const user = data?.data;
    if (!res.ok || !user) {
      throw new Error(data.detail || 'Could not load X profile.');
    }
    const username = user.username || user.name || 'x_user';
    const m = user.public_metrics || {};
    return {
      username: `@${username}`,
      platformUserId: String(user.id),
      dna: {
        platform,
        source: 'connected',
        label: `${PLATFORM_LABELS[platform]} · @${username}`,
        connectedHandle: `@${username}`,
        summary: `Connected X account @${username}. Follower counts are public; impression and audience demographics are not included.`,
        fields: [
          f('username', 'Username', `@${username}`, 'authorized'),
          f('followers', 'Followers', String(m.followers_count ?? 'Not available from this platform.'), m.followers_count != null ? 'authorized' : 'unavailable'),
          f('following', 'Following', String(m.following_count ?? '—'), 'authorized'),
          na('primaryAudience', 'Primary age group'),
          na('peak', 'Peak activity'),
        ],
      },
    };
  }

  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok || !data.sub) {
    throw new Error(data.message || 'Could not load LinkedIn profile.');
  }
  const username = data.name || data.given_name || 'LinkedIn member';
  return {
    username,
    platformUserId: String(data.sub),
    dna: {
      platform,
      source: 'connected',
      label: `${PLATFORM_LABELS[platform]} · ${username}`,
      connectedHandle: username,
      summary: `Connected LinkedIn identity for ${username}. Page analytics and audience demographics require LinkedIn Marketing partner APIs and are not available.`,
      fields: [
        f('name', 'Name', username, 'authorized'),
        f('headline', 'Headline', String(data.headline || 'Not available from this platform.'), data.headline ? 'authorized' : 'unavailable'),
        na('primaryAudience', 'Primary audience'),
        na('topInterest', 'Top interest'),
        na('peak', 'Peak engagement'),
      ],
    },
  };
}
