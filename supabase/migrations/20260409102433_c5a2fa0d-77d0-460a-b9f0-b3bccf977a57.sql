UPDATE public.tests SET duration_minutes = 60 WHERE id = 1;

INSERT INTO public.tests (id, title, description, duration_minutes) VALUES (2, 'প্রাথমিক শিক্ষক মক টেস্ট — ০২', 'প্রাথমিক শিক্ষক নিয়োগ - বিগত বছরের প্রশ্ন (মক টেস্ট ২০২৩)', 60);
INSERT INTO public.tests (id, title, description, duration_minutes) VALUES (3, 'প্রাথমিক শিক্ষক মক টেস্ট — ০৩', 'প্রাথমিক শিক্ষক নিয়োগ প্রশ্ন সমাধান - ০৩-০৬-২০২২', 60);
INSERT INTO public.tests (id, title, description, duration_minutes) VALUES (4, 'প্রাথমিক শিক্ষক মক টেস্ট — ০৪', 'প্রাথমিক শিক্ষক নিয়োগ মক টেস্ট', 60);
INSERT INTO public.tests (id, title, description, duration_minutes) VALUES (5, 'প্রাথমিক শিক্ষক মক টেস্ট — ০৫', 'প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার প্রশ্ন সমাধান - ২০-০৫-২০২২', 60);
INSERT INTO public.tests (id, title, description, duration_minutes) VALUES (6, 'প্রাথমিক শিক্ষক মক টেস্ট — ০৬', 'প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার প্রশ্ন সমাধান - ২১-০৬-২০১৯', 60);

-- Update sequence to avoid conflicts
SELECT setval('tests_id_seq', (SELECT MAX(id) FROM public.tests));