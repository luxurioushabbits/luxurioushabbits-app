/**
 * Products — Luxurious Habbits
 * Live page — "More Products Coming Soon" only inside the product grid
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Leaf, Search, Heart } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { getLoginUrl } from "@/const";
import { getStrainColors } from "@/data/strainColors";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fallback = setTimeout(() => setVisible(true), 800);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); clearTimeout(fallback); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return { ref, visible };
}

const categories = [
  {
    num: "01",
    title: "Flower",
    href: "/products/flower",
    sub: "Premium Hemp Flower",
    desc: "Hand-selected, small-batch hemp flower cultivated for potency, terpene profile, and purity. The connoisseur's choice — nothing less.",
    details: [
      "Indoor Grown",
      "Greenhouse Grown",
      "Light Dep.",
      "Living Soil Grown",
      "Hydro Grown",
      "Strict Compliance Testing",
    ],
  },
  {
    num: "02",
    title: "Extracts",
    href: "/products/extracts",
    sub: "Solventless Hash Rosin",
    desc: "Pure solventless hash rosin — crafted without chemicals, solvents, or shortcuts. Only heat, pressure, and premium starting material. The cleanest extract you can put in your body.",
    details: ["100% Solventless", "Hash Rosin", "No Solvents, No Chemicals", "Third-Party Lab Tested", "COA Available Per Batch"],
  },
  {
    num: "03",
    title: "Accessories",
    href: "/products/accessories",
    sub: "Premium Accessories",
    desc: "Hand-picked premium smoking accessories — glass, grinders, papers, lighters, rolling trays, and lifestyle pieces. Everything we carry, we'd use ourselves.",
    details: ["Premium Glass & Papers", "High-Quality Grinders", "Luxury Lighters & Torches", "Rolling Trays & Storage", "Curated Selection"],
  },
];

const strainTypes = [
  {
    name: "Indica",
    desc: "Known for deeply relaxing effects. Our Indica selections are sourced for their rich terpene profiles and premium cultivation standards.",
    tag: "Relaxing",
    gradientClass: "strain-indica",
    tagBg: "linear-gradient(90deg, #4b0082, #bf5fff)",
    hoverBorder: "#bf5fff88",
    glowColor: "#7b2fff22",
  },
  {
    name: "Sativa",
    desc: "Uplifting and energizing. Our Sativa offerings are hand-selected for their vibrant aroma, potency, and clean compliance.",
    tag: "Energizing",
    gradientClass: "strain-sativa",
    tagBg: "linear-gradient(90deg, #7a0000, #ff4444)",
    hoverBorder: "#ff444488",
    glowColor: "#c0392b22",
  },
  {
    name: "Hybrid",
    desc: "The best of both worlds. Carefully balanced hybrids offering a spectrum of effects to suit every preference and occasion.",
    tag: "Balanced",
    gradientClass: "strain-hybrid",
    tagBg: "linear-gradient(90deg, #004d00, #2ecc71)",
    hoverBorder: "#2ecc7188",
    glowColor: "#1a7a1a22",
  },
];

// ─── Filter Pill ─────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.4rem 1rem",
        borderRadius: "100px",
        border: active ? "1px solid #bf5fff" : "1px solid oklch(1 0 0 / 12%)",
        background: active ? "#bf5fff22" : "none",
        color: active ? "#bf5fff" : "oklch(0.50 0 0)",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.7rem",
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.05em",
        cursor: "pointer",
        transition: "all 150ms ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// ─── Wishlist Heart Button ───────────────────────────────────────────────────
function WishlistButton({ productId }: { productId: number }) {
  const { isAuthenticated } = useAuth();
  const { data, refetch } = trpc.wishlists.isWishlisted.useQuery(
    { productId },
    { enabled: isAuthenticated }
  );
  const toggle = trpc.wishlists.toggle.useMutation({
    onSuccess: () => refetch(),
  });
  const wishlisted = data?.wishlisted ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    toggle.mutate({ productId });
  };

  return (
    <button
      onClick={handleClick}
      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      style={{
        position: "absolute",
        top: "0.75rem",
        left: "0.75rem",
        background: wishlisted ? "#ff4d6d22" : "oklch(0.04 0 0 / 70%)",
        border: wishlisted ? "1px solid #ff4d6d66" : "1px solid oklch(1 0 0 / 15%)",
        borderRadius: "6px",
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backdropFilter: "blur(4px)",
        transition: "all 150ms ease",
        zIndex: 2,
      }}
    >
      <Heart
        size={14}
        style={{
          color: wishlisted ? "#ff4d6d" : "oklch(0.55 0 0)",
          fill: wishlisted ? "#ff4d6d" : "none",
          transition: "all 150ms ease",
        }}
      />
    </button>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
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

function ProductCard({ product, vendor, terpenes }: { product: any; vendor: any; terpenes?: { terpeneName: string; percentage: string | null }[] }) {
  const sc = getStrainColors(product.strainType ?? "hybrid");
  const strainColor = sc.primary;
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: String(product.retailPrice),
      imageUrl: product.imageUrl ?? undefined,
      vendorName: vendor?.hideVendor ? undefined : vendor?.name,
      weightGrams: product.weightGrams ?? null,
      category: product.category ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        style={{
          background: "oklch(0.06 0 0)",
          border: `1px solid ${hovered ? "#bf5fff44" : "oklch(1 0 0 / 8%)"}`,
          borderRadius: "10px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hovered ? "0 8px 32px oklch(0.55 0.25 295 / 0.12)" : "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image area */}
        <div style={{ height: "210px", background: "oklch(0.09 0 0)", position: "relative", overflow: "hidden" }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 400ms ease", transform: hovered ? "scale(1.04)" : "scale(1)" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={40} style={{ color: "oklch(0.20 0 0)" }} />
            </div>
          )}

          {/* Wishlist heart — top left */}
          <WishlistButton productId={product.id} />

          {/* THCA% badge — top right (large green box) */}
          {product.thcaPercent ? (
            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "oklch(0.08 0.04 145)", border: "1px solid oklch(0.50 0.20 145)", borderRadius: "6px", padding: "0.3rem 0.55rem", textAlign: "center", minWidth: "52px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.85 0.22 145)", lineHeight: 1 }}>{product.thcaPercent}%</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.15em", color: "oklch(0.55 0.15 145)", textTransform: "uppercase" }}>THCA</div>
            </div>
          ) : product.strainType ? (
            <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: `${strainColor}22`, border: `1px solid ${strainColor}44`, borderRadius: "4px", padding: "0.2rem 0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.1em", color: strainColor, textTransform: "uppercase" }}>{product.strainType}</div>
          ) : null}

          {/* Featured badge — bottom left */}
          {product.isFeatured && (
            <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", background: "#bf5fff", borderRadius: "4px", padding: "0.2rem 0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: "#fff" }}>FEATURED</div>
          )}

          {/* Quick Add overlay — slides up on hover */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(to top, oklch(0.04 0 0 / 0.95) 0%, transparent 100%)",
              padding: "1.5rem 0.75rem 0.75rem",
              transform: hovered ? "translateY(0)" : "translateY(100%)",
              transition: "transform 220ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <button
              onClick={handleQuickAdd}
              style={{
                width: "100%",
                background: added ? "oklch(0.55 0.18 145)" : "#bf5fff",
                border: "none",
                borderRadius: "6px",
                padding: "0.55rem 1rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#fff",
                cursor: "pointer",
                transition: "background 200ms ease, transform 100ms ease",
                transform: "scale(1)",
              }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              {added ? "✓ ADDED TO CART" : "QUICK ADD"}
            </button>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "1rem" }}>
          {vendor && !vendor.hideVendor && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.40 0 0)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.35rem" }}>{vendor.name}</div>}
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "oklch(0.90 0 0)", fontWeight: 500, marginBottom: "0.2rem", lineHeight: 1.3 }}>{product.name}</div>
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
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {product.weightGrams && <span style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "4px", padding: "0.15rem 0.4rem", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.55 0 0)" }}>{product.weightGrams}g</span>}
            {product.category && <span style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "4px", padding: "0.15rem 0.4rem", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.45 0 0)", textTransform: "capitalize" }}>{product.category}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.35rem", color: "#bf5fff", letterSpacing: "0.05em" }}>${product.retailPrice}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              View Details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Live Product Grid ────────────────────────────────────────────────────────
