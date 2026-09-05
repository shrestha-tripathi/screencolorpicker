---
title: "Extracting brand colours from a logo, a screenshot, or a PDF"
description: "A practical workflow for pulling accurate brand colours out of logos, screenshots, PDFs and websites — including the antialiasing, compression and colour-profile traps that give you the wrong hex."
pubDate: 2026-09-05
tags: ["Workflow", "Branding", "Design"]
---

"Can you match our brand colours?" — followed by a logo PNG, a screenshot of the old site, or a 40-page brand guideline PDF that specifies everything except a usable hex code.

This happens constantly, and it's deceptively easy to get wrong. Sample the wrong pixel and you ship a colour that's *nearly* right, which is worse than obviously wrong — it looks subtly off next to the real brand asset and nobody can articulate why.

Here's a workflow that produces accurate values, plus the specific traps that corrupt them.

## First: check whether the real value already exists

Before sampling anything, spend two minutes looking for the authoritative value. Sampled colours are reconstructions; declared colours are ground truth.

**In a PDF brand guideline:** search the document for `#`, "HEX", "RGB", "Pantone", or "CMYK". Most guidelines list values explicitly, often in a table you can copy from directly. If the PDF has selectable text, you can copy the hex string rather than sampling it.

**On an existing website:** open DevTools, inspect the element, and read the computed `color` or `background-color`. Even better, check the CSS custom properties — many sites expose their whole token set:

```js
getComputedStyle(document.documentElement)
  .getPropertyValue("--color-brand");
```

Or dump every declared custom property at once:

```js
[...document.styleSheets].flatMap(s => {
  try { return [...s.cssRules]; } catch { return []; }
}).filter(r => r.style)
  .flatMap(r => [...r.style].filter(p => p.startsWith("--")))
  .filter((v, i, a) => a.indexOf(v) === i);
```

**In an SVG logo:** open it in a text editor. SVG is XML — the fill values are right there as literal strings. This is by far the most reliable source, because it's the actual authored value with no rendering in between.

**In a Figma or Sketch file:** the layer inspector shows the declared fill. Use it in preference to sampling the canvas, because a rendered layer may have opacity or blend modes applied.

Only when none of these are available do you sample.

## Sampling accurately

The core operation: open the asset at a comfortable size, pick a pixel with an eyedropper, done. But *which* pixel decides whether the value is right.

### Sample from the middle of a large flat area

This is the single most important rule. Every failure mode below is a variation of breaking it.

Zoom in first if the flat area is small. A 40px logo on screen has almost no truly flat region — open it at 400px and the safe zone becomes obvious.

### Never sample from text or thin strokes

Text is rendered with **subpixel antialiasing** — the renderer lights individual red, green, and blue subpixels to fake extra horizontal resolution. Sample the edge of a letterform and you get a value tinged orange or cyan that appears nowhere in the design.

Thin logo strokes have the same problem. A 1px rule in a wordmark is mostly antialiased edge.

If the brand colour only ever appears as text in your source, find a heading at the largest available size, zoom to 400%+, and sample the fattest part of the thickest stroke. Or better, find another asset.

### Watch for compression artefacts

JPEG stores colour at reduced resolution and introduces ringing near sharp edges. Screenshots saved as JPEG — which is what you get from most messaging apps — will have a halo of slightly-wrong colours around every boundary.

The tell: sample the same visual region twice, a few pixels apart. If the values differ, you're in an artefact zone. Move toward the centre until two samples agree.

PNG is lossless and doesn't have this problem. If you have any influence over how the asset reaches you, ask for PNG or SVG.

### Beware transparency and blend modes

A logo PNG with an alpha channel composites against whatever is behind it. Open it on a white background and sample a semi-transparent region, and you get the colour *blended with white* — not the colour itself.

Test: open the same image against a dark background. If the sampled value changes, that region is transparent and your sample is compositing. Find a fully opaque area.

Same issue in design tools with layer opacity or blend modes: the pixel you sample is the composited result, not the declared fill.

### Colour profiles

Your display has an ICC profile. If the source content is tagged Display P3 and your display is sRGB, the OS converts before painting, and you sample the converted result.

For web work this is usually fine — browsers assume sRGB and that's what you want. It matters when: the brand's authoritative value is in a wide-gamut space, the asset is tagged P3, or you're working toward print. In those cases get the declared value; don't sample.

