

## Plan: Fix Missing Category Data and Improve Seeder Robustness

### Problem
160 questions (test IDs 7 and 8) have `category: NULL` because they were uploaded without the `category` field in the JSON. The Subjects page correctly queries by category, but these questions are invisible since they have no category.

### Step 1: Fix Existing NULL Data (Migration)
Run a SQL migration to update the 160 orphaned questions. Since we can't determine their categories automatically (they're mixed subjects), we need a pragmatic approach:
- Add a migration that sets `category` based on simple heuristics from question text (Bengali text → detect subject keywords), OR
- Since we can't reliably auto-categorize, mark them with a fallback category like "সাধারণ" (General) so they appear in the UI, OR
- Delete the orphaned questions if they were test uploads

**Recommended**: Delete questions with NULL category from test IDs 7 and 8 (they appear to be duplicate test data uploaded without proper formatting). The user can re-upload with correct JSON format.

### Step 2: Make Seeder More Robust (`src/pages/Seed.tsx`)
- Add validation: if any question in the uploaded JSON is missing a `category` field, show an error toast and reject the upload
- Show a preview of detected categories before seeding (e.g., "Bangla: 20, English: 20, Math: 20, GK: 20")
- This prevents future NULL category issues

### Step 3: Handle Edge Cases in Subjects Page (`src/pages/Subjects.tsx`)
- Add a fallback: if questions have NULL category, either skip them (current behavior) or group them under "অন্যান্য" (Others)
- Keep current behavior (skip NULLs) since Step 2 prevents future NULLs

---

### Files Changed
| File | Action |
|------|--------|
| Migration SQL | Delete 160 orphaned questions (test_id 7, 8 with NULL category) |
| `src/pages/Seed.tsx` | Add category validation — reject JSON files where any question lacks `category` |

### Result
After cleanup, the Subjects page will show accurate counts. The seeder will prevent future uploads without proper category tagging.

