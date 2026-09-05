---
title: "WCAG contrast explained: how to check colour accessibility properly"
description: "A practical guide to WCAG 2.1 contrast ratios — what 4.5:1 actually means, how the maths works, the large-text exemption, the APCA future, and the mistakes that quietly ship inaccessible interfaces."
pubDate: 2026-09-05
tags: ["Accessibility", "WCAG", "Color Theory"]
---

Roughly one in twelve men has some form of colour vision deficiency. Far more people — everyone over about forty, everyone using a phone in sunlight, everyone with a cheap monitor at a bad angle — has degraded contrast perception in some situation. Low-contrast text isn't an edge case. It's the single most common accessibility failure on the web, and it's the easiest one to fix.

This guide covers what contrast ratios actually mean, how to compute them, where the thresholds come from, and the mistakes that let inaccessible colour combinations pass review.

## What a contrast ratio is

A contrast ratio compares the **relative luminance** of two colours. It's written like `4.5:1` and ranges from `1:1` (identical colours, invisible) to `21:1` (pure black on pure white, maximum possible).

The formula from WCAG 2.1:

```
ratio = (L1 + 0.05) / (L2 + 0.05)
```

where `L1` is the lighter colour's relative luminance and `L2` the darker's. The `0.05` terms model ambient light reflecting off the screen — without them, black-on-black would be a division by zero, and real screens never achieve true black anyway.

Relative luminance itself is not the average of the RGB channels. It's a weighted sum applied *after* removing the sRGB gamma curve:

```js
function channel(c) {              // c is 0..1
  return c <= 0.03928
    ? c / 12.92
    : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(r, g, b) {      // each 0..255
  const R = channel(r / 255);
  const G = channel(g / 255);
  const B = channel(b / 255);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(rgb1, rgb2) {
  const l1 = luminance(...rgb1);
  const l2 = luminance(...rgb2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
```

Two things in that code matter.

**The weights are wildly uneven.** Green contributes 71.5% of perceived brightness, red 21.3%, blue only 7.2%. This is human physiology — our eyes have far more green-sensitive cones. The practical consequence: changing the blue channel barely moves contrast, while changing green moves it a lot. Pure blue `#0000ff` on white has a ratio of only 8.6:1 despite looking dark, because blue carries so little luminance.

**The gamma removal is not optional.** sRGB values are gamma-encoded; `128` is not half the light of `255`. Skipping the `channel()` step — just averaging raw RGB — produces ratios that are wrong by a wide margin, always in the optimistic direction. This is the single most common bug in home-rolled contrast checkers.

## The thresholds

WCAG 2.1 defines two conformance levels for contrast.

**Level AA** (the practical standard, and what most legal requirements reference):

| Content | Minimum ratio |
|---|---|
| Normal text | **4.5:1** |
| Large text | **3:1** |
| UI components & graphics | **3:1** |

**Level AAA** (stricter, for content aimed at users with low vision):

| Content | Minimum ratio |
|---|---|
| Normal text | **7:1** |
| Large text | **4.5:1** |

"Large text" means **18pt (24px) or larger**, *or* **14pt (18.66px) bold or larger**. Larger glyphs have thicker strokes, so more of each letterform survives at low contrast — hence the relaxed threshold.

The "UI components" row is the one people forget. It applies to anything you need to *see* in order to *use*: input borders, focus rings, toggle states, icon buttons, chart lines, the boundary of a card you're supposed to click. A 1px `#e5e5e5` border on white is 1.2:1 and fails badly — and it's on approximately every website built in the last five years.

## What's exempt

Not everything on screen needs to pass:

- **Disabled controls.** A greyed-out button is exempt, because its greyness *is* the signal.
- **Logos and brand marks.** Your logo can be whatever it is.
- **Purely decorative imagery** that conveys no information.
- **Incidental text** inside a photograph.

Everything else — body copy, labels, placeholders, error messages, link text, button text, form borders, focus indicators — is in scope.

