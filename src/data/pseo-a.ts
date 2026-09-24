import type { PseoEntry } from "./pseo";

export const pseoA: PseoEntry[] = [
  {
    slug: "color-picker-for-chromebook",
    title: "Color picker for Chromebook — sample any pixel, no extension",
    h1: "Color picker for Chromebook",
    metaDescription:
      "Pick colors on a Chromebook without installing an extension. ChromeOS ships Chrome with the EyeDropper API, so you can sample any pixel and copy HEX, RGB, HSL or OKLCH.",
    intro:
      "ChromeOS has no built-in system color picker, and school or work Chromebooks often block extension installs. Chrome on ChromeOS does ship the EyeDropper API (Chrome 95+), so a web page can hand you a pixel-accurate eyedropper with no install and no admin approval.",
    steps: [
      "Open this site in Chrome on your Chromebook.",
      "Click “Pick a color”. The cursor turns into a magnified loupe.",
      "Move over any pixel on screen, including Android apps, the Files app or a Linux (Crostini) window, and click.",
      "Copy the HEX, RGB, HSL or OKLCH value with one click. It's also saved to your local palette.",
    ],
    tips: [
      "On a managed Chromebook, admin policy can block extensions but usually not ordinary websites, which is why a web-based picker still works.",
      "Install the site as an app (Chrome menu → Install) to launch it from the shelf like a native tool.",
      "If the eyedropper cancels, the window probably lost focus. Click the button again and pick without switching windows.",
      "In tablet mode with no mouse or trackpad, the live picker can't hover. Use screenshot mode instead.",
    ],
    faqs: [
      { q: "Does ChromeOS have a built-in color picker?", a: "Not a system-wide one. Some individual apps have their own, but there is no OS-level eyedropper. Chrome's EyeDropper API fills that gap from inside a web page." },
      { q: "Will this work on a school Chromebook?", a: "Usually, yes. It's a normal website with no extension to install. Some schools block specific domains through a filter; if this site is blocked, ask your admin." },
      { q: "Can I pick colors from Android apps on my Chromebook?", a: "Yes. The EyeDropper samples whatever is composited on screen, so Android and Linux app windows are fair game as long as they're visible when you click." },
    ],
    related: ["color-picker-for-linux", "pick-color-from-website", "wcag-contrast-checker"],
  },
  {
    slug: "color-picker-for-linux",
    title: "Color picker for Linux — works on GNOME, KDE, X11 and Wayland",
    h1: "Color picker for Linux",
    metaDescription:
      "A screen color picker for Linux that needs no package install. Use Chrome, Chromium, Brave or Edge to sample any pixel and copy HEX, RGB, HSL or OKLCH. Includes Wayland notes.",
    intro:
      "On Linux, the go-to color pickers (gpick, KColorChooser, GNOME's Eyedropper) vary by distro and desktop, and some older X11 tools can't read the screen at all under Wayland. A Chromium-based browser gives you the same eyedropper everywhere, with no apt, dnf or flatpak step.",
    steps: [
      "Open this page in Chrome, Chromium, Brave, Edge or Vivaldi on Linux.",
      "Click “Pick a color”.",
      "Hover over any pixel, in a terminal, an IDE, GIMP or another monitor, and click.",
      "Copy the value you need. HEX and OKLCH are ready to paste straight into CSS.",
    ],
    tips: [
      "Under Wayland, some Chromium builds go through the desktop portal for screen access. If the live picker fails, use screenshot mode, which goes through the standard xdg-desktop-portal screen-share dialog.",
      "Firefox on Linux doesn't implement EyeDropper. Screenshot mode still works there.",
      "Fractional scaling can blend neighbouring pixels. Sample from the middle of a flat area, not an edge.",
      "Snap and Flatpak browser sandboxes sometimes limit screen capture. If screenshot mode shows a black frame, try a native package build.",
    ],
    faqs: [
      { q: "Does this work on Wayland?", a: "Generally yes in current Chromium builds, but it depends on your compositor and portal setup. Screenshot mode, which uses the screen-share portal, is the most reliable fallback." },
      { q: "Is it better than gpick?", a: "Different trade-off. gpick has more palette tooling. This site needs no install, behaves the same on every distro, and gives you OKLCH output, which most Linux pickers don't." },
      { q: "Does anything get uploaded?", a: "No. The browser returns only the sampled color to the page, and your palette lives in localStorage on your machine." },
    ],
    related: ["color-picker-for-chromebook", "pick-color-from-video", "wcag-contrast-checker"],
  },
  {
    slug: "pick-color-from-video",
    title: "Pick a color from a video — YouTube, Netflix, local files",
    h1: "Pick a color from a video",
    metaDescription:
      "Grab an exact color from any video frame: YouTube, Vimeo, a local MP4 in VLC. Pause, click, and copy HEX, RGB, HSL or OKLCH. Covers compression and HDR pitfalls.",
    intro:
      "Video colors are hard to capture because frames change constantly and streaming compression smears flat areas. The trick is to pause on a clean frame and sample it with a system-level eyedropper that reads what's actually on screen, whether it's a browser tab or a desktop player like VLC or mpv.",
    steps: [
      "Pause the video on the frame you want. Scrub frame by frame if the player supports it (on YouTube, press , and .).",
      "Come back to this tab and click “Pick a color”, or use screenshot mode if the video is in another tab.",
      "Click the pixel you want to sample. Pick from a flat region, not a moving edge.",
      "Sample 2–3 nearby points and compare. If they differ a lot, you're in a compression artefact zone.",
    ],
    tips: [
      "Watch at the highest resolution available. At 360p, compression blocks can shift a color by several HEX steps.",
      "HDR video is tone-mapped to your display, so the sampled value is what your screen shows, not the mastering value.",
      "Some DRM-protected streams (Netflix, Disney+ and similar) show as black in screen captures. The live EyeDropper may still read the pixel, depending on browser and OS.",
      "Fullscreen video plus the live picker: the picker opens from this tab, so use a second monitor or screenshot mode.",
    ],
    faqs: [
      { q: "Why is the color I picked from YouTube slightly off?", a: "Streaming codecs subsample chroma (typically 4:2:0), which blurs color across neighbouring pixels. Sample the middle of a large flat area and compare a few points." },
      { q: "Can I pick from a video in VLC or another desktop player?", a: "Yes, in Chromium browsers. The EyeDropper samples anything visible on screen, not just browser content." },
      { q: "Why does screenshot mode show a black video?", a: "Protected (DRM) content is often excluded from screen capture by the OS or browser. Try the live picker, or pick from an unprotected source." },
    ],
    related: ["pick-color-from-website", "color-picker-for-powerpoint", "color-picker-for-linux"],
  },
  {
    slug: "pick-color-from-website",
    title: "Pick a color from any website — no DevTools, no extension",
    h1: "Pick a color from a website",
    metaDescription:
      "Find the exact color a website uses. Sample any pixel in any tab, then copy HEX, RGB, HSL or OKLCH. Also explains when to use DevTools for the declared CSS value instead.",
    intro:
      "When you want “that blue on their homepage”, you have two options: read the declared CSS value in DevTools, or sample the rendered pixel. Sampling is quicker and works on images, gradients and canvas, where there's no CSS color to read. This page does the sampling for you in one click.",
    steps: [
      "Open the target website next to this tab (side by side, or on a second monitor).",
      "Click “Pick a color” here, then click the pixel on the other site.",
      "If the site is in a different tab, use “Pick from screenshot”, choose that tab, and pick from the frozen frame with the magnifier.",
      "Copy the format you need and paste it into your CSS, Figma or brand doc.",
    ],
    tips: [
      "For solid UI colors, confirm with DevTools (Inspect → Computed → color). The declared value beats any sample.",
      "Semi-transparent overlays give you a blended pixel. The sampled color only applies on that exact background.",
      "Text is antialiased. Sample a thick heading stroke or a button fill, never thin body text.",
      "Browser zoom doesn't change colors, but it gives you more flat pixels to hit. Zoom in on tiny icons first.",
    ],
    faqs: [
      { q: "Is sampling a website's colors allowed?", a: "Reading a color value is fine. Colors themselves generally aren't copyrightable, though a full brand identity can be trademarked. Use sampled colors for reference and inspiration, not to impersonate a brand." },
      { q: "Why doesn't my sample match the site's CSS?", a: "Usually transparency, a gradient, a filter, or antialiasing. Check the computed style in DevTools when you need the exact declared value." },
      { q: "Do I need a Chrome extension?", a: "No. The EyeDropper API is built into Chromium browsers and needs no permissions, unlike extensions that request access to every site you visit." },
    ],
    related: ["pick-color-from-video", "wcag-contrast-checker", "color-picker-for-canva"],
  },
];
