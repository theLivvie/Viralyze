import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { Platform, Confidence, Classification, PlatformFitScore, ContentVariation } from '@/lib/types';
import { rateLimit } from '@/lib/rate-limit';

function parseSafeJson<T>(str: unknown, fallback: T): T {
  if (!str || typeof str !== 'object') return fallback;
  if (Array.isArray(str)) return str as T;
  return fallback;
}

function mapSnakeToAnalysis(row: Record<string, unknown>) {
  const scores = {
    hook: (row.hook_score as number) || 0,
    engagement: (row.engagement_score as number) || 0,
    shareability: (row.shareability_score as number) || 0,
    retention: (row.retention_score as number) || 0,
    originality: (row.originality_score as number) || 0,
    audienceFit: (row.audience_fit_score as number) || 0,
    emotionalImpact: (row.emotional_impact_score as number) || 0,
    contentQuality: (row.content_quality_score as number) || 0,
    trendAlignment: (row.trend_alignment_score as number) || 0,
  };

  return {
    id: row.id as string,
    title: row.title as string,
    platform: row.platform as Platform,
    contentType: row.content_type as string,
    contentText: row.content_text as string,
    ideaText: (row.idea_text as string) || undefined,
    audience: (row.audience as string) || undefined,
    overallScore: row.overall_score as number,
    confidence: (row.confidence as Confidence) || 'medium',
    classification: (row.classification as Classification) || 'moderate',
    createdAt: (row.created_at as string) || new Date().toISOString(),
    scores,
    platformFit: parseSafeJson<PlatformFitScore[]>(row.platform_fit_scores, []),
    strengths: parseSafeJson<string[]>(row.strengths, []),
    weaknesses: parseSafeJson<string[]>(row.weaknesses, []),
    improvements: parseSafeJson<string[]>(row.recommendations, []),
    optimizedHook: (row.optimized_hook as string) || undefined,
    optimizedCaption: (row.optimized_caption as string) || undefined,
    optimizedTitle: (row.optimized_title as string) || undefined,
    variations: parseSafeJson<ContentVariation[]>(row.variations, []),
  };
}

async function getAuthUserId(request: NextRequest): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const platform = searchParams.get('platform');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    const userId = await getAuthUserId(request);

    const admin = await createAdminClient();

    // Fetch single analysis
    if (id) {
      const { data: row } = await admin
        .from('content_analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (!row) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
      }
      if (userId && row.user_id !== userId) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
      }
      return NextResponse.json(mapSnakeToAnalysis(row as Record<string, unknown>));
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let query = admin
      .from('content_analyses')
      .select('*')
      .eq('user_id', userId);

    if (platform) {
      query = query.eq('platform', platform);
    }

    // Validate sort column
    const validSortCols = ['created_at', 'overall_score', 'title', 'platform'];
    const sortCol = validSortCols.includes(sortBy) ? sortBy : 'created_at';

    query = query.order(sortCol, { ascending: order === 'asc' }).limit(50);

    const { data: rows, error } = await query;

    if (error) {
      console.error('Library fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
    }

    const formatted = (rows || []).map((row) =>
      mapSnakeToAnalysis(row as Record<string, unknown>),
    );

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Library error:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const admin = await createAdminClient();
    const { error } = await admin
      .from('content_analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
