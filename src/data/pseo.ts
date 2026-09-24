import { pseoA } from "./pseo-a";
import { pseoB } from "./pseo-b";

export interface PseoEntry {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  steps: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
  related: string[];
  /** Render the inline WCAG contrast checker widget */
  contrastTool?: boolean;
}

const multiMonitor: PseoEntry = {
  slug: "color-picker-multiple-monitors",
  title: "Color picker for multiple monitors — sample across screens",
  h1: "Color picker for multiple monitors",
  metaDescription:
    "Pick colors from any monitor in a multi-display setup, including a laptop screen plus external displays. Covers mixed scaling and color-profile differences between screens.",
  intro:
    "Many screen pickers only read the primary display or get confused by mixed DPI setups. The browser EyeDropper runs at the OS level, so the loupe follows your cursor onto any connected monitor and returns the pixel as that screen renders it.",
  steps: [
    "Open this page on any monitor.",
    "Click “Pick a color”, then move the cursor onto the other display.",
    "Click the pixel. The value comes back to this tab and is saved to your palette.",
    "To compare screens, pick the same element on each monitor and compare the two HEX values.",
  ],
  tips: [
    "Displays with different color profiles (say, a P3 laptop and an sRGB external) can report different values for the same content. That's color management at work, not a bug.",
    "Mixed scaling (150% plus 100%) can blend a pixel at edges. Sample flat areas.",
    "Screenshot mode lets you choose one specific screen in the share dialog, which is handy when the live picker cancels on focus changes.",
    "Keep the source window visible. Minimised windows can't be sampled.",
  ],
  faqs: [
    { q: "Why do I get different HEX values for the same image on two monitors?", a: "Each display has its own color profile, and the OS converts content per screen. The picker reports what's actually on screen there. For the source value, read it from the file or CSS." },
    { q: "Does it work with a TV or projector as a second screen?", a: "Yes. Any display the OS treats as a monitor can be sampled." },
    { q: "Does it need any permission to read other screens?", a: "The live EyeDropper needs none. The browser draws the loupe and hands back only the clicked color. Screenshot mode asks for screen-share permission each time." },
  ],
  related: ["color-picker-for-linux", "pick-color-from-video", "color-picker-for-chromebook"],
};

export const pseoEntries: PseoEntry[] = [...pseoA, ...pseoB, multiMonitor];
export const PSEO_BASE = "/guides";
