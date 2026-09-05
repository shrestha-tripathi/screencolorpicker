---
title: "Why a browser colour picker needs no permissions (and what that means for your privacy)"
description: "The EyeDropper API reads pixels from anywhere on your screen — including other applications — without a single permission prompt. Here's the security model that makes that safe, and how it differs from screen sharing."
pubDate: 2026-09-05
tags: ["Privacy", "Security", "EyeDropper"]
---

Here's something that sounds alarming when you first hear it: a web page can read the colour of any pixel on your screen — including pixels belonging to other applications — and the browser will not ask your permission first.

No dialog. No prompt. No indicator light.

If your reaction is "that sounds like a security hole", good instinct. It isn't one, and the reason why is a genuinely elegant piece of API design worth understanding. It also explains why the same browser *does* interrogate you every single time a page wants to share your screen.

## The two mechanisms, side by side

There are two ways a web page can learn about pixels outside itself. They are architecturally opposite.

### `getDisplayMedia()` — screen capture

```js
const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
```

This is what Google Meet, Zoom, and Loom use. It hands the page a **live MediaStream** — a continuous video feed of your screen or a chosen window.

What the page receives: every frame, at up to 60fps, for as long as the stream is open. It can record it. It can pipe it to a server. It can run OCR on it and read your emails, your password manager, your Slack DMs.

This is enormously powerful and correspondingly dangerous. Hence: an explicit permission dialog every time, a mandatory source picker where *you* choose what to share, a persistent browser indicator while it's active, and on macOS an OS-level permission on top of that.

### `EyeDropper` — colour sampling

```js
const eyeDropper = new EyeDropper();
const result = await eyeDropper.open();
console.log(result.sRGBHex);   // "#3da5ff"
```

This is what colour pickers use. No permission prompt.

What the page receives: **one string.** `"#3da5ff"`. That's the entire payload. Seven characters.

## Why one is safe and the other isn't

The critical detail is *who is in control during the operation*.

When `open()` is called, the page does not gain any new capability. Control transfers to the **browser process itself**. From that moment:

- The **browser** draws the magnifier overlay
- The **browser** tracks your cursor across the screen
- The **browser** reads the pixel under the cursor
- The **browser** waits for you to click

The page is sitting there with a pending promise and no visibility into any of it. It cannot see where your cursor is. It cannot see what's under the magnifier. It cannot see the screen. It is blind until you deliberately click, at which point the browser resolves the promise with one colour value.

If you press `Escape` instead, the promise rejects with an `AbortError` and the page receives **nothing at all** — not even the fact that you were hovering over something.

This is the difference between *granting access* and *making a delivery*. Screen capture grants a page ongoing access to a data firehose. The eyedropper delivers one value that you personally selected, then closes the door.

## Could a page abuse it?

The obvious attack: call `open()` in a loop and reconstruct the screen pixel by pixel.

It doesn't work, for several stacked reasons.

**Every invocation requires a user gesture.** `new EyeDropper().open()` throws immediately if it isn't called from a click, tap, or keypress handler. A page cannot start the eyedropper on its own — you have to press a button, every single time.

**Every invocation requires a user click to resolve.** Even after starting, the page gets nothing until you deliberately click a pixel. The user is in the loop for every single value.

**Only one can be open at a time.** Concurrent calls throw `InvalidStateError`.

**The overlay is unmissable.** The cursor changes to a large magnifier showing a zoomed pixel grid. Nobody misses this happening.

So the theoretical exfiltration attack requires the victim to click a button, then click a pixel, then repeat — roughly two deliberate actions per pixel. A 1920×1080 screen has just over two million pixels. At one second per pixel that's about **66 days of continuous, attentive clicking** to steal one screenshot, with a giant magnifier on screen the whole time.

Compare with `getDisplayMedia()`: one permission grant, and the attacker has 60 full frames per second forever.

The asymmetry is the entire point. A capability that requires a deliberate human action per bit of data is not an exfiltration channel.

## What the page genuinely cannot learn

Worth being precise about, because the boundary is sharp:

- ❌ Screen contents, at any resolution
- ❌ Cursor position — before, during, or after
- ❌ Which application or window you sampled from
- ❌ Anything at all if you press Escape
- ❌ Your screen dimensions, display count, or arrangement
- ❌ Any pixel you didn't personally click on

- ✅ One sRGB hex string, for one pixel, that you deliberately selected

That's the complete list.

## Where the data goes after that

The API's security model protects the *capture*. It says nothing about what a site does with the value afterwards — that's a product decision, and it's where sites actually differ.

A colour picker could reasonably:

- Keep the value in a JavaScript variable and forget it on refresh
- Store it in `localStorage` for palette history, staying on your device
- POST it to a server for "cloud sync" or analytics
- Send it, plus a fingerprint, to an ad network

All four are technically possible with the same seven-character payload. The API doesn't and can't distinguish them.

For [Screen Color Picker](/), the answer is the second one. Sampled colours and your palette history live in `localStorage` on your device. There is no server, no account, and no endpoint that colour values are sent to — the site is a static build with no backend to receive them.

To be straight about the full picture, since vague privacy claims are worth distrusting: the site does use Google Analytics 4 and Google AdSense, which set cookies and see standard web analytics like page views and approximate region. Those are gated behind a Consent Mode v2 banner for EEA/UK visitors and disclosed in the [privacy policy](/privacy-policy/). What never leaves your device is the **product data** — the actual colours you pick and the palette you build.

You can verify the colour-handling claim yourself in about thirty seconds: open DevTools → Network, filter to `Fetch/XHR`, and pick a dozen colours. Nothing appears. The values simply have nowhere to go.

## The wider design lesson

The `EyeDropper` API is a good example of a pattern more web APIs should follow: **narrow the capability until the permission becomes unnecessary.**

The naive way to build a colour picker would have been to grant pages screen-read access and gate it behind a scary dialog. Users would have clicked through the dialog without reading it — they always do — and a real privacy risk would exist behind an ignored prompt.

Instead the API was scoped so tightly that there's nothing meaningful left to protect. One user-selected pixel, per user gesture, with the browser mediating throughout. No prompt needed, because no prompt would add anything.

Permission fatigue is real. Every dialog a user dismisses without reading makes the next one less effective. An API narrow enough not to need one is strictly better than an API that needs one and gets waved through.

## Trying it

Open the console on any Chromium desktop browser:

```js
"EyeDropper" in window     // true on Chrome/Edge/Brave/Arc desktop
```

Then run this from a click handler and watch what happens — the magnifier, the browser-drawn overlay, the single value that comes back:

```js
document.body.addEventListener("click", async () => {
  const r = await new EyeDropper().open();
  console.log(r);   // { sRGBHex: "#3da5ff" }
}, { once: true });
```

One object. One property. One string. That's the whole security model, visible in the return value.

Related reading: [what the EyeDropper API is](/blog/what-is-the-eyedropper-api/) · [how to pick a colour from any app](/blog/how-to-pick-a-color-from-any-app/) · [privacy by design](/privacy/)