Note that **placeholder text is not exempt.** Light grey placeholders are one of the most common failures. If the placeholder communicates the expected format ("DD/MM/YYYY"), it's functional content and must pass 4.5:1.

## The mistakes that ship

**Checking against the wrong background.** Semi-transparent text over a gradient, an image, or a coloured card must be checked against the *actual composited* result — and against the *worst-case* region of it. Text over a photo can pass in the dark corner and fail across the bright centre. This is why sampling the real rendered pixel matters more than reading your design tokens.

**Only checking one theme.** Your palette passes in light mode. Your dark mode inverts the tokens and your muted-grey secondary text drops to 3.1:1. Both themes need checking, every time. A dark theme is not a free pass — dark backgrounds actually make low-chroma text *harder* to read for many users due to halation.

**Stacking opacity on an already-muted colour.** This is the classic. Your `--color-muted` token was carefully tuned to sit at exactly 4.6:1. Then someone writes `text-muted/70` because it "looked better", and the real ratio silently becomes 3.2:1. Tokens intended for text should never have opacity applied on top. If you need a lighter variant, define a second token and check it.

**Trusting HSL lightness as a proxy.** Two colours with the same HSL "lightness" can have six times different luminance, as [covered here](/blog/hex-vs-rgb-vs-hsl-vs-oklch/). HSL lightness tells you nothing reliable about contrast. OKLCH lightness correlates much better — it's still not the WCAG formula, but it at least moves in the right direction.

**Checking the design file instead of the build.** Antialiasing, colour profiles, and browser rendering all shift the final pixels. Check what actually renders.

## Checking it in practice

The reliable workflow is to sample the real rendered pixels, not the intended values:

1. Open the built page in your browser.
2. Sample the text colour with an eyedropper, from a solid stroke — not from an antialiased edge.
3. Sample the background colour from a flat area immediately adjacent.
4. Run both through a contrast formula.
5. Repeat in the other theme.

[Screen Color Picker](/) covers steps 2 and 3 — it reads the actual composited pixel from any application, so you're testing what users see rather than what your CSS claims. Sample both colours into the palette, then compute.

Chrome DevTools also shows a contrast ratio inline in the colour picker for any text element, with AA/AAA pass indicators. It's excellent for the common case, but it only checks against the computed background of the *element*, which is why it can mislead on gradients and images.

## The APCA footnote

The WCAG 2.1 formula is known to be imperfect. It systematically over-rates dark-on-light and under-rates light-on-dark, and it handles very dark colours poorly — several combinations that pass 4.5:1 are genuinely hard to read, and a few that fail are perfectly legible.

**APCA** (Accessible Perceptual Contrast Algorithm) is the proposed replacement, developed for WCAG 3. It models polarity, font weight, and font size directly, and outputs a signed `Lc` value from about -108 to +106 rather than a ratio. Rough mapping: `Lc 60` ≈ the old 4.5:1 for body text; `Lc 75` ≈ 7:1.

WCAG 3 is still a working draft and has been for years. **Ship against WCAG 2.1 AA today** — it's what audits, procurement checklists, and legal requirements reference. Treat APCA as a useful second opinion when a combination passes 2.1 but still looks wrong to you. Your eyes are often detecting something real that the old formula misses.

## A quick reference

Safe defaults that comfortably pass AA on white:

- Body text: `#4a4a4a` or darker (≥ 8.6:1)
- Secondary text: `#6b6b6b` or darker (≥ 5.3:1) — do not go lighter
- Borders and dividers on white: `#949494` or darker for *functional* borders (≥ 3:1); purely decorative separators are exempt
- Links: ensure 4.5:1 against the background *and* don't rely on colour alone — underline them

And the single highest-value habit: **check your secondary text token in dark mode.** It is, in practice, the thing that fails.

Related reading: [HEX vs RGB vs HSL vs OKLCH](/blog/hex-vs-rgb-vs-hsl-vs-oklch/) · [building an accessible colour palette](/blog/building-an-accessible-color-palette/)
