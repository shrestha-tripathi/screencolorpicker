# Screen Color Picker — SPEC v0.1

**Working name:** Screen Color Picker. Final domain TBD (working candidates: `hextrail.com`,
`huetrail.com`, `huegrab.com`, `swatchpicker.com`, `huesteal.com`). Scaffold is
brand-rename-safe via env-driven `site.config.ts`.

**One-liner:** Click anywhere on your screen — get the exact color. Free,
in-browser, zero install, zero permissions.

**Ranked:** 🥉 #3 of 8 in June 2026 idea synthesis. Reasons it tops:
- Shortest build time (6h)
- Obscure API (`window.EyeDropper`) → ~12mo first-mover defensibility
- Zero permissions UX is genuinely magical → designer evangelism + HN front page candidate
- Empty intersection: free + cross-platform + screen-picker + zero-permission

---

## 1. The Hook

> Designers and devs want exact colors from anywhere on their screen — running
> apps, photos, design files, other websites. The current options all suck:
>
> - **ColorZilla** (5M Chrome installs, ad-injected, requires scary permissions)
> - **Sip / ColorSnapper** (Mac-only, $10)
> - **Adobe Color / Coolors** (palette browsers, not screen pickers)
> - **Most online color pickers** (only work on uploaded images)
>
> The `window.EyeDropper` API has been in Chrome since 95 (Oct 2021) and gives
> us native, zero-permission, system-wide pixel sampling. Almost nobody knows
> it exists. We ship a clean polished product around it in 6 hours and own
> the SEO for ~12 months before competitors catch on.

---

## 2. The Core Flow (v0.1)

```
User lands on screencolorpicker.com
  ↓
Big "🎯 Pick a color" button (centered, instant value visible)
  ↓
Click → cursor turns into eyedropper (browser-native)
  ↓
Click anywhere on screen → color captured
  ↓
Result card shows:
  - Big swatch (200×200)
  - HEX (default, prominent)
  - RGB
  - HSL
  - OKLCH (NEW! 2023+ designer hotness)
  - Each value: click to copy → toast "Copied #FF6347"
  ↓
Color appended to "Recent palette" strip (last 24)
  - Click any swatch → re-loads as active
  - Drag to reorder
  - Long-press / hover X → remove
  ↓
Below palette: "Pick another color" button (loops back)
```

**No accounts. No signup. No nothing.** localStorage for palette persistence.

---

## 3. v0.1 Scope (what ships day-one — must fit in 6h)

| Feature | Status |
|---|---|
| Big landing CTA → EyeDropper open | ✅ MUST |
| Active color result: HEX/RGB/HSL/OKLCH | ✅ MUST |
| Click-to-copy on each format | ✅ MUST |
| Recent palette strip (last 24, localStorage) | ✅ MUST |
| Click swatch → re-load as active | ✅ MUST |
| Remove swatch from history | ✅ MUST |
| Browser compatibility banner (Firefox/Safari/mobile fallback) | ✅ MUST |
| Dark + light theme + theme toggle | ✅ MUST |
| Theme matches OS, persists override | ✅ MUST |
| Mobile-friendly layout (works on phones even if no EyeDropper) | ✅ MUST |
| SEO landing copy (≥800 words, keyword-targeted) | ✅ MUST |
| FAQ section (4-5 Qs, inline + JSON-LD ready) | ✅ MUST |
| /privacy + /about (boilerplate, ~150 words each) | ✅ MUST |
| Favicon + OG image (basic for now) | ✅ MUST |
| robots.txt + sitemap.xml route | ✅ MUST |
| Footer with "100% free forever" claim + GitHub link | ✅ MUST |

---

## 4. v0.2+ Backlog (not in initial commit; spec-then-build later)

