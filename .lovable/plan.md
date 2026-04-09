

## Plan: Remove Email OTP from AuthModal

Remove the email/OTP login method, keeping only Google OAuth sign-in.

### Changes to `src/components/AuthModal.tsx`

1. **Remove state variables**: `email`, `otp`, `step` (simplify to just loading/error/success), remove `Step` type
2. **Remove functions**: `handleSendOtp`, `handleVerifyOtp`
3. **Remove UI elements**: The "অথবা" divider, email input field, OTP button, OTP verification screen, and "অন্য ইমেইল ব্যবহার করুন" link
4. **Remove unused imports**: `Input`, `Label`, `Mail` — keep `Loader2`, `CheckCircle`, `AlertCircle`
5. **Keep**: Google login button, success state, error banner, modal structure

Result: The auth modal will show only the Google login button with the existing header and styling.

