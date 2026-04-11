# Add Active Users & Current Exams Section to Admin Dashboard

## What We're Building

A new card below the activity chart showing users who are active today, along with the most recent exam they took. This will query `daily_activity` for today's active users, join with `profiles` for display names, and join with `results` + `tests` to show their latest exam.

## Technical Approach

**File modified:** `src/pages/admin/AdminDashboard.tsx`

1. **New data fetch** — In the existing `useEffect`, add a query that:
  Only show active users 
  - Gets today's `daily_activity` rows to find active user IDs
  - Fetches their `profiles` (display_name, avatar_url)
  - Fetches their most recent `results` entry joined with `tests` (title) to show what exam they last took
2. **New state** — `activeUsersList` array with shape: `{ userId, displayName, avatarUrl, lastTestTitle, lastTestTime }`
3. **New UI section** — A `Card` with a table/list below the chart:
  - Columns: Avatar + Name, Last Exam Title, Time
  - Bengali heading: "সক্রিয় ব্যবহারকারী ও পরীক্ষা"
  - Skeleton loading state
  - Empty state message if no one is active today
  - Uses existing Avatar and Table components