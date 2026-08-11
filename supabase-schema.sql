-- Viralyze Supabase Schema
-- Run this in the Supabase SQL Editor

-- ============================================
-- 1. PROFILES table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  predictions_used INT NOT NULL DEFAULT 0,
  predictions_limit INT NOT NULL DEFAULT 5,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. CONTENT_ANALYSES table
-- ============================================
CREATE TABLE IF NOT EXISTS public.content_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_text TEXT NOT NULL DEFAULT '',
  idea_text TEXT,
  audience TEXT,

  overall_score INT NOT NULL DEFAULT 0,
  confidence TEXT NOT NULL DEFAULT 'medium',
  classification TEXT NOT NULL DEFAULT 'moderate',

  hook_score INT NOT NULL DEFAULT 0,
  engagement_score INT NOT NULL DEFAULT 0,
  shareability_score INT NOT NULL DEFAULT 0,
  retention_score INT NOT NULL DEFAULT 0,
  originality_score INT NOT NULL DEFAULT 0,
  audience_fit_score INT NOT NULL DEFAULT 0,
  emotional_impact_score INT NOT NULL DEFAULT 0,
  content_quality_score INT NOT NULL DEFAULT 0,
  trend_alignment_score INT NOT NULL DEFAULT 0,
  platform_fit_scores JSONB NOT NULL DEFAULT '[]'::jsonb,

  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  optimized_hook TEXT,
  optimized_caption TEXT,
  optimized_title TEXT,
  variations JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. CALENDAR_EVENTS table
-- ============================================
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  notes TEXT,
  analysis_id UUID REFERENCES public.content_analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_content_analyses_user_id ON public.content_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analyses_created_at ON public.content_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Content analyses: users can CRUD their own
CREATE POLICY "Users can view own analyses" ON public.content_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses" ON public.content_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.content_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.content_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar events: users can CRUD their own
CREATE POLICY "Users can view own calendar events" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendar events" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON public.calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON public.calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. AUTO-GENERATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS content_analyses_updated_at ON public.content_analyses;
CREATE TRIGGER content_analyses_updated_at
  BEFORE UPDATE ON public.content_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
