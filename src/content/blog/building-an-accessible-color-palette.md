---
title: "Building an accessible colour palette from a single brand colour"
description: "How to turn one hex code into a full, accessible design-system palette — lightness ramps in OKLCH, chroma curves, semantic tokens, dark mode, and the contrast checks that keep it honest."
pubDate: 2026-09-05
tags: ["Design Systems", "Accessibility", "OKLCH"]
---

A client sends you one hex code. That's the brand. Now build an entire interface from it — primary buttons, hover states, disabled states, borders, backgrounds, focus rings, a dark theme, error and success colours that don't clash, and every one of them has to pass contrast checks.

This is the most common colour task in product work and the one most often done badly. Here's a systematic approach that produces a palette you can defend.

## Step 1: Get the base colour accurately

Before anything else, make sure the colour you're building on is the real one.

If it came from a PDF brand guideline, a screenshot, or an existing site, sample the actual rendered pixel rather than trusting a value someone typed. Sample from the **middle of a large flat area** — never from text, where subpixel antialiasing tints the value, and never near an edge, where JPEG compression introduces noise.

Then convert to OKLCH. Everything downstream depends on this, for reasons that become obvious in step 2.

Say the brand colour is `#3da5ff`. In OKLCH that's roughly:

```
oklch(70.6% 0.152 250.8)
```

Lightness 70.6%, chroma 0.152, hue 250.8°. Three numbers you can actually reason about.

## Step 2: Build the lightness ramp

You need somewhere between 9 and 11 steps. The conventional naming — 50, 100, 200, …, 900, sometimes 950 — comes from Material and was cemented by Tailwind. Use it; everyone understands it.

**Vary lightness linearly. This is the whole trick.**

```css
@theme {
  --color-brand-50:  oklch(97% 0.015 250.8);
  --color-brand-100: oklch(94% 0.032 250.8);
  --color-brand-200: oklch(88% 0.062 250.8);
  --color-brand-300: oklch(82% 0.095 250.8);
  --color-brand-400: oklch(76% 0.128 250.8);
  --color-brand-500: oklch(70.6% 0.152 250.8);  /* ← the brand colour */
  --color-brand-600: oklch(62% 0.150 250.8);
  --color-brand-700: oklch(52% 0.135 250.8);
  --color-brand-800: oklch(42% 0.108 250.8);
  --color-brand-900: oklch(32% 0.078 250.8);
}
```

Look at the lightness column: 97, 94, 88, 82, 76, 70.6, 62, 52, 42, 32. Roughly even steps, slightly compressed at the light end where the eye is more sensitive.

Now try the same thing in HSL and compare the result side by side. The HSL ramp will have a visible "jump" somewhere in the middle and the 700–900 range will feel muddy. That's because HSL lightness isn't perceptual — the [format comparison post](/blog/hex-vs-rgb-vs-hsl-vs-oklch/) covers why in detail. **The entire reason to build palettes in OKLCH is that this step works.**

## Step 3: Curve the chroma

Notice chroma in that ramp isn't constant: `0.015 → 0.152 → 0.078`. It rises to a peak near the middle and falls off at both ends.

This isn't decoration, it's necessity. At 97% lightness, a colour physically cannot be very saturated — you're near white, and there's no room. Same at 32% lightness near black. Forcing high chroma at the extremes produces either out-of-gamut values that the browser silently clamps (giving you an unpredictable colour) or shades that look garish and wrong.

The rule of thumb: **peak chroma at your base lightness, then taper roughly proportionally toward both ends.** A parabola-ish curve. If a shade looks neon or dirty, its chroma is too high for its lightness.

Also watch the sRGB gamut boundary: chroma above about **0.37** exits sRGB entirely. Modern browsers will map it into Display P3 on capable screens and clamp on others — meaning the same token renders differently on different monitors. For a design system, stay inside sRGB unless you've deliberately decided otherwise.

## Step 4: Handle hue drift deliberately

The ramp above holds hue constant at 250.8°. That's the safe default, but not always the best-looking one.

Many well-regarded palettes apply a slight hue shift across the ramp — darker shades drift a few degrees toward blue, lighter shades toward yellow. This mimics how real materials behave under real light, where shadows are cooler and highlights warmer. Radix Colors and the Tailwind default palette both do this.

If you want it, keep it subtle: no more than 10–15° total across the whole ramp. Larger shifts and your 900 stops reading as "the same colour as" your 300, which defeats the purpose of a ramp.

Start with constant hue. Add drift only if the ramp feels lifeless.

## Step 5: Assign semantic tokens

Raw scale values should not appear in component code. Map them to meaning first:

```css
@theme {
  /* Surfaces */
  --color-bg:            oklch(100% 0 0);
  --color-bg-elevated:   var(--color-brand-50);
  --color-border:        var(--color-brand-200);

  /* Text */
  --color-fg:            oklch(20% 0.01 250.8);
  --color-fg-secondary:  oklch(42% 0.015 250.8);
  --color-fg-subtle:     oklch(52% 0.012 250.8);

  /* Interactive */
  --color-accent:        var(--color-brand-600);
  --color-accent-hover:  var(--color-brand-700);
  --color-accent-fg:     oklch(100% 0 0);
  --color-focus-ring:    var(--color-brand-500);
}
```

