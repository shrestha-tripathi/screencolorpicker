/**
 * ColorPicker behavior — wires up the EyeDropper button, palette history,
 * copy-to-clipboard, and result card.
 *
 * Lives client-side only. No SSR.
 */

import {
  parseHex,
  formatHex,
  formatRgb,
  formatHsl,
  formatOklch,
  contrastTextOn,
} from "../lib/colorFormats";
import {
  pickColor,
  supportLevel,
  type SupportLevel,
} from "../lib/browserSupport";
import {
  addToPalette,
  clearPalette,
  readPalette,
  removeFromPalette,
} from "../lib/paletteStore";

// ----------------------------------------------------------------------
// DOM refs
// ----------------------------------------------------------------------

const pickBtn = document.getElementById("pick-btn") as HTMLButtonElement | null;
const pickBtnLabel = document.getElementById("pick-btn-label");
const pickHint = document.getElementById("pick-hint");
const banner = document.getElementById("compat-banner");
const bannerText = document.getElementById("compat-banner-text");
const resultCard = document.getElementById("result-card");
const swatchEl = document.getElementById("result-swatch");
const swatchHex = document.getElementById("result-swatch-hex");
const fmtHex = document.getElementById("fmt-hex");
const fmtRgb = document.getElementById("fmt-rgb");
const fmtHsl = document.getElementById("fmt-hsl");
const fmtOklch = document.getElementById("fmt-oklch");
const paletteSection = document.getElementById("palette-section");
const paletteGrid = document.getElementById("palette-grid");
const paletteCount = document.getElementById("palette-count");
const clearBtn = document.getElementById("clear-palette");
const toast = document.getElementById("toast");

if (!pickBtn) {
  // The ColorPicker component isn't on this page — quietly do nothing.
  // (Allows safe import on every page if we ever inline the script.)
  console.debug("ColorPicker root not found, script no-op");
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

let activeHex: string | null = null;

// ----------------------------------------------------------------------
// Compatibility banner
// ----------------------------------------------------------------------

function configureForSupport(): void {
  const level: SupportLevel = supportLevel();
  if (!banner || !bannerText || !pickBtn || !pickBtnLabel || !pickHint) return;

  switch (level) {
    case "supported":
      banner.classList.add("hidden");
      pickBtn.disabled = false;
      break;
    case "mobile-warning":
      banner.classList.remove("hidden");
      bannerText.innerHTML =
        "📱 <strong>Heads up:</strong> on mobile, the eyedropper can only sample colors visible inside this browser tab — not other apps. Use a desktop browser for the full experience.";
      pickBtn.disabled = false;
      break;
    case "unsupported":
      banner.classList.remove("hidden");
      bannerText.innerHTML =
        "⚠️ <strong>This browser doesn't support the EyeDropper API.</strong> Use the latest <a href='https://www.google.com/chrome/' target='_blank' rel='noopener' class='underline text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]'>Chrome</a>, Edge, Brave, or Opera. Firefox + Safari haven't shipped this yet.";
      pickBtn.disabled = true;
      pickBtnLabel.textContent = "Not supported in this browser";
      pickHint.textContent = "Try Chrome, Edge, Brave, or Opera on desktop.";
      break;
  }
}

// ----------------------------------------------------------------------
// Toast
// ----------------------------------------------------------------------

let toastTimer: number | null = null;

function showToast(message: string): void {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  if (toastTimer !== null) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.add("hidden");
    toastTimer = null;
  }, 1800);
}

// ----------------------------------------------------------------------
// Active color rendering
// ----------------------------------------------------------------------

function setActive(hex: string): void {
  const rgb = parseHex(hex);
  if (!rgb) return;
  const hexUp = formatHex(rgb);
  activeHex = hexUp;

  // result card
  if (resultCard) resultCard.classList.remove("hidden");
  if (swatchEl) {
    swatchEl.style.backgroundColor = hexUp;
    const textColor = contrastTextOn(rgb);
    if (swatchHex) {
      swatchHex.textContent = hexUp;
      swatchHex.style.color = textColor;
    }
  }
  if (fmtHex) fmtHex.textContent = hexUp;
  if (fmtRgb) fmtRgb.textContent = formatRgb(rgb);
  if (fmtHsl) fmtHsl.textContent = formatHsl(rgb);
  if (fmtOklch) fmtOklch.textContent = formatOklch(rgb);

  // CTA button morphs from "Pick a color" → "Pick another color"
  if (pickBtnLabel) pickBtnLabel.textContent = "Pick another color";
  if (pickHint) pickHint.textContent = "Click the button to grab another color from your screen.";
}

