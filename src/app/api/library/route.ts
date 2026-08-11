import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Platform, Confidence, Classification, PlatformFitScore, ContentVariation } from '@/lib/types';
import { rateLimit } from '@/lib/rate-limit';

function parseSafeJson<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

function formatFullAnalysis(a: Record<string, unknown>) {
  const scores = {
    hook: (a.hookScore as number) || 0,
    engagement: (a.engagementScore as number) || 0,
    shareability: (a.shareabilityScore as number) || 0,
    retention: (a.retentionScore as number) || 0,
    originality: (a.originalityScore as number) || 0,
    audienceFit: (a.audienceFitScore as number) || 0,
    emotionalImpact: (a.emotionalImpactScore as number) || 0,
    contentQuality: (a.contentQualityScore as number) || 0,
    trendAlignment: (a.trendAlignmentScore as number) || 0,
  };

  const strengths = parseSafeJson<string[]>(a.strengths as string, []);
  const weaknesses = parseSafeJson<string[]>(a.weaknesses as string, []);
  const improvements = parseSafeJson<string[]>(a.recommendations as string, []);
  const platformFit = parseSafeJson<PlatformFitScore[]>(a.platformFitScores as string, []);
  const variations = parseSafeJson<ContentVariation[]>(a.variations as string, []);

  return {
    id: a.id as string,
    title: a.title as string,
    platform: a.platform as Platform,
    contentType: a.contentType as string,
    contentText: a.contentText as string,
    ideaText: (a.ideaText as string) || undefined,
    audience: (a.audience as string) || undefined,
    overallScore: a.overallScore as number,
    confidence: (a.confidence as Confidence) || 'medium',
    classification: (a.classification as Classification) || 'moderate',
    createdAt: (a.createdAt as Date).toISOString(),
    scores,
    platformFit,
    strengths,
    weaknesses,
    improvements,
    optimizedHook: (a.optimizedHook as string) || undefined,
    optimizedCaption: (a.optimizedCaption as string) || undefined,
    optimizedTitle: (a.optimizedTitle as string) || undefined,
    variations,
  };
}

export async function GET(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const platform = searchParams.get('platform');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Fetch single full analysis (verify userId ownership for security)
    if (id) {
      const analysis = await db.contentAnalysis.findUnique({ where: { id } });
      if (!analysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
      }
      if (userId && analysis.userId !== userId) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
      }
      return NextResponse.json(formatFullAnalysis(analysis as unknown as Record<string, unknown>));
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (platform) where.platform = platform;

    const analyses = await db.contentAnalysis.findMany({
      where,
      orderBy: { [sortBy]: order === 'asc' ? 'asc' : 'desc' },
      take: 50,
    });

    const formatted = analyses.map((a) => ({
      id: a.id,
      title: a.title,
      platform: a.platform as Platform,
      contentType: a.contentType,
      contentText: a.contentText,
      ideaText: a.ideaText || undefined,
      audience: a.audience || undefined,
      overallScore: a.overallScore,
      confidence: (a.confidence as Confidence) || 'medium',
      classification: (a.classification as Classification) || 'moderate',
      scores: {
        hook: a.hookScore || 0,
        engagement: a.engagementScore || 0,
        shareability: a.shareabilityScore || 0,
        retention: a.retentionScore || 0,
        originality: a.originalityScore || 0,
        audienceFit: a.audienceFitScore || 0,
        emotionalImpact: a.emotionalImpactScore || 0,
        contentQuality: a.contentQualityScore || 0,
        trendAlignment: a.trendAlignmentScore || 0,
      },
      platformFit: parseSafeJson<PlatformFitScore[]>(a.platformFitScores as string, []),
      strengths: parseSafeJson<string[]>(a.strengths as string, []),
      weaknesses: parseSafeJson<string[]>(a.weaknesses as string, []),
      improvements: parseSafeJson<string[]>(a.recommendations as string, []),
      optimizedHook: a.optimizedHook || undefined,
      optimizedCaption: a.optimizedCaption || undefined,
      optimizedTitle: a.optimizedTitle || undefined,
      variations: parseSafeJson<ContentVariation[]>(a.variations as string, []),
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Library error:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 });
    }

    await db.contentAnalysis.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
