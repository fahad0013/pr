

## Plan: Database Seeder Page with Smart Test Routing

### Summary
Add new columns to the `tests` table (`test_type`, `subject_category`, `status`), create a hidden `/seed` page for uploading JSON question files, and update the LiveExam and Subjects pages to filter by `test_type`.

---

### Step 1: Database Migration
Add three columns to the `tests` table:
- `test_type` (text, default `'live'`) — values: `'live'` or `'subject'`
- `subject_category` (text, nullable) — e.g., `'Bangla'`, `'English'`, `'Math'`, `'GK'`
- `status` (text, default `'live'`)

Also add an RLS INSERT policy for authenticated users so the seeder can insert tests and questions.

```sql
ALTER TABLE public.tests ADD COLUMN test_type text NOT NULL DEFAULT 'live';
ALTER TABLE public.tests ADD COLUMN subject_category text;
ALTER TABLE public.tests ADD COLUMN status text NOT NULL DEFAULT 'live';

-- Allow authenticated users to insert tests (for seeder)
CREATE POLICY "Authenticated users can insert tests"
  ON public.tests FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert questions (for seeder)
CREATE POLICY "Authenticated users can insert questions"
  ON public.questions FOR INSERT TO authenticated
  WITH CHECK (true);
```

### Step 2: Create `/seed` Page (`src/pages/Seed.tsx`)
- Hidden page, no navbar link
- File input accepting multiple `.json` files
- "Seed Database" button
- Processing logic per file:
  - Parse JSON array, count questions
  - If `count >= 70`: insert into `tests` with `test_type='live'`, `duration_minutes=60`, `subject_category=null`
  - If `count < 70`: extract `category` from first question, insert with `test_type='subject'`, `duration_minutes=20`, `subject_category=category`
  - Get returned `test_id`, inject into each question, bulk insert into `questions`
- Toast notifications via sonner for success/error
- Dark theme consistent UI

### Step 3: Add Route in `App.tsx`
Add `<Route path="/seed" element={<Seed />} />` as a standalone route (no layout).

### Step 4: Update LiveExam Page
Filter tests query: `.eq("test_type", "live")` so only full mock tests appear.

### Step 5: Update Subjects Page
Filter questions query to only include questions from tests where `test_type='subject'`. Group by `subject_category` from the tests table rather than individual question subjects.

### Step 6: Update SubjectSets Page
Adjust query to fetch sets from tests with `test_type='subject'` filtered by `subject_category`.

---

### Files Changed
| File | Action |
|------|--------|
| Migration SQL | New — add columns + insert policies |
| `src/pages/Seed.tsx` | New — seeder page |
| `src/App.tsx` | Edit — add `/seed` route |
| `src/pages/LiveExam.tsx` | Edit — filter by `test_type='live'` |
| `src/pages/Subjects.tsx` | Edit — filter by `test_type='subject'`, group by `subject_category` |
| `src/pages/SubjectSets.tsx` | Edit — filter sets by `test_type='subject'` + `subject_category` |

