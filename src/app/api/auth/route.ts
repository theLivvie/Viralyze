import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

/** Helper: get authenticated user from request, return null if not logged in */
async function getAuthUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

/** Helper: get or create profile for a user */
async function getOrCreateProfile(userId: string, email: string, name?: string) {
  const admin = await createAdminClient();

  // Try to find existing profile
  let { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    // Create profile (trigger should handle this, but just in case)
    const { data: newProfile } = await admin
      .from('profiles')
      .insert({
        id: userId,
        email,
        name: name || email.split('@')[0],
      })
      .select()
      .single();
    profile = newProfile;
  }

  return profile;
}

/** Helper: format profile for frontend */
function formatProfile(p: Record<string, unknown>) {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    image: p.avatar_url,
    plan: p.plan,
    predictionsUsed: p.predictions_used,
    predictionsLimit: p.predictions_limit,
  };
}

// ============================================
// POST — signup / login
// ============================================
export async function POST(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { action, email, name, password } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const supabase = await createClient();

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return NextResponse.json({ error: 'Email already exists. Please sign in.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Profile is auto-created by trigger, but fetch to return it
      if (data.user) {
        const profile = await getOrCreateProfile(data.user.id, email, name);
        if (profile) {
          return NextResponse.json(formatProfile(profile));
        }
      }

      return NextResponse.json({
        id: data.user?.id,
        email,
        name: name || email.split('@')[0],
        plan: 'free',
        predictionsUsed: 0,
        predictionsLimit: 5,
      });
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login')) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      if (data.user) {
        const profile = await getOrCreateProfile(data.user.id, email);
        if (profile) {
          return NextResponse.json(formatProfile(profile));
        }
      }

      return NextResponse.json({
        id: data.user?.id,
        email,
        name: email.split('@')[0],
        plan: 'free',
        predictionsUsed: 0,
        predictionsLimit: 5,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// ============================================
// PUT — update profile
// ============================================
export async function PUT(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { name } = await request.json();
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = await createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .update({ name })
      .eq('id', user.id)
      .select()
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(formatProfile(profile));
  } catch (error) {
    console.error('Auth PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// ============================================
// GET — get current session/user
// ============================================
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const profile = await getOrCreateProfile(user.id, user.email || '', user.user_metadata?.name);
    if (!profile) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      ...formatProfile(profile),
    });
  } catch (error) {
    console.error('Auth GET error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

// ============================================
// DELETE — delete account
// ============================================
export async function DELETE(request: NextRequest) {
  const rl = rateLimit(60, 60_000);
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = rl.check(identifier);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = await createAdminClient();

    // Delete user data (cascade should handle this via FK, but be explicit)
    await admin.from('calendar_events').delete().eq('user_id', user.id);
    await admin.from('content_analyses').delete().eq('user_id', user.id);
    await admin.from('profiles').delete().eq('id', user.id);

    // Delete auth user
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error('Delete auth user error:', error);
    }

    // Sign out from the current session
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
