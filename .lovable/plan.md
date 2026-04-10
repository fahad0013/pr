

## Plan: Fix blank page caused by base path

The `base: '/prostuti-progress-hub/'` was added for GitHub Pages deployment, but it breaks the Lovable dev preview because assets get loaded from the wrong path.

### Fix

**File: `vite.config.ts`**

Make `base` conditional — only apply the subpath in production builds:

```ts
base: mode === 'production' ? '/prostuti-progress-hub/' : '/',
```

This way:
- **Development (Lovable preview)**: base is `/` — works correctly
- **Production build (`npm run build`)**: base is `/prostuti-progress-hub/` — works on GitHub Pages

One line change, one file.

