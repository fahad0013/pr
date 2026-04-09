

## Plan: One-Upload, Multiple-View Hybrid System

### Summary
Restructure the seeder and frontend so one uploaded JSON creates a single `live` test, while Subjects/SubjectSets pages query the `questions` table directly by `category` — no dependency on `test_type='subject'`.

---

### Step 1: Simplify Seed Page (`src/pages/Seed.tsx`)
- Always create test with `test_type: 'live'` regardless of question count
- Remove the `isLive` branching logic (no more `subject` test_type)
- Keep title/description inputs as-is

### Step 2: Rewrite Subjects Page (`src/pages/Subjects.tsx`)
Query `questions` table directly instead of `tests`:
- `SELECT category, COUNT(*) as question_count, COUNT(DISTINCT test_id) as set_count FROM questions WHERE category IS NOT NULL GROUP BY category`
- Build subject cards from this aggregated data
- This shows all categories (Bangla, English, Math, GK, বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান) with their question and set counts

### Step 3: Rewrite SubjectSets Page (`src/pages/SubjectSets.tsx`)
When user clicks a subject (e.g., "Bangla"):
- Query distinct `test_id` values from `questions` where `category` matches (including Bengali variants via `subjectVariantsMap`)
- For each `test_id`, count questions in that category → becomes "বাংলা সেট ০১", "বাংলা সেট ০২", etc.
- Fetch test titles from `tests` table for display
- Navigate to `/exam/{testId}?subject={category}` so ExamRoom filters correctly

### Step 4: Update ExamRoom (`src/pages/ExamRoom.tsx`)
- In the normal exam path (non-revision, non-set), when `subjectFilter` is present:
  - Filter questions by **both** `test_id` AND `category` (using category variants)
  - This ensures only questions of that specific category from that specific test are shown
- Remove the old `isSetMode` logic (examId === "subject") since we now use real test IDs
- Set appropriate duration (e.g., 1 min per question)

### Step 5: LiveExam stays unchanged
Already filters by `test_type='live'` — works correctly.

---

### Files Changed
| File | Action |
|------|--------|
| `src/pages/Seed.tsx` | Edit — always use `test_type: 'live'` |
| `src/pages/Subjects.tsx` | Rewrite — query `questions` grouped by `category` |
| `src/pages/SubjectSets.tsx` | Rewrite — query `questions` by category, group by `test_id` |
| `src/pages/ExamRoom.tsx` | Edit — filter by `category` + `test_id` for subject sets |

No database migrations needed.

