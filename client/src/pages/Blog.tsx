/**
 * Blog / Strain Review Hub — Luxurious Habbits
 * SEO-focused content hub targeting THCA flower search queries.
 * Targets: "THCA flower review", "best THCA strains 2026", "indica vs sativa THCA", etc.
 */
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { ArrowRight, BookOpen, Leaf, FlaskConical, Star, Droplets } from "lucide-react";
import { getStrainColors } from "@/data/strainColors";

// Strain color helpers
const SATIVA_COLOR = getStrainColors("sativa").primary;   // red
const INDICA_COLOR = getStrainColors("indica").primary;   // purple
const HYBRID_COLOR = getStrainColors("hybrid").primary;   // green

// ─── Static article stubs — owner will add real content over time ─────────────
const FEATURED_ARTICLES = [
  {
    slug: "blue-dream-thca-strain-review",
    category: "Strain Guide",
    categoryColor: SATIVA_COLOR,
    title: "Blue Dream THCA Flower: Full Strain Review",
    excerpt:
      "Blue Dream is one of the most iconic strains in cannabis history — a pure sativa with a sweet berry aroma, powerful cerebral lift, and clean energetic effects. As a THCA hemp flower, it delivers the same legendary profile that has made it a benchmark strain for connoisseurs worldwide.",
    readTime: "7 min read",
    publishDate: "2026-03-15",
    tags: ["Blue Dream", "Strain Review", "Sativa", "THCA"],
    featured: true,
  },
  {
    slug: "what-is-thca-flower",
    category: "Education",
    categoryColor: "#00e5a0",
    title: "What Is THCA Flower? The Complete Guide",
    excerpt:
      "THCA (tetrahydrocannabinolic acid) is the raw, non-psychoactive precursor to THC found naturally in the hemp plant. When heated — through smoking, vaping, or cooking — THCA converts to THC via decarboxylation. This guide covers everything you need to know about THCA flower, its legal status, effects, and why it's become the premium choice for connoisseurs.",
    readTime: "8 min read",
    publishDate: "2026-01-15",
    tags: ["THCA", "Education", "Beginner Guide"],
    featured: true,
  },
  {
    slug: "thca-vs-thc-difference",
    category: "Education",
    categoryColor: "#00e5a0",
    title: "THCA vs THC: What's the Difference?",
    excerpt:
      "Many people confuse THCA with THC, but they are chemically distinct compounds with very different properties. THCA is non-psychoactive in its raw form and is federally legal under the 2018 Farm Bill when derived from hemp. THC is psychoactive and federally controlled. Understanding this distinction is essential for any hemp consumer.",
    readTime: "6 min read",
    publishDate: "2026-01-22",
    tags: ["THCA", "THC", "Chemistry", "Legal"],
    featured: true,
  },
  {
    slug: "is-thca-flower-legal",
    category: "Legal",
    categoryColor: "#bf5fff",
    title: "Is THCA Flower Legal? State-by-State Breakdown",
    excerpt:
      "THCA flower occupies a nuanced legal space. Federally, hemp-derived THCA flower containing ≤0.3% Δ9-THC on a dry weight basis is legal under the 2018 Farm Bill. However, several states have enacted their own restrictions. This article breaks down the current legal landscape and what you need to know before ordering.",
    readTime: "10 min read",
    publishDate: "2026-02-01",
    tags: ["Legal", "Farm Bill", "State Laws"],
    featured: false,
  },
  {
    slug: "indica-vs-sativa-thca",
    category: "Strain Guide",
    categoryColor: `linear-gradient(90deg, ${SATIVA_COLOR}, ${INDICA_COLOR})`,
    // gradient: sativa red → indica purple
    title: "Indica vs Sativa THCA Flower: Which Is Right for You?",
    excerpt:
      "The indica/sativa distinction is one of the most common frameworks for understanding cannabis effects. Indica strains are traditionally associated with body relaxation and evening use, while sativas are linked to uplifting, cerebral effects. This guide explores how these differences apply to THCA hemp flower and how to choose the right strain for your needs.",
    readTime: "7 min read",
    publishDate: "2026-02-10",
    tags: ["Indica", "Sativa", "Strain Guide", "Effects"],
    featured: false,
  },
  {
    slug: "how-to-read-coa",
    category: "Education",
    categoryColor: "#00e5a0",
    title: "How to Read a Certificate of Analysis (COA)",
    excerpt:
      "A Certificate of Analysis is the single most important document when buying THCA hemp flower. It tells you exactly what's in your product — cannabinoid percentages, terpene profiles, heavy metals, pesticides, and microbials. This guide teaches you how to read and verify a COA so you never buy blind.",
    readTime: "9 min read",
    publishDate: "2026-02-18",
    tags: ["COA", "Lab Testing", "Safety", "Education"],
    featured: false,
  },
  {
    slug: "best-thca-strains-2025",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "Best THCA Strains of 2026: Our Top Picks",
    excerpt:
      "The THCA hemp market has exploded with premium genetics in 2026. From legendary crosses to new boutique cultivars, the options are better than ever. We break down the top strains by category — best for relaxation, best for focus, best for sleep, and best overall — based on potency, terpene profile, and overall experience.",
    readTime: "12 min read",
    publishDate: "2026-03-01",
    tags: ["Strain Review", "Top Picks", "2026", "Recommendations"],
    featured: true,
  },
  {
    slug: "how-to-store-thca-flower",
    category: "Education",
    categoryColor: "#00e5a0",
    title: "How to Store THCA Flower: Keep It Fresh Longer",
    excerpt:
      "Proper storage is the single biggest factor in preserving the potency, aroma, and flavor of your THCA hemp flower after purchase. Light, heat, air, and humidity are the four enemies of fresh flower. This guide covers the best containers, humidity control packs, and long-term storage strategies to keep your flower at peak quality for months.",
    readTime: "6 min read",
    publishDate: "2026-04-05",
    tags: ["Storage", "Freshness", "THCA", "Tips"],
    featured: false,
  },
  {
    slug: "thca-terpenes-explained",
    category: "Education",
    categoryColor: "#00e5a0",
    title: "THCA Flower Terpenes Explained: Aroma, Flavor & the Entourage Effect",
    excerpt:
      "Terpenes are the aromatic compounds that give each cannabis strain its unique scent and flavor — and they do far more than just smell good. They interact with cannabinoids to shape your experience through what researchers call the entourage effect. This guide breaks down the most common THCA flower terpenes and what they mean for your experience.",
    readTime: "9 min read",
    publishDate: "2026-04-20",
    tags: ["Terpenes", "Entourage Effect", "Education", "Aroma"],
    featured: false,
  },
  {
    slug: "hemp-flower-vs-cbd-flower",
    category: "Education",
    categoryColor: "#00e5a0",
    title: "Hemp Flower vs CBD Flower vs THCA Flower: What's the Difference?",
    excerpt:
      "The terms hemp flower, CBD flower, and THCA flower are often used interchangeably — but they describe meaningfully different products. Understanding the distinction is essential for making an informed purchase. This guide breaks down each category, compares them side by side, and helps you choose the right product for your needs.",
    readTime: "7 min read",
    publishDate: "2026-05-01",
    tags: ["Hemp", "CBD", "THCA", "Education", "Comparison"],
    featured: false,
  },
  {
    slug: "thca-flower-beginners-guide",
    category: "Education",
    categoryColor: "#00e5a0",
    title: "THCA Flower for Beginners: Everything You Need to Know",
    excerpt:
      "New to THCA hemp flower? This complete beginner's guide covers everything — what THCA is, how it differs from CBD flower, how to use it safely, what effects to expect, and how to buy from a reputable source. Start here before you buy.",
    readTime: "10 min read",
    publishDate: "2026-05-15",
    tags: ["Beginner Guide", "THCA", "How To", "Education"],
    featured: true,
  },
  {
    slug: "og-kush-thca-strain-review",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "OG Kush THCA Flower: Full Strain Review",
    excerpt:
      "OG Kush is the foundation of modern cannabis genetics. As a THCA hemp flower, it delivers the same legendary earthy, piney, fuel-forward profile that defined a generation — with a balanced effect profile that works for afternoon or evening use.",
    readTime: "7 min read",
    publishDate: "2026-04-01",
    tags: ["OG Kush", "Strain Review", "Hybrid", "THCA"],
    featured: false,
  },
  {
    slug: "gelato-thca-strain-review",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "Gelato THCA Flower: Full Strain Review",
    excerpt:
      "Gelato is the definitive dessert strain — sweet, creamy, and potent. A cross between Sunset Sherbet and Thin Mint GSC, it represents the pinnacle of modern hybrid genetics with a rich terpene profile and a balanced, euphoric effect profile.",
    readTime: "7 min read",
    publishDate: "2026-04-10",
    tags: ["Gelato", "Strain Review", "Hybrid", "THCA"],
    featured: false,
  },
  {
    slug: "wedding-cake-thca-strain-review",
    category: "Strain Guide",
    categoryColor: INDICA_COLOR,
    title: "Wedding Cake THCA Flower: Full Strain Review",
    excerpt:
      "Wedding Cake is one of the most potent THCA hemp strains available — dense, frosty, and consistently testing above 25% THCA. A cross between Triangle Kush and Animal Mints, it delivers a rich doughy aroma and powerful, long-lasting effects best suited for experienced consumers.",
    readTime: "7 min read",
    publishDate: "2026-04-18",
    tags: ["Wedding Cake", "Strain Review", "Indica", "THCA"],
    featured: false,
  },
  {
    slug: "runtz-thca-strain-review",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "Runtz THCA Flower: Full Strain Review",
    excerpt:
      "Runtz is the candy strain — sweet, tropical, and visually stunning. A cross between Zkittlez and Gelato, it delivers one of the most unique flavor profiles in the hemp market with a balanced, euphoric effect profile that works for almost any occasion.",
    readTime: "7 min read",
    publishDate: "2026-05-05",
    tags: ["Runtz", "Strain Review", "Hybrid", "THCA"],
    featured: false,
  },
  {
    slug: "gmo-thca-strain-review",
    category: "Strain Guide",
    categoryColor: INDICA_COLOR,
    title: "GMO (Garlic Cookies) THCA Flower: Full Strain Review",
    excerpt:
      "GMO Cookies is the most pungent, savory strain in the premium hemp market — a garlic-forward, fuel-drenched indica powerhouse with some of the highest THCA percentages available. Not for the faint of heart.",
    readTime: "7 min read",
    publishDate: "2026-06-01",
    tags: ["GMO", "Garlic Cookies", "Strain Review", "Indica", "THCA"],
    featured: false,
  },
  {
    slug: "oreoz-thca-strain-review",
    category: "Strain Guide",
    categoryColor: INDICA_COLOR,
    title: "Oreoz THCA Flower: Full Strain Review",
    excerpt:
      "Oreoz is the ultimate dessert indica — chocolate, vanilla, and campfire s'mores wrapped in a deeply relaxing, long-lasting high. A celebrity strain from 3rd Coast Genetics that regularly tests 24–31% THCA.",
    readTime: "7 min read",
    publishDate: "2026-06-02",
    tags: ["Oreoz", "Strain Review", "Indica", "THCA"],
    featured: false,
  },
  {
    slug: "mac-thca-strain-review",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "MAC (Miracle Alien Cookies) THCA Flower: Full Strain Review",
    excerpt:
      "MAC is the benchmark balanced hybrid — orange creamsicle aroma, creative euphoria, and full-body calm without sedation. Bred by Capulator, it's a modern classic that works for any time of day.",
    readTime: "7 min read",
    publishDate: "2026-06-03",
    tags: ["MAC", "Miracle Alien Cookies", "Strain Review", "Hybrid", "THCA"],
    featured: false,
  },
  {
    slug: "zoap-thca-strain-review",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "Zoap THCA Flower: Full Strain Review",
    excerpt:
      "Zoap is a visually stunning hybrid from Deo Farms — dense purple-tinted buds, a sweet cherry-citrus aroma, and a euphoric balanced high. Winner of Best Strain at the 2024 Leafly Budtenders' Choice Awards.",
    readTime: "7 min read",
    publishDate: "2026-06-04",
    tags: ["Zoap", "Strain Review", "Hybrid", "THCA"],
    featured: false,
  },
  {
    slug: "white-truffle-thca-strain-review",
    category: "Strain Guide",
    categoryColor: INDICA_COLOR,
    title: "White Truffle THCA Flower: Full Strain Review",
    excerpt:
      "White Truffle is a savory, luxurious indica — butter, garlic, and nuts wrapped in a deeply calming high. Nevada's second-best-selling strain in 2025 and a High Times Cup finalist.",
    readTime: "7 min read",
    publishDate: "2026-06-05",
    tags: ["White Truffle", "Strain Review", "Indica", "THCA"],
    featured: false,
  },
  {
    slug: "sfv-og-thca-strain-review",
    category: "Strain Guide",
    categoryColor: INDICA_COLOR,
    title: "SFV OG THCA Flower: Full Strain Review",
    excerpt:
      "SFV OG is a legendary California OG cut — lemon-pine-diesel aroma, immediate mental calm, and a clean body relaxation that defines West Coast cannabis culture. Preserved through cloning for over two decades.",
    readTime: "7 min read",
    publishDate: "2026-06-06",
    tags: ["SFV OG", "San Fernando Valley OG", "Strain Review", "Indica", "THCA"],
    featured: false,
  },
  {
    slug: "rs11-thca-strain-review",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "RS11 (Rainbow Sherbet 11) THCA Flower: Full Strain Review",
    excerpt:
      "RS11 is a multi-award-winning California hybrid from Deo Farms — vibrant purple buds, sweet cherry-berry aroma, and a versatile high that transitions from creative uplift to deep body relaxation.",
    readTime: "7 min read",
    publishDate: "2026-06-07",
    tags: ["RS11", "Rainbow Sherbet 11", "Strain Review", "Hybrid", "THCA"],
    featured: false,
  },
  {
    slug: "zkittlez-thca-strain-review",
    category: "Strain Guide",
    categoryColor: INDICA_COLOR,
    title: "Zkittlez THCA Flower: Full Strain Review",
    excerpt:
      "Zkittlez — The Original Z — is a multiple Cannabis Cup winner with an unmatched fruit candy aroma, a euphoric creative onset, and a deeply relaxing body high. The definitive fruit candy indica.",
    readTime: "7 min read",
    publishDate: "2026-06-08",
    tags: ["Zkittlez", "The Original Z", "Strain Review", "Indica", "THCA"],
    featured: false,
  },
  {
    slug: "gsc-thca-strain-review",
    category: "Strain Guide",
    categoryColor: INDICA_COLOR,
    title: "GSC (Girl Scout Cookies) THCA Flower: Full Strain Review",
    excerpt:
      "GSC is one of the most awarded and influential cannabis strains ever bred — a Cookie Fam legend with a pungent dessert aroma, potent euphoria, and full-body relaxation. The genetic foundation of Gelato, Thin Mint, and more.",
    readTime: "7 min read",
    publishDate: "2026-06-09",
    tags: ["GSC", "Girl Scout Cookies", "Strain Review", "Indica", "THCA"],
    featured: false,
  },
  {
    slug: "grape-gas-thca-strain-review",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "Grape Gas THCA Flower: Full Strain Review",
    excerpt:
      "Grape Gas is an 8x award-winning hybrid from Compound Genetics — grape candy meets kerosene in one of the most distinctive and celebrated terpene profiles in premium cannabis. Leaflink's Best-Selling Flower in California 2019.",
    readTime: "7 min read",
    publishDate: "2026-06-10",
    tags: ["Grape Gas", "Strain Review", "Hybrid", "THCA"],
    featured: false,
  },
  {
    slug: "gary-payton-thca-strain-review",
    category: "Strain Guide",
    categoryColor: HYBRID_COLOR,
    title: "Gary Payton THCA Flower: Full Strain Review",
    excerpt:
      "Gary Payton is a Cookies x Powerzzzup collaboration named after the NBA Hall of Famer — gas and fruit loops in one even-keeled, award-winning hybrid. 2022 Emerald Cup finalist.",
    readTime: "7 min read",
    publishDate: "2026-06-11",
    tags: ["Gary Payton", "Strain Review", "Hybrid", "THCA"],
    featured: false,
  },
  {
    slug: "tangie-thca-strain-review",
    category: "Strain Guide",
    categoryColor: SATIVA_COLOR,
    title: "Tangie THCA Flower: Full Strain Review",
    excerpt:
      "Tangie is the definitive tangerine sativa — a 10x award-winning strain from DNA Genetics with an intensely refreshing citrus aroma and a burst of creative, euphoric energy. The go-to daytime sativa.",
    readTime: "7 min read",
    publishDate: "2026-06-12",
    tags: ["Tangie", "Strain Review", "Sativa", "THCA"],
    featured: false,
  },
  {
    slug: "jack-herer-thca-strain-review",
    category: "Strain Guide",
    categoryColor: SATIVA_COLOR,
    title: "Jack Herer THCA Flower: Full Strain Review",
    excerpt:
      "Jack Herer is a legendary sativa named after the cannabis activist — pine, citrus, and earthy herbs with a clear-headed, energizing high. Developed by Sensi Seeds in the 1990s and distributed by Dutch pharmacies as a medical-grade strain.",
    readTime: "7 min read",
    publishDate: "2026-06-13",
    tags: ["Jack Herer", "Strain Review", "Sativa", "THCA"],
    featured: false,
  },
];

