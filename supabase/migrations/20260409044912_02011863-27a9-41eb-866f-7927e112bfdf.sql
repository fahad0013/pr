
-- Update profiles table with new columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subject_interest TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Create results table
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  subject_scores JSONB DEFAULT '{}',
  rank_in_test INTEGER,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own results"
ON public.results FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
ON public.results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create mistakes table
CREATE TABLE public.mistakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  test_id TEXT NOT NULL,
  subject TEXT,
  question_text TEXT,
  correct_answer TEXT,
  user_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mistakes"
ON public.mistakes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mistakes"
ON public.mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mistakes"
ON public.mistakes FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_results_user_id ON public.results(user_id);
CREATE INDEX idx_mistakes_user_id ON public.mistakes(user_id);
CREATE INDEX idx_mistakes_subject ON public.mistakes(subject);
