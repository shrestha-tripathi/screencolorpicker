# ColorTrail

> Pick any color from your screen. Free, in-browser, zero install, zero permissions.

A clean polished UI on top of the browser-native [`EyeDropper API`](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper).
Outputs HEX / RGB / HSL / OKLCH with click-to-copy and a local palette history.

**Live:** TBD (Cloudflare Pages — coming soon)
**Working brand:** ColorTrail (rename-safe via env-driven config)

## Quick start

```bash
git clone https://github.com/shrestha-tripathi/colortrail.git
cd colortrail
npm install
cp .env.example .env       # optional — override brand strings locally
npm run dev                # http://localhost:4321
```

## Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production static build → `./dist/` |
| `npm run preview` | Preview production build locally |
| `npx astro check` | Type + diagnostics check |

## Browser support

The EyeDropper API is shipped only by Chromium-based browsers as of mid-2026:

| Browser | Support |
|---|---|
| Chrome 95+, Edge 95+, Brave, Opera 81+ | ✅ |
| Firefox | ❌ ([Mozilla position: no](https://mozilla.github.io/standards-positions/)) |
| Safari | ❌ (no WebKit signal) |
| Mobile Chromium | ⚠️ Tab-only sampling, not system-wide |

For unsupported browsers, ColorTrail shows a friendly banner suggesting Chrome/Edge.

## Architecture

- **Astro 6** static MPA (no React, no SSR)
- **Tailwind CSS v4** via `@tailwindcss/vite` (no config file, `@theme` directive)
- **TypeScript strict**
- **Zero backend** — localStorage for palette persistence
- **Cloudflare Pages** for hosting (auto-deploys on push to `main`)

```
src/
├── site.config.ts           # env-driven brand strings (single source of truth)
├── lib/
│   ├── colorFormats.ts      # HEX/RGB/HSL/OKLCH conversion math
│   ├── paletteStore.ts      # localStorage palette persistence
│   └── browserSupport.ts    # EyeDropper API feature detection
├── components/
│   ├── Nav.astro
│   ├── Footer.astro
│   ├── ThemeToggle.astro
│   └── ColorPicker.astro + ColorPicker.script.ts   # the main feature
├── layouts/Layout.astro     # OG meta, canonical, theme bootstrap
└── pages/                   # index, about, privacy, 404, sitemap.xml
```

## Roadmap

See [`SPEC.md`](./SPEC.md) for the locked v0.1 scope and the v0.2+ backlog
(Pantone matcher, WCAG contrast checker, palette export, etc.).

## License

MIT. See [`LICENSE`](./LICENSE).
