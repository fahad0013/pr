

## Plan: Configure GitHub Pages Deployment

**GitHub**: `fahad0013/prostuti-progress-hub`

### Changes

**1. `package.json`**
- Add `"homepage": "https://fahad0013.github.io/prostuti-progress-hub"`
- Add `"gh-pages"` to `devDependencies`
- Update scripts:
  - `"build": "vite build && cp dist/index.html dist/404.html"`
  - `"predeploy": "npm run build"`
  - `"deploy": "gh-pages -d dist"`

**2. `vite.config.ts`**
- Add `base: '/prostuti-progress-hub/'` to the config object

