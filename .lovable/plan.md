

# User Daily Improvement Tracking System

## Overview
Create a dedicated **User Profile Detail Page** (`/admin/users/:userId`) accessible from the admin users table, replacing the current modal with a full-page view featuring charts, tables, and insights powered by real Supabase data.

## Changes

### 1. New Page: `src/pages/admin/AdminUserDetail.tsx`
A comprehensive user profile detail page with these sections:

**Header** — User avatar, name, district, institution, streak, badges

**Score Over Time** (Line Chart) — Query `results` for this user, plot `total_score` vs `created_at` date

**Accuracy Trend** (Line Chart) — Calculate accuracy per test (`correct_count / (correct_count + wrong_count) * 100`), plot over time

**Daily Activity** (Bar Chart) — Query `daily_activity` for this user, show `tests_completed` and `minutes_spent` per day

**Daily Performance Table** — Aggregate `results` by date: tests taken, avg score, avg accuracy, total time spent

**Subject-wise Performance** (Bar Chart) — Parse `subject_scores` JSONB from `results`, aggregate correct/total per subject, show accuracy %

**Mistake Insights:**
- Most incorrect subjects — aggregate `mistakes` by `subject`, show count
- Frequently wrong questions — group `mistakes` by `question_id`, show top 10 with question text and count

### 2. Update Routing — `src/App.tsx`
Add route: `<Route path="users/:userId" element={<AdminUserDetail />} />`

### 3. Update Admin Users Table — `src/pages/admin/AdminUsers.tsx`
Replace the modal dialog with a `useNavigate` link to `/admin/users/${userId}`. Remove the dialog code.

### 4. Database Index Migration
Add indexes to optimize the queries:
```sql
CREATE INDEX IF NOT EXISTS idx_results_user_id_created ON results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mistakes_user_id_subject ON mistakes(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_id_date ON daily_activity(user_id, activity_date DESC);
```

## Data Queries (all real Supabase, no mock)
- **Results**: `supabase.from("results").select("*").eq("user_id", userId).order("created_at")`
- **Daily activity**: `supabase.from("daily_activity").select("*").eq("user_id", userId).order("activity_date")`
- **Mistakes**: `supabase.from("mistakes").select("*").eq("user_id", userId)`
- **Profile**: `supabase.from("profiles").select("*").eq("id", userId).single()`
- **Tests** (for titles): `supabase.from("tests").select("id, title")`

## UI Stack
- Recharts `LineChart`, `BarChart` (already in project)
- Existing Card, Table, Avatar, Skeleton, Badge components
- Bengali labels throughout
- Dark/light mode compatible via CSS variables

