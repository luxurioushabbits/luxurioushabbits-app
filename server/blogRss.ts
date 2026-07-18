/**
 * Blog RSS Feed — Luxurious Habbits
 * Generates RSS 2.0 XML from static blog article metadata.
 * Served at GET /blog/rss.xml
 */
import type { Request, Response } from "express";

const BASE_URL = "https://www.luxurioushabbits.com";

const ARTICLES = [
  {
    slug: "blue-dream-thca-strain-review",
    title: "Blue Dream THCA Flower: Full Strain Review",
    excerpt:
      "Blue Dream is one of the most iconic strains in cannabis history — a pure sativa with a sweet berry aroma, powerful cerebral lift, and clean energetic effects. As a THCA hemp flower, it delivers the same legendary profile that has made it a benchmark strain for connoisseurs worldwide.",
    publishDate: "2026-03-15",
    category: "Strain Guide",
    tags: ["Blue Dream", "Strain Review", "Sativa", "THCA"],
  },
  {
    slug: "what-is-thca-flower",
    title: "What Is THCA Flower? The Complete Guide",
    excerpt:
      "THCA (tetrahydrocannabinolic acid) is the raw, non-psychoactive precursor to THC found naturally in the hemp plant. When heated — through smoking, vaping, or cooking — THCA converts to THC via decarboxylation. This guide covers everything you need to know about THCA flower, its legal status, effects, and why it's become the premium choice for connoisseurs.",
    publishDate: "2026-01-15",
    category: "Education",
    tags: ["THCA", "Education", "Beginner Guide"],
  },
  {
    slug: "thca-vs-thc-difference",
    title: "THCA vs THC: What's the Difference?",
    excerpt:
      "Many people confuse THCA with THC, but they are chemically distinct compounds with very different properties. THCA is non-psychoactive in its raw form and is federally legal under the 2018 Farm Bill when derived from hemp. THC is psychoactive and federally controlled.",
    publishDate: "2026-01-22",
    category: "Education",
    tags: ["THCA", "THC", "Chemistry", "Legal"],
  },
  {
    slug: "is-thca-flower-legal",
    title: "Is THCA Flower Legal? State-by-State Breakdown",
    excerpt:
      "THCA flower occupies a nuanced legal space. Federally, hemp-derived THCA flower containing ≤0.3% Δ9-THC on a dry weight basis is legal under the 2018 Farm Bill. However, several states have enacted their own restrictions.",
    publishDate: "2026-02-01",
    category: "Legal",
    tags: ["Legal", "Farm Bill", "State Laws"],
  },
  {
    slug: "how-to-read-a-coa",
    title: "How to Read a Certificate of Analysis (COA) for Hemp Flower",
    excerpt:
      "A Certificate of Analysis (COA) is the most important document in the hemp industry — it's the third-party lab report that verifies exactly what's in your product. This guide walks you through every section of a COA and explains what to look for.",
    publishDate: "2026-02-15",
    category: "Lab Testing",
    tags: ["COA", "Lab Testing", "Transparency", "Safety"],
  },
  {
    slug: "indica-vs-sativa-vs-hybrid-thca",
    title: "Indica vs Sativa vs Hybrid THCA Flower: Which Is Right for You?",
    excerpt:
      "The indica/sativa/hybrid classification system is the most widely used framework for choosing cannabis strains — but what does it actually mean for THCA hemp flower? This guide breaks down the real differences and helps you choose the right strain type.",
    publishDate: "2026-03-01",
    category: "Education",
    tags: ["Indica", "Sativa", "Hybrid", "Strain Types", "THCA"],
  },
  {
    slug: "thca-flower-storage-guide",
    title: "How to Store THCA Hemp Flower: The Complete Freshness Guide",
    excerpt:
      "Proper storage is the single biggest factor in preserving the potency, aroma, and flavor of your THCA hemp flower after purchase. Light, heat, air, and humidity are the four enemies of fresh flower.",
    publishDate: "2026-04-05",
    category: "Education",
    tags: ["Storage", "Freshness", "THCA", "Tips"],
  },
  {
    slug: "thca-terpenes-explained",
    title: "THCA Flower Terpenes Explained: Aroma, Flavor & the Entourage Effect",
    excerpt:
      "Terpenes are the aromatic compounds that give each cannabis strain its unique scent and flavor — and they do far more than just smell good. They interact with cannabinoids to shape your experience through what researchers call the entourage effect.",
    publishDate: "2026-04-20",
    category: "Education",
    tags: ["Terpenes", "Entourage Effect", "Education", "Aroma"],
  },
  {
    slug: "hemp-flower-vs-cbd-flower",
    title: "Hemp Flower vs CBD Flower vs THCA Flower: What's the Difference?",
    excerpt:
      "The terms hemp flower, CBD flower, and THCA flower are often used interchangeably — but they describe meaningfully different products. Understanding the distinction is essential for making an informed purchase.",
    publishDate: "2026-05-01",
    category: "Education",
    tags: ["Hemp", "CBD", "THCA", "Education", "Comparison"],
  },
  {
    slug: "thca-flower-beginners-guide",
    title: "THCA Flower for Beginners: Everything You Need to Know",
    excerpt:
      "New to THCA hemp flower? This complete beginner's guide covers everything — what THCA is, how it differs from CBD flower, how to use it safely, what effects to expect, and how to buy from a reputable source.",
    publishDate: "2026-05-15",
    category: "Education",
    tags: ["Beginner Guide", "THCA", "How To", "Education"],
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function handleBlogRss(_req: Request, res: Response) {
  const sorted = [...ARTICLES].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  const lastBuildDate = new Date(sorted[0]?.publishDate ?? Date.now()).toUTCString();

  const items = sorted
    .map((a) => {
      const pubDate = new Date(a.publishDate).toUTCString();
      const link = `${BASE_URL}/blog/${a.slug}`;
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(a.category)}</category>
      ${a.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Luxurious Habbits — THCA Flower Blog &amp; Strain Reviews</title>
    <link>${BASE_URL}/blog</link>
    <description>Expert guides on THCA flower, strain reviews, lab testing, and hemp education from Luxurious Habbits.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/og-image.jpg</url>
      <title>Luxurious Habbits</title>
      <link>${BASE_URL}/blog</link>
    </image>
${items}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
}
