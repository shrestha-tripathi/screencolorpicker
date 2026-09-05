---
title: "HEX vs RGB vs HSL vs OKLCH: which colour format should you actually use?"
description: "Four ways to write the same colour, each with a real reason to exist. A practical comparison of HEX, RGB, HSL and OKLCH — what each is good at, where each breaks, and which one to reach for in 2026."
pubDate: 2026-09-05
tags: ["CSS", "Color Theory", "OKLCH"]
---

`#3da5ff`, `rgb(61 165 255)`, `hsl(210 100% 62%)`, `oklch(70.6% 0.152 250.8)`.

Four strings. One colour. Pixel-identical on screen.

So why do four notations exist, and does the choice matter? It does — not for what the browser paints, but for what *you* can do with the value afterwards. Each format makes a different operation easy and a different operation painful. Picking the wrong one is why your hover states look inconsistent and your colour scale has a weird gap in the middle.

Here's the honest comparison.

## HEX — the lingua franca

```css
color: #3da5ff;
```

Three bytes written in base 16: red `3d` (61), green `a5` (165), blue `ff` (255). It's RGB with a compact skin on.

**What it's good at:** being universally understood. Every design tool, every CSS file, every Slack message, every brand guideline PDF uses hex. It's short, it copy-pastes cleanly, and it never has ambiguous syntax. If you're handing a colour to another human, hand them hex.

**What it's bad at:** everything else. You cannot look at `#3da5ff` and `#5ab0ff` and know which is lighter without doing mental arithmetic in base 16. You cannot "make this 10% darker" by editing the string. You cannot tell that `#3da5ff` and `#ff3da5` are the same brightness at different hues, because they aren't, and you can't tell that either.

Hex is a *transport* format. It is not a *thinking* format.

**Alpha:** `#3da5ff80` (8-digit) works in every modern browser but reads terribly — `80` meaning "50% opacity" is not obvious to anyone.

## RGB — the machine format

```css
color: rgb(61 165 255);
color: rgb(61 165 255 / 50%);   /* modern space-separated syntax */
```

Same three numbers as hex, in decimal. Note the modern syntax: spaces, not commas, and a slash before alpha. Both work; the space-separated form is what CSS Color Level 4 standardised.

**What it's good at:** arithmetic. If you're working with canvas `ImageData`, image processing, WebGL, or any code that touches pixel buffers, you're in RGB whether you like it or not, because that's how the hardware stores it. Blending, channel swapping, and luminance calculations all start here.

**What it's bad at:** the same thing hex is bad at, because it's the same numbers. `rgb(61 165 255)` tells you nothing intuitive. There's an extra trap too: RGB is not linear. The value `128` is not "half as bright" as `255` — sRGB applies a gamma curve, so perceived half-brightness sits nearer `188`. Naive averaging of RGB values produces muddy, too-dark blends. This is why crossfading two colours in RGB often passes through an ugly grey.

**Use it when:** you're writing code that manipulates pixels, or you need readable alpha.

## HSL — the intuitive one that lies

```css
color: hsl(210 100% 62%);
```

Hue (0–360° around the colour wheel), Saturation (0–100%), Lightness (0–100%).

**What it's good at:** feeling intuitive. "Same colour, less saturated" is a one-number edit. "Rotate the hue 30°" is a one-number edit. For twenty years this was the best available way to reason about colour in CSS, and it's why every pre-2023 design system used it to generate shades.

**What it's bad at:** and this is the big one — **the numbers lie about what you'll see.**

HSL "lightness" is a geometric construction, not a perceptual measurement. Consider:

```css
hsl(60 100% 50%)    /* yellow  — blindingly bright */
hsl(240 100% 50%)   /* blue    — very dark */
```

Both claim 50% lightness. Put them side by side and one nearly glows while the other is almost navy. Yellow at "50% lightness" has roughly **six times** the actual luminance of blue at the same number.

This has real consequences. Build a 50→900 colour ramp by stepping HSL lightness, and your yellow ramp will look washed out at the top while your blue ramp still looks solid. Generate hover states with `lightness + 10%` and the effect will be dramatic on blue, invisible on yellow. Check contrast ratios by comparing lightness values and you'll ship inaccessible text.

