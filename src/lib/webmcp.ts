/**
 * WebMCP — progressive enhancement. Exposes the picker to in-browser AI
 * agents via navigator.modelContext when available. No-op otherwise; never
 * throws. Tools reuse the existing color functions / picker UI.
 */
import {
  parseHex,
  formatHex,
  formatRgb,
  formatHsl,
  formatOklch,
  contrastRatio,
  type Rgb,
} from "./colorFormats";

type ToolResult = { content: { type: "text"; text: string }[] };
const text = (t: string): ToolResult => ({ content: [{ type: "text", text: t }] });

/** Accepts "#abc", "#aabbcc" or "rgb(r, g, b)". */
export function parseColor(v: unknown): Rgb | null {
  if (typeof v !== "string") return null;
  const hex = parseHex(v);
  if (hex) return hex;
  const m = v.trim().match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/i);
  if (!m) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map(Number);
  return r <= 255 && g <= 255 && b <= 255 ? { r, g, b } : null;
}

export function registerWebMcp(opts: { pick: () => Promise<string | null>; pickButton: HTMLElement | null }): void {
  try {
    const mc = (navigator as unknown as { modelContext?: Record<string, unknown> }).modelContext;
    if (!mc) return;
    const tools = [
      {
        name: "pick_color",
        description:
          "Open the browser's native EyeDropper so the user can click any pixel on screen. Browsers require a real user gesture, so this may be refused; in that case the Pick button is focused and the user must click it.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          try {
            const hex = await opts.pick();
            if (!hex) {
              opts.pickButton?.focus();
              return text(
                'No color picked. Either the user cancelled, or the browser refused to open the EyeDropper without a real user click (a security requirement). I focused the "Pick a color" button; ask the user to click it, then read the result from the page.',
              );
            }
            const rgb = parseHex(hex)!;
            return text(`Picked ${formatHex(rgb)} · ${formatRgb(rgb)} · ${formatHsl(rgb)} · ${formatOklch(rgb)}`);
          } catch (e) {
            opts.pickButton?.focus();
            opts.pickButton?.scrollIntoView({ block: "center" });
            return text(
              `The EyeDropper could not open without a user gesture (${e instanceof Error ? e.message : String(e)}). I focused the "Pick a color" button — ask the user to click it.`,
            );
          }
        },
      },
      {
        name: "contrast_check",
        description: "Compute the WCAG 2.x contrast ratio between a foreground and background color (HEX or rgb()) and report AA/AAA pass/fail.",
        inputSchema: {
          type: "object",
          properties: { fg: { type: "string" }, bg: { type: "string" } },
          required: ["fg", "bg"],
        },
        execute: async (args: { fg?: string; bg?: string }) => {
          const fg = parseColor(args?.fg);
          const bg = parseColor(args?.bg);
          if (!fg || !bg) return text("Invalid color. Use #rgb, #rrggbb or rgb(r, g, b).");
          const r = contrastRatio(fg, bg);
          const pf = (n: number) => (r >= n ? "pass" : "fail");
          return text(
            `Contrast ${r.toFixed(2)}:1 (${formatHex(fg)} on ${formatHex(bg)}). Normal text: AA ${pf(4.5)}, AAA ${pf(7)}. Large text: AA ${pf(3)}, AAA ${pf(4.5)}. UI components: ${pf(3)}.`,
          );
        },
      },
      {
        name: "convert_color",
        description: "Convert a HEX or rgb() color to hex, rgb, hsl or oklch.",
        inputSchema: {
          type: "object",
          properties: {
            value: { type: "string" },
            to: { type: "string", enum: ["hex", "rgb", "hsl", "oklch", "all"] },
          },
          required: ["value"],
        },
        execute: async (args: { value?: string; to?: string }) => {
          const rgb = parseColor(args?.value);
          if (!rgb) return text("Invalid color. Use #rgb, #rrggbb or rgb(r, g, b).");
          const all: Record<string, string> = {
            hex: formatHex(rgb),
            rgb: formatRgb(rgb),
            hsl: formatHsl(rgb),
            oklch: formatOklch(rgb),
          };
          const to = (args?.to ?? "all").toLowerCase();
          return text(all[to] ?? Object.values(all).join(" · "));
        },
      },
    ];
    const reg = mc.registerTool as ((t: unknown) => void) | undefined;
    const provide = mc.provideContext as ((c: unknown) => void) | undefined;
    if (typeof reg === "function") tools.forEach((t) => reg.call(mc, t));
    else if (typeof provide === "function") provide.call(mc, { tools });
  } catch {
    /* never throw */
  }
}
