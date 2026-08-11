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
    const { data: profile, error } = await admin
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(profile.settings || {});
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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

    const { ...updates } = await request.json();

    const admin = await createAdminClient();

    // Fetch current settings
    const { data: profile } = await admin
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const current = (typeof profile.settings === 'object' && profile.settings !== null)
      ? profile.settings as Record<string, unknown>
      : {};

    // Deep merge
    const merged = { ...current };
    for (const [key, value] of Object.entries(updates)) {
      if (
        typeof value === 'object' && value !== null && !Array.isArray(value) &&
        typeof merged[key] === 'object' && merged[key] !== null && !Array.isArray(merged[key])
      ) {
        merged[key] = { ...(merged[key] as Record<string, unknown>), ...(value as Record<string, unknown>) };
      } else {
        merged[key] = value;
      }
    }

    const { data: updated, error } = await admin
      .from('profiles')
      .update({ settings: merged })
      .eq('id', userId)
      .select('settings')
      .single();

    if (error) {
      console.error('Settings PUT error:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json(updated?.settings || {});
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
