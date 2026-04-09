
-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_index INTEGER NOT NULL,
  subject TEXT NOT NULL,
  test_id TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Everyone can read questions
CREATE POLICY "Questions are publicly readable"
ON public.questions FOR SELECT USING (true);

CREATE INDEX idx_questions_subject ON public.questions(subject);
CREATE INDEX idx_questions_test_id ON public.questions(test_id);

-- Seed sample questions
INSERT INTO public.questions (text, options, correct_index, subject, test_id) VALUES
  ('''সোনার তরী'' কবিতাটি কোন কবির লেখা?', '["কাজী নজরুল ইসলাম","রবীন্দ্রনাথ ঠাকুর","জীবনানন্দ দাশ","মাইকেল মধুসূদন দত্ত"]', 1, 'বাংলা', 'bcs-mock-07'),
  ('বাংলাদেশের জাতীয় সংসদ ভবনের স্থপতি কে?', '["লুই আই কান","এফ আর খান","মাজহারুল ইসলাম","জন বেচটেল"]', 0, 'সাধারণ জ্ঞান', 'bcs-mock-07'),
  ('Which one is correct?', '["He come here yesterday","He came here yesterday","He has come here yesterday","He was come here yesterday"]', 1, 'English', 'bcs-mock-07'),
  ('একটি ত্রিভুজের তিন বাহুর দৈর্ঘ্য ৩, ৪ ও ৫ হলে ত্রিভুজটির ক্ষেত্রফল কত?', '["৫","৬","৭.৫","১০"]', 1, 'গণিত', 'bcs-mock-07'),
  ('বাংলাদেশের স্বাধীনতা দিবস কত তারিখে?', '["১৬ ডিসেম্বর","২৬ মার্চ","২১ ফেব্রুয়ারি","১৭ মার্চ"]', 1, 'সাধারণ জ্ঞান', 'bcs-mock-07'),
  ('''কবর'' নাটকটি কার রচনা?', '["মুনীর চৌধুরী","সৈয়দ ওয়ালীউল্লাহ","সেলিম আল দীন","মমতাজউদদীন আহমদ"]', 0, 'বাংলা', 'bcs-mock-07'),
  ('log₂(32) = ?', '["৩","৪","৫","৬"]', 2, 'গণিত', 'bcs-mock-07'),
  ('The synonym of ''Abundant'' is —', '["Scarce","Plentiful","Rare","Meager"]', 1, 'English', 'bcs-mock-07'),
  ('বাংলাদেশের বৃহত্তম নদী কোনটি?', '["পদ্মা","মেঘনা","যমুনা","ব্রহ্মপুত্র"]', 3, 'সাধারণ জ্ঞান', 'bcs-mock-07'),
  ('x² - 5x + 6 = 0 সমীকরণের মূলদ্বয় কত?', '["১, ৬","২, ৩","-২, -৩","১, ৫"]', 1, 'গণিত', 'bcs-mock-07');
