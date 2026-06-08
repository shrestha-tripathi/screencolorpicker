# AGENTS.md — Project rules for AI coding agents

Read this BEFORE making any change to this repo.

## Project mission

Screen Color Picker is a one-tap screen color picker that runs entirely in the
browser, via the `window.EyeDropper` API. Zero install, zero permissions,
zero tracking. The product IS the moat — the moment we add a server, a
login, a tracking pixel, or a "Pro tier" we've lost the differentiator.

## Mandatory reading before edits

1. **`SPEC.md`** — locked v0.1 scope. Don't expand without explicit user signoff.
2. **`DESIGN.md`** — color tokens, type scale, anti-patterns.
3. This file.

## Hard rules

1. **Brand strings:** ONLY in `src/site.config.ts`. Search before adding new copy:
   ```bash
   grep -rn "Screen Color Picker" src/ | grep -v site.config.ts
   ```
   Empty = clean. Any hit = inline brand string that won't survive a rename.

2. **Tailwind v4 only.** No `tailwind.config.js`. No `@tailwind base;`.
   Use `@theme` directive and `@import "tailwindcss"`. v3 patterns silently no-op.

3. **Never stack opacity on muted color tokens** (`--color-muted`, `--color-fg-subtle`).
   Fails WCAG on light theme. Tokens are already tuned.

4. **Light + dark must both pass.** After any visual change, manually verify
   both themes via the toggle. ~50% of visitors get light by default via OS.

5. **No accounts, no server, no tracking.** Anything that adds these breaks the
   privacy/moat promise. Bring it to the user before opening a PR.

6. **One feature = one commit.** Rollback-safe. No combined feat+refactor commits.

7. **`grep` test before claiming a rebrand is done:**
   ```bash
   grep -rln "Screen Color Picker" src/ public/ astro.config.* package.json 2>/dev/null \
     | grep -v site.config.ts
   ```

## Stack invariants

- Astro 6 MPA, static output, no SSR
- Tailwind v4 via `@tailwindcss/vite`
- TypeScript strict, Node 22+
- No backend. All client-side. localStorage only.
- Cloudflare Pages auto-deploys on push to `main` (when set up)

## SEO non-negotiables

- Every page has `<title>` + `<meta name="description">` via `Layout` props
- Index page has WebApplication + FAQPage JSON-LD inlined
- `/sitemap.xml` route enumerates all public pages
- `public/robots.txt` allows all + points at sitemap
- Canonical URL on every page via `Layout` (auto from `Astro.url.pathname`)
- OG image present (regenerate when brand changes)
- `noindex` on 404 and any private/app routes

## Pitfalls already known (don't re-trip)

- **Cloudflare Pages dashboard env vars are sticky.** If `PUBLIC_SITE_URL` was
  ever set to a `*.pages.dev` value, that stale value survives every deploy
  and silently poisons OG/canonical/sitemap. `src/site.config.ts` has a
  regex guard that rejects `.pages.dev` in those env vars — keep it.
- **`grep` will find brand mentions inside `node_modules/`.** Always restrict
  searches to `src/ public/ astro.config.*` etc.
- **`browser_vision` lies about SVG/canvas contents.** For pixel-precision
  checks, always cross-verify with `browser_console` and `getBoundingClientRect`.

## Verify command (run before every commit)

```bash
npm run build && npx astro check
```

Both must exit 0. No warnings about TS strict mode. No `astro check` errors.

## Commit message format

```
<type>(<scope>): <subject>

<optional body explaining "why">
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`.

Scopes used in this repo: `picker`, `palette`, `nav`, `seo`, `theme`,
`design`, `build`, `deps`, `meta`.

Examples:
- `feat(picker): add OKLCH format with click-to-copy`
- `fix(theme): re-read localStorage on visibility change`
- `chore(deps): bump astro 6.0.2 → 6.0.3`

## When in doubt

Ask the user before:
- Adding a third-party library (zero-deps preferred)
- Adding any kind of analytics
- Changing brand identity (color palette, logo, font)
- Adding new pages to the site (impacts SEO sitemap)
- Touching the `EyeDropper` permissions/security model
