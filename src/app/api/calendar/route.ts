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
    const { data: events, error } = await admin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Calendar GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
    }

    return NextResponse.json(events || []);
  } catch (error) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { title, date, time, platform, contentType, notes, analysisId } = await request.json();

    if (!title || !date || !platform || !contentType) {
      return NextResponse.json({ error: 'title, date, platform, and contentType are required' }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { data: event, error } = await admin
      .from('calendar_events')
      .insert({
        user_id: userId,
        title,
        date,
        time: time || null,
        platform,
        content_type: contentType,
        notes: notes || null,
        analysis_id: analysisId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Calendar POST error:', error);
      return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Calendar POST error:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const { id, title, date, time, platform, contentType, notes, analysisId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const admin = await createAdminClient();

    // Verify ownership
    const { data: existing } = await admin
      .from('calendar_events')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (platform !== undefined) updateData.platform = platform;
    if (contentType !== undefined) updateData.content_type = contentType;
    if (notes !== undefined) updateData.notes = notes;
    if (analysisId !== undefined) updateData.analysis_id = analysisId;

    const { data: event, error } = await admin
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Calendar PUT error:', error);
      return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Calendar PUT error:', error);
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { error } = await admin
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Calendar DELETE error:', error);
      return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
  }
}
