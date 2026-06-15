// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const SITE_URL = process.env.PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://colortrail.com";
const BASE_PATH = process.env.PUBLIC_BASE_PATH || "/";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  // "always" → built pages live at /foo/index.html and Astro.url.pathname
  // carries the trailing slash, matching Cloudflare Pages' 308 /foo → /foo/
  // behaviour. Keeps sitemap + canonical + internal links pointing straight
  // at the 200 URL (no redirect hop, no "Alternate page with canonical" in GSC).
  trailingSlash: "always",
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
