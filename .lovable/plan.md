

## Prostuti (প্রস্তুতি) — EdTech App UI

### Design System Setup
- **Colors**: Emerald green primary (`#10B981`), Navy blue secondary (`#1E3A5F`), Soft yellow accent (`#FBBF24`), success/error tokens — all as HSL CSS variables with dark mode variants
- **Typography**: Import Hind Siliguri (Bengali) + Inter (English) from Google Fonts. Define a type scale optimized for readability (base 16px, comfortable line height)
- **Component tokens**: Radius, shadows, spacing scale in Tailwind config
- **Dark mode**: Toggle via class-based dark mode with localStorage persistence

### Bottom Navigation (Mobile)
- Sticky bottom bar with 5 tabs: **হোম (Home)**, **বিষয় (Subjects)**, **লাইভ পরীক্ষা (Live Exam)**, **লিডারবোর্ড**, **প্রোফাইল**
- Icons + Bengali labels, active state with emerald highlight
- Hidden on desktop, replaced by sidebar/top nav

### Pages

**1. Landing/Home Page**
- Hero section with motivational Bengali tagline + CTA button (yellow accent)
- Daily streak indicator + progress ring
- Quick stats cards (exams taken, score avg, rank)
- "Continue studying" section with subject cards
- Upcoming live exam banner

**2. Subjects Page**
- Grid of subject cards (BCS categories: বাংলা, English, Math, GK, etc.)
- Each card shows progress bar, topic count, completion %
- Soft shadows, rounded corners, tap-friendly sizing

**3. Live Exam Page**
- List of upcoming/ongoing mock exams
- Countdown timers, participant count
- Join exam CTA buttons

**4. Leaderboard Page**
- Top 3 highlighted with badges (gold/silver/bronze)
- Scrollable rank list with avatar, name, score
- Weekly/monthly/all-time tabs

**5. Profile Page**
- User avatar, name, streak count
- Stats summary (badges earned, exams completed)
- Achievement badges grid
- Dark mode toggle
- Settings links

### Shared Components
- **Cards**: Soft shadow, rounded-xl, hover scale effect
- **Progress bars**: Animated, emerald-filled
- **Badges**: Streak fire 🔥, rank badges, achievement icons
- **Buttons**: Large touch targets (min 48px), yellow CTA, outlined secondary
- **Modal**: Clean login/onboarding dialog with form fields

### Animations
- Page transitions with fade-in
- Progress bar fill animations
- Subtle hover scale on cards
- Tap feedback on buttons
- Streak counter pulse animation

### Responsive
- Mobile-first (375px base), scales up to tablet/desktop
- Bottom nav on mobile → top nav on desktop
- Card grid: 1 col mobile → 2-3 cols desktop

