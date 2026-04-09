
-- Add unique constraint to prevent duplicate badges
ALTER TABLE public.badges ADD CONSTRAINT badges_user_badge_unique UNIQUE (user_id, badge_type);

-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert own badges" ON public.badges;

-- Block all direct inserts from clients
CREATE POLICY "No direct badge inserts" ON public.badges
FOR INSERT TO public
WITH CHECK (false);

-- Create server-side badge awarding function
CREATE OR REPLACE FUNCTION public.award_badge(p_user_id UUID, p_badge_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INT;
  v_high50 INT;
  v_high70 INT;
  v_valid BOOLEAN := false;
BEGIN
  -- Only allow awarding to yourself
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot award badges to other users';
  END IF;

  -- Validate badge_type
  IF p_badge_type NOT IN ('bronze', 'silver', 'gold') THEN
    RAISE EXCEPTION 'Invalid badge type: %', p_badge_type;
  END IF;

  -- Check if already earned
  IF EXISTS (SELECT 1 FROM public.badges WHERE user_id = p_user_id AND badge_type = p_badge_type) THEN
    RETURN; -- Already has this badge
  END IF;

  -- Fetch stats
  SELECT COALESCE(current_streak, 0) INTO v_streak FROM public.profiles WHERE id = p_user_id;
  SELECT COUNT(*) INTO v_high50 FROM public.results WHERE user_id = p_user_id AND total_score >= 50;
  SELECT COUNT(*) INTO v_high70 FROM public.results WHERE user_id = p_user_id AND total_score >= 70;

  -- Validate eligibility
  IF p_badge_type = 'gold' AND (v_streak >= 30 OR v_high70 >= 10) THEN
    v_valid := true;
  ELSIF p_badge_type = 'silver' AND (v_streak >= 10 OR v_high50 >= 5) THEN
    v_valid := true;
  ELSIF p_badge_type = 'bronze' AND v_streak >= 3 THEN
    v_valid := true;
  END IF;

  IF NOT v_valid THEN
    RAISE EXCEPTION 'User does not meet requirements for % badge', p_badge_type;
  END IF;

  INSERT INTO public.badges (user_id, badge_type) VALUES (p_user_id, p_badge_type);
END;
$$;
