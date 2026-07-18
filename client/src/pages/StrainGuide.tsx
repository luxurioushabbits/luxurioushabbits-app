/**
 * Strain Guide Hub — Luxurious Habbits
 * SEO-focused strain index. Each card links to a full strain review.
 * Only add strains here when owner provides them.
 */
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { ArrowLeft, ArrowRight, Leaf } from "lucide-react";
import { getStrainColors } from "@/data/strainColors";

// ─── Strains — all 5 reviewed strains with correct color system ───────────────
// Sativa = red (#ff4444) | Indica = purple (#bf5fff) | Hybrid = green (#2ecc71)
const STRAINS = [
  {
    slug: "blue-dream-thca-strain-review",
    name: "Blue Dream",
    type: "Pure Sativa",
    typeColor: getStrainColors("sativa").primary,
    tagline: "The benchmark sativa. Sweet berry, cerebral lift, smooth smoke.",
    tags: ["Sativa", "Blue Dream", "THCA", "Strain Review"],
    thca: "18–26%",
    terpenes: ["Myrcene", "Caryophyllene", "Terpinolene", "Pinene"],
    effects: ["Uplifting", "Creative", "Focused", "Energetic"],
  },
  {
    slug: "og-kush-thca-strain-review",
    name: "OG Kush",
    type: "Hybrid",
    typeColor: getStrainColors("hybrid").primary,
    tagline: "The original. Earthy, piney, fuel-forward. The genetic backbone of modern cannabis.",
    tags: ["Hybrid", "OG Kush", "THCA", "Strain Review"],
    thca: "20–26%",
    terpenes: ["Myrcene", "Limonene", "Caryophyllene", "Pinene"],
    effects: ["Euphoric", "Relaxing", "Focused", "Sociable"],
  },
  {
    slug: "gelato-thca-strain-review",
    name: "Gelato",
    type: "Hybrid",
    typeColor: getStrainColors("hybrid").primary,
    tagline: "The definitive dessert strain. Sweet, creamy, and potent. Modern hybrid perfection.",
    tags: ["Hybrid", "Gelato", "THCA", "Strain Review"],
    thca: "22–27%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene", "Linalool"],
    effects: ["Euphoric", "Creative", "Relaxing", "Uplifting"],
  },
  {
    slug: "wedding-cake-thca-strain-review",
    name: "Wedding Cake",
    type: "Indica-Dominant Hybrid",
    typeColor: getStrainColors("indica").primary,
    tagline: "One of the most potent THCA strains available. Dense, frosty, and consistently above 25%.",
    tags: ["Indica", "Wedding Cake", "THCA", "Strain Review"],
    thca: "23–28%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    effects: ["Euphoric", "Relaxing", "Sedating", "Body High"],
  },
  {
    slug: "runtz-thca-strain-review",
    name: "Runtz",
    type: "Balanced Hybrid",
    typeColor: getStrainColors("hybrid").primary,
    tagline: "The candy strain. Sweet, tropical, and visually stunning. Zkittlez × Gelato perfection.",
    tags: ["Hybrid", "Runtz", "THCA", "Strain Review"],
    thca: "19–24%",
    terpenes: ["Caryophyllene", "Limonene", "Linalool"],
    effects: ["Euphoric", "Happy", "Creative", "Sociable"],
  },
  {
    slug: "gmo-thca-strain-review",
    name: "GMO (Garlic Cookies)",
    type: "Indica-Dominant Hybrid",
    typeColor: getStrainColors("indica").primary,
    tagline: "The most pungent indica. Garlic, diesel, and deep sedation. Not for the faint of heart.",
    tags: ["Indica", "GMO", "Garlic Cookies", "THCA", "Strain Review"],
    thca: "22–34%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    effects: ["Euphoric", "Relaxing", "Sedating", "Pain Relief"],
  },
  {
    slug: "oreoz-thca-strain-review",
    name: "Oreoz",
    type: "Indica-Dominant Hybrid",
    typeColor: getStrainColors("indica").primary,
    tagline: "The ultimate dessert indica. Chocolate, vanilla, s'mores. Deep, long-lasting relaxation.",
    tags: ["Indica", "Oreoz", "THCA", "Strain Review"],
    thca: "24–31%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    effects: ["Euphoric", "Relaxing", "Sedating", "Hungry"],
  },
  {
    slug: "mac-thca-strain-review",
    name: "MAC (Miracle Alien Cookies)",
    type: "Balanced Hybrid",
    typeColor: getStrainColors("hybrid").primary,
    tagline: "The benchmark hybrid. Orange creamsicle aroma, creative euphoria, full-body calm.",
    tags: ["Hybrid", "MAC", "Miracle Alien Cookies", "THCA", "Strain Review"],
    thca: "20–30%",
    terpenes: ["Limonene", "Caryophyllene", "Pinene"],
    effects: ["Euphoric", "Creative", "Focused", "Relaxing"],
  },
  {
    slug: "zoap-thca-strain-review",
    name: "Zoap",
    type: "Balanced Hybrid",
    typeColor: getStrainColors("hybrid").primary,
    tagline: "Award-winning hybrid. Purple buds, cherry-citrus aroma, euphoric and balanced.",
    tags: ["Hybrid", "Zoap", "THCA", "Strain Review"],
    thca: "25–33%",
    terpenes: ["Caryophyllene", "Limonene", "Linalool"],
    effects: ["Euphoric", "Giggly", "Creative", "Relaxing"],
  },
  {
    slug: "white-truffle-thca-strain-review",
    name: "White Truffle",
    type: "Indica-Dominant Hybrid",
    typeColor: getStrainColors("indica").primary,
    tagline: "Luxury indica. Butter, garlic, nuts. Deeply calming without overwhelming couch-lock.",
    tags: ["Indica", "White Truffle", "THCA", "Strain Review"],
    thca: "23–30%",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Calming", "Relaxing", "Sedating", "Stress Relief"],
  },
  {
    slug: "sfv-og-thca-strain-review",
    name: "SFV OG",
    type: "Indica-Dominant Hybrid",
    typeColor: getStrainColors("indica").primary,
    tagline: "Legendary California OG cut. Lemon-pine-diesel. Immediate mental calm, clean body relaxation.",
    tags: ["Indica", "SFV OG", "San Fernando Valley OG", "THCA", "Strain Review"],
    thca: "22–34%",
    terpenes: ["Limonene", "Caryophyllene", "Myrcene"],
    effects: ["Calming", "Relaxing", "Focused", "Pain Relief"],
  },
  {
    slug: "rs11-thca-strain-review",
    name: "RS11 (Rainbow Sherbet 11)",
    type: "Indica-Dominant Hybrid",
    typeColor: getStrainColors("hybrid").primary,
    tagline: "Multi-award-winning California hybrid. Vibrant purple buds, sweet cherry-berry, versatile high.",
    tags: ["Hybrid", "RS11", "Rainbow Sherbet 11", "THCA", "Strain Review"],
    thca: "22–36%",
    terpenes: ["Limonene", "Caryophyllene", "Humulene"],
    effects: ["Uplifting", "Creative", "Relaxing", "Happy"],
  },
  {
    slug: "zkittlez-thca-strain-review",
    name: "Zkittlez",
    type: "Indica-Dominant Hybrid",
    typeColor: getStrainColors("indica").primary,
    tagline: "The Original Z. Unmatched fruit candy aroma. Cannabis Cup winner. Euphoric and relaxing.",
    tags: ["Indica", "Zkittlez", "The Original Z", "THCA", "Strain Review"],
    thca: "17–29%",
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    effects: ["Euphoric", "Creative", "Relaxing", "Happy"],
  },
  {
    slug: "gsc-thca-strain-review",
    name: "GSC (Girl Scout Cookies)",
    type: "Indica-Dominant Hybrid",
    typeColor: getStrainColors("indica").primary,
    tagline: "A Cookie Fam legend. Pungent dessert aroma, potent euphoria, full-body relaxation.",
    tags: ["Indica", "GSC", "Girl Scout Cookies", "THCA", "Strain Review"],
    thca: "25–28%",
    terpenes: ["Caryophyllene", "Limonene", "Humulene"],
    effects: ["Euphoric", "Happy", "Relaxing", "Hungry"],
  },
  {
    slug: "grape-gas-thca-strain-review",
    name: "Grape Gas",
    type: "Hybrid",
    typeColor: getStrainColors("hybrid").primary,
    tagline: "8x award-winning hybrid. Grape candy meets kerosene. Energizing onset, deep body relaxation.",
    tags: ["Hybrid", "Grape Gas", "THCA", "Strain Review"],
    thca: "21–37%",
    terpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    effects: ["Euphoric", "Energizing", "Relaxing", "Pain Relief"],
  },
  {
    slug: "gary-payton-thca-strain-review",
    name: "Gary Payton",
    type: "Hybrid",
    typeColor: getStrainColors("hybrid").primary,
    tagline: "Cookies x Powerzzzup collaboration. Gas and fruit loops. Even-keeled, award-winning hybrid.",
    tags: ["Hybrid", "Gary Payton", "THCA", "Strain Review"],
    thca: "22–36%",
    terpenes: ["Caryophyllene", "Limonene", "Linalool"],
    effects: ["Euphoric", "Focused", "Relaxing", "Giggly"],
  },
  {
    slug: "tangie-thca-strain-review",
    name: "Tangie",
    type: "Sativa-Dominant Hybrid",
    typeColor: getStrainColors("sativa").primary,
    tagline: "The definitive tangerine sativa. 10x award-winner. Intensely citrusy, creative, and energizing.",
    tags: ["Sativa", "Tangie", "THCA", "Strain Review"],
    thca: "19–22%",
    terpenes: ["Myrcene", "Caryophyllene", "Pinene"],
    effects: ["Uplifting", "Creative", "Focused", "Energetic"],
  },
  {
    slug: "jack-herer-thca-strain-review",
    name: "Jack Herer",
    type: "Sativa-Dominant Hybrid",
    typeColor: getStrainColors("sativa").primary,
    tagline: "A legendary sativa. Pine, citrus, earthy herbs. Clear-headed energy and creativity.",
    tags: ["Sativa", "Jack Herer", "THCA", "Strain Review"],
    thca: "24–29%",
    terpenes: ["Terpinolene", "Caryophyllene", "Myrcene"],
    effects: ["Uplifting", "Creative", "Focused", "Energetic"],
  },
];

