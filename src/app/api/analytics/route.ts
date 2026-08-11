import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

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

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch all analyses for the user (no limit — we need full history for analytics)
    const analyses = await db.contentAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // If no analyses, return empty analytics
    if (analyses.length === 0) {
      return NextResponse.json({
        totalAnalyses: 0,
        avgScore: 0,
        bestScore: 0,
        scoreDistribution: [
          { range: '0-20', count: 0 },
          { range: '21-40', count: 0 },
          { range: '41-60', count: 0 },
          { range: '61-80', count: 0 },
          { range: '81-100', count: 0 },
        ],
        platformPerformance: [],
        weeklyTrend: [],
        categoryBreakdown: [],
        topContent: [],
      });
    }

    // --- Overview stats ---
    const scores = analyses.map((a) => a.overallScore);
    const totalAnalyses = analyses.length;
    const avgScore = Math.round(scores.reduce((s, v) => s + v, 0) / totalAnalyses);
    const bestScore = Math.max(...scores);

    // --- Score distribution ---
    const ranges = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '21-40', min: 21, max: 40, count: 0 },
      { range: '41-60', min: 41, max: 60, count: 0 },
      { range: '61-80', min: 61, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 },
    ];
    for (const s of scores) {
      const bucket = ranges.find((r) => s >= r.min && s <= r.max);
      if (bucket) bucket.count++;
    }
    const scoreDistribution = ranges.map((r) => ({ range: r.range, count: r.count }));

    // --- Platform performance (avg score per platform) ---
    const platformMap: Record<string, { total: number; count: number }> = {};
    for (const a of analyses) {
      const p = a.platform;
      if (!platformMap[p]) platformMap[p] = { total: 0, count: 0 };
      platformMap[p].total += a.overallScore;
      platformMap[p].count++;
    }
    const platformDisplayName: Record<string, string> = {
      instagram: 'Instagram',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      x: 'X',
      linkedin: 'LinkedIn',
    };
    const platformPerformance = Object.entries(platformMap)
      .map(([platform, data]) => ({
        platform: platformDisplayName[platform] || platform,
        score: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.score - a.score);

    // --- Weekly trend (group by ISO week, last 12 weeks) ---
    const weekMap: Record<string, { total: number; count: number }> = {};
    for (const a of analyses) {
      const d = new Date(a.createdAt);
      // Get ISO week number
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
      const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
      const year = d.getFullYear();
      const key = `${year}-W${String(weekNum).padStart(2, '0')}`;
      if (!weekMap[key]) weekMap[key] = { total: 0, count: 0 };
      weekMap[key].total += a.overallScore;
      weekMap[key].count++;
    }
    // Get the last 12 weeks chronologically
    const allWeeks = Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b));
    const lastWeeks = allWeeks.slice(-12);
    const weeklyTrend = lastWeeks.map(([week, data]) => ({
      week,
      score: Math.round(data.total / data.count),
    }));

    // --- Category breakdown (average each score dimension) ---
    const categories = [
      { key: 'hookScore', label: 'Hook' },
      { key: 'engagementScore', label: 'Engagement' },
      { key: 'shareabilityScore', label: 'Shareability' },
      { key: 'retentionScore', label: 'Retention' },
      { key: 'originalityScore', label: 'Originality' },
      { key: 'audienceFitScore', label: 'Audience Fit' },
      { key: 'emotionalImpactScore', label: 'Emotional Impact' },
      { key: 'contentQualityScore', label: 'Content Quality' },
      { key: 'trendAlignmentScore', label: 'Trend Alignment' },
    ];
    const categoryBreakdown = categories
      .map((cat) => {
        const vals = analyses
          .map((a) => (a as Record<string, unknown>)[cat.key] as number)
          .filter((v) => v != null && v > 0);
        if (vals.length === 0) return null;
        return {
          category: cat.label,
          score: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0)) as { category: string; score: number }[];

    // --- Top content (top 5 by overallScore) ---
    const sorted = [...analyses].sort((a, b) => b.overallScore - a.overallScore);
    const topContent = sorted.slice(0, 5).map((a) => {
      const d = new Date(a.createdAt);
      const dateStr = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return {
        id: a.id,
        title: a.title,
        platform: a.platform,
        score: a.overallScore,
        date: dateStr,
      };
    });

    return NextResponse.json({
      totalAnalyses,
      avgScore,
      bestScore,
      scoreDistribution,
      platformPerformance,
      weeklyTrend,
      categoryBreakdown,
      topContent,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
