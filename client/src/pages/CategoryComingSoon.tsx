/**
 * CategoryPage — Luxurious Habbits
 * Shows active products in a category, or Coming Soon + notify-me if none exist.
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import { ChevronLeft, Leaf, FlaskConical, Bell, CheckCircle, ArrowRight, Sparkles, Package, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getStrainColors } from "@/data/strainColors";

const TERPENE_COLORS = ["#00f5ff", "#bf5fff", "#7fff7f", "#ffb347", "#ff6b9d"];

function TerpeneBar({ name, percentage, color }: { name: string; percentage: number; color: string }) {
  const barWidth = Math.min((percentage / 1.5) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.22rem" }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.50 0 0)", width: "96px", flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
      <div style={{ flex: 1, height: "3px", background: "oklch(0.11 0 0)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${barWidth}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.56rem", color: "oklch(0.42 0 0)", width: "40px", textAlign: "right", flexShrink: 0 }}>{percentage.toFixed(3)}%</div>
    </div>
  );
}

// ── Category config ────────────────────────────────────────────────────────
interface CategoryConfig {
  slug: "flower" | "extracts" | "accessories";
  label: string;
  tagline: string;
  description: string;
  details: string[];
  accentColor: string;
  glowColor: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  seoTitle: string;
  seoDescription: string;
  keywords: string;
}

const CATEGORIES: Record<string, CategoryConfig> = {
  flower: {
    slug: "flower",
    label: "Hemp Flower",
    tagline: "The Finest Cuts. Coming Soon.",
    description:
      "We're curating an elite selection of premium THCA hemp flower — hand-selected small-batch cultivars from the highest-tier growers in the country. Every strain will be full-panel tested, COA-verified, and worthy of the Luxurious Habbits standard.",
    details: [
      "Hand-selected small-batch cultivars",
      "Full-panel third-party lab tested",
      "Sativa, Indica, and Hybrid varieties",
      "Whole flower & pre-rolls",
      "Vacuum-sealed, odor-barrier packaging",
    ],
    accentColor: "#d97706",
    glowColor: "#d977060f",
    Icon: Leaf,
    seoTitle: "Premium THCA Hemp Flower — Coming Soon | Luxurious Habbits",
    seoDescription:
      "Luxurious Habbits is launching a curated selection of premium THCA hemp flower. Sign up to be notified when our flower drops — small-batch, full-panel tested, Farm Bill compliant.",
    keywords:
      "THCA flower, hemp flower, premium hemp flower, THCA hemp, buy THCA flower, small batch hemp, Farm Bill hemp flower",
  },
  accessories: {
    slug: "accessories",
    label: "Accessories",
    tagline: "Curated Smoking Accessories. Coming Soon.",
    description:
      "We're hand-picking a curated collection of premium smoking accessories — from high-quality glass and papers to lighters, grinders, and lifestyle pieces that match the Luxurious Habbits standard. Everything we carry, we'd use ourselves.",
    details: [
      "Premium glass, papers & wraps",
      "High-quality grinders & storage",
      "Luxury lighters & torches",
      "Rolling trays & lifestyle pieces",
      "Curated selection — ships direct to you",
    ],
    accentColor: "#f59e0b",
    glowColor: "#f59e0b0f",
    Icon: Package,
    seoTitle: "Premium Smoking Accessories — Coming Soon | Luxurious Habbits",
    seoDescription:
      "Luxurious Habbits is launching a curated accessories collection. Sign up to be notified when our smoking accessories drop — premium glass, grinders, papers, and more.",
    keywords:
      "smoking accessories, hemp accessories, premium grinder, rolling papers, glass pipe, luxury lighter, smoking tray, hemp lifestyle",
  },
  extracts: {
    slug: "extracts",
    label: "Extracts",
    tagline: "Concentrated Excellence. Coming Soon.",
    description:
      "Precision-crafted hemp extracts are on the way. We're sourcing full-spectrum and broad-spectrum concentrates made through the cleanest extraction processes — maximum potency, zero compromise. Live resin, live rosin, diamonds, and more.",
    details: [
      "Full-spectrum & broad-spectrum options",
      "Live resin, live rosin, diamonds, sauce",
      "Solventless and solvent-based options",
      "Full-panel COA for every batch",
      "Discreet, compliant packaging",
    ],
    accentColor: "#bf5fff",
    glowColor: "#bf5fff0f",
    Icon: FlaskConical,
    seoTitle: "Premium Hemp Extracts & Concentrates — Coming Soon | Luxurious Habbits",
    seoDescription:
      "Luxurious Habbits is launching a curated line of premium hemp extracts and concentrates. Sign up to be notified when our extracts drop — live resin, live rosin, diamonds, full-panel tested.",
    keywords:
      "hemp extracts, hemp concentrates, THCA concentrate, live resin hemp, live rosin hemp, hemp diamonds, hemp sauce, buy hemp extracts",
  },
};

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  category: "flower" | "extracts" | "accessories";
}

// ── Product Card (inline) ─────────────────────────────────────────────────
function CategoryProductCard({ product, vendor, terpenes }: { product: any; vendor: any; terpenes?: { terpeneName: string; percentage: string | null }[] }) {
  const sc = getStrainColors(product.strainType ?? "hybrid");
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addItem({ productId: product.id, name: product.name, price: String(product.retailPrice), imageUrl: product.imageUrl ?? undefined, vendorName: vendor?.hideVendor ? undefined : vendor?.name, weightGrams: product.weightGrams ?? null, category: product.category ?? undefined });
    setAdded(true); setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        style={{ background: "oklch(0.06 0 0)", border: `1px solid ${hovered ? "#bf5fff44" : "oklch(1 0 0 / 8%)"}`, borderRadius: "10px", overflow: "hidden", cursor: "pointer", transition: "all 200ms ease", transform: hovered ? "translateY(-3px)" : "translateY(0)", boxShadow: hovered ? "0 8px 32px oklch(0.55 0.25 295 / 0.12)" : "none" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ height: "200px", background: "oklch(0.09 0 0)", position: "relative", overflow: "hidden" }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 400ms ease", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Leaf size={40} style={{ color: "oklch(0.20 0 0)" }} /></div>
          )}
          {/* THCA% badge — top right */}
          {product.thcaPercent ? (
            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "oklch(0.08 0.04 145)", border: "1px solid oklch(0.50 0.20 145)", borderRadius: "6px", padding: "0.3rem 0.55rem", textAlign: "center", minWidth: "52px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.85 0.22 145)", lineHeight: 1 }}>{product.thcaPercent}%</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.15em", color: "oklch(0.55 0.15 145)", textTransform: "uppercase" }}>THCA</div>
            </div>
          ) : product.strainType ? (
            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: `${sc.primary}22`, border: `1px solid ${sc.primary}44`, borderRadius: "4px", padding: "0.2rem 0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.1em", color: sc.primary, textTransform: "uppercase" }}>{product.strainType}</div>
          ) : null}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, oklch(0.04 0 0 / 0.95) 0%, transparent 100%)", padding: "1.5rem 0.75rem 0.75rem", transform: hovered ? "translateY(0)" : "translateY(100%)", transition: "transform 220ms cubic-bezier(0.23, 1, 0.32, 1)" }}>
            <button onClick={handleAdd} style={{ width: "100%", background: added ? "oklch(0.55 0.18 145)" : "#bf5fff", border: "none", borderRadius: "6px", padding: "0.55rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: "#fff", cursor: "pointer" }}>
              {added ? "✓ ADDED" : "QUICK ADD"}
            </button>
          </div>
        </div>
        <div style={{ padding: "1rem" }}>
          {vendor && !vendor.hideVendor && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.40 0 0)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{vendor.name}</div>}
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "oklch(0.90 0 0)", fontWeight: 500, marginBottom: "0.2rem" }}>{product.name}</div>
          {product.tagline && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.75rem", color: "oklch(0.50 0 0)", marginBottom: "0.5rem" }}>{product.tagline}</div>}
          {/* Top Terpenes bar chart */}
          {terpenes && terpenes.length > 0 && (
            <div style={{ marginBottom: "0.85rem" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em", color: "oklch(0.38 0 0)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Top Terpenes</div>
              {terpenes.map((t, i) => (
                <TerpeneBar
                  key={t.terpeneName}
                  name={t.terpeneName}
                  percentage={parseFloat(t.percentage ?? "0")}
                  color={TERPENE_COLORS[i % TERPENE_COLORS.length]}
                />
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "#bf5fff" }}>${product.retailPrice}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)" }}>View Details →</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryComingSoon({ category }: Props) {
  const config = CATEGORIES[category];
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [error, setError] = useState("");

  // Check if there are active products in this category
  const catalogCategory = category === "extracts" ? "extract" : category === "accessories" ? "accessory" : "flower";
  const { data: catalogData, isLoading: catalogLoading } = trpc.catalog.list.useQuery({ category: catalogCategory as any, limit: 48 });
  const hasProducts = !catalogLoading && (catalogData?.products?.length ?? 0) > 0;

  const subscribe = trpc.notifyMe.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        setAlreadySubscribed(true);
      }
      setSubmitted(true);
      setEmail("");
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    subscribe.mutate({ email: email.trim(), category: config.slug });
  };

  const { Icon } = config;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: config.seoTitle,
    description: config.seoDescription,
    url: `https://luxurioushabbits.com/products/${category}`,
    publisher: {
      "@type": "Organization",
      name: "Luxurious Habbits",
      url: "https://luxurioushabbits.com",
    },
  };

  // If products exist, show the product grid instead of Coming Soon
  if (hasProducts && catalogData?.products) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
        <SEO
          title={`${config.label} | Luxurious Habbits`}
          description={`Shop premium ${config.label.toLowerCase()} at Luxurious Habbits. Farm Bill compliant, full-panel lab tested.`}
          keywords={config.keywords}
        />
        {/* Back nav */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem 0" }}>
          <Link href="/products">
            <button style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", transition: "color 150ms ease" }}
              onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.70 0 0)")}
              onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.45 0 0)")}>
              <ChevronLeft size={14} /> Back to All Products
            </button>
          </Link>
        </div>
        {/* Category header */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `${config.accentColor}18`, border: `1px solid ${config.accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <config.Icon size={18} style={{ color: config.accentColor }} />
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", margin: 0 }}>{config.label}</h1>
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "oklch(0.50 0 0)", margin: 0 }}>{catalogData.products.length} product{catalogData.products.length !== 1 ? "s" : ""} available</p>
        </div>
        {/* Product grid */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {catalogData.products.map(({ product, vendor, terpenes }) => (
              <CategoryProductCard key={product.id} product={product} vendor={vendor} terpenes={terpenes} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title={config.seoTitle}
        description={config.seoDescription}
        keywords={config.keywords}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Back nav ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 0" }}>
        <Link href="/products">
          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "oklch(0.45 0 0)",
              transition: "color 150ms ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.70 0 0)")}
            onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.45 0 0)")}
          >
            <ChevronLeft size={14} />
            Back to Products
          </button>
        </Link>
      </div>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "4rem 1.5rem 2rem",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Radial glow behind icon */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -60%)",
          width: "500px", height: "400px",
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Icon badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "80px", height: "80px", borderRadius: "50%",
          background: `${config.accentColor}15`,
          border: `1px solid ${config.accentColor}40`,
          marginBottom: "1.5rem",
          position: "relative",
        }}>
          <Icon size={32} style={{ color: config.accentColor }} />
        </div>

        {/* Category label */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700,
          letterSpacing: "0.25em", textTransform: "uppercase",
          color: config.accentColor, marginBottom: "1rem",
        }}>
          {config.label}
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
          letterSpacing: "0.05em",
          color: "oklch(0.96 0 0)",
          lineHeight: 0.95,
          marginBottom: "1.5rem",
        }}>
          {config.tagline}
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          color: "oklch(0.55 0 0)",
          maxWidth: "640px",
          margin: "0 auto 3rem",
          lineHeight: 1.75,
          fontWeight: 300,
        }}>
          {config.description}
        </p>

        {/* What's coming list */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "0.6rem",
          justifyContent: "center", marginBottom: "3.5rem",
        }}>
          {config.details.map((detail) => (
            <div key={detail} style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "oklch(0.07 0 0)",
              border: `1px solid ${config.accentColor}25`,
              borderRadius: "999px",
              padding: "0.4rem 1rem",
              fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 500,
              letterSpacing: "0.05em",
              color: "oklch(0.65 0 0)",
            }}>
              <Sparkles size={11} style={{ color: config.accentColor, flexShrink: 0 }} />
              {detail}
            </div>
          ))}
        </div>

        {/* ── Email capture ── */}
        <div style={{
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(1 0 0 / 8%)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          maxWidth: "520px",
          margin: "0 auto",
        }}>
          {submitted ? (
            /* Success state */
            <div style={{ textAlign: "center" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "56px", height: "56px", borderRadius: "50%",
                background: `${config.accentColor}15`,
                border: `1px solid ${config.accentColor}40`,
                marginBottom: "1.25rem",
              }}>
                <CheckCircle size={24} style={{ color: config.accentColor }} />
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.5rem", letterSpacing: "0.1em",
                color: "oklch(0.90 0 0)", marginBottom: "0.75rem",
              }}>
                {alreadySubscribed ? "Already on the list!" : "You're on the list!"}
              </div>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: "0.78rem",
                color: "oklch(0.50 0 0)", lineHeight: 1.6,
              }}>
                {alreadySubscribed
                  ? `You're already signed up for ${config.label} drop notifications. We'll reach out the moment they're live.`
                  : `We'll notify you the moment our ${config.label} collection drops. Keep an eye on your inbox.`}
              </p>
            </div>
          ) : (
            /* Form state */
            <>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                marginBottom: "0.5rem",
              }}>
                <Bell size={16} style={{ color: config.accentColor }} />
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.2rem", letterSpacing: "0.1em",
                  color: "oklch(0.90 0 0)",
                }}>
                  Notify Me When It Drops
                </span>
              </div>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: "0.72rem",
                color: "oklch(0.45 0 0)", lineHeight: 1.6, marginBottom: "1.5rem",
              }}>
                Be the first to know when our {config.label} collection goes live. No spam — just the drop announcement.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    required
                    style={{
                      flex: "1 1 200px",
                      background: "oklch(0.09 0 0)",
                      border: `1px solid ${error ? "#ef4444" : "oklch(1 0 0 / 10%)"}`,
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      fontFamily: "'Inter', sans-serif", fontSize: "0.8rem",
                      color: "oklch(0.90 0 0)",
                      outline: "none",
                      transition: "border-color 150ms ease",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = `${config.accentColor}60`)}
                    onBlur={e => (e.currentTarget.style.borderColor = error ? "#ef4444" : "oklch(1 0 0 / 10%)")}
                  />
                  <button
                    type="submit"
                    disabled={subscribe.isPending}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: config.accentColor,
                      color: "#fff",
                      border: "none", borderRadius: "8px",
                      fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "0.75rem 1.5rem", cursor: subscribe.isPending ? "not-allowed" : "pointer",
                      opacity: subscribe.isPending ? 0.7 : 1,
                      transition: "opacity 150ms ease, transform 100ms ease",
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (!subscribe.isPending) (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
                    onMouseLeave={e => { if (!subscribe.isPending) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {subscribe.isPending ? "Saving…" : (
                      <>Notify Me <ArrowRight size={13} /></>
                    )}
                  </button>
                </div>

                {error && (
                  <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: "0.7rem",
                    color: "#ef4444", letterSpacing: "0.02em",
                  }}>
                    {error}
                  </div>
                )}

                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "0.6rem",
                  color: "oklch(0.30 0 0)", letterSpacing: "0.04em",
                }}>
                  Your email is kept private. Unsubscribe at any time.
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── Browse what's available ── */}
      <section style={{
        maxWidth: "900px", margin: "0 auto",
        padding: "3rem 1.5rem 5rem",
        textAlign: "center",
        borderTop: "1px solid oklch(1 0 0 / 5%)",
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "oklch(0.35 0 0)", marginBottom: "1rem",
        }}>
          In the meantime
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.8rem", letterSpacing: "0.08em",
          color: "oklch(0.75 0 0)", marginBottom: "0.75rem",
        }}>
          Browse What's Available Now
        </div>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: "0.78rem",
          color: "oklch(0.40 0 0)", marginBottom: "2rem",
        }}>
          Explore our current catalog while we finalize the {config.label} collection.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/products">
            <button style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "oklch(0.08 0 0)",
              border: "1px solid oklch(1 0 0 / 12%)",
              color: "oklch(0.75 0 0)",
              borderRadius: "8px",
              fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "0.75rem 1.5rem", cursor: "pointer",
              transition: "border-color 150ms ease",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "oklch(1 0 0 / 25%)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "oklch(1 0 0 / 12%)")}
            >
              Shop All Products <ArrowRight size={13} />
            </button>
          </Link>
          <Link href="/blog">
            <button style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "none",
              border: `1px solid ${config.accentColor}40`,
              color: config.accentColor,
              borderRadius: "8px",
              fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "0.75rem 1.5rem", cursor: "pointer",
              transition: "border-color 150ms ease, background 150ms ease",
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = config.accentColor; el.style.background = `${config.accentColor}10`; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = `${config.accentColor}40`; el.style.background = "none"; }}
            >
              Read the Journal <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
