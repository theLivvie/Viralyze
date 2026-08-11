import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

const SYSTEM_PROMPT = `You are Viralyze, an expert AI-powered viral content prediction engine.

IMPORTANT: You must respond with ONLY a valid JSON object. No markdown code blocks, no explanations, no text before or after the JSON.

Return this EXACT JSON structure:
{
  "overallScore": <number 0-100>,
  "confidence": "low" or "medium" or "high",
  "classification": "low" or "moderate" or "high" or "viral",
  "scores": {
    "hook": <0-100>,
    "engagement": <0-100>,
    "shareability": <0-100>,
    "retention": <0-100>,
    "originality": <0-100>,
    "audienceFit": <0-100>,
    "emotionalImpact": <0-100>,
    "contentQuality": <0-100>,
    "trendAlignment": <0-100>
  },
  "platformFit": [
    {"platform": "instagram", "score": <0-100>},
    {"platform": "youtube", "score": <0-100>},
    {"platform": "tiktok", "score": <0-100>},
    {"platform": "x", "score": <0-100>},
    {"platform": "linkedin", "score": <0-100>}
  ],
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...],
  "improvements": ["<improvement1>", "<improvement2>", ...],
  "optimizedHook": "<rewritten hook>",
  "optimizedCaption": "<rewritten caption>",
  "optimizedTitle": "<rewritten title>",
  "variations": [
    {"label": "Curiosity", "style": "curiosity", "score": <0-100>, "content": "<rewritten content>"},
    {"label": "Controversial", "style": "controversial", "score": <0-100>, "content": "<rewritten content>"},
    {"label": "Emotional", "style": "emotional", "score": <0-100>, "content": "<rewritten content>"},
    {"label": "Educational", "style": "educational", "score": <0-100>, "content": "<rewritten content>"},
    {"label": "Storytelling", "style": "storytelling", "score": <0-100>, "content": "<rewritten content>"}
  ],
  "emotionalBreakdown": {
    "curiosity": <0-100>,
    "surprise": <0-100>,
    "excitement": <0-100>,
    "humor": <0-100>,
    "inspiration": <0-100>,
    "relatability": <0-100>,
    "controversy": <0-100>,
    "fear": <0-100>
  },
  "predictedEngagement": {
    "likes": "<formatted string like 12.5K or 500>",
    "comments": "<formatted string>",
    "shares": "<formatted string>",
    "saves": "<formatted string>"
  }
}

Scoring guidelines:
- overallScore: Weighted average -- hook(15%), engagement(15%), shareability(12%), originality(12%), audienceFit(13%), retention(10%), emotionalImpact(8%), contentQuality(8%), trendAlignment(7%)
- confidence: "low" (score<50), "medium" (50-75), "high" (>75)
- classification: "low" (<40), "moderate" (40-65), "high" (65-85), "viral" (>85)

Be specific, actionable, honest. Don't inflate scores. Provide 3-5 items in each array.`;