function LiveProductGrid() {
  const [strainFilter, setStrainFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedSearch(val), 350);
  };

  const { data, isLoading } = trpc.catalog.list.useQuery({
    strainType: strainFilter as any,
    category: categoryFilter as any,
    search: debouncedSearch || undefined,
    limit: 48,
    offset: 0,
  });

  const { data: vendorList } = trpc.catalog.vendors.useQuery();
  const strainTypes = ["indica", "sativa", "hybrid"];
  const catTypes = ["flower", "extract", "preroll", "edible"];

  // Only render the section if there are products OR if we're loading
  if (!isLoading && (!data?.products || data.products.length === 0) && !search && !strainFilter && !categoryFilter) {
    return null;
  }

  return (
    <section style={{ padding: "5rem 0", background: "oklch(0.05 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>Shop Now</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>THE <span className="text-holo">COLLECTION</span></h2>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2rem", padding: "1rem", background: "oklch(0.07 0 0)", borderRadius: "8px", border: "1px solid oklch(1 0 0 / 8%)" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "oklch(0.40 0 0)" }} />
            <input placeholder="Search..." value={search} onChange={e => handleSearch(e.target.value)} style={{ background: "oklch(0.09 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.4rem 0.75rem 0.4rem 2rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", width: "160px", outline: "none" }} />
          </div>
          {strainTypes.map(s => <FilterPill key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={strainFilter === s} onClick={() => setStrainFilter(strainFilter === s ? undefined : s)} />)}
          {catTypes.map(c => <FilterPill key={c} label={c.charAt(0).toUpperCase() + c.slice(1)} active={categoryFilter === c} onClick={() => setCategoryFilter(categoryFilter === c ? undefined : c)} />)}
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {Array(6).fill(null).map((_, i) => <div key={i} style={{ background: "oklch(0.07 0 0)", borderRadius: "10px", height: "300px" }} />)}
          </div>
        ) : !data?.products?.length ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>No products match your filters.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {data.products.map(({ product, vendor, terpenes }) => <ProductCard key={product.id} product={product} vendor={vendor} terpenes={terpenes} />)}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Products() {
  const [glitch, setGlitch] = useState(false);
  const categoriesSection = useInView();
  const promiseSection = useInView();

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 350);
    }, 4800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", position: "relative", overflow: "hidden" }}>
      {/* ── ANIMATED BACKGROUND ── */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Slow-drifting radial orbs */}
        <div style={{
          position: "absolute", width: "700px", height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #bf5fff14 0%, transparent 70%)",
          top: "-10%", left: "-15%",
          animation: "orb-drift-1 28s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: "500px", height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #00f5ff0d 0%, transparent 70%)",
          top: "30%", right: "-10%",
          animation: "orb-drift-2 34s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: "400px", height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #bf5fff0a 0%, transparent 70%)",
          bottom: "10%", left: "30%",
          animation: "orb-drift-3 22s ease-in-out infinite",
        }} />
        {/* Subtle moving grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(oklch(1 0 0 / 2%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 2%) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          animation: "grid-drift 60s linear infinite",
        }} />
        {/* Slow scan line */}
        <div style={{
          position: "absolute", left: 0, width: "100%", height: "1px",
          background: "linear-gradient(90deg, transparent, #bf5fff33, transparent)",
          animation: "scan-line 18s linear infinite",
        }} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
      <SEO
        title="Premium THCA Flower — Indica, Sativa & Hybrid"
        description="Shop premium THCA flower strains at Luxurious Habbits. Indica, Sativa & Hybrid hemp flower. Farm Bill compliant, third-party lab tested with COA verification. Discreet nationwide shipping."
        keywords="THCA flower strains, indica THCA flower, sativa THCA flower, hybrid THCA flower, premium hemp flower online, buy THCA flower, farm bill hemp flower, hemp extracts online"
        canonical="/products"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
        ]}
      />

      {/* ── HEADER ── */}
      <section className="glitch-tear" style={{ padding: "6rem 0 5rem", position: "relative", overflow: "hidden", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #00f5ff, transparent)", opacity: 0.2, animation: "scan-line 11s linear infinite" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up" style={{ marginBottom: "1rem" }}>The Collection</div>
          <h1 className="animate-fade-up-1 glitch glitch-intense" data-text="PREMIUM HEMP" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            PREMIUM
          </h1>
          <h1 className="animate-fade-up-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "#bf5fff", lineHeight: 1, marginBottom: "2rem" }}>
            HEMP.
          </h1>
          <p className="animate-fade-up-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "oklch(0.55 0 0)", maxWidth: "560px", lineHeight: 1.8, fontWeight: 300 }}>
            Luxurious Lavish Habits — sourced to the highest standard, tested to the strictest compliance.
          </p>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section ref={categoriesSection.ref} className="glitch-tear" style={{ padding: "6rem 0", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Categories</div>
            <h2 className="glitch glitch-slow" data-text="FLOWER & EXTRACTS" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              FLOWER, EXTRACTS &amp; <span className="text-holo">ACCESSORIES</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2px", marginBottom: "2px" }}>
            {categories.map((cat, i) => (
              <Link key={cat.title} href={(cat as any).href ?? "#"} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "oklch(0.04 0 0)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  padding: "3rem 2.5rem",
                  position: "relative",
                  overflow: "hidden",
                  opacity: categoriesSection.visible ? 1 : 0,
                  transform: categoriesSection.visible ? "translateY(0)" : "translateY(30px)",
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
                  cursor: "pointer",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#bf5fff66"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 8%)"; }}
              >
                <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "5rem", color: "oklch(1 0 0 / 3%)", lineHeight: 1 }}>{cat.num}</div>
                <div className="section-label" style={{ marginBottom: "1rem" }}>{cat.sub}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3.5rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1, marginBottom: "1.25rem" }}>{cat.title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.48 0 0)", lineHeight: 1.8, marginBottom: "2rem", fontWeight: 300 }}>{cat.desc}</p>
                <div className="gold-divider" style={{ marginBottom: "1.5rem" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {cat.details.map((d) => (
                    <li key={d} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ color: "#bf5fff", fontSize: "0.5rem" }}>◆</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
              </Link>
            ))}
          </div>

          {/* More Products Coming Soon card */}
          <div style={{
            border: "1px dashed #bf5fff33",
            padding: "3rem 2.5rem",
            textAlign: "center",
            background: "oklch(0.04 0 0)",
            marginTop: "2px",
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.1em", color: "oklch(0.25 0 0)", marginBottom: "0.75rem" }}>
              MORE PRODUCTS COMING SOON
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.30 0 0)", letterSpacing: "0.1em", fontWeight: 300 }}>
              We are continuously expanding our collection. Sign up to be notified when new products drop.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("You're on the list!"); }} style={{ display: "flex", gap: "0", maxWidth: "400px", margin: "1.5rem auto 0" }}>
              <input
                type="email"
                placeholder="your@email.com"
                required
                style={{ flex: 1, background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRight: "none", color: "oklch(0.96 0 0)", padding: "0.75rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", outline: "none" }}
              />
              <button type="submit" style={{ background: "linear-gradient(90deg, #00f5ff, #bf5fff, #ff00e5)", border: "1px solid #bf5fff", color: "oklch(0.04 0 0)", padding: "0.75rem 1.25rem", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                Notify Me
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── STRAIN TYPES ── */}
      <section className="glitch-tear" style={{ padding: "6rem 0", background: "oklch(0.04 0 0)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Strain Types</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", lineHeight: 1 }}>
              <span style={{ color: "oklch(0.96 0 0)" }}>INDICA. </span>
              <span className="strain-heading-sativa" style={{ fontSize: "inherit", fontFamily: "inherit", letterSpacing: "inherit" }}>SATIVA. </span>
              <span style={{ color: "oklch(0.96 0 0)" }}>HYBRID.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "2px" }}>
            {strainTypes.map((s, i) => (
              <div
                key={s.name}
                className={`card-hover ${s.gradientClass}`}
                style={{
                  border: "1px solid oklch(1 0 0 / 12%)",
                  padding: "2.5rem 2rem",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.3s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = s.hoverBorder; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(1 0 0 / 12%)"; }}
              >
                {/* Inner glow overlay */}
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${s.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />
                {/* Dark overlay so text stays readable */}
                <div style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 55%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ position: "absolute", top: "-0.5rem", right: "0", fontFamily: "'Bebas Neue', sans-serif", fontSize: "4rem", color: "oklch(1 0 0 / 6%)", lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ display: "inline-block", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", color: "oklch(0.04 0 0)", background: s.tagBg, padding: "0.25rem 0.75rem", marginBottom: "1.25rem", textTransform: "uppercase", fontWeight: 600 }}>{s.tag}</div>
                  <h3
                    className={`glitch strain-name-animated strain-name-${s.name.toLowerCase()}`}
                    data-text={s.name}
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", letterSpacing: "0.05em", lineHeight: 1, marginBottom: "1rem" }}
                  >{s.name}</h3>
                  <div className="gold-divider" style={{ marginBottom: "1.25rem" }} />
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.92 0 0)", lineHeight: 1.8, fontWeight: 300 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PRODUCT GRID ── */}
      <LiveProductGrid />

      {/* ── PROMISE ── */}
      <section ref={promiseSection.ref} style={{ padding: "6rem 0", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "1.5rem" }}>Our Promise</div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            color: "oklch(0.60 0 0)",
            lineHeight: 1.8,
            fontWeight: 300,
            marginBottom: "3rem",
            opacity: promiseSection.visible ? 1 : 0,
            transition: "opacity 0.7s ease",
          }}>
            "Every product that carries the Luxurious Habbits name has passed our personal standard. We only sell what we would use ourselves — and we hold ourselves to the highest."
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", opacity: promiseSection.visible ? 1 : 0, transition: "opacity 0.7s ease 0.2s" }}>
            <Link href="/coa"><button className="btn-gold"><span>View Lab Results</span></button></Link>
            <Link href="/about"><button className="btn-outline-white"><span>About Us</span></button></Link>
          </div>
        </div>
      </section>
      </div>{/* end zIndex:1 wrapper */}
    </div>
  );
}