Every designer who has ever muttered "why does this shade look wrong" while staring at a mathematically-correct palette has been bitten by this.

**Use it when:** you want a quick intuitive tweak and precision doesn't matter. Avoid it for systematic scale generation.

## OKLCH — the one that finally works

```css
color: oklch(70.6% 0.152 250.8);
```

Lightness (0–100%, perceptually uniform), Chroma (0–~0.4, colourfulness), Hue (0–360°).

Superficially it looks like HSL rearranged. It isn't. OKLCH is built on the OKLab colour space, published by Björn Ottosson in 2020 and standardised in CSS Color Level 4. The defining property is **perceptual uniformity**: equal numeric changes produce equal *perceived* changes.

The same test as before:

```css
oklch(70% 0.15 90)    /* yellow-ish */
oklch(70% 0.15 250)   /* blue-ish   */
```

These genuinely look equally bright. Not approximately — measurably. That single property fixes everything HSL got wrong:

- **Colour scales** built by stepping L have visually even spacing across every hue.
- **Hover and focus states** generated by `calc(l + 5%)` feel identical everywhere.
- **Theme inversion** (light ↔ dark) by flipping L produces balanced results instead of one theme looking washed out.
- **Contrast** correlates with the L difference, so you can reason about accessibility from the numbers.

There's a bonus: OKLCH can express colours **outside sRGB**. Chroma above roughly 0.37 exits the sRGB gamut and reaches into Display P3 — which most modern laptops and phones can actually show. Hex literally cannot represent those colours.

**What it's bad at:** legibility to humans who haven't learned it. Nobody looks at `oklch(70.6% 0.152 250.8)` and thinks "ah, a mid blue." And the conversion maths is genuinely non-trivial (sRGB → linear → LMS → cube root → OKLab → polar), which is why so few tools output it.

**Browser support:** Chrome 111+, Safari 15.4+, Firefox 113+, Edge 111+ — all shipped in 2023. It's safe to use directly today. Tailwind v4 uses it as its native colour space.

## The comparison table

| | HEX | RGB | HSL | OKLCH |
|---|---|---|---|---|
| Human-readable | Familiar | Poor | Good | Learnable |
| Predictable lightness | ✗ | ✗ | ✗ | ✓ |
| Safe scale generation | ✗ | ✗ | ✗ | ✓ |
| Pixel arithmetic | ✗ | ✓ | ✗ | ✗ |
| Wide gamut (P3) | ✗ | ✗ | ✗ | ✓ |
| Universal tool support | ✓ | ✓ | ✓ | Growing |

## What to actually do

**Use HEX for handoff.** Sending a colour to a client, a designer, a Slack thread, a brand doc? Hex. It's the format everyone can consume without thinking.

**Use RGB in code that touches pixels.** Canvas, WebGL, image processing. You have no choice, and that's fine.

**Use OKLCH for design tokens.** Every colour in your `@theme` block, every scale, every semantic token. This is where perceptual uniformity pays off, and it pays off every single time you generate a shade.

**Use HSL when you're being casual.** A quick tweak in devtools, a throwaway prototype. Just don't build a system on it.

A concrete Tailwind v4 example:

```css
@import "tailwindcss";

@theme {
  --color-brand-50:  oklch(97% 0.012 250);
  --color-brand-100: oklch(94% 0.030 250);
  --color-brand-300: oklch(84% 0.085 250);
  --color-brand-500: oklch(70.6% 0.152 250.8);  /* base */
  --color-brand-700: oklch(52% 0.140 250);
  --color-brand-900: oklch(32% 0.100 250);
}
```

Notice that the lightness values step down evenly and chroma peaks in the middle — that's the shape of a well-built ramp, and it's only expressible cleanly in OKLCH.

## Getting all four at once

You don't have to choose at pick time. [Screen Color Picker](/) samples any pixel on your screen and outputs HEX, RGB, HSL, and OKLCH simultaneously, each one click to copy. Grab the colour once, take whichever notation the current task needs.

Related reading: [OKLCH explained in depth](/blog/oklch-explained/) · [the OKLCH picker](/oklch-color-picker/) · [how to pick a colour from any app](/blog/how-to-pick-a-color-from-any-app/)
