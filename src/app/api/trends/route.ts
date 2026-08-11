import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { rateLimit } from '@/lib/rate-limit';

const SYSTEM_PROMPT = `You are Viralyze, a viral content trend analysis engine.

IMPORTANT: You must respond with ONLY a valid JSON object. No markdown code blocks, no explanations, no text before or after the JSON.

Return this EXACT JSON structure:
{
  "categories": [
    {
      "category": "<category name>",
      "trends": [
        {
          "name": "<trend name>",
          "growth": "<percentage string like +142%>",
          "heat": <1-5 number>",
          "platforms": ["<platform1>", "<platform2>"]
        }
      ]
    }
  ]
}

Requirements:
- Provide 4-5 trend categories (e.g. Technology, Social Media, Business, Culture, Health & Wellness)
- Each category should have 3-4 trending topics
- Each topic must include: name (specific trend), growth (percentage string with + sign), heat (1-5 rating), and platforms (array of platform names)
- Valid platforms: instagram, youtube, tiktok, x, linkedin
- Be specific and current with trend names
- Growth percentages should be realistic (20%-400%)
- Heat ratings should reflect true viral potential`;

export async function GET(request: NextRequest) {
  const rl = rateLimit(20, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Generate the latest trending topics across social media platforms right now. Focus on what is currently gaining traction and has viral potential for content creators.' },
      ],
      thinking: { type: 'disabled' },
    });

    let raw = completion.choices[0]?.message?.content || '';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let data;
    // Strategy 1: Direct parse
    try { data = JSON.parse(raw); } catch {}
    // Strategy 2: Find first { to last }
    if (!data) {
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try { data = JSON.parse(raw.slice(firstBrace, lastBrace + 1)); } catch {}
      }
    }
    // Strategy 3: Find JSON object that starts with expected keys
    if (!data) {
      const jsonBlock = raw.match(/\{\s*"categories"[\s\S]*?\}/);
      if (jsonBlock) {
        try { data = JSON.parse(jsonBlock[0]); } catch {}
      }
    }

    if (!data || !Array.isArray(data.categories)) {
      return NextResponse.json({ error: 'Failed to parse trend data' }, { status: 500 });
    }

    // Normalize platforms to lowercase
    const normalized = {
      categories: data.categories.map((cat: Record<string, unknown>) => ({
        category: cat.category || 'Unknown',
        trends: (Array.isArray(cat.trends) ? cat.trends : []).map((t: Record<string, unknown>) => ({
          name: t.name || 'Unknown',
          growth: String(t.growth || '+0%'),
          heat: Math.max(1, Math.min(5, Number(t.heat) || 3)),
          platforms: (Array.isArray(t.platforms) ? t.platforms : []).map((p: string) => String(p).toLowerCase()),
        })),
      })),
    };

    return NextResponse.json(normalized);
  } catch (error: unknown) {
    console.error('Trends fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
