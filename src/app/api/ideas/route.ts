import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { rateLimit } from '@/lib/rate-limit';

const SYSTEM_PROMPT = `You are Viralyze's content idea generator.

IMPORTANT: Respond with ONLY a valid JSON array. No markdown, no code blocks, no explanation.

Generate 10 content ideas. Each must have:
- "title": string
- "description": string (1-2 sentences)
- "viralScore": number (70-98)
- "platform": one of: instagram, youtube, tiktok, x, linkedin
- "contentType": one of: video, reel, short, carousel, thread, post, article

Mix styles: tutorials, stories, hot takes, comparisons, challenges, listicles.
Be specific and honest with scores. 90+ = exceptional, 80-89 = good, 70-79 = solid.`;

export async function POST(request: NextRequest) {
  const rl = rateLimit(15, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const { topic, platform, audience } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const userPrompt = `Generate 10 viral content ideas about: "${topic}"
${platform ? `Primary platform: ${platform}` : ''}
${audience ? `Target audience: ${audience}` : ''}`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
      thinking: { type: 'disabled' },
    });

    let raw = completion.choices[0]?.message?.content || '';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const extractArray = (text: string): unknown[] | null => {
      try { const p = JSON.parse(text); if (Array.isArray(p)) return p; } catch {}
      const first = text.indexOf('[');
      const last = text.lastIndexOf(']');
      if (first !== -1 && last > first) {
        try { return JSON.parse(text.slice(first, last + 1)); } catch {}
      }
      return null;
    };

    const ideas = extractArray(raw);
    if (!ideas) {
      return NextResponse.json({ error: 'Failed to parse ideas' }, { status: 500 });
    }

    const normalized = ideas.map((idea: Record<string, unknown>) => ({
      title: String(idea.title || 'Untitled'),
      description: String(idea.description || ''),
      viralScore: typeof idea.viralScore === 'number' ? idea.viralScore : 75,
      platform: String(idea.platform || 'instagram'),
      contentType: String(idea.contentType || 'post'),
    }));

    return NextResponse.json(normalized);
  } catch (error: unknown) {
    console.error('Ideas error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate ideas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
