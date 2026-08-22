import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import type { Platform } from '@/lib/types';
import { loadAudienceDna, persistSimulation, requireUserId } from '@/lib/audience-simulator/persist';
import { metricsFromSimulation, remixContent, runFullSimulation } from '@/lib/audience-simulator/pipeline';
import type { AudienceSimulationResult, SimulatorContentKind } from '@/lib/audience-simulator/types';

const PLATFORMS: Platform[] = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'];
const KINDS: SimulatorContentKind[] = ['text', 'script', 'caption', 'transcript'];

function httpError(error: unknown) {
  const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status: number }).status) : 500;
  const message = error instanceof Error ? error.message : 'Audience simulation failed.';
  return NextResponse.json({ error: message }, { status: status || 500 });
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(8, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rl.check(`sim:${identifier}`);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many simulation requests. Please wait a minute and try again.' },
      { status: 429 }
    );
  }

  try {
    const userId = await requireUserId();
    const body = await request.json();
    const action = body?.action || 'simulate';

    if (action === 'remix') {
      const previous = body?.previous as AudienceSimulationResult | undefined;
      if (!previous?.content || !previous.primaryIssue || !previous.recommendation) {
        return NextResponse.json({ error: 'A completed simulation is required before improving content.' }, { status: 400 });
      }
      const remix = await remixContent({
        content: previous.remix?.improvedContent || previous.content,
        platform: previous.platform,
        primaryIssue: previous.primaryIssue,
        recommendation: previous.recommendation,
      });
      return NextResponse.json({ remix });
    }

    if (action === 'resimulate') {
      const previous = body?.previous as AudienceSimulationResult | undefined;
      const improved = body?.improvedContent || previous?.remix?.improvedContent;
      if (!previous || !improved) {
        return NextResponse.json({ error: 'Improved content is required to simulate again.' }, { status: 400 });
      }

      const { dna, warning } = await loadAudienceDna(
        userId,
        previous.platform,
        previous.audienceSource === 'connected' ? 'connected' : 'demo'
      );

      const next = await runFullSimulation({
        content: improved,
        platform: previous.platform,
        contentKind: previous.contentKind,
        dna,
      });

      const comparison = {
        before: metricsFromSimulation(previous.scores, previous.reactions),
        after: metricsFromSimulation(next.scores, next.reactions),
      };

      const result: AudienceSimulationResult = {
        ...next,
        remix: previous.remix
          ? { ...previous.remix, improvedContent: improved }
          : { originalContent: previous.content, improvedContent: improved, changeExplanation: '' },
        comparison,
      };

      const analysisId = await persistSimulation(userId, result).catch(() => null);
      result.analysisId = analysisId;

      return NextResponse.json({ result, warning: warning || null });
    }

    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    const platform = body?.platform as Platform;
    const contentKind = (body?.contentKind || 'text') as SimulatorContentKind;
    const audienceSource = body?.audienceSource === 'connected' ? 'connected' : 'demo';

    if (!content || content.length < 10) {
      return NextResponse.json({ error: 'Content must contain at least 10 characters.' }, { status: 400 });
    }
    if (content.length > 15000) {
      return NextResponse.json({ error: 'Content cannot exceed 15,000 characters.' }, { status: 400 });
    }
    if (!PLATFORMS.includes(platform)) {
      return NextResponse.json({ error: 'Select Instagram, YouTube, TikTok, X, or LinkedIn.' }, { status: 400 });
    }
    if (!KINDS.includes(contentKind)) {
      return NextResponse.json({ error: 'Invalid content type.' }, { status: 400 });
    }

    const { dna, warning } = await loadAudienceDna(userId, platform, audienceSource);
    const simulated = await runFullSimulation({
      content,
      platform,
      contentKind,
      dna,
    });

    const result: AudienceSimulationResult = simulated;
    const analysisId = await persistSimulation(userId, result).catch(() => null);
    result.analysisId = analysisId;

    return NextResponse.json({ result, warning: warning || null });
  } catch (error) {
    console.error('Audience simulator error:', error);
    return httpError(error);
  }
}
