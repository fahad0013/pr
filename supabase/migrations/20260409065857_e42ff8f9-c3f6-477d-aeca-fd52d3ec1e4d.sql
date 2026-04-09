
CREATE TABLE public.daily_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  minutes_spent integer DEFAULT 0,
  tests_completed integer DEFAULT 0,
  UNIQUE(user_id, activity_date)
);

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily activity"
ON public.daily_activity
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily activity"
ON public.daily_activity
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily activity"
ON public.daily_activity
FOR UPDATE
USING (auth.uid() = user_id);
