

## Plan: Add Custom Title & Description to Seed Page

### Problem
The seeder auto-generates generic titles like "Primary Mock Test". User wants to manually enter a custom Bengali title (e.g., "প্রাথমিক শিক্ষক মক টেস্ট — ০১") and description (e.g., "প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার প্রশ্ন সমাধান - ০৩-০৬-২০২২") for each upload.

### Changes

**File: `src/pages/Seed.tsx`**

1. Add two text input fields above the file upload:
   - **টাইটেল (Title)** — text input, required. Placeholder: "যেমন: প্রাথমিক শিক্ষক মক টেস্ট — ০১"
   - **বিবরণ (Description)** — text input, optional. Placeholder: "যেমন: প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার প্রশ্ন সমাধান - ২০২২"

2. Update the seed logic:
   - Use the user-provided `title` instead of auto-generating it
   - Pass the `description` field to the `tests` table insert

3. Add validation: require title before allowing seed

4. Reset title/description fields after successful seed

**Database: `tests` table**
- The `description` column already exists (nullable text) — no migration needed.

### No other files changed.

