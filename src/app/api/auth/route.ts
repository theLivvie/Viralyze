import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export async function PUT(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      predictionsUsed: user.predictionsUsed,
      predictionsLimit: user.predictionsLimit,
    });
  } catch (error) {
    console.error('Auth PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    const { action, email, name, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (action === 'signup') {
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      const user = await db.user.create({
        data: { email, name: name || email.split('@')[0], password: password || null },
      });
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        predictionsUsed: user.predictionsUsed,
        predictionsLimit: user.predictionsLimit,
      });
    }

    if (action === 'login') {
      let user = await db.user.findUnique({ where: { email } });
      if (!user) {
        user = await db.user.create({
          data: { email, name: email.split('@')[0], password: password || null },
        });
      }
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        predictionsUsed: user.predictionsUsed,
        predictionsLimit: user.predictionsLimit,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, retryAfter } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 });
  }

  try {
    // Accept userId from query params or body
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    if (!userId) {
      try {
        const body = await request.json();
        userId = body.userId || body.id;
      } catch {
        // Body parse failed, continue without
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Delete all related content analyses (calendar events will cascade via SetNull)
    await db.contentAnalysis.deleteMany({ where: { userId } });

    // Delete calendar events explicitly
    await db.calendarEvent.deleteMany({ where: { userId } });

    // Delete the user
    await db.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
