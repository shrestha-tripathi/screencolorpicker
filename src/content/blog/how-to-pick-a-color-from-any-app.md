---
title: "How to pick a color from any app on your screen"
description: "A practical guide to sampling a colour from a video, a PDF, a Figma board, a game, or any native app — using the browser's built-in EyeDropper API instead of installing a desktop utility."
pubDate: 2026-09-05
tags: ["EyeDropper", "Workflow", "Design"]
---

You saw a colour. It's in a YouTube thumbnail, a competitor's app, a screenshot a client sent you on WhatsApp, a frame of a movie, a PDF brand guideline. You need the hex code. Right now.

The traditional answers are all bad. Install a desktop colour utility that wants accessibility permissions. Open Photoshop for a five-second task. Screenshot, crop, upload to some random site that keeps your image on its server. Squint at a colour wheel and guess.

None of that is necessary anymore. Every Chromium browser since 2021 ships a native screen colour sampler, and this guide walks through using it properly — including the parts nobody explains, like why it can read pixels outside the browser window and what to do when it isn't available.

## The 15-second version

1. Open [Screen Color Picker](/).
2. Click **Pick a color**.
3. Your cursor becomes a magnifier. Move it anywhere on your screen — including outside the browser.
4. Click. The colour is captured, converted to HEX, RGB, HSL, and OKLCH, and saved to your palette history.

That's the entire workflow. No install, no permission dialog, no upload.

## Why it can read pixels outside the browser

This is the part that surprises people. A web page is normally sandboxed — it cannot see your desktop, your other tabs, or your other applications. So how does a web-based colour picker read a pixel from a Photoshop window?

The answer is that it doesn't. **The browser does.**

The `EyeDropper` API is a browser-mediated capability. When you call it, the page hands control to the browser itself. The browser draws the magnifier overlay, tracks your cursor across the whole screen, reads the pixel under it, and — only after you click — hands one single colour value back to the page.

The page never gets a screenshot. It never gets a stream. It gets one sRGB value, and only for the pixel you deliberately clicked. If you press `Escape`, the page gets nothing at all: the promise rejects with an `AbortError` and the operation is over.

This design is why the API needed no permission prompt. There is no meaningful privacy surface to protect, because a single deliberately-chosen pixel is not enough to reconstruct anything. Contrast that with `getDisplayMedia()` (screen sharing), which hands the page a live video stream and therefore *does* require an explicit, scary permission dialog every time.

## Sampling from specific sources

### From a video (YouTube, Netflix, a local file)

Pause on the frame you want first. The eyedropper reads whatever is currently painted on screen, so a moving video will give you whatever pixel happened to be there at click time — which is rarely what you meant.

One caveat: some DRM-protected players composite video through a protected path, and the pixels can read back as pure black. Netflix and Prime Video do this on some hardware. If you get `#000000` from a bright frame, that's what happened. Workaround: screenshot the frame with your OS tool (which is often also blocked), or sample from a promotional still instead.

### From a PDF

Open the PDF in your browser's built-in viewer, or in any desktop reader. Both work identically — the eyedropper doesn't care which application owns the window. This is the fastest way to extract brand colours from a client's brand guideline document, which is otherwise a genuinely annoying task.

### From Figma, Sketch, or a design tool

Works fine, but consider whether you actually want the *rendered* colour. If the layer has opacity, a blend mode, or an effect applied, the pixel you sample is the composited result — not the layer's declared fill. That's usually what you want when matching, and usually *not* what you want when copying a design token. Check the tool's own inspector for the source value.

### From a screenshot on your phone

AirDrop or WhatsApp it to your desktop, open the image, and sample. There's no mobile version of this workflow, because — see below — the API is desktop-only.

### From a game

Works, with the same DRM caveat. Windowed and borderless-window modes are reliable; exclusive fullscreen sometimes prevents the overlay from drawing on top. Alt-tab to windowed mode if the magnifier doesn't appear.

## The formats you get back, and when to use each

A colour picker that only gives you HEX is doing half the job. Here's the decision tree.

**HEX (`#3da5ff`)** — the default for handoff. Universally understood, compact, works in every tool from CSS to Slack. Use it when you're communicating a colour to another human or pasting into a design tool.

**RGB (`rgb(61 165 255)`)** — use when you need to do arithmetic on channels, when working with canvas or image data, or when you need an alpha channel and want it readable.

**HSL (`hsl(210 100% 62%)`)** — use when you want to reason about a colour in human terms: "same hue, less saturated." Be aware of its flaw, covered in the next post: equal numeric changes do not produce equal perceptual changes.

**OKLCH (`oklch(70.6% 0.152 250.8)`)** — use when building a design system, generating a colour scale, or working in Tailwind v4. It's perceptually uniform, so a scale built by stepping lightness actually looks evenly spaced. This is the format modern design systems have standardised on.

## When the eyedropper isn't available

The `EyeDropper` API is **Chromium desktop only** as of 2026. That means:

- ✅ Chrome, Edge, Brave, Arc, Opera, Vivaldi — on Windows, macOS, Linux, ChromeOS
- ❌ Firefox (no implementation shipped; the feature request remains open)
- ❌ Safari (no implementation; Apple has not signalled intent)
- ❌ Any mobile browser, including Chrome on Android and iOS

The mobile exclusion is not an oversight. On a phone there is no cursor to hover with, no concept of "the pixel under the pointer", and no reliable way to read pixels from another app's window. The whole interaction model doesn't translate.

If you're on an unsupported browser, the honest workaround is to upload the image to a picker that reads pixels from the image itself via canvas — a fundamentally different (and less private) mechanism, since the image data has to enter the page. Or switch to a Chromium browser for the ten seconds the task takes.

You can check support yourself in the browser console:

```js
"EyeDropper" in window
// true  → supported
// false → not supported
```

Any well-built tool should feature-detect this and tell you clearly rather than showing a button that does nothing.

## Accuracy: what "the colour" actually means

Three things can make the value you get differ from the value the original author specified.

**Colour profiles.** Your display has an ICC profile. If the source content is tagged P3 and your display is sRGB, the operating system converts before painting. You sample the converted result. For web work this is almost always fine — sRGB is what browsers assume by default — but for print work it matters.

**Subpixel antialiasing.** Text is rendered with coloured subpixels. Sample the middle of a letterform and you can get a value tinged red or blue that appears nowhere in the design. Always sample from a solid area, never from text.

**Compression artefacts.** JPEG and heavily-compressed video introduce colour noise, especially near edges. Sample from the flat centre of a region, not near a boundary.

The practical rule: **sample from the middle of a large flat area of colour.** If you sample the same region twice and get two different values, you're in an artefact zone — move inward.

## Building a palette, not just grabbing one colour

Most real work involves more than one colour. You're matching a brand, extracting a scheme from a reference image, or building a theme.

Screen Color Picker keeps every colour you sample in a local palette history, stored in your browser's `localStorage` — meaning it stays on your device, survives a refresh, and is never sent anywhere. Sample five colours from a reference, then copy them all out in whatever format you need.

For scale generation — turning one brand colour into a 50/100/…/900 ramp — sample your base in OKLCH and step the lightness. Because OKLCH is perceptually uniform, evenly-spaced numbers produce evenly-spaced-looking shades. Do the same thing in HSL and the midtones bunch up.

## Summary

The colour under your cursor is one click away, in any application, without installing anything, with nothing leaving your machine. The browser has quietly had this capability for years — most people just never found out.

Try it on [the picker](/), or read the deep dive on [what the EyeDropper API actually is](/blog/what-is-the-eyedropper-api/).
