
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS test_type text NOT NULL DEFAULT 'live';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS subject_category text;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'live';

CREATE POLICY "Authenticated users can insert tests"
  ON public.tests FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert questions"
  ON public.questions FOR INSERT TO authenticated
  WITH CHECK (true);
