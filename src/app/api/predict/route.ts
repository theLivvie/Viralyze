import { NextRequest, NextResponse } from 'next/server';
import { getZAI } from '@/lib/zai';
import {
  createClient,
  createAdminClient,
} from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

/* =========================================================
   AI SYSTEM PROMPT
========================================================= */

const SYSTEM_PROMPT = `You are Viralyze, an expert AI-powered viral content prediction engine.

IMPORTANT:
You must respond with ONLY a valid JSON object.
No markdown code blocks.
No explanations.
No text before or after the JSON.

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

  "strengths": [
    "<strength1>",
    "<strength2>",
    "<strength3>"
  ],

  "weaknesses": [
    "<weakness1>",
    "<weakness2>",
    "<weakness3>"
  ],

  "improvements": [
    "<improvement1>",
    "<improvement2>",
    "<improvement3>"
  ],

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
- confidence: low for score below 50, medium for 50-75, high for above 75.
- classification: low below 40, moderate 40-65, high 65-85, viral above 85.
- Be specific, actionable, and honest.
- Do not inflate scores.
- Provide 3-5 useful items in each array.`;


/* =========================================================
   TYPES
========================================================= */

type PredictionRequest = {
  mode: string;
  platform: string;
  contentType: string;
  audience?: string;
  ideaText?: string;
  contentText?: string;
  title?: string;
  hashtags?: string;
};


/* =========================================================
   BUILD USER PROMPT
========================================================= */

