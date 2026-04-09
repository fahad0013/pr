

## Plan: Convert English digits to Bengali on LiveExam page

The question count (`exam.questionCount`) is rendered as a raw number, which shows English digits (80, 67, etc.). Need to convert to Bengali digits (৮০, ৬৭, etc.).

### Changes

**File: `src/pages/LiveExam.tsx`**

1. Add a helper function to convert English digits to Bengali:
   ```ts
   const toBengali = (n: number) => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
   ```

2. Update line 171: `{toBengali(exam.questionCount)} প্রশ্ন`
3. Update line 197: `{toBengali(exam.questionCount)} প্রশ্ন`
4. Update line 79 (the fallback in `formatDuration`): `${toBengali(minutes)} মিনিট` — so non-standard durations also show Bengali digits.

