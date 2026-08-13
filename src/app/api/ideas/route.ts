import { NextRequest, NextResponse } from 'next/server';
import { getZAI } from '@/lib/zai';
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