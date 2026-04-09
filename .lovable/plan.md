

## Plan: Add Password Gate to Seed Page

### Change: `src/pages/Seed.tsx`

Add two states: `isUnlocked` (false) and `password` ('').

When `isUnlocked` is false, render a centered card with:
- `Lock` icon from lucide-react
- "Admin Access Only" title
- Password input (`type="password"`)
- "Unlock" button

On click: check against hardcoded `"$~F4h4d~Pr0$tut1$"`. Match → `setIsUnlocked(true)` + success toast. Fail → error toast + clear input.

When unlocked, render existing seeder UI unchanged.

Single file change, no other modifications needed.