Now `bg-accent` means "the interactive colour", not "brand-600". When the brand changes, you edit the ramp; every component follows. When you add dark mode, you redefine the semantic layer only.

Two details worth stealing:

**Tint your greys.** `--color-fg` above isn't pure `oklch(20% 0 0)` — it carries a trace of chroma at the brand hue. Neutrals tinted 0.01–0.02 toward the brand hue make an interface feel cohesive instead of assembled from parts. Pure grey next to a saturated brand colour reads as slightly dead.

**Never apply opacity to a text token.** `--color-fg-secondary` is tuned to sit just above 4.5:1. Write `text-fg-secondary/70` and you've silently dropped below the threshold with no warning from any tool. If you need lighter, define another token and check it.

## Step 6: Build dark mode as a redefinition, not an inversion

Naively flipping lightness (`L → 100 − L`) gets you 80% of the way and looks wrong in specific, predictable ways.

Three adjustments:

**Don't use pure black.** Dark backgrounds around `oklch(18–22% …)` are more comfortable than `0%`. True black next to bright text causes halation — the text appears to glow and smear, especially for astigmatic users, which is a large fraction of people.

**Reduce chroma slightly.** Saturated colours read as more intense against dark backgrounds. A chroma that felt right on white will feel aggressive on near-black. Drop it 10–20%.

**Shift which ramp step means what.** On light backgrounds your accent is `brand-600`. On dark it should be `brand-400` — you need a *lighter* accent for contrast against a dark surface, not a darker one.

```css
[data-theme="dark"] {
  --color-bg:            oklch(20% 0.012 250.8);
  --color-bg-elevated:   oklch(25% 0.015 250.8);
  --color-border:        oklch(33% 0.020 250.8);
  --color-fg:            oklch(95% 0.008 250.8);
  --color-fg-secondary:  oklch(78% 0.012 250.8);
  --color-accent:        var(--color-brand-400);
  --color-accent-hover:  var(--color-brand-300);
  --color-accent-fg:     oklch(20% 0.012 250.8);
}
```

Note `--color-accent-fg` flipped from white to near-black. A light accent needs dark text on top. Forgetting this ships white-on-light-blue buttons — technically visible, actually unreadable.

## Step 7: Verify with real contrast checks

The palette isn't done until it's measured. Minimum checks, in **both** themes:

| Pair | Requirement |
|---|---|
| `--color-fg` on `--color-bg` | ≥ 7:1 (aim AAA for body) |
| `--color-fg-secondary` on `--color-bg` | ≥ 4.5:1 |
| `--color-fg-subtle` on `--color-bg` | ≥ 4.5:1 if it carries text |
| `--color-accent-fg` on `--color-accent` | ≥ 4.5:1 |
| `--color-border` on `--color-bg` | ≥ 3:1 *if functional* |
| `--color-focus-ring` on both surfaces | ≥ 3:1 |

Do this against the **built page**, not the design file — sample the rendered pixels. Antialiasing, colour profiles, and any accidental opacity all shift the real result. The [WCAG contrast guide](/blog/wcag-contrast-explained/) covers the formula and the failure modes.

In practice the two that fail are always **secondary text in dark mode** and **the focus ring on the elevated surface**. Check those first.

## Step 8: Status colours that belong

Error, warning, success, info. Don't paste in stock red/amber/green — they'll look like they came from a different design system, because they did.

Build them at the **same lightness and comparable chroma** as your brand ramp, varying only hue:

```css
--color-error:   oklch(58% 0.170 27);    /* red    */
--color-warning: oklch(70% 0.150 75);    /* amber  */
--color-success: oklch(62% 0.140 150);   /* green  */
--color-info:    oklch(70.6% 0.152 250.8); /* = brand */
```

Same L, same chroma neighbourhood, different H. They'll read as siblings of the brand colour rather than imports.

Two constraints: red and green must be distinguishable by more than hue, since deuteranopia and protanopia make exactly that pair hard — differentiate by lightness too, and always pair status colour with an icon or text label. And red at high chroma on a dark background is genuinely hard to read; pull chroma down in your dark theme.

## The condensed checklist

1. Sample the base colour from real rendered pixels
2. Convert to OKLCH
3. Build 9–11 steps varying **lightness linearly**
4. Curve chroma — peak at the middle, taper at both ends
5. Keep hue constant (or drift ≤ 15° total, deliberately)
6. Map to **semantic** tokens; never use raw scale values in components
7. Tint neutrals toward the brand hue
8. Redefine — don't invert — for dark mode; avoid pure black
9. Verify every text and functional-border pair, in both themes
10. Build status colours at matched lightness

The whole system depends on step 1 and step 3. Get an accurate base colour, do the ramp in a perceptually uniform space, and the rest is bookkeeping.

You can sample the base and read its OKLCH value directly with [the picker](/) — it outputs OKLCH alongside HEX, RGB, and HSL for any pixel on your screen, and keeps a local palette history while you work through the ramp.

Related reading: [OKLCH explained](/blog/oklch-explained/) · [WCAG contrast explained](/blog/wcag-contrast-explained/) · [format comparison](/blog/hex-vs-rgb-vs-hsl-vs-oklch/)