- **Pantone / Tailwind / Material match** ("nearest swatch from system X")
- **Drag to reorder** palette history (mobile-friendly)
- **Export palette** as JSON / CSS vars / Tailwind tokens / SVG strip / PNG / `.ase`
- **Save named palettes** (multi-palette IndexedDB)
- **Color contrast checker** (WCAG AA/AAA against another color)
- **Color blindness simulator** (deuteranopia, protanopia, tritanopia views)
- **PWA install prompt** + offline cache
- **Image upload mode** (canvas-based picker for Firefox/Safari/mobile users)
- **Browser extension** (companion piece — instant pick from active tab)
- **API endpoint** (`?img=` URL → palette JSON, for designers who script)
- **Share palette** (URL fragment → renders a public swatch page)

---

## 5. Browser Compatibility Reality

| Browser | EyeDropper API | Fallback in v0.1 |
|---|---|---|
| Chrome 95+ | ✅ Full native | — |
| Edge 95+ | ✅ Full native | — |
| Opera 81+ | ✅ Full native | — |
| Brave | ✅ Full native | — |
| Firefox (any) | ❌ Won't ship per Mozilla position | Banner: "Use Chrome/Edge — or upload image mode (coming soon)" |
| Safari (any) | ❌ No WebKit support | Banner: same as Firefox |
| Mobile Chrome Android | ⚠️ Limited (no system-wide; in-tab only) | Banner: "Desktop browser required" |
| Mobile Safari iOS | ❌ Same as desktop Safari | Banner: same |

**Wedge survival:** ~70% of designer/dev visits are desktop Chrome/Edge/Brave.
For the other 30%, v0.1 ships a clear "use a supported browser" banner +
a roadmap item for image-upload fallback in v0.2. Not blocking launch.

---

## 6. Stack (Astro 6 + Tailwind v4)

Same stack as p2pdatesharing for muscle memory:
- **Astro 6** MPA, static, no React needed (single-page interactive island via `<script>`)
- **Tailwind CSS v4** via `@tailwindcss/vite`, no config file, `@theme` directive
- **TypeScript strict**, Node 22+
- **No backend.** All client-side. localStorage only.
- **Cloudflare Pages** auto-deploy on push to `main` (deferred — user sets up after first push)

---

## 7. Project Structure (Day 1)

```
~/projects/screencolorpicker/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── DESIGN.md
├── AGENTS.md
├── SPEC.md                           # this file
├── README.md
├── public/
│   ├── robots.txt
│   └── favicon.svg                    # simple — proper icon pack in v0.2
├── src/
│   ├── site.config.ts                # env-driven brand strings + .pages.dev guard
│   ├── styles/global.css             # @import "tailwindcss" + @theme tokens
│   ├── layouts/Layout.astro          # <title>, OG meta, canonical, theme bootstrap
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── ColorPicker.astro         # The MAIN feature
│   │   ├── ColorPicker.script.ts     # All the logic
│   │   ├── PaletteHistory.astro
│   │   ├── ThemeToggle.astro
│   │   └── CompatBanner.astro
│   ├── lib/
│   │   ├── colorFormats.ts           # HEX/RGB/HSL/OKLCH conversions
│   │   ├── paletteStore.ts           # localStorage palette persistence
│   │   └── browserSupport.ts         # EyeDropper detection
│   └── pages/
│       ├── index.astro               # landing + pickr
│       ├── about.astro
│       ├── privacy.astro
│       ├── 404.astro
│       └── sitemap.xml.ts
```

---

## 8. SEO Strategy (v0.1)

**Primary target keywords:**
- "color picker from screen"        (71 autocomplete depth — confirmed in June 7 session)
- "eyedropper tool web"
- "color picker chrome free"
- "screen color picker no install"
- "html color picker from screen"

**Landing page structure** (≥800 words):
1. Hero (≤60 chars title, value prop subhead, big CTA)
2. Live demo (the picker itself, above the fold)
3. "How it works" (3 steps with screenshots/icons)
4. "Why we built this" (the privacy/zero-perms moat, vs ColorZilla scare)
5. Comparison table (vs ColorZilla, Sip, Adobe Color, online image pickers)
6. FAQ (5 Qs — what is EyeDropper, why no Firefox, how is it free, can you see my colors, etc.)
7. Footer CTA + "100% free forever" + GitHub link