// ----------------------------------------------------------------------
// Palette grid
// ----------------------------------------------------------------------

function renderPalette(palette?: string[]): void {
  if (!paletteSection || !paletteGrid || !paletteCount) return;

  const items = palette ?? readPalette();
  if (items.length === 0) {
    paletteSection.classList.add("hidden");
    return;
  }

  paletteSection.classList.remove("hidden");
  paletteCount.textContent = `(${items.length})`;
  paletteGrid.innerHTML = "";

  for (const hex of items) {
    const wrap = document.createElement("div");
    wrap.className = "group relative";
    wrap.setAttribute("role", "listitem");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "block w-full aspect-square rounded-md border border-[var(--color-border)] hover:scale-[1.08] hover:z-10 transition-transform shadow";
    btn.style.backgroundColor = hex;
    btn.title = hex;
    btn.setAttribute("aria-label", `Select ${hex}`);
    btn.addEventListener("click", () => setActive(hex));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className =
      "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--color-fg)] text-[var(--color-bg)] text-xs leading-none opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center";
    remove.textContent = "×";
    remove.title = `Remove ${hex}`;
    remove.setAttribute("aria-label", `Remove ${hex} from palette`);
    remove.addEventListener("click", (e) => {
      e.stopPropagation();
      const next = removeFromPalette(hex);
      renderPalette(next);
    });

    wrap.appendChild(btn);
    wrap.appendChild(remove);
    paletteGrid.appendChild(wrap);
  }
}

// ----------------------------------------------------------------------
// Clipboard
// ----------------------------------------------------------------------

async function copyToClipboard(text: string, label: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`Copied ${label}: ${text}`);
  } catch {
    // Fallback for old browsers — synchronous, doesn't actually need permission
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      (document as Document & { execCommand: (cmd: string) => boolean }).execCommand("copy");
      showToast(`Copied ${label}: ${text}`);
    } catch {
      showToast("Could not copy — please copy manually");
    } finally {
      document.body.removeChild(ta);
    }
  }
}

function wireCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>(".copy-btn").forEach((b) => {
    b.addEventListener("click", () => {
      if (!activeHex) return;
      const which = b.getAttribute("data-copy");
      const rgb = parseHex(activeHex);
      if (!rgb) return;
      switch (which) {
        case "hex": void copyToClipboard(formatHex(rgb), "HEX"); break;
        case "rgb": void copyToClipboard(formatRgb(rgb), "RGB"); break;
        case "hsl": void copyToClipboard(formatHsl(rgb), "HSL"); break;
        case "oklch": void copyToClipboard(formatOklch(rgb), "OKLCH"); break;
      }
    });
  });

  // Big swatch is also clickable to copy hex
  if (swatchEl) {
    swatchEl.style.cursor = "pointer";
    swatchEl.setAttribute("role", "button");
    swatchEl.setAttribute("tabindex", "0");
    swatchEl.setAttribute("aria-label", "Click to copy HEX");
    const handler = () => {
      if (activeHex) void copyToClipboard(activeHex, "HEX");
    };
    swatchEl.addEventListener("click", handler);
    swatchEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  }
}

// ----------------------------------------------------------------------
// Main button handler
// ----------------------------------------------------------------------

async function handlePick(): Promise<void> {
  if (!pickBtn) return;
  pickBtn.disabled = true;
  try {
    const hex = await pickColor();
    if (!hex) return; // user cancelled
    setActive(hex);
    const next = addToPalette(formatHex(parseHex(hex)!));
    renderPalette(next);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    showToast(`Picker error: ${msg}`);
    console.warn("EyeDropper error:", err);
  } finally {
    pickBtn.disabled = false;
  }
}

// ----------------------------------------------------------------------
// Clear button
// ----------------------------------------------------------------------

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (readPalette().length === 0) return;
    if (!confirm("Clear all colors from history?")) return;
    clearPalette();
    renderPalette([]);
    showToast("Palette cleared");
  });
}

// ----------------------------------------------------------------------
// Boot
// ----------------------------------------------------------------------

configureForSupport();
wireCopyButtons();
renderPalette();

if (pickBtn) {
  pickBtn.addEventListener("click", () => {
    void handlePick();
  });
}

// Keyboard shortcut: P to pick (when not focused in input)
window.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
  if (e.key === "p" || e.key === "P") {
    if (!pickBtn || pickBtn.disabled) return;
    e.preventDefault();
    void handlePick();
  }
});
