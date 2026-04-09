

## Plan: Remove Empty Tests (ID 7 & 8)

Two tests have 0 questions and need to be deleted from the `tests` table:
- **ID 7**: "Primary Mock Test" (0 questions)
- **ID 8**: "প্রাথমিক শিক্ষক মক টেস্ট - ০৭" (0 questions)

### Steps

1. **Delete test rows** — Use the Supabase insert tool to run `DELETE FROM tests WHERE id IN (7, 8)` to remove both empty tests.

No code changes needed — the LiveExam page dynamically fetches tests, so removing the rows will automatically hide the cards.

