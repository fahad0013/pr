
-- 1. Admin RLS policies for read-restricted tables

-- results: admins can SELECT all
CREATE POLICY "Admins can view all results"
ON public.results FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- daily_activity: admins can SELECT all
CREATE POLICY "Admins can view all daily_activity"
ON public.daily_activity FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- mistakes: admins can SELECT all
CREATE POLICY "Admins can view all mistakes"
ON public.mistakes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Admin UPDATE/DELETE policies for questions and tests

CREATE POLICY "Admins can update questions"
ON public.questions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete questions"
ON public.questions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tests"
ON public.tests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tests"
ON public.tests FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Cascade delete: drop old FK constraint on questions.test_id, re-add with CASCADE
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_test_id_fkey;
ALTER TABLE public.questions
  ADD CONSTRAINT questions_test_id_fkey
  FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;

-- 4. Platform settings table
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'true'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read settings"
ON public.platform_settings FOR SELECT TO public
USING (true);

CREATE POLICY "Admins can insert settings"
ON public.platform_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
ON public.platform_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings"
ON public.platform_settings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed default settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('maintenance_mode', 'false'::jsonb),
  ('signups_enabled', 'true'::jsonb);

-- 5. Leaderboard bans table
CREATE TABLE public.leaderboard_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.leaderboard_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view bans"
ON public.leaderboard_bans FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert bans"
ON public.leaderboard_bans FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bans"
ON public.leaderboard_bans FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
