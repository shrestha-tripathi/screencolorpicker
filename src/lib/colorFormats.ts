/**
 * Color format conversions between HEX → RGB → HSL → OKLCH.
 *
 * All conversions are lossless within practical sRGB precision. OKLCH uses the
 * IEC 61966-2-1 sRGB → linear → OKLab → OKLCH pipeline (Björn Ottosson, 2020).
 *
 * Inputs are always a `Rgb` object internally — UI parses HEX to Rgb first.
 */

export interface Rgb {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface Hsl {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface Oklch {
  l: number; // 0-1
  c: number; // 0-~0.4 (sRGB max ~0.37)
  h: number; // 0-360
}

const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

// ----------------------------------------------------------------------
// HEX <-> RGB
// ----------------------------------------------------------------------

/** Parse "#abc", "#aabbcc", "abc", "aabbcc" → Rgb. Returns null if invalid. */
export function parseHex(raw: string): Rgb | null {
  if (!raw) return null;
  let s = raw.trim().toLowerCase().replace(/^#/, "");
  if (s.length === 3) {
    s = s.split("").map((c) => c + c).join("");
  }
  if (s.length !== 6 || !/^[0-9a-f]{6}$/.test(s)) return null;
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}

/** RGB → "#aabbcc" (lowercase, always 7 chars). */
export function rgbToHex({ r, g, b }: Rgb): string {
  const h = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

// ----------------------------------------------------------------------
// RGB <-> HSL  (standard sRGB-relative HSL, NOT OKLCH; UI shows both)
// ----------------------------------------------------------------------

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
      case g1: h = (b1 - r1) / d + 2; break;
      case b1: h = (r1 - g1) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// ----------------------------------------------------------------------
// RGB <-> OKLCH (via sRGB linear → OKLab → OKLCH)
// Reference: https://bottosson.github.io/posts/oklab/
// ----------------------------------------------------------------------

function srgbToLinear(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  // sRGB linear → LMS
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // LMS → OKLab (cube root)
  const l3 = Math.cbrt(l_);
  const m3 = Math.cbrt(m_);
  const s3 = Math.cbrt(s_);

  const L = 0.2104542553 * l3 + 0.793617785 * m3 - 0.0040720468 * s3;
  const A = 1.9779984951 * l3 - 2.428592205 * m3 + 0.4505937099 * s3;
  const B = 0.0259040371 * l3 + 0.7827717662 * m3 - 0.808675766 * s3;

  // OKLab → OKLCH
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

// ----------------------------------------------------------------------
// String formatters (clipboard-friendly canonical forms)
// ----------------------------------------------------------------------

export function formatHex(rgb: Rgb): string {
  return rgbToHex(rgb).toUpperCase();
}

export function formatRgb({ r, g, b }: Rgb): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function formatHsl(rgb: Rgb): string {
  const { h, s, l } = rgbToHsl(rgb);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function formatOklch(rgb: Rgb): string {
  const { l, c, h } = rgbToOklch(rgb);
  // CSS oklch() spec: L is 0-100% OR 0-1; chroma 0-~0.4; hue 0-360.
  // Use percentage notation for L (more readable to designers) and 4-digit
  // chroma precision (sufficient for round-tripping).
  const lp = (l * 100).toFixed(2);
  const cp = c.toFixed(4);
  const hp = h.toFixed(1);
  return `oklch(${lp}% ${cp} ${hp})`;
}

// ----------------------------------------------------------------------
// Convenience: contrast text color (white vs near-black) for readable swatches
// Standard WCAG-relative-luminance.
// ----------------------------------------------------------------------

export function contrastTextOn(rgb: Rgb): "#fff" | "#0a0a0b" {
  const lum =
    0.2126 * srgbToLinear(rgb.r) +
    0.7152 * srgbToLinear(rgb.g) +
    0.0722 * srgbToLinear(rgb.b);
  return lum > 0.45 ? "#0a0a0b" : "#fff";
}
