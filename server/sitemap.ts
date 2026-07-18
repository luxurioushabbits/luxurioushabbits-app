/**
 * sitemap.ts — Dynamic XML Sitemap Generator
 * Serves /sitemap.xml with all static pages + live products + blog posts.
 * Automatically pinged to Google/Bing on product publish via IndexNow.
 */
import { Request, Response } from "express";
import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const SITE_URL = "https://www.luxurioushabbits.com";

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/products", priority: "0.9", changefreq: "daily" },
  { loc: "/products/flower", priority: "0.8", changefreq: "weekly" },
  { loc: "/products/extracts", priority: "0.8", changefreq: "weekly" },
  { loc: "/products/accessories", priority: "0.8", changefreq: "weekly" },
  { loc: "/habbits-box", priority: "0.8", changefreq: "monthly" },
  { loc: "/blog", priority: "0.7", changefreq: "weekly" },
  { loc: "/our-story", priority: "0.6", changefreq: "monthly" },
  { loc: "/compliance", priority: "0.5", changefreq: "monthly" },
  { loc: "/faq", priority: "0.6", changefreq: "monthly" },
  { loc: "/contact", priority: "0.5", changefreq: "monthly" },
  { loc: "/terpene-guide", priority: "0.6", changefreq: "monthly" },
  { loc: "/strain-guide", priority: "0.6", changefreq: "monthly" },
  { loc: "/coa", priority: "0.5", changefreq: "monthly" },
  { loc: "/track-order", priority: "0.4", changefreq: "yearly" },
  { loc: "/terms", priority: "0.3", changefreq: "yearly" },
  { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
  { loc: "/shipping", priority: "0.4", changefreq: "monthly" },
  { loc: "/returns", priority: "0.4", changefreq: "monthly" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc: string, lastmod?: string, changefreq?: string, priority?: string): string {
  const parts = [`  <url>`, `    <loc>${escapeXml(SITE_URL + loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`    <priority>${priority}</priority>`);
  parts.push(`  </url>`);
  return parts.join("\n");
}

export async function handleSitemap(_req: Request, res: Response) {
  try {
    // Fetch live products (active only)
    const db = await getDb();
    if (!db) { res.status(503).send("Database unavailable"); return; }
    const liveProducts = await db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.isActive, true));

    // Static blog slugs (blog posts are currently static content)
    const staticBlogSlugs = [
      "blue-dream-thca-strain-review",
      "what-is-thca-flower",
      "thca-vs-thc-difference",
      "is-thca-flower-legal",
      "indica-vs-sativa-thca",
      "how-to-read-coa",
      "best-thca-strains-2025",
      "how-to-store-thca-flower",
      "thca-terpenes-explained",
      "hemp-flower-vs-cbd-flower",
      "thca-flower-beginners-guide",
    ];

    const today = new Date().toISOString().split("T")[0];

    const entries: string[] = [
      // Static pages
      ...STATIC_PAGES.map(p => urlEntry(p.loc, today, p.changefreq, p.priority)),
      // Product pages
      ...liveProducts.map((p: { slug: string; updatedAt: Date | null }) => {
        const lastmod = p.updatedAt
          ? new Date(p.updatedAt).toISOString().split("T")[0]
          : today;
        return urlEntry(`/products/${p.slug}`, lastmod, "weekly", "0.85");
      }),
      // Blog post pages
      ...staticBlogSlugs.map((slug: string) =>
        urlEntry(`/blog/${slug}`, today, "monthly", "0.65")
      ),
    ];

    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...entries,
      `</urlset>`,
    ].join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(xml);
  } catch (err) {
    console.error("[sitemap] Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
}
