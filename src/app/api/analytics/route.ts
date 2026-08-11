import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

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
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const admin = await createAdminClient();
    const { data: analyses, error } = await admin
      .from('content_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Analytics error:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    const rows = analyses || [];

    if (rows.length === 0) {
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

    const scores = rows.map((a) => (a.overall_score as number) || 0);
    const totalAnalyses = rows.length;
    const avgScore = Math.round(scores.reduce((s, v) => s + v, 0) / totalAnalyses);
    const bestScore = Math.max(...scores);

    // Score distribution
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

    // Platform performance
    const platformMap: Record<string, { total: number; count: number }> = {};
    for (const a of rows) {
      const p = a.platform as string;
      if (!platformMap[p]) platformMap[p] = { total: 0, count: 0 };
      platformMap[p].total += (a.overall_score as number) || 0;
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

    // Weekly trend
    const weekMap: Record<string, { total: number; count: number }> = {};
    for (const a of rows) {
      const d = new Date(a.created_at as string);
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
      const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
      const year = d.getFullYear();
      const key = `${year}-W${String(weekNum).padStart(2, '0')}`;
      if (!weekMap[key]) weekMap[key] = { total: 0, count: 0 };
      weekMap[key].total += (a.overall_score as number) || 0;
      weekMap[key].count++;
    }
    const allWeeks = Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b));
    const lastWeeks = allWeeks.slice(-12);
    const weeklyTrend = lastWeeks.map(([week, data]) => ({
      week,
      score: Math.round(data.total / data.count),
    }));

    // Category breakdown
    const categories = [
      { key: 'hook_score', label: 'Hook' },
      { key: 'engagement_score', label: 'Engagement' },
      { key: 'shareability_score', label: 'Shareability' },
      { key: 'retention_score', label: 'Retention' },
      { key: 'originality_score', label: 'Originality' },
      { key: 'audience_fit_score', label: 'Audience Fit' },
      { key: 'emotional_impact_score', label: 'Emotional Impact' },
      { key: 'content_quality_score', label: 'Content Quality' },
      { key: 'trend_alignment_score', label: 'Trend Alignment' },
    ];
    const categoryBreakdown = categories
      .map((cat) => {
        const vals = rows
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

    // Top content
    const sorted = [...rows].sort((a, b) => (b.overall_score as number) - (a.overall_score as number));
    const topContent = sorted.slice(0, 5).map((a) => {
      const d = new Date(a.created_at as string);
      const dateStr = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return {
        id: a.id,
        title: a.title,
        platform: a.platform,
        score: a.overall_score,
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
