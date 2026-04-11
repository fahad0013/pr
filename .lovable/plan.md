

# Show Only Live Active Exam-Taking Users

## What Changes

Replace the current "active today" section with a filtered view showing only users who are **currently taking or just completed an exam** (results created within the last 30 minutes). Add a green pulse indicator and auto-refresh every 30 seconds.

## Technical Approach

**File:** `src/pages/admin/AdminDashboard.tsx`

1. **Change query logic** — Instead of fetching from `daily_activity` for today, query `results` where `created_at` is within the last 30 minutes. Join with `profiles` for names/avatars and `tests` for exam titles.

2. **Add auto-refresh** — Set up a `setInterval` (30s) to re-fetch the active exam takers, so the list updates in near real-time.

3. **Add live indicator** — Green pulsing dot next to each user and a "Live" badge on the card header.

4. **Update UI labels** — Change heading to "লাইভ পরীক্ষার্থী" (Live Examinees), update empty state to "এখন কেউ পরীক্ষা দিচ্ছে না" (No one is taking an exam right now).

5. **Show time as relative** — e.g., "৫ মিনিট আগে" instead of absolute time.

