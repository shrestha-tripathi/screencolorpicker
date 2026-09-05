---
title: "The best colour picker for developers in 2026: browser-native vs extensions vs desktop apps"
description: "An honest comparison of the four ways developers sample colours — browser-native EyeDropper, browser extensions, desktop utilities, and DevTools — with the trade-offs each makes on privacy, speed, and capability."
pubDate: 2026-09-05
tags: ["Tools", "Comparison", "Workflow"]
---

Every developer needs to grab a colour off the screen a few times a week, and there are four broadly different ways to do it. They differ far more than you'd expect for such a small task — on install friction, on what data leaves your machine, on whether they work outside the browser at all.

This is a straight comparison. I build one of these tools, which I'll be upfront about, and I'll also be upfront about the cases where the others are simply better.

## The four options

### 1. Browser-native (`EyeDropper` API)

Since 2021, Chromium browsers ship a colour sampler built into the browser itself. Any web page can invoke it, and it reads pixels from **anywhere on your screen** — including other applications entirely.

**Setup:** none. Open a page, click a button.

**Reach:** the whole screen. PDFs, Figma, native apps, paused video, other browsers.

**Privacy:** the browser reads the pixel and hands the page exactly one colour string. The page never sees your screen. There's no permission prompt because there's no meaningful data to protect — the [security model](/blog/why-eyedropper-needs-no-permissions/) is genuinely well designed.

**The catch:** Chromium desktop only. No Firefox, no Safari, no mobile — and mobile isn't coming, because the interaction model (hover a cursor over an arbitrary pixel) doesn't exist on touch.

### 2. Browser extensions (ColorZilla, Eye Dropper, etc.)

The traditional answer. ColorZilla has been around since the Firefox 1.0 era and has millions of installs.

**Setup:** install from a web store, grant permissions, restart if asked.

**Reach:** typically the current web page only. Extensions read pixels by injecting a content script and rendering the page to a canvas — which means they cannot see PDFs in the native viewer, native applications, or other browsers. Some also fail on cross-origin iframes and canvas elements.

**Privacy:** this is the part worth reading carefully. A colour-picker extension generally requests permission to **read and change all your data on all websites**. That is not a colour-picking permission; it's total access to every page you visit, including your bank and your email. Most such extensions are honest. Some have been sold to new owners and turned into data harvesters after the fact — this has happened repeatedly across the extension ecosystem, and the update ships silently to everyone who already trusted the old version.

**Where they win:** advanced features. ColorZilla's page-wide palette extraction, CSS gradient generator, and colour history are genuinely useful and have no browser-native equivalent. If you need those, the extension earns its permissions.

### 3. Desktop utilities (Digital Color Meter, PowerToys, Just Color Picker)

Native applications that read screen pixels at the OS level.

**Setup:** download, install, and on macOS grant Screen Recording permission — which is a real, broad permission.

**Reach:** everything, including full-screen games and DRM content that blocks other approaches. The best reach of any option.

**Privacy:** depends entirely on the vendor. macOS's Digital Color Meter and Microsoft PowerToys are first-party and trustworthy. A random freeware picker with Screen Recording permission is a genuine risk — that permission allows continuous capture of your entire display.

**Where they win:** precision work. Averaging over an N×N region, native colour-profile handling, working outside the browser entirely, and keyboard-driven workflows. If you're doing colour-critical print work, use these.

**The friction:** an install, an OS permission, and a running background process for a task you do a few times a week.

### 4. Browser DevTools

The colour swatch next to any CSS colour value in the Styles panel opens a picker with an eyedropper — in Chrome it's the same native `EyeDropper` under the hood.

**Setup:** none, it's already there.

**Reach:** the whole screen, same as browser-native.

**Where it wins:** it's *right there* while you're already debugging CSS, and it shows a live WCAG contrast ratio with AA/AAA indicators for text elements. For "is this text accessible against this background", nothing is faster.

**Where it loses:** you have to be inspecting an element that already has a colour property, it only outputs one format at a time, and there's no palette history across sessions. It's a debugging affordance, not a colour tool.

## The comparison table

| | Browser-native | Extension | Desktop app | DevTools |
|---|---|---|---|---|
| Install required | No | Yes | Yes | No |
| Permissions | None | Broad web access | OS screen recording | None |
| Reads outside browser | ✓ | ✗ | ✓ | ✓ |
| Reads PDFs / native apps | ✓ | ✗ | ✓ | ✓ |
| Works in Firefox / Safari | ✗ | ✓ | ✓ | Partial |
| Works on mobile | ✗ | ✗ | ✗ | ✗ |
| Multiple formats at once | Depends on site | ✓ | ✓ | ✗ |
| Palette history | Depends on site | ✓ | ✓ | ✗ |
| Contrast checking | Depends on site | Some | Some | ✓ |
| Advanced (gradients, region averaging) | ✗ | ✓ | ✓ | ✗ |

## Which one to actually use

**For most developers, most of the time: browser-native.** You need a colour, you need it now, you don't want to install anything, and you don't want to hand a third party read access to every page you visit. Open a tab, click, copy, close. The whole interaction is under ten seconds and nothing persists.

**Use DevTools when you're already in DevTools** and specifically when you need the contrast ratio. It's the fastest path to an accessibility answer.

**Use an extension if you genuinely need its advanced features** — page-wide palette extraction, gradient generation, a persistent history synced across machines. Just read the permission list before installing, prefer extensions with an identifiable maintainer and recent updates, and be aware that ownership can change hands.

**Use a desktop app for colour-critical work** — print, region averaging, ICC profile handling, or sampling from content that blocks browser-level capture.

**Use Firefox or Safari?** Your options are extension or desktop app. The `EyeDropper` API isn't implemented in either, and neither vendor has signalled that it will be.

## Where Screen Color Picker fits

[Screen Color Picker](/) is the browser-native option, built out into an actual tool rather than a bare API demo:

- Sample any pixel on screen — PDFs, native apps, Figma, paused video
- HEX, RGB, HSL, and **OKLCH** output simultaneously, each one click to copy
- Palette history in `localStorage`, so it survives a refresh and stays on your device
- No install, no extension permissions, no account

The OKLCH output is the differentiator worth naming. Most pickers predate CSS Color Level 4 and only emit HEX/RGB/HSL. If you work in Tailwind v4 or any modern design system, OKLCH is the format you actually need — see the [format comparison](/blog/hex-vs-rgb-vs-hsl-vs-oklch/) for why.

The honest limitations: Chromium desktop only, no page-wide palette extraction, no gradient tools. If you need those, ColorZilla does them well and I'd tell you to use it — there's a [detailed comparison here](/blog/colorzilla-vs-screencolorpicker/).

## The short version

For a task this small, the right default is the one with the least friction and the smallest attack surface. That's the browser-native picker: nothing to install, no permissions to grant, no vendor to trust with your browsing history, and full reach across every application on your screen.

Escalate to an extension or a desktop app only when you hit a specific capability you actually need — not preemptively.

Related reading: [ColorZilla alternative](/colorzilla-alternative/) · [why no permissions are needed](/blog/why-eyedropper-needs-no-permissions/) · [what the EyeDropper API is](/blog/what-is-the-eyedropper-api/)
