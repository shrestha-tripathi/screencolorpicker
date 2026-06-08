# ColorTrail — Design System

**Working brand:** ColorTrail. All brand strings live in `src/site.config.ts`
(env-driven via `PUBLIC_SITE_*`). Never hardcode the brand name anywhere
in `src/`.

## Visual identity

**Vibe:** Clean, fast, designer-friendly. Indigo accent on neutral grayscale.
Generous whitespace. Big touch targets. The picker button is the unmistakable
hero — everything else recedes.

## Color tokens (CSS variables, in `src/styles/global.css`)

| Token | Dark | Light | Use |
|---|---|---|---|
| `--color-bg` | `#0a0a0b` | `#ffffff` | Page background |
| `--color-bg-elevated` | `#131316` | `#fafafa` | Section backgrounds, cards |
| `--color-surface` | `#1a1a1f` | `#f4f4f5` | Buttons, input wells, hover |
| `--color-border` | `#2a2a32` | `#e4e4e7` | Hairlines, dividers, table |
| `--color-fg` | `#f5f5f7` | `#0a0a0b` | Body text |
| `--color-muted` | `#a1a1aa` | `#52525b` | Secondary text |
| `--color-fg-subtle` | `#71717a` | `#71717a` | Captions, footnotes |
| `--color-accent` | `#6366f1` | `#4f46e5` | Primary CTA, links (in prose) |
| `--color-accent-hover` | `#818cf8` | `#4338ca` | Hover state for accent |
| `--color-accent-fg` | `#ffffff` | `#ffffff` | Text on accent fills |
| `--color-success` | `#22c55e` | `#22c55e` | Confirmations, green-light |
| `--color-warning` | `#f59e0b` | `#f59e0b` | Banners, caution |
| `--color-error` | `#ef4444` | `#ef4444` | Errors, destructive actions |

**HARD RULE: Never stack opacity (`/80`) on muted color tokens.** Light theme
fails WCAG AA contrast even at 80% opacity on the `muted` token. Tokens are
already perceptually tuned — use them directly.

## Typography

- **Family:** Inter (sans), system UI mono fallback.
- **Hero:** `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight`
- **H2:** `text-3xl sm:text-4xl font-bold`
- **H3:** `text-lg font-semibold`
- **Body:** `text-base` (default) or `text-lg` (lede paragraphs)
- **Body muted:** `text-sm text-[var(--color-muted)]` — NEVER `text-xs` for body-flow muted text (fails WCAG)
- **Numeric / code:** `font-mono` — uppercase HEX always (`#A1B2C3`, not `#a1b2c3`)

## Spacing

- Page padding: `px-4 sm:px-6`
- Section vertical: `py-12` to `py-20`
- Card padding: `p-5 sm:p-6`
- Grid gap: `gap-6` for cards, `gap-2` for swatches

## Layout containers

- Hero / FAQ: `max-w-3xl mx-auto`
- Comparison / picker area: `max-w-5xl mx-auto`
- Footer: `max-w-6xl mx-auto`

## Components in use

- `<Layout>` — page chrome, OG meta, theme bootstrap
- `<Nav>` — sticky header, links + theme toggle
- `<Footer>` — 2-row, "100% free forever" claim, GitHub link
- `<ColorPicker>` — the main interactive feature
- `<ThemeToggle>` — sun/moon button, instant flip

## Anti-patterns

- ❌ Hardcoding the brand name "ColorTrail" anywhere outside `site.config.ts`
- ❌ Creating `tailwind.config.js` (v4 ignores it; use `@theme` directive)
- ❌ Using `@tailwind base;` syntax (v3 only; use `@import "tailwindcss"`)
- ❌ Adding opacity modifiers (`/40`, `/80`) to `--color-muted` or `--color-fg-subtle` tokens
- ❌ Using `text-xs` for body-flowing muted text — fails WCAG
- ❌ External color libraries (chroma.js, color.js, etc.) — we do the math
- ❌ Adding accounts, login, server-side anything — the moat is "fully local"
- ❌ Bundling fonts via CDN — system font stack only (zero blocking requests)
- ❌ Tracking pixels — privacy is part of the product

## Theme bootstrap (FOUC-free)

The inline `<script is:inline>` in `Layout.astro` runs BEFORE any stylesheet
loads. It reads `localStorage["colortrail:theme"]`, defaults to dark, and
sets `data-theme` synchronously on `<html>`. Without this, light-mode users
get a black-flash on every navigation.

If you ever add a new theme-dependent meta tag (like `theme-color` for the
mobile browser chrome), patch it from `window.__setTheme` AND the inline
bootstrap. Both. Two write paths must stay in sync.

## Light-theme verification

After ANY style change, verify in BOTH dark and light:
1. `npm run dev`
2. Open in browser
3. Toggle theme via the sun/moon button
4. Scan each page for: text legibility, button contrast, border visibility
5. Test on at least one mobile viewport (≤640px)

Failing to verify light theme = shipping a half-broken product to ~50% of
users (system theme detection makes light-default common).