function buildUserPrompt(req: { mode: string; platform: string; contentType: string; audience: string; ideaText?: string; contentText?: string; title?: string; hashtags?: string }): string {
  const { mode, platform, contentType, audience, ideaText, contentText, title, hashtags } = req;

  if (mode === 'idea') {
    return `Analyze this CONTENT IDEA:

Platform: ${platform}
Content Type: ${contentType}
Target Audience: ${audience}

Content Idea:
"""${ideaText || contentText || ''}"""
${title ? `Proposed Title: ${title}` : ''}
${hashtags ? `Proposed Hashtags: ${hashtags}` : ''}

Provide a complete viral content prediction analysis as JSON.`;
  }

  return `Analyze this EXISTING CONTENT:

Platform: ${platform}
Content Type: ${contentType}
Target Audience: ${audience}

Content:
"""${contentText || ''}"""
${title ? `Title: ${title}` : ''}
${hashtags ? `Hashtags: ${hashtags}` : ''}
${ideaText ? `Original Idea Context: ${ideaText}` : ''}

Provide a complete viral content prediction analysis as JSON.`;
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(10, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { mode, platform, contentType, audience, ideaText, contentText, title, hashtags } = body;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    if (!userId) {
      return NextResponse.json({ error: 'Please sign in to analyze content' }, { status: 401 });
    }

    // Validate required fields
    if (!platform || !contentType || (!ideaText && !contentText)) {
      return NextResponse.json({ error: 'Missing required fields: platform, contentType, and content (ideaText or contentText)' }, { status: 400 });
    }

    const rawContent = contentText || ideaText || '';
    if (rawContent.length < 10) {
      return NextResponse.json({ error: 'Content is too short. Please provide at least 10 characters.' }, { status: 400 });
    }
    if (rawContent.length > 10000) {
      return NextResponse.json({ error: 'Content exceeds the 10,000 character limit.' }, { status: 400 });
    }

    const validPlatforms = ['instagram', 'youtube', 'tiktok', 'x', 'linkedin'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` }, { status: 400 });
    }

    const validContentTypes = ['reel', 'video', 'post', 'story', 'carousel', 'thread', 'short', 'blog', 'email', 'newsletter'];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json({ error: `Invalid content type. Must be one of: ${validContentTypes.join(', ')}` }, { status: 400 });
    }

    const targetAudience = audience || 'General social media audience';

    const userPrompt = buildUserPrompt({ mode, platform, contentType, audience: targetAudience, ideaText, contentText, title, hashtags });

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

    const extractJSON = (text: string) => {
      try { return JSON.parse(text); } catch {}
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)); } catch {}
      }
      const jsonBlock = text.match(/\{\s*"overallScore"[\s\S]*?\}/);
      if (jsonBlock) {
        try { return JSON.parse(jsonBlock[0]); } catch {}
      }
      return null;
    };

    const analysis = extractJSON(raw);
    if (!analysis) {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
    }

    // Save to Supabase
    const admin = await createAdminClient();
    const { data: savedAnalysis } = await admin
      .from('content_analyses')
      .insert({
        user_id: userId,
        title: title || (ideaText || contentText || '').slice(0, 80),
        platform,
        content_type: contentType,
        content_text: contentText || ideaText || '',
        idea_text: ideaText || null,
        audience: targetAudience,
        overall_score: analysis.overallScore || 0,
        confidence: analysis.confidence || 'medium',
        classification: analysis.classification || 'moderate',
        hook_score: analysis.scores?.hook || 0,
        engagement_score: analysis.scores?.engagement || 0,
        shareability_score: analysis.scores?.shareability || 0,
        retention_score: analysis.scores?.retention || 0,
        originality_score: analysis.scores?.originality || 0,
        audience_fit_score: analysis.scores?.audienceFit || 0,
        emotional_impact_score: analysis.scores?.emotionalImpact || 0,
        content_quality_score: analysis.scores?.contentQuality || 0,
        trend_alignment_score: analysis.scores?.trendAlignment || 0,
        platform_fit_scores: analysis.platformFit || [],
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.improvements || [],
        optimized_hook: analysis.optimizedHook || null,
        optimized_caption: analysis.optimizedCaption || null,
        optimized_title: analysis.optimizedTitle || null,
        variations: analysis.variations || null,
      })
      .select()
      .single();

    // Increment predictions used (fetch-then-update pattern for Supabase)
    let updatedProfile = null;
    const { data: currentProfile } = await admin
      .from('profiles')
      .select('predictions_used, predictions_limit')
      .eq('id', userId)
      .single();

    if (currentProfile) {
      const newCount = (currentProfile.predictions_used || 0) + 1;
      await admin
        .from('profiles')
        .update({ predictions_used: newCount })
        .eq('id', userId);
      updatedProfile = { ...currentProfile, predictions_used: newCount };
    }

    // Normalize response
    const response: Record<string, unknown> = {
      id: savedAnalysis?.id,
      overallScore: analysis.overallScore || 50,
      confidence: analysis.confidence || 'medium',
      classification: analysis.classification || 'moderate',
      scores: {
        hook: analysis.scores?.hook || 50,
        engagement: analysis.scores?.engagement || 50,
        shareability: analysis.scores?.shareability || 50,
        retention: analysis.scores?.retention || 50,
        originality: analysis.scores?.originality || 50,
        audienceFit: analysis.scores?.audienceFit || 50,
        emotionalImpact: analysis.scores?.emotionalImpact || 50,
        contentQuality: analysis.scores?.contentQuality || 50,
        trendAlignment: analysis.scores?.trendAlignment || 50,
      },
      platformFit: Array.isArray(analysis.platformFit) ? analysis.platformFit : [],
      emotionalBreakdown: analysis.emotionalBreakdown && typeof analysis.emotionalBreakdown === 'object'
        ? analysis.emotionalBreakdown
        : { curiosity: 70, surprise: 60, excitement: 65, humor: 40, inspiration: 55, relatability: 70, controversy: 30, fear: 20 },
      predictedEngagement: analysis.predictedEngagement && typeof analysis.predictedEngagement === 'object'
        ? analysis.predictedEngagement
        : { likes: '1.2K', comments: '85', shares: '340', saves: '220' },
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
      improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
      optimizedHook: analysis.optimizedHook || '',
      optimizedCaption: analysis.optimizedCaption || '',
      optimizedTitle: analysis.optimizedTitle || '',
      variations: Array.isArray(analysis.variations) ? analysis.variations : [],
    };

    if (updatedProfile) {
      response.userUsage = {
        predictionsUsed: updatedProfile.predictions_used,
        predictionsLimit: updatedProfile.predictions_limit,
      };
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Prediction error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
