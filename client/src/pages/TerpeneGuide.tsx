/**
 * Terpene Guide Hub — Luxurious Habbits
 * /blog/terpene-guide — clickable cards for all terpenes in the full-panel COA
 * SEO-optimized with JSON-LD structured data
 */
import { useLocation, Link } from "wouter";
import SEO from "@/components/SEO";
import { TERPENES, PRIMARY_TERPENE_SLUGS } from "@/data/terpenes";
import { ChevronLeft, ArrowRight, Leaf, FlaskConical } from "lucide-react";

const primaryTerpenes = TERPENES.filter(t => PRIMARY_TERPENE_SLUGS.includes(t.slug));
const fullPanelTerpenes = TERPENES.filter(t => !PRIMARY_TERPENE_SLUGS.includes(t.slug));

function TerpeneCard({ terpene }: { terpene: typeof TERPENES[0] }) {
  return (
    <Link href={`/blog/terpene-guide/${terpene.slug}`}>
      <div
        style={{
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "12px",
          padding: "1.5rem",
          cursor: "pointer",
          transition: "border-color 200ms ease, transform 200ms ease, background 200ms ease",
          position: "relative",
          overflow: "hidden",
          height: "100%",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = `${terpene.color}60`;
          el.style.transform = "translateY(-3px)";
          el.style.background = "oklch(0.07 0 0)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "oklch(1 0 0 / 8%)";
          el.style.transform = "translateY(0)";
          el.style.background = "oklch(0.06 0 0)";
        }}
      >
        {/* Accent glow */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "120px", height: "120px",
          background: `radial-gradient(circle, ${terpene.color}12 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Accent bar */}
        <div style={{ width: "3px", height: "1.5rem", background: terpene.color, borderRadius: "2px", marginBottom: "0.85rem" }} />

        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)", marginBottom: "0.35rem" }}>
          {terpene.name}
        </div>

        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", color: terpene.color, textTransform: "uppercase", marginBottom: "0.75rem" }}>
          {terpene.aromatags.slice(0, 3).join(" · ")}
        </div>

        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
          {terpene.effects.slice(0, 3).map(effect => (
            <span key={effect} style={{
              background: `${terpene.color}15`,
              color: terpene.color,
              fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "0.2rem 0.5rem", borderRadius: "20px",
            }}>
              {effect}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Learn More <ArrowRight size={10} />
        </div>
      </div>
    </Link>
  );
}

export default function TerpeneGuide() {
  const [, setLocation] = useLocation();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Hemp Terpene Guide — Full Panel Tested Terpenes",
    "description": "Complete guide to hemp and cannabis terpenes. Learn about the effects, aromas, and science behind every terpene in a full-panel COA, including myrcene, limonene, beta-caryophyllene, linalool, and more.",
    "url": "https://luxurioushabbits.com/blog/terpene-guide",
    "publisher": { "@type": "Organization", "name": "Luxurious Habbits", "url": "https://luxurioushabbits.com" },
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Hemp Terpene Guide — Full Panel Tested Terpenes | Luxurious Habbits"
        description="Complete guide to hemp terpenes. Learn the effects, aromas, and science behind every terpene in a full-panel COA — myrcene, limonene, beta-caryophyllene, linalool, and more. Find products by terpene profile."
        keywords="hemp terpenes, cannabis terpenes, what are terpenes, terpene effects, myrcene, limonene, beta-caryophyllene, linalool, terpene guide, THCA flower terpenes, full panel terpene test"
        canonical="/blog/terpene-guide"
      />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 6rem" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <button onClick={() => setLocation("/blog")} style={{ background: "none", border: "none", color: "oklch(0.35 0 0)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", padding: 0 }}>Journal</button>
          <span>/</span>
          <span style={{ color: "oklch(0.55 0 0)" }}>Terpene Guide</span>
        </nav>

        {/* Back */}
        <button
          onClick={() => setLocation("/blog")}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", color: "oklch(0.40 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0, marginBottom: "2rem", transition: "color 150ms ease" }}
          onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.70 0 0)")}
          onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.40 0 0)")}
        >
          <ChevronLeft size={14} />
          The Journal
        </button>

        {/* Hero */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "oklch(0.35 0 0)", textTransform: "uppercase", marginBottom: "1rem" }}>
            Luxurious Habbits · Education Series
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            letterSpacing: "0.05em",
            color: "oklch(0.96 0 0)",
            lineHeight: 0.95,
            marginBottom: "1.25rem",
          }}>
            Terpene Guide
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", color: "oklch(0.55 0 0)", lineHeight: 1.75, maxWidth: "700px", marginBottom: "1.5rem" }}>
            Terpenes are the aromatic compounds that give hemp and cannabis their distinctive scents and flavors — but they do far more than smell good. Each terpene has a unique aroma and flavor profile that works synergistically with cannabinoids through the <strong style={{ color: "oklch(0.70 0 0)" }}>entourage effect</strong>.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.40 0 0)", lineHeight: 1.7, maxWidth: "700px" }}>
            Our products are tested for a full terpene panel. Click any terpene below to learn about its effects, aroma profile, the science behind it, and which products we carry that contain it.
          </p>
        </div>

        {/* Entourage Effect Explainer */}
        <div style={{
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "3rem",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}>
          <div style={{ width: "48px", height: "48px", background: "#bf5fff20", border: "1px solid #bf5fff40", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FlaskConical size={22} style={{ color: "#bf5fff" }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.1em", color: "oklch(0.85 0 0)", marginBottom: "0.5rem" }}>
              The Entourage Effect
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.50 0 0)", lineHeight: 1.75, margin: 0 }}>
              The entourage effect is the theory — supported by growing research — that cannabinoids and terpenes work better together than in isolation. A strain rich in myrcene and linalool will feel different from one dominated by limonene and terpinolene, even at the same THCA percentage. This is why full-panel terpene testing matters: it tells you the complete story of what you're consuming.
            </p>
          </div>
        </div>

        {/* Primary Terpenes */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ width: "3px", height: "1.5rem", background: "#bf5fff", borderRadius: "2px" }} />
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", margin: 0 }}>
              Primary Terpenes
            </h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Most commonly studied
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {primaryTerpenes.map(t => <TerpeneCard key={t.slug} terpene={t} />)}
          </div>
        </div>

        {/* Full Panel */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ width: "3px", height: "1.5rem", background: "oklch(0.35 0 0)", borderRadius: "2px" }} />
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", margin: 0 }}>
              Full Panel Tested Terpenes
            </h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {TERPENES.length} terpenes tested
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {fullPanelTerpenes.map(t => <TerpeneCard key={t.slug} terpene={t} />)}
          </div>
        </div>

        {/* How to Choose */}
        <div style={{
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "16px",
          padding: "2.5rem",
          marginBottom: "3rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Leaf size={18} style={{ color: "#bf5fff" }} />
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", margin: 0 }}>
              How to Choose by Terpene Profile
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {[
              { title: "Earthy & Musky Profiles", terpenes: "Myrcene, Linalool, Terpineol, Nerolidol", desc: "Strains high in myrcene (>0.5%) combined with linalool tend to have classic indica-style aromas — earthy, floral, and grounding. These are the most common terpenes in heavy-hitting indica profiles." },
              { title: "Citrus & Pine Profiles", terpenes: "Limonene, Terpinolene, Ocimene, alpha-Pinene", desc: "Citrus-forward strains high in limonene and terpinolene have bright, uplifting aromas. Alpha-pinene adds a fresh pine note and is one of the most abundant terpenes in nature." },
              { title: "Spicy & Woody Profiles", terpenes: "beta-Caryophyllene, alpha-Humulene, Linalool", desc: "Beta-caryophyllene delivers a spicy, peppery kick and is one of the most researched terpenes in cannabis science. Often found alongside humulene, which adds an earthy, hoppy character." },
              { title: "Citrus & Floral Profiles", terpenes: "Limonene, Linalool, beta-Caryophyllene", desc: "This trio produces some of the most recognizable aromas in hemp — bright citrus from limonene, soft floral notes from linalool, and a spicy backbone from caryophyllene. A crowd-favorite combination." },
            ].map(item => (
              <div key={item.title} style={{ background: "oklch(0.04 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", marginBottom: "0.35rem" }}>{item.title}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "#bf5fff", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{item.terpenes}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)", lineHeight: 1.65 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/products">
            <button style={{ background: "#bf5fff", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.85rem 1.75rem", cursor: "pointer", transition: "background 150ms ease" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#a855f7")}
              onMouseLeave={e => (e.currentTarget.style.background = "#bf5fff")}
            >
              Shop Products
            </button>
          </Link>
          <Link href="/coa">
            <button style={{ background: "none", color: "oklch(0.65 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.85rem 1.75rem", cursor: "pointer", transition: "border-color 150ms ease, color 150ms ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(1 0 0 / 30%)"; (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.85 0 0)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(1 0 0 / 15%)"; (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.65 0 0)"; }}
            >
              View Lab Results
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
