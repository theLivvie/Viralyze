import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import {
  createClient,
  createAdminClient,
} from '@/lib/supabase/server';
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
    { "platform": "instagram", "score": <0-100> },
    { "platform": "youtube", "score": <0-100> },
    { "platform": "tiktok", "score": <0-100> },
    { "platform": "x", "score": <0-100> },
    { "platform": "linkedin", "score": <0-100> }
  ],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"],
  "optimizedHook": "<rewritten hook>",
  "optimizedCaption": "<rewritten caption>",
  "optimizedTitle": "<rewritten title>",
  "variations": [
    {
      "label": "Curiosity",
      "style": "curiosity",
      "score": <0-100>,
      "content": "<rewritten content>"
    },
    {
      "label": "Controversial",
      "style": "controversial",
      "score": <0-100>,
      "content": "<rewritten content>"
    },
    {
      "label": "Emotional",
      "style": "emotional",
      "score": <0-100>,
      "content": "<rewritten content>"
    },
    {
      "label": "Educational",
      "style": "educational",
      "score": <0-100>,
      "content": "<rewritten content>"
    },
    {
      "label": "Storytelling",
      "style": "storytelling",
      "score": <0-100>,
      "content": "<rewritten content>"
    }
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
- overallScore: Weighted average based on content quality and viral potential.
- confidence: "low" for score below 50, "medium" for 50-75, "high" for above 75.
- classification: "low" below 40, "moderate" 40-65, "high" 65-85, "viral" above 85.

Be specific, actionable, honest, and do not inflate scores.
Provide 3-5 useful items in each array.`;

function buildUserPrompt(req: {
  mode: string;
  platform: string;
  contentType: string;
  audience: string;
  ideaText?: string;
  contentText?: string;
  title?: string;
  hashtags?: string;
}): string {
  const {
    mode,
    platform,
    contentType,
    audience,
    ideaText,
    contentText,
    title,
    hashtags,
  } = req;

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

function extractJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    // Continue and try extracting JSON from the response
  }

  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const possibleJSON = cleaned.slice(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(possibleJSON);
    } catch {
      // Continue
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(10, 60_000);

  const identifier =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const { allowed } = rl.check(identifier);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    // ==========================================
    // 1. GET REQUEST DATA
    // ==========================================
    const body = await request.json();

    const {
      mode,
      platform,
      contentType,
      audience,
      ideaText,
      contentText,
      title,
      hashtags,
    } = body;

    // ==========================================
    // 2. CHECK AUTHENTICATED USER
    // ==========================================
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Supabase authentication error:', authError);
    }

    const userId = user?.id || null;

    if (!userId) {
      return NextResponse.json(
        { error: 'Please sign in to analyze content' },
        { status: 401 }
      );
    }

    // ==========================================
    // 3. VALIDATE INPUT
    // ==========================================
    if (!platform || !contentType || (!ideaText && !contentText)) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: platform, contentType, and content',
        },
        { status: 400 }
      );
    }

    const rawContent = contentText || ideaText || '';

    if (rawContent.length < 10) {
      return NextResponse.json(
        {
          error:
            'Content is too short. Please provide at least 10 characters.',
        },
        { status: 400 }
      );
    }

    if (rawContent.length > 10000) {
      return NextResponse.json(
        {
          error:
            'Content exceeds the 10,000 character limit.',
        },
        { status: 400 }
      );
    }

    const validPlatforms = [
      'instagram',
      'youtube',
      'tiktok',
      'x',
      'linkedin',
    ];

    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        {
          error: `Invalid platform. Must be one of: ${validPlatforms.join(
            ', '
          )}`,
        },
        { status: 400 }
      );
    }

    const validContentTypes = [
      'reel',
      'video',
      'post',
      'story',
      'carousel',
      'thread',
      'short',
      'blog',
      'email',
      'newsletter',
    ];

    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error: `Invalid content type. Must be one of: ${validContentTypes.join(
            ', '
          )}`,
        },
        { status: 400 }
      );
    }

    const targetAudience =
      audience || 'General social media audience';

    // ==========================================
    // 4. BUILD AI PROMPT
    // ==========================================
    const userPrompt = buildUserPrompt({
      mode,
      platform,
      contentType,
      audience: targetAudience,
      ideaText,
      contentText,
      title,
      hashtags,
    });

    // ==========================================
    // 5. CREATE ZAI CLIENT
    // ==========================================
    console.log('Creating ZAI client...');

    const zai = await ZAI.create();

    console.log('ZAI client created successfully.');

    // ==========================================
    // 6. CALL AI
    // ==========================================
    console.log('Sending request to ZAI...');

    const aiStartTime = Date.now();

  const completion = await zai.chat.completions.create({
  model: 'glm-4.7-flash',
  messages: [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: userPrompt,
    },
  ],
  stream: false,
  thinking: {
    type: 'disabled',
  },
  response_format: {
    type: 'json_object',
  },
  temperature: 0.7,
});

    // IMPORTANT:
    // This prints the full response in your VS Code terminal.
    console.log(
  'ZAI completion response:',
  JSON.stringify(completion, null, 2)
);

if (
  completion &&
  typeof completion === 'object' &&
  'error' in completion
) {
  console.error(
    'ZAI API ERROR:',
    JSON.stringify(completion, null, 2)
  );
}

    // ==========================================
    // 7. SAFELY CHECK AI RESPONSE
    // ==========================================
    if (!completion) {
      console.error('ZAI returned no response.');

      return NextResponse.json(
        {
          error:
            'AI returned no response. Check your ZAI configuration and API key.',
        },
        { status: 500 }
      );
    }

    if (
      !Array.isArray(completion.choices) ||
      completion.choices.length === 0
    ) {
      console.error(
        'Invalid ZAI response. choices is missing or empty:',
        completion
      );

      return NextResponse.json(
        {
          error:
            'AI returned an invalid response. Check the VS Code terminal for details.',
        },
        { status: 500 }
      );
    }

    const firstChoice = completion.choices[0];

    if (!firstChoice) {
      return NextResponse.json(
        {
          error: 'AI response contains no first choice.',
        },
        { status: 500 }
      );
    }

    let raw = firstChoice.message?.content || '';

    if (!raw) {
      console.error(
        'AI returned empty content:',
        JSON.stringify(completion, null, 2)
      );

      return NextResponse.json(
        {
          error:
            'AI returned an empty response. Check the VS Code terminal.',
        },
        { status: 500 }
      );
    }

    // Convert content to string in case the SDK returns another type
    if (typeof raw !== 'string') {
      raw = String(raw);
    }

    // Remove markdown code blocks if AI adds them
    raw = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    console.log('Raw AI content:', raw);

    // ==========================================
    // 8. PARSE AI JSON
    // ==========================================
    const analysis = extractJSON(raw);

    if (!analysis) {
      console.error('Failed to parse AI JSON:', raw);

      return NextResponse.json(
        {
          error:
            'Failed to parse AI response as JSON. Check the terminal for the raw AI response.',
        },
        { status: 500 }
      );
    }

    console.log('AI JSON parsed successfully.');

    // ==========================================
    // 9. SAVE ANALYSIS TO SUPABASE
    // ==========================================
    const admin = await createAdminClient();

    const { data: savedAnalysis, error: saveError } = await admin
      .from('content_analyses')
      .insert({
        user_id: userId,
        title:
          title ||
          (ideaText || contentText || '').slice(0, 80),
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
        emotional_impact_score:
          analysis.scores?.emotionalImpact || 0,
        content_quality_score:
          analysis.scores?.contentQuality || 0,
        trend_alignment_score:
          analysis.scores?.trendAlignment || 0,

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

    if (saveError) {
      console.error('Error saving analysis:', saveError);
    } else {
      console.log('Analysis saved successfully:', savedAnalysis?.id);
    }

    // ==========================================
    // 10. UPDATE USER PREDICTION USAGE
    // ==========================================
    let updatedProfile: any = null;

    const {
      data: currentProfile,
      error: profileError,
    } = await admin
      .from('profiles')
      .select('predictions_used, predictions_limit')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error(
        'Error getting user profile:',
        profileError
      );
    }

    if (currentProfile) {
      const newCount =
        (currentProfile.predictions_used || 0) + 1;

      const { error: updateError } = await admin
        .from('profiles')
        .update({
          predictions_used: newCount,
        })
        .eq('id', userId);

      if (updateError) {
        console.error(
          'Error updating prediction usage:',
          updateError
        );
      } else {
        updatedProfile = {
          ...currentProfile,
          predictions_used: newCount,
        };
      }
    }

    // ==========================================
    // 11. BUILD FINAL RESPONSE
    // ==========================================
    const response: Record<string, unknown> = {
      id: savedAnalysis?.id || null,

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
        emotionalImpact:
          analysis.scores?.emotionalImpact || 50,
        contentQuality:
          analysis.scores?.contentQuality || 50,
        trendAlignment:
          analysis.scores?.trendAlignment || 50,
      },

      platformFit: Array.isArray(analysis.platformFit)
        ? analysis.platformFit
        : [],

      emotionalBreakdown:
        analysis.emotionalBreakdown &&
        typeof analysis.emotionalBreakdown === 'object'
          ? analysis.emotionalBreakdown
          : {
              curiosity: 70,
              surprise: 60,
              excitement: 65,
              humor: 40,
              inspiration: 55,
              relatability: 70,
              controversy: 30,
              fear: 20,
            },

      predictedEngagement:
        analysis.predictedEngagement &&
        typeof analysis.predictedEngagement === 'object'
          ? analysis.predictedEngagement
          : {
              likes: '1.2K',
              comments: '85',
              shares: '340',
              saves: '220',
            },

      strengths: Array.isArray(analysis.strengths)
        ? analysis.strengths
        : [],

      weaknesses: Array.isArray(analysis.weaknesses)
        ? analysis.weaknesses
        : [],

      improvements: Array.isArray(analysis.improvements)
        ? analysis.improvements
        : [],

      optimizedHook: analysis.optimizedHook || '',
      optimizedCaption: analysis.optimizedCaption || '',
      optimizedTitle: analysis.optimizedTitle || '',

      variations: Array.isArray(analysis.variations)
        ? analysis.variations
        : [],
    };

    if (updatedProfile) {
      // updatedProfile may be an unknown type at compile time; use a safe cast
      const _p: any = updatedProfile;
      response.userUsage = {
        predictionsUsed: _p.predictions_used ?? 0,
        predictionsLimit: _p.predictions_limit ?? 0,
      };
    }

    console.log('Prediction completed successfully.');

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Prediction error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Analysis failed';

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}