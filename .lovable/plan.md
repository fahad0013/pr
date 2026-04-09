

# Plan: Improve 4 Key Features for Prostuti

## Summary
Enhance the existing Smart Mistake Tracker, Subject Analytics, Leaderboard, and Daily Streak features — plus add PDF result download and revision exam functionality.

---

## What Already Exists

| Feature | Status | What's Missing |
|---------|--------|----------------|
| Mistake Tracker (ErrorBank) | Basic list + delete | Revision exam from mistakes doesn't work (navigates to `/exam/revision` which doesn't exist) |
| Subject Analytics (RadarChart) | On Dashboard + ExamResult | No dedicated analytics page; ExamResult has hardcoded mock fallback data |
| Leaderboard | Works with real data | District/Institution filters don't actually filter; no per-test leaderboard |
| Daily Goal & Streak | Shows on Dashboard | Streak never updates automatically; daily progress is estimated, not tracked |

---

## Plan

### 1. Smart Mistake Tracker — Revision Exam Mode

**Problem**: The "রিভিশন পরীক্ষা দিন" button navigates to `/exam/revision?mode=revision` but that route doesn't load mistake-based questions.

**Changes**:
- **ExamRoom.tsx**: Detect `mode=revision` query param. When present, fetch questions from the user's `mistakes` table instead of `questions` table. Optionally filter by `subject` param.
- **ExamRoom.tsx**: After completing a revision exam, delete correctly-answered mistakes from the `mistakes` table (so they're "cleared").
- **ErrorBank.tsx**: Add a confirmation count showing how many questions will be in the revision test.

### 2. Subject-wise Analytics — Improved Visualization

**Problem**: Analytics exist but are scattered. ExamResult page falls back to hardcoded mock data.

**Changes**:
- **ExamResult.tsx**: Remove the entire mock fallback data block (lines 86-102). If no state is passed, redirect to `/dashboard` instead of showing fake results.
- **Dashboard.tsx**: Add a bar chart alongside the radar chart showing per-subject accuracy with color-coded performance levels (red < 40%, yellow 40-70%, green > 70%).
- **Dashboard.tsx**: Add subject-wise trend — show if accuracy is improving or declining compared to last 5 tests vs previous 5.

### 3. Real-time Leaderboard with Filters + Per-Test Ranking

**Changes**:
- **Leaderboard.tsx**: Make district/institution filter tabs functional — fetch user's own district/institution from their profile, then filter the aggregated scores to show only matching users.
- **Leaderboard.tsx**: Add a test-specific filter dropdown (select a test from `tests` table) to see rankings for individual tests.
- **Leaderboard.tsx**: Show the user's own position highlighted even if they're not in top 20 (currently only shows if in the sorted list).
- **ExamResult.tsx**: Replace the mock rank (`mockRank`) with actual rank calculated from `results` table for that specific test.

### 4. Daily Goal & Streak — Real Tracking

**Problem**: Streak is stored but never updated. Daily progress is estimated as `totalTests * 15`.

**Changes**:
- **Database migration**: Add a `daily_activity` table to track actual daily study time:
  ```sql
  CREATE TABLE public.daily_activity (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_date date NOT NULL DEFAULT CURRENT_DATE,
    minutes_spent integer DEFAULT 0,
    tests_completed integer DEFAULT 0,
    UNIQUE(user_id, activity_date)
  );
  ```
  With RLS policies for users to read/insert/update their own rows.

- **ExamRoom.tsx**: After submitting an exam, upsert into `daily_activity` — increment `tests_completed` and add `time_taken` minutes.
- **Dashboard.tsx**: Fetch today's `daily_activity` for real progress instead of estimation.
- **ExamRoom.tsx / ExamResult.tsx**: After exam submission, update `profiles.current_streak` and `profiles.last_activity_date` — increment streak if last activity was yesterday, reset to 1 if gap > 1 day.
- **StreakBadge.tsx**: Add milestone celebrations at 7, 14, 30 day streaks with a brief animation.

### 5. PDF Result Download (New Feature)

**Changes**:
- **ExamResult.tsx**: Add a "📥 রেজাল্ট ডাউনলোড (PDF)" button.
- Create a utility function `generateResultPDF()` using the browser's `window.print()` or a lightweight library (`jspdf` + `html2canvas`) to capture:
  - Test name, date, score
  - Subject-wise breakdown
  - Full question review with correct/wrong markers
- The PDF will be generated client-side — no backend needed.

---

## Technical Details

### Files to Create
- `src/utils/generateResultPDF.ts` — PDF generation utility

### Files to Modify
- `src/pages/ExamRoom.tsx` — revision mode, daily activity tracking, streak update
- `src/pages/ExamResult.tsx` — remove mock data, add PDF download, real rank
- `src/pages/ErrorBank.tsx` — minor UX improvements
- `src/pages/Dashboard.tsx` — real daily progress, bar chart, trend indicators
- `src/pages/Leaderboard.tsx` — functional filters, per-test filtering
- `src/components/StreakBadge.tsx` — milestone animations

### Database Migration
- New `daily_activity` table with RLS
- No changes to existing tables

### Dependencies
- `jspdf` + `html2canvas` for PDF generation (npm install)