A quick sanity check: sample the same asset on two different displays. Matching values mean you're in a consistent profile. Diverging values mean profile conversion is happening and you should find the authored source.

## Source-by-source notes

**PDF.** Open in your browser's built-in viewer or any desktop reader — an eyedropper doesn't care which application owns the window. Zoom to 200%+ before sampling, because PDF viewers render at screen resolution and small swatches will be antialiased. Brand guidelines usually include large colour chips specifically for this; use those, not the small examples.

**Screenshot.** Ask which format it is. PNG is fine. JPEG needs the artefact check above. A screenshot of a screenshot, re-compressed twice, is not a reliable source — go back to the original.

**Live website.** Prefer DevTools. If you must sample, do it against the rendered page rather than a screenshot, so you skip one compression round-trip. Sample large solid areas — a header background, a filled button, a hero panel — not small accents.

**Video.** Pause first. Video compression is aggressive and colour is stored at reduced resolution, so treat every value as approximate. Some DRM-protected players return pure black; if a bright frame reads `#000000`, that's what happened. Prefer a promotional still.

**Native app.** Works exactly like anything else on screen — the eyedropper reads composited desktop pixels regardless of which application drew them. Watch out for the app's own theme tinting: a colour shown inside a dark-themed app may be a variant, not the canonical brand value.

## The tooling

You need something that reads pixels from *anywhere*, not just from an image you've uploaded. That distinction matters: an upload-based picker requires the source to be an image file you can export, which rules out PDFs, native apps, and live pages.

[Screen Color Picker](/) uses the browser's native `EyeDropper` API, so it reads any pixel on your screen — a PDF in Preview, a Figma board, a paused video, a native app window — with nothing installed and nothing uploaded. The pixel is read by the browser itself and only the resulting colour reaches the page; the [permissions post](/blog/why-eyedropper-needs-no-permissions/) covers why that's safe.

It outputs HEX, RGB, HSL, and OKLCH simultaneously, which matters here: you'll want hex to send back to the client for confirmation, and OKLCH to actually build the ramp.

Requires a Chromium desktop browser — Chrome, Edge, Brave, Arc, Opera, Vivaldi. Not Firefox, not Safari, not mobile.

## Verifying before you ship

Sampled values are reconstructions. Verify before building a whole system on one.

**Sample the same colour from three different sources.** The logo, the website header, the PDF chip. If all three agree within a couple of hex digits, you have it. If they diverge significantly, ask the client which is canonical — there's a decent chance their assets are genuinely inconsistent, which is itself worth flagging.

**Compare side by side at full size.** Fill a large swatch with your sampled value and put it directly beside the original asset, both at 100% zoom, on the same display. Differences invisible at 40px are obvious at 400px.

**Round sensibly.** `#3da5ff` and `#3ea6fe` are indistinguishable to any human. If your samples cluster, pick the cleanest-looking value in the cluster rather than a noisy one from a single sample.

**Send it back for confirmation.** "I've matched your brand blue as `#3da5ff` — can you confirm?" takes one message and prevents a whole rebuild. Clients often have the real value and just didn't think to send it.

## Then build the system

Once you have a verified base colour, it's one hex code — you still need the ramp, the semantic tokens, the dark theme, and the contrast checks. That process is covered in [building an accessible colour palette](/blog/building-an-accessible-color-palette/).

The condensed version: convert to OKLCH, build 9–11 steps varying lightness linearly, curve chroma to peak at the middle, then map to semantic tokens rather than using raw scale values.

## Checklist

1. Look for the declared value first — SVG source, CSS variables, PDF text, design-tool inspector
2. Sample only when no declared value exists
3. Zoom in; sample the middle of a large flat area
4. Never sample text, thin strokes, or edges
5. Check for JPEG artefacts by sampling twice
6. Check for transparency by changing the backdrop
7. Cross-check the value across three sources
8. Compare side by side at large size
9. Confirm with the client
10. Then build the ramp

Related reading: [how to pick a colour from any app](/blog/how-to-pick-a-color-from-any-app/) · [format comparison](/blog/hex-vs-rgb-vs-hsl-vs-oklch/) · [building an accessible palette](/blog/building-an-accessible-color-palette/)