const CATEGORIES = [
  { label: "All", value: "all", color: "oklch(0.60 0 0)" },
  { label: "Education", value: "Education", color: "#00e5a0" },
  { label: "Strain Guide", value: "Strain Guide", color: HYBRID_COLOR },
  { label: "Legal", value: "Legal", color: "#bf5fff" },
  { label: "Lab Testing", value: "Lab Testing", color: "#3b82f6" },
];

// Returns a safe CSS color for text (gradients can't be used as text color directly)
function getTextColor(color: string): string {
  return color.startsWith("linear-gradient") ? "#bf5fff" : color;
}

function ArticleCard({ article, large = false }: { article: typeof FEATURED_ARTICLES[0]; large?: boolean }) {
  return (
    <Link href={`/blog/${article.slug}`}>
      <div
        style={{
          background: "oklch(0.06 0 0 / 80%)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "8px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "border-color 200ms ease, transform 200ms ease",
          height: "100%",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 18%)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 8%)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Color accent bar — supports solid color or gradient */}
        <div style={{
          height: "3px",
          background: article.categoryColor,
          opacity: 0.85,
        }} />

        <div style={{ padding: large ? "2rem" : "1.5rem" }}>
          {/* Category + read time */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: getTextColor(article.categoryColor),
              fontWeight: 600,
            }}>
              {article.category}
            </span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.65rem",
              color: "oklch(0.35 0 0)",
            }}>
              {article.readTime}
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: large ? "1.8rem" : "1.25rem",
            letterSpacing: "0.04em",
            color: "oklch(0.96 0 0)",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
          }}>
            {article.title}
          </h2>

          {/* Excerpt */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.78rem",
            color: "oklch(0.50 0 0)",
            lineHeight: 1.7,
            marginBottom: "1.25rem",
            display: "-webkit-box",
            WebkitLineClamp: large ? 4 : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {article.excerpt}
          </p>

          {/* Tags */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                color: "oklch(0.40 0 0)",
                background: "oklch(0.08 0 0)",
                border: "1px solid oklch(1 0 0 / 6%)",
                borderRadius: "3px",
                padding: "0.2rem 0.5rem",
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Read more */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: getTextColor(article.categoryColor), fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", letterSpacing: "0.08em", fontWeight: 500 }}>
            Read Article <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const featured = FEATURED_ARTICLES.filter(a => a.featured);
  const strainGuide = FEATURED_ARTICLES.filter(a => a.category === "Strain Guide");
  const rest = FEATURED_ARTICLES.filter(a => !a.featured && a.category !== "Strain Guide");

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <SEO
        title="THCA Flower Blog & Strain Reviews"
        description="Expert guides on THCA flower, strain reviews, lab testing, and hemp education. Learn what THCA is, how to read a COA, the best strains of 2026, and more."
        keywords="THCA flower blog, THCA strain reviews, what is THCA, THCA vs THC, best THCA strains 2026, indica sativa hybrid THCA, how to read COA, THCA legal guide"
        canonical="/blog"
      />
      {/* RSS autodiscovery link */}
      <link rel="alternate" type="application/rss+xml" title="Luxurious Habbits Blog RSS" href="/blog/rss.xml" />

      {/* ── HERO ── */}
      <section style={{
        padding: "8rem 1.5rem 4rem",
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          maxWidth: "640px",
          margin: "0 auto",
          background: "oklch(0.04 0 0 / 82%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "12px",
          padding: "2.5rem 2.5rem 2rem",
        }}>
        <div className="section-label" style={{ marginBottom: "1rem" }}>
          Knowledge Hub · Strain Reviews · Education
        </div>
        <h1
          className="glitch"
          data-text="THE HABBITS"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(3rem, 10vw, 7rem)",
            letterSpacing: "0.05em",
            color: "oklch(0.96 0 0)",
            lineHeight: 0.95,
            marginBottom: "0.2rem",
          }}
        >
          THE HABBITS
        </h1>
        <h1
          className="text-holo"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(3rem, 10vw, 7rem)",
            letterSpacing: "0.05em",
            lineHeight: 0.95,
            marginBottom: "1.5rem",
          }}
        >
          JOURNAL
        </h1>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
          color: "oklch(0.55 0 0)",
          maxWidth: "520px",
          margin: "0 auto",
          lineHeight: 1.7,
          fontWeight: 300,
        }}>
          Expert guides, strain reviews, and everything you need to know about premium THCA hemp.
        </p>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section style={{ padding: "0 1.5rem 3rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {[
              { icon: <BookOpen size={18} />, label: "What Is THCA?", href: "/blog/what-is-thca-flower", color: "#00e5a0" },
              { icon: <Leaf size={18} />, label: "Strain Guide", href: "/blog/strain-guide", color: "#f5a623" },
              { icon: <FlaskConical size={18} />, label: "Read a COA", href: "/blog/how-to-read-coa", color: "#bf5fff" },
              { icon: <Droplets size={18} />, label: "Terpene Guide", href: "/blog/terpene-guide", color: "#00e5a0" },
              { icon: <Star size={18} />, label: "Legal Guide", href: "/blog/is-thca-flower-legal", color: "#3b82f6" },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div style={{
                  background: "oklch(0.06 0 0 / 80%)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                  transition: "border-color 150ms ease",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 18%)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 8%)"}
                >
                  <div style={{ color: item.color }}>{item.icon}</div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.75 0 0)", fontWeight: 500 }}>{item.label}</span>
                  <ArrowRight size={12} style={{ color: "oklch(0.35 0 0)", marginLeft: "auto" }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ARTICLES ── */}
      <section style={{ padding: "0 1.5rem 4rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div className="section-label" style={{ marginBottom: "0.5rem" }}>Featured</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
              ESSENTIAL READING
            </h2>
          </div>

          {/* Featured grid: 1 large + 2 small */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ gridRow: "span 2" }}>
              <ArticleCard article={featured[0]} large />
            </div>
            {featured.slice(1, 3).map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ── STRAIN GUIDE ── */}
      {strainGuide.length > 0 && (
        <section style={{ padding: "0 1.5rem 4rem" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div>
                <div className="section-label" style={{ marginBottom: "0.5rem", color: "#f5a623" }}>Strain Guide</div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
                  STRAIN REVIEWS
                </h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {strainGuide.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ALL ARTICLES ── */}
      <section style={{ padding: "0 1.5rem 6rem", background: "oklch(0.05 0 0 / 60%)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", paddingTop: "3rem" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div className="section-label" style={{ marginBottom: "0.5rem" }}>All Articles</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
              THE FULL LIBRARY
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {rest.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 1.5rem", textAlign: "center", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>Ready to Shop?</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>
            ONLY THE <span className="text-holo">FINEST.</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.50 0 0)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Every product we carry is third-party lab tested with a COA available. No compromises.
          </p>
          <Link href="/products">
            <button className="btn-gold"><span>Shop Premium THCA Flower</span></button>
          </Link>
        </div>
      </section>
    </div>
  );
}
