/**
 * Browser capability detection — feature-test only, never UA-sniff.
 *
 * The EyeDropper API ships only in Chromium browsers as of June 2026
 * (Chrome 95+, Edge 95+, Opera 81+, Brave). Firefox + Safari have publicly
 * declined to implement (Mozilla position: negative; WebKit: no signal).
 * Mobile Chromium has the API but the picker can only sample inside the
 * current tab — practically useless for the "pick from anywhere" promise.
 */

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperConstructor {
  new (): {
    open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult>;
  };
}

declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}

/** True iff EyeDropper API exists. SSR-safe (returns false on server). */
export function hasEyeDropper(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.EyeDropper === "function";
}

/** Rough mobile detection via UA Client Hints when available, fallback UA regex. */
export function isLikelyMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaHints = (navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  }).userAgentData;
  if (uaHints && typeof uaHints.mobile === "boolean") return uaHints.mobile;
  return /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent);
}

export type SupportLevel = "supported" | "mobile-warning" | "unsupported";

/** Combined verdict the UI banner uses. */
export function supportLevel(): SupportLevel {
  if (!hasEyeDropper()) return "unsupported";
  if (isLikelyMobile()) return "mobile-warning";
  return "supported";
}

/**
 * Open the eyedropper. Returns hex like "#a1b2c3" on success, null on user
 * cancel (AbortError). Rejects on unexpected errors so the caller can show
 * an inline error.
 */
export async function pickColor(
  signal?: AbortSignal,
): Promise<string | null> {
  if (typeof window === "undefined" || !window.EyeDropper) {
    throw new Error("EyeDropper API not available in this browser");
  }
  try {
    const dropper = new window.EyeDropper();
    const result = await dropper.open({ signal });
    return result.sRGBHex;
  } catch (err: unknown) {
    if (
      err instanceof DOMException &&
      (err.name === "AbortError" || err.name === "NotAllowedError")
    ) {
      return null; // user pressed Esc / clicked outside
    }
    throw err;
  }
}
