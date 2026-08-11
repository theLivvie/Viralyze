import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    // Fetch profile from profiles table
    const admin = await createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      id: profile.id,
      email: profile.email,
      name: profile.name,
      image: profile.avatar_url,
      plan: profile.plan,
      predictionsUsed: profile.predictions_used,
      predictionsLimit: profile.predictions_limit,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