export default function StrainGuide() {
  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <SEO
        title="THCA Strain Guide — Reviews & Profiles"
        description="Honest strain reviews from the team at Luxurious Habbits — every strain we've smoked, broken down by genetics, terpenes, and real-world effects."
        keywords="THCA strain guide, THCA strain reviews, Blue Dream THCA, OG Kush THCA, Gelato THCA, Wedding Cake THCA, Runtz THCA, GMO THCA, Oreoz THCA, MAC THCA, Zoap THCA, White Truffle THCA, SFV OG THCA, RS11 THCA, Zkittlez THCA, GSC THCA, Grape Gas THCA, Gary Payton THCA, Tangie THCA, Jack Herer THCA, best THCA strains, hemp strain profiles, sativa indica hybrid THCA flower"
        canonical="/blog/strain-guide"
      />

      {/* ── HERO ── */}
      <section style={{ padding: "8rem 1.5rem 4rem", textAlign: "center", position: "relative" }}>
        {/* Back to Journal */}
        <Link href="/blog">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            fontFamily: "'Inter', sans-serif", fontSize: "0.72rem",
            color: "oklch(0.40 0 0)", letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: "pointer", marginBottom: "2.5rem",
          }}>
            <ArrowLeft size={12} /> Back to The Habbits Journal
          </div>
        </Link>

        <div className="section-label" style={{ marginBottom: "1rem", color: "#f5a623" }}>
          Smoked & Reviewed · Genetics · Terpenes · Real Effects
        </div>
        <h1
          className="glitch"
          data-text="STRAIN"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(3rem, 10vw, 7rem)",
            letterSpacing: "0.05em",
            color: "oklch(0.96 0 0)",
            lineHeight: 0.95,
            marginBottom: "0.2rem",
          }}
        >
          STRAIN
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
          GUIDE
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
          Every strain we've had the pleasure of smoking — honest reviews, terpene breakdowns, and the real experience behind the flower.
        </p>
      </section>

      {/* ── STRAIN GRID ── */}
      <section style={{ padding: "0 1.5rem 6rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {STRAINS.map(strain => (
              <Link key={strain.slug} href={`/blog/${strain.slug}`}>
                <div
                  style={{
                    background: "oklch(0.06 0 0 / 80%)",
                    border: "1px solid oklch(1 0 0 / 8%)",
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color 200ms ease, transform 200ms ease",
                    height: "100%",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#ff444466";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 8%)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Top accent bar — Sativa=red, Indica=purple, Hybrid=green */}
                  <div style={{ height: "3px", background: strain.typeColor, opacity: 0.85 }} />

                  <div style={{ padding: "1.75rem" }}>
                    {/* Type badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                      <Leaf size={13} style={{ color: strain.typeColor }} />
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.6rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: strain.typeColor,
                        fontWeight: 600,
                      }}>
                        {strain.type}
                      </span>
                    </div>

                    {/* Strain name */}
                    <h2 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "2rem",
                      letterSpacing: "0.05em",
                      color: "oklch(0.96 0 0)",
                      lineHeight: 1.0,
                      marginBottom: "0.5rem",
                    }}>
                      {strain.name}
                    </h2>

                    {/* Tagline */}
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontSize: "0.95rem",
                      color: "oklch(0.50 0 0)",
                      lineHeight: 1.6,
                      marginBottom: "1.25rem",
                    }}>
                      {strain.tagline}
                    </p>

                    {/* Stats row */}
                    <div style={{
                      display: "flex", gap: "1.5rem", marginBottom: "1.25rem",
                      paddingBottom: "1.25rem",
                      borderBottom: "1px solid oklch(1 0 0 / 6%)",
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.35 0 0)", marginBottom: "0.2rem" }}>THCA</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: strain.typeColor }}>{strain.thca}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.35 0 0)", marginBottom: "0.2rem" }}>Top Terpenes</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.55 0 0)" }}>{strain.terpenes.slice(0, 2).join(", ")}</div>
                      </div>
                    </div>

                    {/* Effects */}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                      {strain.effects.map(e => (
                        <span key={e} style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.6rem",
                          letterSpacing: "0.08em",
                          color: "oklch(0.45 0 0)",
                          background: "oklch(0.08 0 0)",
                          border: "1px solid oklch(1 0 0 / 6%)",
                          borderRadius: "3px",
                          padding: "0.2rem 0.5rem",
                        }}>
                          {e}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.4rem",
                      color: strain.typeColor,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      fontWeight: 500,
                    }}>
                      Read Full Review <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>


        </div>
      </section>

      {/* ── SHOP CTA ── */}
      <section style={{ padding: "5rem 1.5rem", textAlign: "center", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>Ready to Shop?</div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "0.05em",
            color: "oklch(0.96 0 0)",
            marginBottom: "1rem",
          }}>
            ONLY THE <span className="text-holo">FINEST.</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.50 0 0)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Every strain we carry is third-party lab tested with a full-panel COA available. No compromises.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products">
              <button className="btn-gold"><span>Shop Premium THCA Flower</span></button>
            </Link>
            <Link href="/strain-comparison">
              <button className="btn-outline-white"><span>Compare Strains</span></button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
