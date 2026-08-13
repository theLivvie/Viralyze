import { NextRequest, NextResponse } from 'next/server';
import { getZAI } from '@/lib/zai';
import { rateLimit } from '@/lib/rate-limit';

const SYSTEM_PROMPT = `You are Viralyze, a viral content trend analysis engine.

IMPORTANT:
Respond with ONLY valid JSON.
No markdown.
No code blocks.
No explanations.
No text before or after the JSON.

Return EXACTLY this structure:

{
  "categories": [
    {
      "category": "Technology",
      "trends": [
        {
          "name": "AI Coding",
          "growth": "+142%",
          "heat": 5,
          "platforms": ["youtube", "tiktok"]
        }
      ]
    }
  ]
}

Requirements:

- Generate 4-5 categories.
- Each category must contain 3-4 trends.
- Each trend must contain:
  - name: specific trend name
  - growth: percentage string beginning with +
  - heat: number from 1 to 5
  - platforms: array containing valid platform names
- Valid platforms:
  instagram
  youtube
  tiktok
  x
  linkedin
- Growth must be realistic, between +20% and +400%.
- Heat must be between 1 and 5.
- Focus on trends that are useful for content creators, marketers, brands, and businesses.
- Prefer specific topics over generic terms.
- Include a mixture of technology, business, creator economy, entertainment, culture, lifestyle, and social media trends.
- Do not invent impossible or obviously fake trends.
- Return ONLY the JSON object.`;

export async function GET(request: NextRequest) {
  // Rate limit: 20 requests per minute
  const rl = rateLimit(20, 60_000);

  const identifier =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const { allowed, retryAfter } = rl.check(identifier);

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter,
      },
      { status: 429 }
    );
  }

  try {
    console.log('Creating ZAI client...');

    const zai = await getZAI();

    console.log('ZAI client created successfully.');
    console.log('Requesting latest trends from Z.ai...');

    const completion = await zai.chat.completions.create({
      model: 'glm-4.7-flash',

      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content:
            'Generate current social media trends that are useful for content creators and marketers. Focus on topics currently gaining attention and likely to have strong viral potential.',
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

    console.log('ZAI completion received.');

    /*
     * Check whether Z.ai returned an error.
     */
    if (
      completion &&
      typeof completion === 'object' &&
      'error' in completion
    ) {
      console.error(
        'ZAI API ERROR:',
        JSON.stringify(completion, null, 2)
      );

      return NextResponse.json(
        {
          error:
            'AI service returned an error. Please try again later.',
        },
        { status: 502 }
      );
    }

    /*
     * Check response.
     */
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

    /*
     * Check choices.
     */
    if (
      !Array.isArray(completion.choices) ||
      completion.choices.length === 0
    ) {
      console.error(
        'Invalid ZAI response:',
        JSON.stringify(completion, null, 2)
      );

      return NextResponse.json(
        {
          error: 'AI returned an invalid response.',
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

    /*
     * Get AI content.
     */
    let raw = firstChoice.message?.content || '';

    if (!raw) {
      console.error(
        'AI returned empty content:',
        JSON.stringify(completion, null, 2)
      );

      return NextResponse.json(
        {
          error: 'AI returned an empty response.',
        },
        { status: 500 }
      );
    }

    if (typeof raw !== 'string') {
      raw = String(raw);
    }

    console.log('Raw trend response received.');

    /*
     * Clean markdown if AI accidentally adds it.
     */
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    /*
     * Parse JSON.
     */
    let data: any = null;

    // Strategy 1: direct JSON parse
    try {
      data = JSON.parse(cleaned);
    } catch {
      // Continue to next strategy
    }

    // Strategy 2: extract JSON object
    if (!data) {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');

      if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
      ) {
        try {
          data = JSON.parse(
            cleaned.slice(firstBrace, lastBrace + 1)
          );
        } catch {
          // Continue
        }
      }
    }

    /*
     * Validate categories.
     */
    if (
      !data ||
      typeof data !== 'object' ||
      !Array.isArray(data.categories)
    ) {
      console.error(
        'Failed to parse trend data:',
        cleaned
      );

      return NextResponse.json(
        {
          error: 'Failed to parse trend data from AI response.',
        },
        { status: 500 }
      );
    }

    /*
     * Normalize and validate platforms.
     */
    const validPlatforms = [
      'instagram',
      'youtube',
      'tiktok',
      'x',
      'linkedin',
    ];

    const normalized = {
      categories: data.categories.map(
        (category: Record<string, unknown>) => {
          const trends = Array.isArray(category.trends)
            ? category.trends
            : [];

          return {
            category: String(
              category.category || 'Unknown'
            ),

            trends: trends.map(
              (trend: Record<string, unknown>) => {
                const platforms = Array.isArray(
                  trend.platforms
                )
                  ? trend.platforms
                      .map((platform) =>
                        String(platform).toLowerCase()
                      )
                      .filter((platform) =>
                        validPlatforms.includes(platform)
                      )
                  : [];

                let heat = Number(trend.heat);

                if (!Number.isFinite(heat)) {
                  heat = 3;
                }

                heat = Math.max(
                  1,
                  Math.min(5, Math.round(heat))
                );

                let growth = String(
                  trend.growth || '+0%'
                ).trim();

                /*
                 * Make sure growth starts with +.
                 */
                if (
                  !growth.startsWith('+') &&
                  !growth.startsWith('-')
                ) {
                  growth = `+${growth}`;
                }

                return {
                  name: String(
                    trend.name || 'Unknown Trend'
                  ),

                  growth,

                  heat,

                  platforms,
                };
              }
            ),
          };
        }
      ),
    };

    /*
     * Remove empty categories.
     */
    normalized.categories =
      normalized.categories.filter(
        (category) => category.trends.length > 0
      );

    if (normalized.categories.length === 0) {
      return NextResponse.json(
        {
          error: 'AI did not return any valid trends.',
        },
        { status: 500 }
      );
    }

    console.log(
      `Successfully generated ${normalized.categories.length} trend categories.`
    );

    return NextResponse.json(normalized, {
      status: 200,
    });
  } catch (error: unknown) {
    console.error(
      'Trends fetch error:',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch trends';

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}