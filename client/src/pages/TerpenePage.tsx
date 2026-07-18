/**
 * TerpenePage — Luxurious Habbits
 * Individual terpene deep-dive page at /blog/terpene-guide/:slug
 * SEO-optimized with JSON-LD structured data + live product wheel with Add to Cart
 */

import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import SEO from "@/components/SEO";
import { getTerpeneBySlug, TERPENES } from "@/data/terpenes";
import { ChevronLeft, ShoppingBag, Leaf, FlaskConical, Sparkles, ArrowRight, MapPin, Heart } from "lucide-react";
import { getStrainReviewUrl } from "@/data/strainReviewLinks";
import { TerpeneMolecule } from "@/components/TerpeneMolecule";
import { toast } from "sonner";

function ProductCard({ row }: { row: any }) {
  const { addItem } = useCart();
  const product = row.product;
  const vendor = row.vendor;

  const displayPrice = product.retailPrice ? parseFloat(product.retailPrice).toFixed(2) : null;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.retailPrice ?? "0",
      imageUrl: product.imageUrl ?? undefined,
      quantity: 1,
      vendorName: vendor?.hideVendor ? undefined : vendor?.name,
    });
    toast.success(`Added to cart`, { description: product.name });
  };

  return (
    <div style={{
      background: "oklch(0.07 0 0)",
      border: "1px solid oklch(1 0 0 / 10%)",
      borderRadius: "12px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "border-color 200ms ease, transform 200ms ease",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#bf5fff40"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 10%)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div style={{ height: "180px", background: "oklch(0.05 0 0)", overflow: "hidden", cursor: "pointer", position: "relative" }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={32} style={{ color: "oklch(0.20 0 0)" }} />
            </div>
          )}
          {product.strainType && (
            <div style={{
              position: "absolute", top: "0.5rem", left: "0.5rem",
              background: product.strainType === "sativa" ? "#ff4444" : product.strainType === "indica" ? "#bf5fff" : "#2ecc71",
              color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "4px",
            }}>
              {product.strainType}
            </div>
          )}
          {row.percentage && parseFloat(row.percentage) > 0 && (
            <div style={{
              position: "absolute", top: "0.5rem", right: "0.5rem",
              background: "oklch(0.04 0 0 / 80%)", backdropFilter: "blur(4px)",
              border: "1px solid #bf5fff40", color: "#bf5fff",
              fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "4px",
            }}>
              {parseFloat(row.percentage).toFixed(2)}% terp
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Link href={`/products/${product.slug}`}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)", cursor: "pointer" }}>
            {product.name}
          </div>
        </Link>
        {vendor && !vendor.hideVendor && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.40 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {vendor.name}
          </div>
        )}
        {product.thcaPercent && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#bf5fff" }}>
            THCA {product.thcaPercent}%
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.05em", color: "oklch(0.90 0 0)" }}>
            {displayPrice ? `$${displayPrice}` : "—"}
          </div>
          <button
            onClick={handleAdd}
            disabled={!displayPrice}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              background: displayPrice ? "#bf5fff" : "oklch(0.15 0 0)",
              color: displayPrice ? "#fff" : "oklch(0.35 0 0)",
              border: "none", borderRadius: "6px",
              fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "0.5rem 0.85rem", cursor: displayPrice ? "pointer" : "default",
              transition: "background 150ms ease, transform 100ms ease",
            }}
            onMouseEnter={e => { if (displayPrice) e.currentTarget.style.background = "#a855f7"; }}
            onMouseLeave={e => { if (displayPrice) e.currentTarget.style.background = "#bf5fff"; }}
            onMouseDown={e => { if (displayPrice) e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={e => { if (displayPrice) e.currentTarget.style.transform = "scale(1)"; }}
          >
            <ShoppingBag size={12} />
            {displayPrice ? "Add to Cart" : "Set Price"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TerpenePage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  const terpene = getTerpeneBySlug(slug ?? "");

  const { data: products, isLoading: productsLoading } = trpc.terpenes.getProductsByTerpene.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  if (!terpene) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SEO title="Terpene Not Found — Luxurious Habbits" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)", marginBottom: "1rem" }}>
            TERPENE NOT FOUND
          </div>
          <button onClick={() => setLocation("/blog/terpene-guide")} style={{ background: "none", border: "1px solid #bf5fff", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}>
            Back to Terpene Guide
          </button>
        </div>
      </div>
    );
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${terpene.name} — Hemp Terpene Guide`,
    "description": terpene.description,
    "keywords": [terpene.name, ...terpene.aromatags, ...terpene.effects, "hemp terpenes", "cannabis terpenes", "THCA flower terpenes"].join(", "),
    "author": { "@type": "Organization", "name": "Luxurious Habbits" },
    "publisher": { "@type": "Organization", "name": "Luxurious Habbits", "url": "https://luxurioushabbits.com" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://luxurioushabbits.com/blog/terpene-guide/${terpene.slug}` },
  };

  const hasProducts = products && products.length > 0;

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title={`${terpene.name} Terpene — Effects, Aroma & Hemp Strains | Luxurious Habbits`}
        description={`${terpene.description.slice(0, 155)}...`}
        keywords={[terpene.name, `${terpene.name} effects`, `${terpene.name} hemp`, `${terpene.name} cannabis`, ...terpene.aromatags, ...terpene.effects, "hemp terpenes", "THCA flower terpenes"].join(", ")}
        canonical={`/blog/terpene-guide/${terpene.slug}`}
      />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 6rem" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <button onClick={() => setLocation("/blog")} style={{ background: "none", border: "none", color: "oklch(0.35 0 0)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", padding: 0 }}>Journal</button>
          <span>/</span>
          <button onClick={() => setLocation("/blog/terpene-guide")} style={{ background: "none", border: "none", color: "oklch(0.35 0 0)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", padding: 0 }}>Terpene Guide</button>
          <span>/</span>
          <span style={{ color: "oklch(0.55 0 0)" }}>{terpene.name}</span>
        </nav>

        {/* Back button */}
        <button
          onClick={() => setLocation("/blog/terpene-guide")}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", color: "oklch(0.40 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: 0, marginBottom: "2rem", transition: "color 150ms ease" }}
          onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.70 0 0)")}
          onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.40 0 0)")}
        >
          <ChevronLeft size={14} />
          All Terpenes
        </button>

        {/* Hero */}
        <div style={{
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "16px",
          padding: "2.5rem",
          marginBottom: "2.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Accent glow */}
          <div style={{
            position: "absolute", top: 0, right: 0, width: "300px", height: "300px",
            background: `radial-gradient(circle, ${terpene.color}15 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Left: text content */}
            <div style={{ flex: "1 1 320px" }}>
            {/* Accent bar */}
            <div style={{ width: "3px", height: "2.5rem", background: terpene.color, borderRadius: "2px", marginBottom: "1.25rem" }} />

            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
              letterSpacing: "0.05em",
              color: "oklch(0.96 0 0)",
              lineHeight: 0.95,
              marginBottom: "0.75rem",
            }}>
              {terpene.name}
            </h1>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", letterSpacing: "0.15em", color: terpene.color, textTransform: "uppercase", marginBottom: "1.5rem" }}>
              {terpene.aroma}
            </p>

            {/* Research notes chips */}
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em", color: "oklch(0.35 0 0)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Research Notes</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {terpene.effects.map(effect => (
                <span key={effect} style={{
                  background: "oklch(0.09 0 0)",
                  border: `1px solid ${terpene.color}40`,
                  color: terpene.color,
                  fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "0.3rem 0.7rem", borderRadius: "20px",
                }}>
                  {effect}
                </span>
              ))}
            </div>

            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "oklch(0.65 0 0)", lineHeight: 1.75, maxWidth: "700px" }}>
              {terpene.description}
            </p>
            </div>{/* end left */}

            {/* Right: molecule visualization */}
            <div style={{
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1.5rem",
              background: "oklch(0.04 0 0 / 60%)",
              border: `1px solid ${terpene.color}20`,
              borderRadius: "12px",
              minWidth: "200px",
            }}>
              <TerpeneMolecule slug={terpene.slug} size={180} />
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                color: "oklch(0.35 0 0)",
                textTransform: "uppercase",
                textAlign: "center",
              }}>
                Molecular Structure
              </div>
              {terpene.formula && (
                <div style={{
                  fontFamily: "'Inter', monospace",
                  fontSize: "0.7rem",
                  color: terpene.color,
                  letterSpacing: "0.05em",
                  opacity: 0.8,
                }}>
                  {terpene.formula}
                </div>
              )}
            </div>
          </div>{/* end flex row */}
        </div>

        {/* The Science */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FlaskConical size={20} style={{ color: terpene.color }} />
            The Science
          </h2>
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "1.75rem" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.60 0 0)", lineHeight: 1.8, margin: 0 }}>
              {terpene.science}
            </p>
          </div>
        </div>

        {/* Aroma Profile */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={20} style={{ color: terpene.color }} />
            Aroma Profile
          </h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {terpene.aromatags.map(tag => (
              <div key={tag} style={{
                background: "oklch(0.06 0 0)",
                border: `1px solid ${terpene.color}30`,
                borderRadius: "10px",
                padding: "0.75rem 1.25rem",
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: terpene.color }}>{tag}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Found In Nature */}
        {terpene.naturalSources && terpene.naturalSources.length > 0 && (
          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={20} style={{ color: terpene.color }} />
              Found In Nature
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.40 0 0)", marginBottom: "1rem", lineHeight: 1.6 }}>
              {terpene.name} occurs naturally in these plants, fruits, and foods — not just cannabis.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {terpene.naturalSources.map(source => (
                <div key={source} style={{
                  background: "oklch(0.06 0 0)",
                  border: `1px solid ${terpene.color}25`,
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 500,
                  color: "oklch(0.65 0 0)",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                }}>
                  <span style={{ color: terpene.color, fontSize: "0.6rem" }}>◆</span>
                  {source}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Potential Benefits */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Heart size={20} style={{ color: terpene.color }} />
            Potential Benefits
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.35 0 0)", marginBottom: "1rem", lineHeight: 1.6 }}>
            Based on available research. These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {terpene.effects.map(effect => (
              <div key={effect} style={{
                background: "oklch(0.06 0 0)",
                border: `1px solid ${terpene.color}30`,
                borderRadius: "10px",
                padding: "1rem 1.25rem",
                display: "flex", alignItems: "center", gap: "0.6rem",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: terpene.color, flexShrink: 0 }} />
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.72 0 0)" }}>{effect}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Strains */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Leaf size={20} style={{ color: terpene.color }} />
            Commonly Found In These Strains
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.40 0 0)", marginBottom: "1rem", lineHeight: 1.6 }}>
            These cannabis and hemp strains are known to carry high concentrations of {terpene.name}. Click any strain to read our full review.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {terpene.strains.map(strain => {
              const reviewUrl = getStrainReviewUrl(strain);
              const chipStyle = {
                background: "oklch(0.07 0 0)",
                border: reviewUrl ? `1px solid ${terpene.color}50` : "1px solid oklch(1 0 0 / 10%)",
                color: reviewUrl ? terpene.color : "oklch(0.55 0 0)",
                fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: reviewUrl ? 600 : 500,
                padding: "0.4rem 0.85rem", borderRadius: "6px",
                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                transition: "border-color 150ms ease, background 150ms ease",
                cursor: reviewUrl ? "pointer" : "default",
                textDecoration: "none" as const,
              };
              return reviewUrl ? (
                <Link key={strain} href={reviewUrl}>
                  <span style={chipStyle}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${terpene.color}15`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.07 0 0)"; }}
                  >
                    {strain}
                    <ArrowRight size={10} />
                  </span>
                </Link>
              ) : (
                <span key={strain} style={chipStyle}>{strain}</span>
              );
            })}
          </div>
        </div>

        {/* ── PRODUCT WHEEL ── */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.1em", color: "oklch(0.80 0 0)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShoppingBag size={20} style={{ color: terpene.color }} />
              Products Containing {terpene.name}
            </h2>
            <Link href="/products">
              <button style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "1px solid oklch(1 0 0 / 12%)", color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.5rem 0.85rem", borderRadius: "6px", cursor: "pointer", transition: "border-color 150ms ease, color 150ms ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = terpene.color; (e.currentTarget as HTMLButtonElement).style.color = terpene.color; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(1 0 0 / 12%)"; (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.45 0 0)"; }}
              >
                View All Products <ArrowRight size={12} />
              </button>
            </Link>
          </div>

          {productsLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: "320px", background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : hasProducts ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {products.map((row: any) => (
                <ProductCard key={row.product.id} row={row} />
              ))}
            </div>
          ) : (
            <div style={{
              background: "oklch(0.06 0 0)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: "12px",
              padding: "3rem 2rem",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "oklch(0.35 0 0)", marginBottom: "0.75rem" }}>
                NO PRODUCTS TAGGED YET
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.30 0 0)", marginBottom: "1.5rem", lineHeight: 1.7 }}>
                When we carry products with {terpene.name} in their terpene profile, they'll appear here automatically after their COA is uploaded.
              </p>
              <Link href="/products">
                <button style={{ background: "#bf5fff", color: "#fff", border: "none", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem 1.5rem", cursor: "pointer" }}>
                  Browse All Products
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Explore More Terpenes */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em", color: "oklch(0.60 0 0)", marginBottom: "1rem" }}>
            Explore More Terpenes
          </h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {TERPENES.filter(t => t.slug !== slug).slice(0, 8).map(t => (
              <Link key={t.slug} href={`/blog/terpene-guide/${t.slug}`}>
                <button style={{
                  background: "oklch(0.06 0 0)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  color: "oklch(0.55 0 0)",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500,
                  padding: "0.4rem 0.85rem", borderRadius: "6px", cursor: "pointer",
                  transition: "border-color 150ms ease, color 150ms ease",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.color; (e.currentTarget as HTMLButtonElement).style.color = t.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(1 0 0 / 8%)"; (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.55 0 0)"; }}
                >
                  {t.name}
                </button>
              </Link>
            ))}
            <Link href="/blog/terpene-guide">
              <button style={{
                background: "oklch(0.06 0 0)",
                border: "1px solid oklch(1 0 0 / 8%)",
                color: "#bf5fff",
                fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600,
                padding: "0.4rem 0.85rem", borderRadius: "6px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.3rem",
              }}>
                View All <ArrowRight size={11} />
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
