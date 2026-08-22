import { createAdminClient, createClient } from '@/lib/supabase/server';
import type { Platform } from '@/lib/types';
import type { AudienceDna, AudienceSimulationResult, ConnectedAccountPublic } from './types';
import { oauthConfigured } from './oauth';
import { getDemoAudienceDna } from './platform-intel';

export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    throw Object.assign(new Error('Please sign in to use the audience simulator.'), { status: 401 });
  }
  return user.id;
}

export async function listConnectedAccounts(userId: string): Promise<ConnectedAccountPublic[]> {
  const platforms: Platform[] = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'];
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from('connected_accounts')
    .select('platform, status, platform_username, connected_at, last_error')
    .eq('user_id', userId);

  if (error) {
    console.error('connected_accounts list failed:', error.message);
  }

  const rows = data || [];
  return platforms.map((platform) => {
    const row = rows.find((r) => r.platform === platform);
    const status = (row?.status as ConnectedAccountPublic['status']) || 'disconnected';
    return {
      platform,
      status,
      platformUsername: row?.platform_username || null,
      connectedAt: row?.connected_at || null,
      oauthConfigured: oauthConfigured(platform),
      lastError: row?.last_error || null,
      availableDataNotes:
        status === 'demo'
          ? 'Demo Data — Simulated for demonstration'
          : status === 'connected'
            ? 'Authorized profile snapshot only. Missing analytics are labeled unavailable.'
            : oauthConfigured(platform)
              ? 'Connect with official OAuth to load authorized profile fields.'
              : 'OAuth credentials are not configured on this deployment. Use Demo Mode.',
    };
  });
}

export async function upsertConnectedAccount(params: {
  userId: string;
  platform: Platform;
  status: 'connected' | 'demo' | 'error';
  platformUserId?: string | null;
  platformUsername?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  lastError?: string | null;
}): Promise<void> {
  const admin = await createAdminClient();
  const { error } = await admin.from('connected_accounts').upsert(
    {
      user_id: params.userId,
      platform: params.platform,
      status: params.status,
      platform_user_id: params.platformUserId || null,
      platform_username: params.platformUsername || null,
      access_token: params.accessToken || null,
      refresh_token: params.refreshToken || null,
      last_error: params.lastError || null,
      connected_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,platform' }
  );
  if (error) {
    console.error('upsert connected_accounts failed:', error.message);
  }
}

export async function saveAudienceProfile(params: {
  userId: string;
  platform: Platform;
  dna: AudienceDna;
}): Promise<void> {
  const admin = await createAdminClient();
  const { error } = await admin.from('audience_profiles').upsert(
    {
      user_id: params.userId,
      platform: params.platform,
      source: params.dna.source,
      profile_data: params.dna,
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,platform' }
  );
  if (error) {
    console.error('upsert audience_profiles failed:', error.message);
  }
}

export async function loadAudienceDna(
  userId: string,
  platform: Platform,
  source: 'demo' | 'connected'
): Promise<{ dna: AudienceDna; warning?: string }> {
  if (source === 'demo') {
    const dna = getDemoAudienceDna(platform);
    await saveAudienceProfile({ userId, platform, dna }).catch(() => {});
    return { dna };
  }

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from('audience_profiles')
    .select('profile_data, source')
    .eq('user_id', userId)
    .eq('platform', platform)
    .maybeSingle();

  if (error) {
    console.error('load audience_profiles failed:', error.message);
  }

  if (data?.profile_data && data.source === 'connected') {
    return { dna: data.profile_data as AudienceDna };
  }

  const { data: account } = await admin
    .from('connected_accounts')
    .select('status, platform_username')
    .eq('user_id', userId)
    .eq('platform', platform)
    .maybeSingle();

  if (account?.status === 'demo') {
    return { dna: getDemoAudienceDna(platform) };
  }

  return {
    dna: getDemoAudienceDna(platform),
    warning:
      'We could not load authorized audience insights for this platform. Showing Demo Data — Simulated for demonstration. Content analysis still runs.',
  };
}

export async function disconnectAccount(userId: string, platform: Platform): Promise<void> {
  const admin = await createAdminClient();
  const { error } = await admin
    .from('connected_accounts')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);
  if (error) {
    console.error('disconnect account failed:', error.message);
  }
}

export async function persistSimulation(
  userId: string,
  result: AudienceSimulationResult
): Promise<string | null> {
  const admin = await createAdminClient();

  const { data: analysis, error: analysisError } = await admin
    .from('content_analyses')
    .insert({
      user_id: userId,
      title: result.content.slice(0, 80) || 'Audience simulation',
      platform: result.platform,
      content_type: 'post',
      content_text: result.content,
      audience: result.audienceDna.summary,
      overall_score: result.weightedOverall,
      confidence: result.primaryIssue.confidence >= 0.8 ? 'high' : result.primaryIssue.confidence >= 0.5 ? 'medium' : 'low',
      classification:
        result.weightedOverall >= 85
          ? 'viral'
          : result.weightedOverall >= 65
            ? 'high'
            : result.weightedOverall >= 40
              ? 'moderate'
              : 'low',
      hook_score: result.scores.find((s) => s.key === 'hookStrength')?.value || 0,
      engagement_score: result.scores.find((s) => s.key === 'engagementPotential')?.value || 0,
      shareability_score: result.scores.find((s) => s.key === 'shareability')?.value || 0,
      retention_score: Math.max(0, 100 - (result.scores.find((s) => s.key === 'retentionRisk')?.value || 0)),
      originality_score: 0,
      audience_fit_score: result.scores.find((s) => s.key === 'audienceRelevance')?.value || 0,
      emotional_impact_score: result.scores.find((s) => s.key === 'emotionalImpact')?.value || 0,
      content_quality_score: result.scores.find((s) => s.key === 'clarity')?.value || 0,
      trend_alignment_score: 0,
      platform_fit_scores: result.crossPlatform.rows,
      strengths: [result.consensus.mostAppreciated],
      weaknesses: [result.consensus.mostCommonConcern],
      recommendations: [result.recommendation.recommendedAction],
    })
    .select('id')
    .single();

  if (analysisError) {
    console.error('save content_analyses from simulator failed:', analysisError.message);
  }

  const analysisId = analysis?.id || null;

  const { error: simError } = await admin.from('audience_simulations').insert({
    user_id: userId,
    analysis_id: analysisId,
    platform: result.platform,
    result,
  });
  if (simError) {
    console.error('save audience_simulations failed:', simError.message);
  }

  return analysisId;
}
