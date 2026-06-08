// Generate the Open Graph preview image (1200x630, social-card standard).
// Run via `node scripts/gen-og-image.mjs`.
//
// Design: dark background with the VIBGYOR brand mark (rainbow square +
// white eyedropper) top-left + wordmark beside it. Big two-line headline
// fills the lower 60% of the canvas. Accent pill at bottom-right with
// the moat credential. Matches the favicon / nav so OG card is brand-
// consistent across all share unfurls (WhatsApp, Twitter, Discord,
// LinkedIn, iMessage, etc).
//
// Layout zones (1200x630):
//   Top zone     (0-260): brand mark (180x180) + wordmark + URL
//   Middle zone  (280-540): big two-line headline
//   Bottom zone  (540-630): subline + accent pill

import sharp from "sharp";
import { writeFileSync } from "node:fs";

const W = 1200;
const H = 630;

// VIBGYOR gradient stops — same as public/favicon.svg + brand language
const RAINBOW = [
  ["0%",   "#ff3d3d"],
  ["16%",  "#ff8a3d"],
  ["33%",  "#ffd23d"],
  ["50%",  "#3ddc84"],
  ["66%",  "#3da5ff"],
  ["83%",  "#7a5af8"],
  ["100%", "#c450ff"],
];

// Brand mark — same geometry as public/favicon.svg (32x32 viewBox).
// Scale 5.625 → 180x180 final pixels. Placed top-left at (80, 80).
const brandMark = `
  <g transform="translate(80, 80) scale(5.625)">
    <rect width="32" height="32" rx="7" fill="url(#brandGrad)"/>
    <g fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m6 26 1-1h3l9-9"/>
      <path d="M7 25v-3l9-9"/>
      <path d="m18 9 3-3a2 2 0 1 1 3 3l-3 3 .4.4a2 2 0 1 1-2.8 2.8l-3.8-3.8a2 2 0 1 1 2.8-2.8z"/>
    </g>
  </g>
`;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      ${RAINBOW.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("\n      ")}
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="20%" r="75%">
      <stop offset="0%" stop-color="#7a5af8" stop-opacity="0.28"/>
      <stop offset="50%" stop-color="#3da5ff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#3da5ff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  ${brandMark}

  <!-- Wordmark + URL stacked to the right of the brand mark -->
  <text x="300" y="160" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="56" font-weight="700" fill="#ffffff" letter-spacing="-1.5">Screen Color Picker</text>
  <text x="300" y="210" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="26" font-weight="500" fill="#9ca3af" letter-spacing="0.5">screencolorpicker.com</text>

  <!-- Big headline -->
  <g transform="translate(80, 360)">
    <text font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="68" font-weight="700" fill="#ffffff" letter-spacing="-2.5">
      <tspan x="0" y="0">Pick any color</tspan>
      <tspan x="0" y="85">from your screen.</tspan>
    </text>
  </g>

  <!-- Subline -->
  <g transform="translate(80, 590)">
    <text font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="22" font-weight="400" fill="#9ca3af">
      Even outside the browser  ·  HEX · RGB · HSL · OKLCH  ·  No install
    </text>
  </g>

  <!-- Accent pill bottom-right — the moat credential.
       Neutral glass surface (not the brand gradient — that's reserved
       for the brand mark surface so the credential doesn't compete
       visually + text contrast stays uniform). -->
  <g transform="translate(${W - 290}, ${H - 95})">
    <rect width="210" height="46" rx="23" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1"/>
    <text x="105" y="30" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="15" font-weight="700" fill="#ffffff" letter-spacing="1.5">100% IN-BROWSER</text>
  </g>
</svg>
`;

const buf = await sharp(Buffer.from(svg)).png({ quality: 92 }).toBuffer();
writeFileSync("public/og-image.png", buf);
console.log(`✓ Generated public/og-image.png (${W}x${H}, ${(buf.length / 1024).toFixed(1)} KB)`);
