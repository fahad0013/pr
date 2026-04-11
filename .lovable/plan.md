

# Admin Panel for Prostuti

## Overview

A full admin panel at `/admin` with sidebar navigation, protected by the existing `user_roles` table and `has_role()` security definer function. No mock data — all queries hit Supabase directly.

## Database Changes (Migrations)

**1. Admin RLS policies** — Admins need to read all rows in tables currently restricted to own-user:

- `results`: Add SELECT policy for admins (`has_role(auth.uid(), 'admin')`)
- `daily_activity`: Add SELECT policy for admins
- `mistakes`: Add SELECT policy for admins (currently only own-user)
- `questions`: Add UPDATE and DELETE policies for admins
- `tests`: Add UPDATE and DELETE policies for admins

**2. Cascade delete for tests → questions** — Add `ON DELETE CASCADE` to `questions.test_id` foreign key so deleting a test removes its questions.

**3. Platform settings table:**

```sql
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'true',
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: admins can read/write, everyone can read
```

Settings like `signups_enabled`, `maintenance_mode`.

**4. Leaderboard bans table:**

```sql
CREATE TABLE public.leaderboard_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
-- RLS: admins can CRUD
```

## New Files

### Route & Guard

- **`src/components/AdminRoute.tsx`** — Checks `has_role(user.id, 'admin')` via Supabase RPC. Redirects to `/` if not admin. Shows spinner while checking.

### Layout

- **`src/components/admin/AdminLayout.tsx`** — Sidebar + content area using Shadcn Sidebar. Dark theme, emerald accents. Sidebar items: Dashboard, Users, Tests, Questions, Analytics, Leaderboard, Notifications, Settings. Lucide icons throughout.

### Pages (all under `src/pages/admin/`)

| Page | File | Key Functionality |
|------|------|-------------------|
| Dashboard | `AdminDashboard.tsx` | Metric cards (total users, active today, total tests taken, avg score). Recharts line charts for daily active users and tests over time. Queries `profiles`, `daily_activity`, `results`. |
| Users | `AdminUsers.tsx` | Data table from `profiles`. Columns: avatar, name, district, institution, streak. Filters by district/institution. "View Performance" opens dialog querying `results` for that user. |
| Tests | `AdminTests.tsx` | Table from `tests`. Edit dialog (title, status, duration, exam_category). Delete with confirmation (cascades to questions). |
| Questions | `AdminQuestions.tsx` | Paginated table from `questions`. Filters: test_id, category, subject. Edit dialog for question_text, options, correct_answer, explanation. Delete single question. |
| Analytics | `AdminAnalytics.tsx` | Bar chart of average accuracy per subject (from `results.subject_scores`). Top 10 most-failed questions (from `mistakes` grouped by question_id, ordered by count). |
| Leaderboard | `AdminLeaderboard.tsx` | Global rankings table (reuses leaderboard logic). Filter by test_id/district. Ban/unban button per user (inserts/deletes from `leaderboard_bans`). |
| Notifications | `AdminNotifications.tsx` | Form: title + content → inserts into `announcements`. List of existing announcements with toggle active/inactive and delete. |
| Settings | `AdminSettings.tsx` | Toggle switches reading/writing `platform_settings`: maintenance mode, disable signups. |

### Routing (in `App.tsx`)

```
<Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="tests" element={<AdminTests />} />
  <Route path="questions" element={<AdminQuestions />} />
  <Route path="analytics" element={<AdminAnalytics />} />
  <Route path="leaderboard" element={<AdminLeaderboard />} />
  <Route path="notifications" element={<AdminNotifications />} />
  <Route path="settings" element={<AdminSettings />} />
</Route>
```

## Technical Details

- **Auth check**: Uses `supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })` — server-side validation, not client-side role field
- **All mutations** use sonner `toast.success()` / `toast.error()` for feedback
- **Loading states**: Skeleton/spinner for every data fetch
- **Pagination**: Questions table uses offset-based pagination (`.range()`)
- **No mock data**: Every component queries Supabase directly
- **Existing `announcements` table** is reused (already has admin RLS policies)
- **Recharts** is already a dependency (used in RadarChart)

## Estimated Scope

- 4 SQL migrations
- ~12 new files
- 1 modified file (`App.tsx` for routes)

