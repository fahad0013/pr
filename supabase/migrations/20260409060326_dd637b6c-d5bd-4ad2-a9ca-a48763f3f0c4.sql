-- Add onboarding_completed to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Change subject_interest from text to text[]
ALTER TABLE public.profiles
ALTER COLUMN subject_interest TYPE text[] USING 
  CASE 
    WHEN subject_interest IS NULL THEN NULL
    WHEN subject_interest LIKE '{%' THEN subject_interest::text[]
    ELSE ARRAY[subject_interest]
  END;

-- Add subject column to questions (copy from category)
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS subject TEXT;

UPDATE public.questions SET subject = category WHERE subject IS NULL;

-- Add detail columns to mistakes
ALTER TABLE public.mistakes
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS question_text TEXT,
ADD COLUMN IF NOT EXISTS correct_answer TEXT,
ADD COLUMN IF NOT EXISTS user_answer TEXT;