import type { PseoEntry } from "./pseo";

export const pseoB: PseoEntry[] = [
  {
    slug: "wcag-contrast-checker",
    title: "WCAG contrast checker — test text and background colors",
    h1: "WCAG contrast checker",
    metaDescription:
      "Check the WCAG 2.x contrast ratio between two colors, with AA and AAA pass/fail for normal text, large text and UI components. Sample either color straight from your screen.",
    intro:
      "WCAG 2.x measures legibility as a contrast ratio from 1:1 to 21:1, based on the relative luminance of the two colors. Enter a foreground and a background below, or pick them from your screen first, and you'll see the exact ratio and which success criteria it meets.",
    contrastTool: true,
    steps: [
      "Pick the text color from your screen with “Pick a color” (or type a HEX value).",
      "Pick the background color the same way.",
      "Enter both values in the contrast checker and read the ratio.",
      "Adjust lightness until you pass: 4.5:1 for normal text at AA, 7:1 at AAA.",
    ],
    tips: [
      "Thresholds (WCAG 2.1): normal text AA 4.5:1, AAA 7:1. Large text (≥24px, or ≥18.66px bold) AA 3:1, AAA 4.5:1. UI components and graphics 3:1 (SC 1.4.11).",
      "Sample flat fills, not antialiased text edges. Edge pixels blend toward the background and understate contrast.",
      "Check hover, focus and disabled states too. Those are the states most often flagged in audits.",
      "Adjusting lightness in OKLCH, which this picker outputs, keeps the hue stable while you nudge contrast.",
    ],
    faqs: [
      { q: "How is the contrast ratio calculated?", a: "(L1 + 0.05) / (L2 + 0.05), where L1 is the relative luminance of the lighter color and L2 of the darker one. Luminance is 0.2126·R + 0.7152·G + 0.0722·B, using linearised sRGB channels." },
      { q: "What about APCA / WCAG 3?", a: "APCA is a proposed newer method and WCAG 3 is still a draft. Legal and procurement requirements still reference WCAG 2.x ratios, which is what this checker computes." },
      { q: "Does transparency affect the result?", a: "Yes. Flatten semi-transparent colors against their actual background first. Sampling the rendered pixel from your screen does that for you." },
    ],
    related: ["pick-color-from-website", "color-picker-for-powerpoint", "color-picker-for-canva"],
  },
  {
    slug: "color-picker-for-canva",
    title: "Color picker for Canva — match colors from outside Canva",
    h1: "Color picker for Canva",
    metaDescription:
      "Canva's own eyedropper only samples inside the editor. Pick a color from anywhere on your screen, like a logo, a website or a PDF, and paste the HEX code into Canva.",
    intro:
      "Canva's built-in color picker is great inside a design, but it can't read pixels outside the Canva canvas: a client's website, a PDF brief, or a photo in another app. Sample the color here, copy the HEX, and paste it into Canva's “+ New color” field.",
    steps: [
      "Keep your reference (a website, PDF or image) visible on screen.",
      "Click “Pick a color” here and click the reference pixel.",
      "Copy the HEX value (for example #3DA5FF).",
      "In Canva, select the element → Color → “+” (Add a new color) → paste the HEX into the input.",
    ],
    tips: [
      "Canva's color inputs expect HEX. Use the HEX output, not RGB or OKLCH.",
      "On paid plans, add sampled colors to your Brand Kit so the whole team uses the same values.",
      "Colors from photos vary pixel to pixel. Sample 2–3 points and pick the most representative one.",
      "Canva exports print PDFs as CMYK. On-screen HEX values can shift slightly in print.",
    ],
    faqs: [
      { q: "Doesn't Canva have its own eyedropper?", a: "It does, but it only samples within the Canva editor (and, in some browsers, on-screen content). This tool samples the whole screen in Chromium browsers, including other apps." },
      { q: "Can I use this in the Canva desktop app?", a: "Yes. Open this site in Chrome or Edge next to the Canva desktop app, pick the color, then paste the HEX into Canva." },
      { q: "Will the colors match in print?", a: "Not always exactly. Screens are RGB and print is CMYK. For critical brand work, get official print values (CMYK or Pantone) from the brand guidelines." },
    ],
    related: ["color-picker-for-powerpoint", "pick-color-from-website", "wcag-contrast-checker"],
  },
  {
    slug: "color-picker-for-powerpoint",
    title: "Color picker for PowerPoint — match any on-screen color",
    h1: "Color picker for PowerPoint",
    metaDescription:
      "Match a slide color to anything on your screen. PowerPoint's Eyedropper only works inside the slide, so sample anywhere here and paste the HEX or RGB into PowerPoint.",
    intro:
      "PowerPoint for Windows and Mac has an Eyedropper, but it only reaches pixels inside the PowerPoint window (on Windows you can drag it out, which is fiddly). When your brand color lives on a website or in a PDF, it's quicker to sample it here and type it into PowerPoint's custom color dialog.",
    steps: [
      "Click “Pick a color” and click the reference color anywhere on screen.",
      "Copy the HEX, or note the R, G, B numbers from the RGB output.",
      "In PowerPoint: Shape Fill (or Font Color) → More Colors → Custom.",
      "Paste the HEX into the Hex field (in recent Microsoft 365 builds), or type the Red, Green and Blue values.",
    ],
    tips: [
      "Older PowerPoint versions have no Hex field. Use the RGB numbers instead.",
      "Save matched colors in a custom theme (Design → Variants → Colors → Customize Colors) so every slide stays consistent.",
      "Projectors wash out colors. Run the contrast checker on your text/background pair before presenting.",
      "PowerPoint Online supports hex entry in its custom color picker too.",
    ],
    faqs: [
      { q: "Why not just use PowerPoint's Eyedropper?", a: "Use it when the color is already in your slide. For colors in a browser, a PDF or another app, a system-wide picker saves you from screenshotting and pasting." },
      { q: "Does this work for Google Slides or Keynote too?", a: "Yes. Any app that accepts HEX or RGB custom colors works the same way: pick here, paste there." },
      { q: "My color looks different on the projector — why?", a: "Projectors have a smaller gamut and lower contrast. The HEX is still correct; it's the display that differs. Aim for high contrast to stay legible." },
    ],
    related: ["color-picker-for-canva", "wcag-contrast-checker", "pick-color-from-video"],
  },
];