function buildUserPrompt(req: PredictionRequest): string {
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
Target Audience: ${
      audience || 'General social media audience'
    }

Content Idea:
"""${ideaText || contentText || ''}"""

${title ? `Proposed Title: ${title}` : ''}

${hashtags ? `Proposed Hashtags: ${hashtags}` : ''}

Provide a complete viral content prediction analysis as JSON.`;
  }

  return `Analyze this EXISTING CONTENT:

Platform: ${platform}
Content Type: ${contentType}
Target Audience: ${
    audience || 'General social media audience'
  }

Content:
"""${contentText || ''}"""

${title ? `Title: ${title}` : ''}

${hashtags ? `Hashtags: ${hashtags}` : ''}

${ideaText ? `Original Idea Context: ${ideaText}` : ''}

Provide a complete viral content prediction analysis as JSON.`;
}


/* =========================================================
   EXTRACT JSON FROM AI RESPONSE
========================================================= */

function extractJSON(text: string): Record<string, any> | null {
  // Strategy 1: Direct JSON parse
  try {
    const parsed = JSON.parse(text);

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }
  } catch {
    // Continue
  }

  // Remove markdown code fences
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Strategy 2: Parse cleaned response
  try {
    const parsed = JSON.parse(cleaned);

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }
  } catch {
    // Continue
  }

  // Strategy 3: Find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const possibleJSON = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );

    try {
      const parsed = JSON.parse(possibleJSON);

      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {
      // Continue
    }
  }

  return null;
}


/* =========================================================
   POST /api/predict
========================================================= */

export async function POST(request: NextRequest) {
  /* =======================================================
     1. BASIC IP RATE LIMIT
  ======================================================= */

  const rl = rateLimit(10, 60_000);

  const identifier =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const { allowed } = rl.check(identifier);

  if (!allowed) {
    return NextResponse.json(
      {
        error:
          'Too many requests. Please wait a minute and try again.',
      },
      { status: 429 }
    );
  }


  try {
    /* =====================================================
       2. GET REQUEST BODY
    ===================================================== */

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


    /* =====================================================
       3. AUTHENTICATE USER
    ===================================================== */

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        'Supabase authentication error:',
        authError
      );
    }

    const userId = user?.id || null;

    if (!userId) {
      return NextResponse.json(
        {
          error:
            'Please sign in to analyze content.',
        },
        { status: 401 }
      );
    }


    /* =====================================================
       4. VALIDATE INPUT
    ===================================================== */

    if (
      !platform ||
      !contentType ||
      (!ideaText && !contentText)
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: platform, contentType, and content.',
        },
        { status: 400 }
      );
    }

    const rawContent =
      contentText || ideaText || '';

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


    /* =====================================================
       5. VALIDATE PLATFORM
    ===================================================== */

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
          error:
            `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
        },
        { status: 400 }
      );
    }


    /* =====================================================
       6. VALIDATE CONTENT TYPE
    ===================================================== */

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
      'article',
    ];

    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error:
            `Invalid content type. Must be one of: ${validContentTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }


    /* =====================================================
       7. CREATE ADMIN CLIENT
    ===================================================== */

    const admin = await createAdminClient();


    /* =====================================================
       8. GET USER USAGE
    ===================================================== */

    const {
      data: currentProfile,
      error: profileError,
    } = await admin
      .from('profiles')
      .select(
        'id, predictions_used, predictions_limit'
      )
      .eq('id', userId)
      .single();

    if (profileError || !currentProfile) {
      console.error(
        'Error getting user profile:',
        profileError
      );

      return NextResponse.json(
        {
          error:
            'Unable to load your prediction usage. Please try again.',
        },
        { status: 500 }
      );
    }


    /* =====================================================
       9. DETERMINE LIMIT
    ===================================================== */

    const predictionsUsed =
      Number(currentProfile.predictions_used || 0);

    const predictionsLimit =
      Number(currentProfile.predictions_limit || 5);


    /* =====================================================
       10. SERVER-SIDE LIMIT CHECK
    ===================================================== */

    if (predictionsUsed >= predictionsLimit) {
      return NextResponse.json(
        {
          error:
            `Monthly prediction limit reached. You have used ${predictionsUsed}/${predictionsLimit} predictions. Please upgrade your plan to continue.`,

          code: 'PREDICTION_LIMIT_REACHED',

          userUsage: {
            predictionsUsed,
            predictionsLimit,
          },
        },
        { status: 403 }
      );
    }


    /* =====================================================
       11. BUILD AI PROMPT
    ===================================================== */

    const targetAudience =
      audience ||
      'General social media audience';

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


    /* =====================================================
       12. CREATE ZAI CLIENT
    ===================================================== */

    console.log('Creating ZAI client...');

    const zai = await getZAI();

    console.log(
      'ZAI client created successfully.'
    );


    /* =====================================================
       13. CALL AI
    ===================================================== */

    console.log(
      'Sending request to ZAI...'
    );

    const completion =
      await zai.chat.completions.create({
        model:
          process.env.Z_AI_MODEL ||
          'glm-4.7-flash',

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

        max_tokens: 5000,
      });


    /* =====================================================
       14. CHECK ZAI RESPONSE
    ===================================================== */

    console.log(
      'ZAI completion received.'
    );

    if (!completion) {
      console.error(
        'ZAI returned no response.'
      );

      return NextResponse.json(
        {
          error:
            'AI returned no response. Please try again later.',
        },
        { status: 502 }
      );
    }

    if (
      'error' in completion &&
      completion.error
    ) {
      console.error(
        'ZAI API ERROR:',
        JSON.stringify(
          completion.error,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            'AI service returned an error. Please try again later.',
        },
        { status: 502 }
      );
    }


    /* =====================================================
       15. CHECK AI CHOICES
    ===================================================== */

    if (
      !Array.isArray(completion.choices) ||
      completion.choices.length === 0
    ) {
      console.error(
        'Invalid ZAI response:',
        completion
      );

      return NextResponse.json(
        {
          error:
            'AI returned an invalid response.',
        },
        { status: 502 }
      );
    }

    const firstChoice =
      completion.choices[0];

    if (!firstChoice) {
      return NextResponse.json(
        {
          error:
            'AI response contains no first choice.',
        },
        { status: 502 }
      );
    }


    /* =====================================================
       16. GET RAW AI CONTENT
    ===================================================== */

    let raw =
      firstChoice.message?.content || '';

    if (!raw) {
      console.error(
        'AI returned empty content:',
        JSON.stringify(
          completion,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            'AI returned an empty response.',
        },
        { status: 502 }
      );
    }

    if (typeof raw !== 'string') {
      raw = String(raw);
    }


    /* =====================================================
       17. PARSE AI JSON
    ===================================================== */

    const analysis =
      extractJSON(raw);

    if (!analysis) {
      console.error(
        'Failed to parse AI JSON:',
        raw
      );

      return NextResponse.json(
        {
          error:
            'Failed to parse AI response as JSON.',
        },
        { status: 502 }
      );
    }

    console.log(
      'AI JSON parsed successfully.'
    );


    /* =====================================================
       18. NORMALIZE AI DATA
    ===================================================== */

    const scores = {
      hook: Number(
        analysis.scores?.hook || 50
      ),

      engagement: Number(
        analysis.scores?.engagement || 50
      ),

      shareability: Number(
        analysis.scores?.shareability || 50
      ),

      retention: Number(
        analysis.scores?.retention || 50
      ),

      originality: Number(
        analysis.scores?.originality || 50
      ),

      audienceFit: Number(
        analysis.scores?.audienceFit || 50
      ),

      emotionalImpact: Number(
        analysis.scores?.emotionalImpact || 50
      ),

      contentQuality: Number(
        analysis.scores?.contentQuality || 50
      ),

      trendAlignment: Number(
        analysis.scores?.trendAlignment || 50
      ),
    };


    const platformFit =
      Array.isArray(analysis.platformFit)
        ? analysis.platformFit
        : [];


    const strengths =
      Array.isArray(analysis.strengths)
        ? analysis.strengths
        : [];


    const weaknesses =
      Array.isArray(analysis.weaknesses)
        ? analysis.weaknesses
        : [];


    const improvements =
      Array.isArray(analysis.improvements)
        ? analysis.improvements
        : [];


    const variations =
      Array.isArray(analysis.variations)
        ? analysis.variations
        : [];


    const emotionalBreakdown =
      analysis.emotionalBreakdown &&
      typeof analysis.emotionalBreakdown ===
        'object'
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
          };


    const predictedEngagement =
      analysis.predictedEngagement &&
      typeof analysis.predictedEngagement ===
        'object'
        ? analysis.predictedEngagement
        : {
            likes: '1.2K',
            comments: '85',
            shares: '340',
            saves: '220',
          };


    /* =====================================================
       19. SAVE ANALYSIS
    ===================================================== */

    const {
      data: savedAnalysis,
      error: saveError,
    } = await admin
      .from('content_analyses')
      .insert({
        user_id: userId,

        title:
          title ||
          (
            ideaText ||
            contentText ||
            ''
          ).slice(0, 80),

        platform,

        content_type:
          contentType,

        content_text:
          contentText ||
          ideaText ||
          '',

        idea_text:
          ideaText || null,

        audience:
          targetAudience,

        overall_score:
          Number(
            analysis.overallScore || 0
          ),

        confidence:
          analysis.confidence ||
          'medium',

        classification:
          analysis.classification ||
          'moderate',

        hook_score:
          scores.hook,

        engagement_score:
          scores.engagement,

        shareability_score:
          scores.shareability,

        retention_score:
          scores.retention,

        originality_score:
          scores.originality,

        audience_fit_score:
          scores.audienceFit,

        emotional_impact_score:
          scores.emotionalImpact,

        content_quality_score:
          scores.contentQuality,

        trend_alignment_score:
          scores.trendAlignment,

        platform_fit_scores:
          platformFit,

        strengths,

        weaknesses,

        recommendations:
          improvements,

        optimized_hook:
          analysis.optimizedHook ||
          null,

        optimized_caption:
          analysis.optimizedCaption ||
          null,

        optimized_title:
          analysis.optimizedTitle ||
          null,

        variations:
          variations,
      })
      .select()
      .single();


    if (saveError) {
      console.error(
        'Error saving analysis:',
        saveError
      );

      return NextResponse.json(
        {
          error:
            'Prediction was generated but could not be saved. Your prediction limit was not changed. Please try again.',
        },
        { status: 500 }
      );
    }


    /* =====================================================
       20. INCREMENT PREDICTION USAGE
    ===================================================== */

    const newPredictionCount =
      predictionsUsed + 1;

    const {
      error: updateError,
    } = await admin
      .from('profiles')
      .update({
        predictions_used:
          newPredictionCount,
      })
      .eq('id', userId);


    if (updateError) {
      console.error(
        'Error updating prediction usage:',
        updateError
      );

      /*
       * Prediction was successfully generated
       * and saved, but usage update failed.
       */

      return NextResponse.json(
        {
          id:
            savedAnalysis?.id ||
            null,

          overallScore:
            Number(
              analysis.overallScore || 50
            ),

          confidence:
            analysis.confidence ||
            'medium',

          classification:
            analysis.classification ||
            'moderate',

          scores,

          platformFit,

          emotionalBreakdown,

          predictedEngagement,

          strengths,

          weaknesses,

          improvements,

          optimizedHook:
            analysis.optimizedHook ||
            '',

          optimizedCaption:
            analysis.optimizedCaption ||
            '',

          optimizedTitle:
            analysis.optimizedTitle ||
            '',

          variations,

          userUsage: {
            predictionsUsed,
            predictionsLimit,
          },

          usageUpdateError: true,
        },
        { status: 200 }
      );
    }


    /* =====================================================
       21. BUILD FINAL RESPONSE
    ===================================================== */

    const response = {
      id:
        savedAnalysis?.id ||
        null,

      overallScore:
        Number(
          analysis.overallScore || 50
        ),

      confidence:
        analysis.confidence ||
        'medium',

      classification:
        analysis.classification ||
        'moderate',

      scores,

      platformFit,

      emotionalBreakdown,

      predictedEngagement,

      strengths,

      weaknesses,

      improvements,

      optimizedHook:
        analysis.optimizedHook ||
        '',

      optimizedCaption:
        analysis.optimizedCaption ||
        '',

      optimizedTitle:
        analysis.optimizedTitle ||
        '',

      variations,

      userUsage: {
        predictionsUsed:
          newPredictionCount,

        predictionsLimit:
          predictionsLimit,
      },
    };


    /* =====================================================
       22. SUCCESS
    ===================================================== */

    console.log(
      `Prediction completed successfully. Usage: ${newPredictionCount}/${predictionsLimit}`
    );

    return NextResponse.json(
      response,
      { status: 200 }
    );


  } catch (error: unknown) {
    console.error(
      'Prediction error:',
      error
    );

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