/**
 * Strain Comparison Tool — Luxurious Habbits
 * Side-by-side comparison of two strains with terpene profiles, effects, THCA%, and type color coding.
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { getStrainColors } from "@/data/strainColors";
import { getTerpeneBySlug } from "@/data/terpenes";
import { ArrowLeft, ShoppingCart, ChevronDown, X, Scale } from "lucide-react";

// ─── Effect bar ───────────────────────────────────────────────────────────────
function EffectBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.55 0 0)", textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)" }}>{value}/10</span>
      </div>
      <div style={{ height: "4px", background: "oklch(0.12 0 0)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value * 10}%`, background: color, borderRadius: "2px", transition: "width 0.6s cubic-bezier(0.23, 1, 0.32, 1)" }} />
      </div>
    </div>
  );
}

// ─── Effects profile derived from strain type ─────────────────────────────────
function getEffects(strainType?: string): Record<string, number> {
  const base: Record<string, number> = { energy: 5, relaxation: 5, creativity: 5, focus: 5, euphoria: 5, appetite: 5, sleep: 5, body_feel: 5 };
  if (strainType === "sativa")  { base.energy = 8; base.creativity = 8; base.focus = 7; base.relaxation = 3; base.sleep = 2; }
  if (strainType === "indica")  { base.relaxation = 9; base.sleep = 8; base.appetite = 7; base.body_feel = 8; base.energy = 2; }
  if (strainType === "hybrid")  { base.energy = 6; base.relaxation = 6; base.creativity = 6; base.euphoria = 7; }
  return base;
}

// ─── Strain Card ──────────────────────────────────────────────────────────────
function StrainCard({ product, terpenes, slot, onClear }: { product: any; terpenes: any[]; slot: 1 | 2; onClear: () => void }) {
  const { addItem } = useCart();
  const sc = getStrainColors(product?.strainType ?? "hybrid");
  const color = sc.primary;
  const effects = getEffects(product?.strainType);
  const topTerpenes = (terpenes ?? []).slice(0, 5);

  const handleAddToCart = () => {
    if (!product) return;
    let priceData: Record<string, number> | null = null;
    try { priceData = product.prices ? JSON.parse(product.prices) : null; } catch { /* ignore */ }
    const basePrice = priceData ? (Object.values(priceData)[0] as number) : 0;
    addItem({ productId: product.id, name: product.name, price: String(basePrice), imageUrl: product.primaryImageUrl ?? undefined });
  };

  return (
    <div style={{ background: "oklch(0.06 0 0)", border: `1px solid ${color}33`, borderRadius: "12px", overflow: "hidden" }}>
      {/* Banner */}
      <div style={{ background: color, padding: "0.4rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "0.15em", color: "#fff" }}>
          STRAIN {slot} — {(product.strainType ?? "unknown").toUpperCase()}
        </span>
        <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", opacity: 0.7, display: "flex" }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "1.5rem" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.08em", color: "oklch(0.95 0 0)", marginBottom: "0.25rem" }}>{product.name}</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)", marginBottom: "1.25rem" }}>{product.vendorName ?? "Luxurious Habbits"}</p>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { label: "THCA%", value: product.thcaPercent ? `${product.thcaPercent}%` : "—" },
            { label: "CBD%",  value: product.cbdPercent  ? `${product.cbdPercent}%`  : "—" },
            { label: "Category",   value: product.category   ? product.category.charAt(0).toUpperCase()   + product.category.slice(1)   : "—" },
            { label: "Strain Type", value: product.strainType ? product.strainType.charAt(0).toUpperCase() + product.strainType.slice(1) : "Unknown" },
          ].map(s => (
            <div key={s.label} style={{ background: "oklch(0.09 0 0)", borderRadius: "6px", padding: "0.75rem" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", color: "oklch(0.35 0 0)", textTransform: "uppercase", marginBottom: "0.3rem" }}>{s.label}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.05em", color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Effects */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", color: "oklch(0.35 0 0)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Effects Profile</div>
          {Object.entries(effects).map(([key, val]) => <EffectBar key={key} label={key.replace("_", " ")} value={val} color={color} />)}
        </div>

        {/* Terpenes */}
        {topTerpenes.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", color: "oklch(0.35 0 0)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Top Terpenes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {topTerpenes.map((t: any) => {
                const info = getTerpeneBySlug(t.terpeneSlug);
                return (
                  <Link key={t.terpeneSlug} href={`/blog/terpene-guide/${t.terpeneSlug}`}>
                    <span style={{ padding: "0.25rem 0.6rem", borderRadius: "20px", background: color + "22", color, fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer" }}>
                      {info?.name ?? t.terpeneName}{t.percentage ? ` (${parseFloat(t.percentage).toFixed(2)}%)` : ""}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.50 0 0)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            {product.description.length > 200 ? product.description.slice(0, 200) + "…" : product.description}
          </p>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={handleAddToCart} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: color, color: "#fff", border: "none", borderRadius: "6px", padding: "0.75rem 1rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", cursor: "pointer" }}>
            <ShoppingCart size={14} /> Add to Cart
          </button>
          <Link href={`/products/${product.slug}`}>
            <button style={{ padding: "0.75rem 1rem", background: "none", border: `1px solid ${color}44`, borderRadius: "6px", color, fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", cursor: "pointer" }}>View</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Product Picker ───────────────────────────────────────────────────────────
function ProductPicker({ slot, onSelect }: { slot: 1 | 2; onSelect: (p: any) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data } = trpc.catalog.list.useQuery({ limit: 100 });
  const products = (data?.products ?? []) as any[];

  const filtered = useMemo(() =>
    products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.strainType ?? "").toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "oklch(0.07 0 0)", border: "1px dashed oklch(1 0 0 / 20%)", borderRadius: "12px", padding: "2rem", color: "oklch(0.50 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>
        <span>Select Strain {slot}</span>
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 50, background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
          <div style={{ padding: "0.75rem" }}>
            <input type="text" placeholder="Search strains..." value={search} onChange={e => setSearch(e.target.value)} autoFocus style={{ width: "100%", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.5rem 0.75rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", outline: "none" }} />
          </div>
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "1.5rem", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.35 0 0)" }}>No strains found</div>
            ) : filtered.map((p: any) => {
              const primaryColor = getStrainColors(p.strainType ?? "hybrid").primary;
              return (
                <button key={p.id} onClick={() => { onSelect(p); setOpen(false); setSearch(""); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: primaryColor, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.80 0 0)", fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", textTransform: "capitalize" }}>{p.strainType ?? "Unknown"} · {p.thcaPercent ? `${p.thcaPercent}% THCA` : "THCA N/A"}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StrainComparison() {
  const [strain1, setStrain1] = useState<any | null>(null);
  const [strain2, setStrain2] = useState<any | null>(null);

  const { data: terpenes1 } = trpc.terpenes.getProductTerpenes.useQuery({ productId: strain1?.id ?? 0 }, { enabled: !!strain1 });
  const { data: terpenes2 } = trpc.terpenes.getProductTerpenes.useQuery({ productId: strain2?.id ?? 0 }, { enabled: !!strain2 });

  const bothSelected = !!(strain1 && strain2);

  const sharedTerpenes = useMemo(() => {
    if (!terpenes1 || !terpenes2) return [];
    const slugs1 = new Set((terpenes1 as any[]).map((t: any) => t.terpeneSlug));
    return (terpenes2 as any[]).filter((t: any) => slugs1.has(t.terpeneSlug));
  }, [terpenes1, terpenes2]);

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "6rem", paddingBottom: "6rem" }}>
      <SEO
        title="Strain Comparison Tool — Compare Hemp Strains Side by Side | Luxurious Habbits"
        description="Compare THCA hemp strains side by side. See terpene profiles, effects, THCA percentages, and strain type differences. Find your perfect strain."
        keywords="compare hemp strains, strain comparison, sativa vs indica, THCA comparison, terpene profile comparison"
        canonical="https://luxurioushabbits.com/strain-comparison"
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <Link href="/blog/strain-guide">
            <button style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer", marginBottom: "1.5rem", padding: 0 }}>
              <ArrowLeft size={14} /> Back to Strain Guide
            </button>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <Scale size={22} style={{ color: "#bf5fff" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", color: "oklch(0.40 0 0)", textTransform: "uppercase" }}>Strain Guide</span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.05em", color: "oklch(0.95 0 0)", marginBottom: "0.75rem" }}>STRAIN COMPARISON TOOL</h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "oklch(0.50 0 0)", maxWidth: "560px" }}>
            Select two strains to compare their terpene profiles, effects, cannabinoid percentages, and more — side by side.
          </p>
        </div>

        {/* Pickers / Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
          {strain1 ? <StrainCard product={strain1} terpenes={(terpenes1 ?? []) as any[]} slot={1} onClear={() => setStrain1(null)} /> : <ProductPicker slot={1} onSelect={setStrain1} />}
          {strain2 ? <StrainCard product={strain2} terpenes={(terpenes2 ?? []) as any[]} slot={2} onClear={() => setStrain2(null)} /> : <ProductPicker slot={2} onSelect={setStrain2} />}
        </div>

        {/* Shared terpenes */}
        {bothSelected && sharedTerpenes.length > 0 && (
          <div style={{ background: "oklch(0.07 0 0)", border: "1px solid #bf5fff33", borderRadius: "10px", padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.12em", color: "#bf5fff", marginBottom: "0.75rem" }}>SHARED TERPENES — {sharedTerpenes.length} IN COMMON</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {sharedTerpenes.map((t: any) => {
                const info = getTerpeneBySlug(t.terpeneSlug);
                return (
                  <Link key={t.terpeneSlug} href={`/blog/terpene-guide/${t.terpeneSlug}`}>
                    <span style={{ padding: "0.3rem 0.8rem", borderRadius: "20px", background: "#bf5fff22", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer" }}>
                      {info?.name ?? t.terpeneName}
                    </span>
                  </Link>
                );
              })}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", marginTop: "0.75rem" }}>Strains sharing terpenes often produce similar effects. Click any terpene to learn more.</p>
          </div>
        )}

        {/* Empty state */}
        {!strain1 && !strain2 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "12px" }}>
            <Scale size={40} style={{ color: "oklch(0.20 0 0)", marginBottom: "1rem" }} />
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em", color: "oklch(0.25 0 0)", marginBottom: "0.5rem" }}>SELECT TWO STRAINS TO COMPARE</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.30 0 0)" }}>Use the dropdowns above to pick any two strains from our catalog.</p>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/products">
            <button style={{ padding: "0.9rem 2.5rem", background: "linear-gradient(135deg, #bf5fff, #7b2fff)", border: "none", borderRadius: "6px", color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", cursor: "pointer" }}>
              Shop All Strains
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