**JSON-LD:** WebApplication + FAQPage (inlined in v0.1)

**Sitemap.xml:** all 4 pages, daily changefreq on /, weekly on others

---

## 9. Differentiator strategy (Moat from day one)

Three structural moats baked in v0.1 — designed to outlast cloners after
HEICPix taught us cloners are aggressive:

1. **OKLCH support** — 2023+ designer hotness, almost no online picker
   exposes it. Anyone copying the spec without doing the conversion math
   will skip it. ColorZilla doesn't have it. Sip doesn't.

2. **Zero permissions + zero install messaging front-and-center** — this is
   the actual differentiator vs ColorZilla. Lead with it, don't bury it.

3. **"100% free forever, no upsells"** — same playbook as HEICPix's
   `/free-forever`. Future-proofs against any pivot suspicion.

Defenses NOT in v0.1 but speccable for v0.2 if cloners arrive:
- **Pantone matcher** (hardcoded Pantone color database = legal sketchy but
  big SEO moat — competitors won't bother)
- **WCAG contrast checker** (every designer needs it; bundle = stickier visit)
- **Custom palette exports to .ase / Figma plugin** (workflow integration =
  even higher switching cost)

---

## 10. Success metrics (week 1 / month 1)

| Metric | Week 1 target | Month 1 target |
|---|---|---|
| Unique visitors | 200 | 5,000 |
| Color picks per visitor | ≥3 | ≥3 |
| HN submission | Submit once | If Week 1 dies, retry with v0.2 features |
| Product Hunt | TBD if domain ready | Launch in PH "WIP" community first |
| Twitter/X share | 1 designer-loved post | Compound from PH/HN |

---

## 11. Risks + mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Cloner ships in 1 weekend | 🟡 Medium | OKLCH + privacy moat + ship-fast on v0.2 features |
| Mobile users bounce | 🟢 Low | Clear desktop-required banner + v0.2 image-upload fallback |
| Firefox users bounce | 🟢 Low | Same banner; Firefox users are <10% of designers |
| Google ranks ColorZilla pages over us | 🟡 Medium | OKLCH keyword + "free no install" SEO angle |
| EyeDropper API removed | 🔴 Low (W3C draft, Chrome stable) | If removed, pivot to canvas-based image picker |

---

## 12. Out of scope (explicitly)

- Color blindness simulation (v0.2)
- Brand palette extraction from image (different product — ColorPaletteAI idea)
- Pantone matching (v0.2 moat)
- Browser extension (v0.3 — companion piece, separate ship)
- API endpoint (v0.3)
- Login / accounts of any kind (NEVER — undermines privacy story)
- Analytics beyond GA4 (NEVER — privacy story)
- Any backend at all (v0.1 is pure static)

---

## 13. Cloudflare Pages deployment (deferred to user)

User will set up Cloudflare Pages connection after first GitHub push.
Settings to use:
- **Framework preset:** Astro
- **Build command:** `npm run build`
- **Build output:** `dist`
- **Node version:** 22
- **Environment vars to set (initial):**
  - `PUBLIC_BASE_PATH=/`
  - `PUBLIC_SITE_URL=https://screencolorpicker.pages.dev` (until domain bought)
  - `PUBLIC_SITE_DOMAIN=screencolorpicker.pages.dev`
  - Note: `site.config.ts` has `.pages.dev` rejection guard — these stale vars
    won't poison output once a real domain is set (lesson from p2pds pitfall #40).

---

**End of SPEC v0.1.** Build begins immediately. One feature = one commit
discipline. Will push to GitHub when minimal v0.1 is green.


---

## 14. Content expansion for AdSense (Sept 2026)

**Trigger:** Google AdSense rejected the site with *"Low value content — your site
does not yet meet the criteria of use in the Google publisher network."*

**Diagnosis (audit run 2026-09-05).** The rejection was about *volume*, not quality
or compliance. Evidence:

| Signal | State at rejection | Verdict |
|---|---|---|
| Trust pages (About/Contact/Privacy/Terms) | all present, footer-linked | ✅ |
| AdSense + DART + GDPR + CCPA + aboutads disclosure | present in `/privacy-policy` | ✅ |
| `ads.txt` (pub-4489093375929447) | live at root | ✅ |
| AdSense snippet | firing sitewide | ✅ |
| robots / sitemap / 404 / canonical | clean, no Googlebot block | ✅ |
| Pages under 600 words | **zero** (thinnest was the 404 at 642w) | ✅ |
| **Total pages** | **16** | ❌ bar is 25–30+ |
| **Blog posts** | **3** | ❌ no ongoing publishing signal |
| **Domain age** | 3 months (registered 2026-06-08) | ❌ India/APAC informally wants ~6mo |

**Response shipped 2026-09-05** — two commits, two branches:

- `feat/blog-batch-adsense` — 7 long-form posts (1985–2374 words each):
  `how-to-pick-a-color-from-any-app`, `hex-vs-rgb-vs-hsl-vs-oklch`,
  `wcag-contrast-explained`, `building-an-accessible-color-palette`,
  `why-eyedropper-needs-no-permissions`, `extracting-brand-colors-from-a-logo`,
  `best-color-picker-for-developers`. Blog 3 → 10 posts.
- `feat/pseo-landing-pages` — 7 keyword landing pages (2100–2500 words each):
  `/hex-color-picker`, `/rgb-color-picker`, `/hsl-color-picker`,
  `/color-picker-from-image`, `/color-picker-without-extension`,
  `/figma-color-picker-alternative`, `/eyedropper-for-windows`,
  `/eyedropper-for-mac`.

**Result:** 16 → 31 pages, 30 sitemap URLs, still zero pages under 600 words.

### 14.1 `src/components/KeywordPage.astro` (new)

The `/oklch-color-picker` layout was extracted into a reusable shell so landing
pages are content-only. Props: `title`, `description`, `path`, `badge`,
`h1Before/h1Highlight/h1After`, `lede`, `appName`, `alternateNames`, `features`,
`sections[]`, `faqs[]`, `faqHeading`, `related[]`. It renders hero → live
`<ColorPicker />` → prose bands (alternating `elevated`) → FAQ accordion →
cross-link CTA, and emits `WebApplication` + `FAQPage` JSON-LD automatically.

**Rules when adding a new landing page:**
1. Create `src/pages/<slug>.astro` that imports `KeywordPage` and passes props only.
2. Brand strings stay in `site.config.ts` — the shell imports `site` / `b`; never
   inline the brand name in a page file (AGENTS.md rule 1). Blog *prose* may
   mention the brand; `.astro` page files may not.
3. Add the route to `STATIC_PAGES` in `src/pages/sitemap.xml.ts`.
4. Add a footer link in `src/components/Footer.astro`.
5. `section.body[]` entries are rendered with `set:html` — inline markup allowed,
   but keep it to `<strong>`, `<em>`, `<code>`, `<br>`, `<span>`.
6. Target **2000+ words** rendered. Verify:
   `sed 's/<[^>]*>/ /g' dist/<slug>/index.html | tr -s ' ' | wc -w`

### 14.2 Privacy copy constraint

`why-eyedropper-needs-no-permissions.md` discusses privacy at length. Per
AGENTS.md rule 5 it explicitly states that GA4 + AdSense are used and disclosed,
and scopes the moat to *product data* (picked colours and palette stay on-device).
**Never re-add "no tracking / no analytics / cookieless" claims** to any page.

### 14.3 Reapply plan

Do **not** click "Request review" until the domain is ~6 months old. A second
rejection on unchanged content costs a longer cooldown and a negative signal.

- Target date: **2026-12-08** (domain hits 6 months). A cron job is scheduled to
  re-run the `adsense-readiness-checklist` §8 evidence pass and give a GO/NO-GO.
- Before reapplying, confirm pages show as **Indexed** in Search Console — not
  just "Discovered". Resubmit the sitemap after this deploy.
- Console path: AdSense → Sites → "We found some policy violations" card →
  tick "I confirm I have fixed the issues" → Request review.
