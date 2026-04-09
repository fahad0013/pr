

## Plan: Add Google Analytics to the website

Add the Google Analytics gtag.js snippet to `index.html`.

### Changes

**File: `index.html`**

Insert the GA script tags at the end of the `<head>` section, just before `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MJQ71SDNW3"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-MJQ71SDNW3');
</script>
```

One file, no other changes needed.

