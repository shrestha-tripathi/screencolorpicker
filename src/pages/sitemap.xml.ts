import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../site.config";

// Auto-derived sitemap: all static pages + blog collection.
// Edit STATIC_PAGES when you add a new static .astro page under src/pages/.

interface SitemapEntry {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  lastmod?: string;
}

const STATIC_PAGES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  // Keyword landing pages
  { path: "/screen-color-picker", changefreq: "weekly", priority: 0.9 },
  { path: "/oklch-color-picker", changefreq: "weekly", priority: 0.9 },
  { path: "/colorzilla-alternative", changefreq: "weekly", priority: 0.9 },
  // Top-level utility/info pages
  { path: "/install", changefreq: "monthly", priority: 0.7 },
  { path: "/faq", changefreq: "monthly", priority: 0.7 },
  { path: "/blog", changefreq: "weekly", priority: 0.7 },
  // Trust pages
  { path: "/about", changefreq: "monthly", priority: 0.5 },
  { path: "/contact", changefreq: "monthly", priority: 0.5 },
  { path: "/privacy", changefreq: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
  { path: "/terms", changefreq: "yearly", priority: 0.3 },
];

export const GET: APIRoute = async () => {
  const blogPosts = await getCollection("blog", ({ data }) => !data.draft);
  const blogEntries: SitemapEntry[] = blogPosts.map((p) => ({
    path: `/blog/${p.id}`,
    changefreq: "monthly",
    priority: 0.6,
    lastmod: (p.data.updatedDate ?? p.data.pubDate).toISOString(),
  }));

  const today = new Date().toISOString();
  const all = [...STATIC_PAGES, ...blogEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (e) => `  <url>
    <loc>${site.url}${e.path}</loc>
    <lastmod>${e.lastmod ?? today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
