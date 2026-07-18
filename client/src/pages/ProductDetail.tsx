/**
 * Product Detail Page — Luxurious Habbits
 * Full product page: images, strain info, effects, COA viewer, Add to Cart
 * No placeholder products — only shows real products added via admin
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import SEO from "@/components/SEO";
import { ShoppingBag, ChevronLeft, Award, Leaf, FlaskConical, FileText, ExternalLink, ChevronDown, ChevronUp, Bell, MessageCircle, Send, ChevronRight, Heart, ZoomIn, X, ChevronLeft as ChevLeft, ChevronRight as ChevRight } from "lucide-react";
import { toast } from "sonner";
import TerpeneWheel from "@/components/TerpeneWheel";
import ProductReviews from "@/components/ProductReviews";
import { getStrainColors } from "@/data/strainColors";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import RecentlyViewedRow from "@/components/RecentlyViewedRow";

// Lazy-loaded terpene wheel section — fetches COA terpene data for a product
function TerpeneWheelSection({ productId }: { productId: number }) {
  const { data: terpenes } = trpc.terpenes.getProductTerpenes.useQuery({ productId });
  if (!terpenes || terpenes.length === 0) return null;
  return (
    <div style={{ marginTop: "3rem" }}>
      <TerpeneWheel terpenes={terpenes as any} />
    </div>
  );
}


export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { addItem } = useCart();

  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [coaOpen, setCoaOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const { isAuthenticated, user } = useAuth();

  // Wishlist
  const { data: wishlistData, refetch: refetchWishlist } = trpc.wishlists.getMyWishlist.useQuery(undefined, { enabled: isAuthenticated });
  const wishlistToggle = trpc.wishlists.toggle.useMutation({
    onSuccess: (res) => {
      refetchWishlist();
      toast.success(res.wishlisted ? "Saved to wishlist" : "Removed from wishlist");
    },
    onError: () => toast.error("Please sign in to save items."),
  });
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaSubmitted, setQaSubmitted] = useState(false);

  const restockSubscribe = trpc.restockNotifications.subscribe.useMutation({
    onSuccess: (res) => {
      setNotifySubmitted(true);
      if (res.alreadySubscribed) {
        toast.info("You're already on the notify list for this product.");
      } else {
        toast.success("We'll email you when it's back in stock!");
      }
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  // Q&A queries — productId is not known until data loads, so we use a placeholder and skip until loaded
  const [qaProductId, setQaProductId] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // Sync lightbox index with selected image
  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setLightboxIdx(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setLightboxIdx(i => i + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen]);
  const { data: qaData, refetch: refetchQA } = trpc.productQA.listForProduct.useQuery(
    { productId: qaProductId ?? 0 },
    { enabled: qaProductId !== null }
  );
  const askMutation = trpc.productQA.ask.useMutation({
    onSuccess: (res) => {
      setQaQuestion("");
      setQaSubmitted(true);
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const { data, isLoading, error } = trpc.catalog.get.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  // Must be called before any early returns — Rules of Hooks
  const { recordView } = useRecentlyViewed();

  // Set qaProductId once we have the product — use effect to avoid setState-in-render
  useEffect(() => {
    if (data?.product?.id && qaProductId === null) {
      setQaProductId(data.product.id);
    }
  }, [data?.product?.id, qaProductId]);

  // Record recently viewed once per product
  useEffect(() => {
    if (!data?.product) return;
    const p = data.product;
    recordView({
      slug: p.slug,
      name: p.name,
      imageUrl: p.imageUrl,
      strainType: p.strainType,
      retailPrice: p.retailPrice,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.product?.slug]);

  if (isLoading) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.15em", color: "oklch(0.30 0 0)", animation: "pulse 1.5s ease-in-out infinite" }}>
          LOADING...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SEO title="Product Not Found — Luxurious Habbits" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)", marginBottom: "1rem" }}>PRODUCT NOT FOUND</div>
          <button onClick={() => setLocation("/products")} style={{ background: "none", border: "1px solid #bf5fff", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const { product, vendor, images, variations } = data;

  // Determine the active variation product (or fall back to current product)
  const activeVariation = variations?.length
    ? (variations.find(v => v.id === selectedVariationId) ?? variations[0])
    : null;
  const displayProduct = activeVariation ?? product;
  const displayPrice = parseFloat(displayProduct.retailPrice).toFixed(2);

  const allImages = [
    ...(displayProduct.imageUrl ? [{ imageUrl: displayProduct.imageUrl, altText: displayProduct.name }] : []),
    ...(displayProduct.id === product.id ? images : []),
  ];

  const effectTags: string[] = (() => {
    try { return JSON.parse(product.effectTags ?? "[]"); }
    catch { return []; }
  })();

  const terpenes: string[] = (() => {
    try { return JSON.parse(product.terpenes ?? "[]"); }
    catch { return []; }
  })();

  const strainColor = getStrainColors(product.strainType ?? "hybrid").primary;

  const handleAddToCart = () => {
    const variationLabel = displayProduct.variationLabel;
    const cartName = variationLabel
      ? `${product.name} — ${variationLabel}`
      : product.name;
    addItem({
      productId: displayProduct.id,
      name: cartName,
      price: displayPrice,
      imageUrl: displayProduct.imageUrl ?? product.imageUrl ?? undefined,
      quantity: qty,
      weightGrams: displayProduct.weightGrams ? parseFloat(displayProduct.weightGrams) : undefined,
      vendorName: vendor?.hideVendor ? undefined : vendor?.name,
    });
    toast.success(`Added to cart`, {
      description: `${product.name} × ${qty}`,
    });
  };

  // Build JSON-LD Product schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.metaDescription ?? product.description ?? `Premium Farm Bill compliant THCA hemp flower. Third-party lab tested.`,
      brand: {
      "@type": "Brand",
      name: vendor?.hideVendor ? "Luxurious Habbits" : (vendor?.name ?? "Luxurious Habbits"),
    },
    image: allImages.filter(Boolean),
    sku: `LH-${product.id}`,
    category: product.category ?? "Hemp Flower",
    offers: {
      "@type": "Offer",
      url: `https://luxurioushabbits.com/products/${product.slug}`,
      priceCurrency: "USD",
      price: displayPrice,
      availability: product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Luxurious Habbits",
      },
    },
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title={`${product.name} — Premium THCA ${product.strainType ? product.strainType.charAt(0).toUpperCase() + product.strainType.slice(1) : ""} | Luxurious Habbits`}
        description={product.metaDescription ?? product.description ?? `Shop ${product.name} — premium Farm Bill compliant THCA hemp flower. Third-party lab tested. Discreet shipping.`}
        canonical={`/products/${product.slug}`}
        ogImage={allImages[0]?.imageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          { name: product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : "Flower", url: `/products/${product.category ?? "flower"}` },
          { name: product.name, url: `/products/${product.slug}` },
        ]}
        jsonLd={productJsonLd}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <button
          onClick={() => setLocation("/products")}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", marginBottom: "2.5rem", padding: 0, transition: "color 150ms ease" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#bf5fff"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "oklch(0.40 0 0)"}
        >
          <ChevronLeft size={14} />
          All Products
        </button>

        <div className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>

          {/* ── LEFT: IMAGES ── */}
          <div>
            {/* Main image with zoom */}
            <div
              style={{ aspectRatio: "1", background: "oklch(0.07 0 0)", borderRadius: "12px", border: "1px solid oklch(1 0 0 / 8%)", overflow: "hidden", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: allImages[selectedImageIdx] ? "zoom-in" : "default" }}
              onClick={() => allImages[selectedImageIdx] && openLightbox(selectedImageIdx)}
            >
              {allImages[selectedImageIdx] ? (
                <>
                  <img
                    src={allImages[selectedImageIdx].imageUrl}
                    alt={allImages[selectedImageIdx].altText ?? product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 300ms ease" }}
                  />
                  {/* Zoom hint overlay */}
                  <div style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem", background: "oklch(0 0 0 / 60%)", borderRadius: "6px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "0.3rem", pointerEvents: "none" }}>
                    <ZoomIn size={12} style={{ color: "oklch(0.70 0 0)" }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.60 0 0)", letterSpacing: "0.08em" }}>CLICK TO ZOOM</span>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <Leaf size={48} style={{ color: "oklch(0.15 0 0)" }} />
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.25 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Photo Coming Soon
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    style={{
                      width: "64px", height: "64px", borderRadius: "6px", overflow: "hidden",
                      border: i === selectedImageIdx ? "2px solid #bf5fff" : "1px solid oklch(1 0 0 / 10%)",
                      background: "oklch(0.07 0 0)", cursor: "pointer", padding: 0,
                      transition: "border-color 150ms ease",
                    }}
                  >
                    <img src={img.imageUrl} alt={img.altText ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: PRODUCT INFO ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Brand + strain badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {vendor && !vendor.hideVendor && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.45 0 0)" }}>
                  {vendor.name}
                </span>
              )}
              {product.strainType && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: strainColor, background: `${strainColor}18`, border: `1px solid ${strainColor}40`, borderRadius: "4px", padding: "2px 8px" }}>
                  {product.strainType}
                </span>
              )}
              {product.category && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.40 0 0)", background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "4px", padding: "2px 8px" }}>
                  {product.category}
                </span>
              )}
            </div>

            {/* Name */}
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 0.95, marginBottom: "0.5rem" }}>
                {product.name}
              </h1>
              {product.tagline && (
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.05rem", color: "oklch(0.50 0 0)", fontWeight: 300 }}>
                  {product.tagline}
                </p>
              )}
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "0.05em", color: "#bf5fff" }}>
                ${displayPrice}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                USD
              </span>
            </div>

            {/* Cannabinoid stats */}
            {(product.thcaPercent || product.cbdPercent) && (
              <div style={{ display: "flex", gap: "1.5rem", padding: "1rem 1.25rem", background: "oklch(0.06 0 0)", borderRadius: "8px", border: "1px solid oklch(1 0 0 / 8%)" }}>
                {product.thcaPercent && (
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.05em", color: "#bf5fff" }}>
                      {parseFloat(product.thcaPercent).toFixed(1)}%
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.40 0 0)" }}>
                      THCA
                    </div>
                  </div>
                )}
                {product.cbdPercent && (
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.05em", color: "#00f5ff" }}>
                      {parseFloat(product.cbdPercent).toFixed(1)}%
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.40 0 0)" }}>
                      CBD
                    </div>
                  </div>
                )}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Award size={14} style={{ color: "oklch(0.35 0 0)" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em" }}>
                    Farm Bill Compliant
                  </span>
                </div>
              </div>
            )}

            {/* Variation selector — DB-driven, shows size + price on each pill */}
            {variations && variations.length > 1 && (
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.75rem" }}>
                  Select Size
                </div>
                <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                  {variations.map(v => {
                    const isSelected = displayProduct.id === v.id;
                    const isOos = v.isOutOfStock;
                    const varPrice = parseFloat(v.retailPrice).toFixed(2);
                    return (
                      <button
                        key={v.id}
                        onClick={() => !isOos && setSelectedVariationId(v.id)}
                        disabled={isOos}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          padding: "0.6rem 1.1rem",
                          borderRadius: "8px",
                          cursor: isOos ? "not-allowed" : "pointer",
                          border: isSelected ? "2px solid #bf5fff" : "1px solid oklch(1 0 0 / 14%)",
                          background: isSelected ? "#bf5fff1a" : "oklch(0.07 0 0)",
                          color: isOos ? "oklch(0.30 0 0)" : isSelected ? "#bf5fff" : "oklch(0.65 0 0)",
                          opacity: isOos ? 0.45 : 1,
                          transition: "border 120ms ease, background 120ms ease, color 120ms ease",
                          textAlign: "center",
                          minWidth: "72px",
                          boxShadow: isSelected ? "0 0 12px #bf5fff22" : "none",
                        }}
                      >
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1.2 }}>
                          {v.variationLabel ?? v.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 500, marginTop: "0.2rem", color: isSelected ? "#d88fff" : isOos ? "oklch(0.28 0 0)" : "oklch(0.50 0 0)" }}>
                          {isOos ? "Out of stock" : `$${varPrice}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart OR Notify Me */}
            {product.isOutOfStock ? (
              <div>
                <div style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "8px", padding: "1.25rem", marginBottom: "0.75rem" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.15em", color: "oklch(0.50 0 0)", marginBottom: "0.75rem" }}>OUT OF STOCK — NOTIFY ME WHEN AVAILABLE</div>
                  {notifySubmitted ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#22c55e", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>
                      <Bell size={14} />
                      You're on the list — we'll email you when it's back.
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={notifyEmail}
                        onChange={e => setNotifyEmail(e.target.value)}
                        style={{ flex: 1, background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.6rem 0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.85 0 0)", outline: "none" }}
                      />
                      <button
                        onClick={() => {
                          if (!notifyEmail || !notifyEmail.includes("@")) { toast.error("Please enter a valid email"); return; }
                          restockSubscribe.mutate({ productId: product.id, email: notifyEmail });
                        }}
                        disabled={restockSubscribe.isPending}
                        style={{ background: "oklch(0.25 0 0)", border: "1px solid oklch(1 0 0 / 20%)", borderRadius: "4px", padding: "0.6rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "oklch(0.85 0 0)", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        {restockSubscribe.isPending ? "..." : "Notify Me"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {/* Qty */}
                <div style={{ display: "flex", alignItems: "center", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", overflow: "hidden" }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: "36px", height: "44px", background: "oklch(0.07 0 0)", border: "none", color: "oklch(0.60 0 0)", cursor: "pointer", fontSize: "1.1rem", transition: "color 150ms ease" }}>−</button>
                  <span style={{ width: "40px", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.85 0 0)", background: "oklch(0.05 0 0)" }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: "36px", height: "44px", background: "oklch(0.07 0 0)", border: "none", color: "oklch(0.60 0 0)", cursor: "pointer", fontSize: "1.1rem", transition: "color 150ms ease" }}>+</button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="btn-gold"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ShoppingBag size={15} />
                    Add to Cart
                  </span>
                </button>

                {/* Save for Later (Wishlist) */}
                {(() => {
                  const isSaved = wishlistData?.some((w: any) => w.productId === product.id);
                  return (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) { toast.info("Sign in to save items to your wishlist."); return; }
                        wishlistToggle.mutate({ productId: product.id });
                      }}
                      title={isSaved ? "Remove from wishlist" : "Save for later"}
                      style={{
                        width: "44px", height: "44px", flexShrink: 0,
                        background: isSaved ? "oklch(0.12 0.04 0)" : "oklch(0.07 0 0)",
                        border: `1px solid ${isSaved ? "#ff4444" : "oklch(1 0 0 / 12%)"}`,
                        borderRadius: "6px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 200ms ease",
                      }}
                    >
                      <Heart size={16} fill={isSaved ? "#ff4444" : "none"} color={isSaved ? "#ff4444" : "oklch(0.55 0 0)"} />
                    </button>
                  );
                })()}
              </div>
            )}

            {/* Shipping note */}
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", letterSpacing: "0.05em", lineHeight: 1.8 }}>
              Free shipping on orders over $50 · Adult signature required · Plain, unmarked packaging
            </div>

            {/* Effects */}
            {effectTags.length > 0 && (
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.6rem" }}>
                  Effects
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {effectTags.map((tag: string) => (
                    <span key={tag} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.08em", color: "oklch(0.65 0 0)", background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "20px", padding: "3px 10px" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Terpenes */}
            {terpenes.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <FlaskConical size={13} style={{ color: "oklch(0.40 0 0)" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.45 0 0)" }}>
                    Terpene Profile
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {terpenes.map((t: string) => (
                    <span key={t} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.08em", color: "#00f5ff", background: "#00f5ff0a", border: "1px solid #00f5ff20", borderRadius: "20px", padding: "3px 10px" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── DESCRIPTION + COA SECTION ── */}
        <div className="product-info-grid" style={{ marginTop: "4rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

          {/* Description */}
          {product.description && (
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <Leaf size={15} style={{ color: "#bf5fff" }} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.12em", color: "oklch(0.80 0 0)" }}>{["flower", "extract", "extracts"].includes((product.category ?? "").toLowerCase()) ? "ABOUT THIS STRAIN" : "ABOUT THIS PRODUCT"}</span>
              </div>

              {/* Genetics & Cultivation metadata */}
              {(product.genetics || product.cultivation) && (
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem", paddingBottom: "1.25rem", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
                  {product.genetics && (
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.38 0 0)", marginBottom: "0.25rem" }}>Genetics</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.9rem", color: "oklch(0.65 0 0)" }}>{product.genetics}</div>
                    </div>
                  )}
                  {product.cultivation && (
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.38 0 0)", marginBottom: "0.25rem" }}>Cultivation</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.9rem", color: "oklch(0.65 0 0)" }}>{product.cultivation}</div>
                    </div>
                  )}
                </div>
              )}

              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "oklch(0.60 0 0)", lineHeight: 1.8, fontWeight: 300 }}>
                {product.description}
              </p>
            </div>
          )}

          {/* COA — only for hemp products, not accessories */}
          {(product.category ?? "").toLowerCase() !== "accessory" && (
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <FileText size={15} style={{ color: "#00f5ff" }} />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.12em", color: "oklch(0.80 0 0)" }}>CERTIFICATE OF ANALYSIS</span>
            </div>

            {product.coaUrl ? (
              <div>
                {product.coaLab && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.45 0 0)", marginBottom: "0.4rem" }}>
                    Lab: <span style={{ color: "oklch(0.65 0 0)" }}>{product.coaLab}</span>
                  </div>
                )}
                {product.coaBatch && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.45 0 0)", marginBottom: "1rem" }}>
                    Batch: <span style={{ color: "oklch(0.65 0 0)", fontFamily: "monospace" }}>{product.coaBatch}</span>
                  </div>
                )}

                {/* Toggle COA embed */}
                <button
                  onClick={() => setCoaOpen(!coaOpen)}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "1px solid #00f5ff30", color: "#00f5ff", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.6rem 1rem", borderRadius: "6px", cursor: "pointer", marginBottom: "0.75rem", transition: "background 150ms ease" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#00f5ff0a"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
                >
                  {coaOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {coaOpen ? "Hide COA" : "View COA"}
                </button>

                {coaOpen && (
                  <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid oklch(1 0 0 / 10%)", marginBottom: "0.75rem" }}>
                    <iframe
                      src={product.coaUrl}
                      title="Certificate of Analysis"
                      style={{ width: "100%", height: "400px", border: "none", background: "oklch(0.08 0 0)" }}
                    />
                  </div>
                )}

                <a
                  href={product.coaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", textDecoration: "none", letterSpacing: "0.08em", transition: "color 150ms ease" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#00f5ff"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "oklch(0.40 0 0)"}
                >
                  <ExternalLink size={11} />
                  Download Full COA PDF
                </a>
              </div>
            ) : (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.35 0 0)", lineHeight: 1.7 }}>
                COA coming soon. Every product on Luxurious Habbits is third-party lab tested before listing.
              </div>
            )}
          </div>
          )}
        </div>

        {/* ── TERPENE WHEEL (from COA data) — only for hemp products ── */}
        {(product.category ?? "").toLowerCase() !== "accessory" && (
          <TerpeneWheelSection productId={product.id} />
        )}

        {/* ── CUSTOMER REVIEWS ── */}
        <ProductReviews productId={product.id} productName={product.name} />

        {/* ── PRODUCT Q&A ── */}
        <div style={{ marginTop: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <MessageCircle size={18} style={{ color: "#bf5fff" }} />
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", margin: 0 }}>QUESTIONS &amp; ANSWERS</h2>
          </div>

          {/* Answered Q&A list */}
          {qaData && qaData.filter((q: any) => q.answer && q.isPublished !== false).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {qaData.filter((q: any) => q.answer).map((q: any) => (
                <div key={q.id} style={{ background: "oklch(0.06 0 0 / 80%)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#bf5fff", background: "#bf5fff15", padding: "0.2rem 0.5rem", borderRadius: "3px", flexShrink: 0, marginTop: "0.1rem" }}>Q</span>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.82 0 0)", margin: 0, lineHeight: 1.6 }}>{q.question}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#00e5a0", background: "#00e5a015", padding: "0.2rem 0.5rem", borderRadius: "3px", flexShrink: 0, marginTop: "0.1rem" }}>A</span>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.65 0 0)", margin: 0, lineHeight: 1.6 }}>{q.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "1.5rem", background: "oklch(0.06 0 0 / 80%)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", marginBottom: "2rem", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.40 0 0)", textAlign: "center" }}>
              No questions yet. Be the first to ask!
            </div>
          )}

          {/* Ask a question form */}
          <div style={{ background: "oklch(0.06 0 0 / 80%)", border: "1px solid #bf5fff25", borderRadius: "10px", padding: "1.25rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.85rem" }}>ASK A QUESTION</div>
            {!isAuthenticated ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.50 0 0)" }}>
                <a href={getLoginUrl()} style={{ color: "#bf5fff", textDecoration: "underline" }}>Sign in</a> to ask a question about this product.
              </div>
            ) : qaSubmitted ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "#00e5a0" }}>✓ Your question has been submitted. We'll answer it shortly!</div>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
                <textarea
                  value={qaQuestion}
                  onChange={e => setQaQuestion(e.target.value)}
                  placeholder="Ask about effects, potency, strain info, shipping..."
                  rows={2}
                  style={{ flex: 1, background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.7rem 0.9rem", color: "oklch(0.85 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
                <button
                  onClick={() => { if (qaQuestion.trim().length >= 5) askMutation.mutate({ productId: product.id, question: qaQuestion.trim() }); }}
                  disabled={qaQuestion.trim().length < 5 || askMutation.isPending}
                  style={{ background: "#bf5fff", border: "none", borderRadius: "6px", padding: "0.7rem 1rem", cursor: qaQuestion.trim().length < 5 ? "not-allowed" : "pointer", opacity: qaQuestion.trim().length < 5 ? 0.5 : 1, display: "flex", alignItems: "center", gap: "0.4rem", color: "oklch(0.04 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}
                >
                  <Send size={13} /> Submit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed */}
        <RecentlyViewedRow excludeSlug={product.slug} />

        {/* Compliance footer */}
        <div style={{ marginTop: "3rem", padding: "1.25rem 1.5rem", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 6%)", borderRadius: "8px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.30 0 0)", lineHeight: 1.9, margin: 0 }}>
            <strong style={{ color: "oklch(0.40 0 0)" }}>Legal Disclaimer:</strong> All products contain ≤0.3% Delta-9 THC on a dry weight basis and are compliant with the 2018 Farm Bill. Products are not intended to diagnose, treat, cure, or prevent any disease. Must be 21+ to purchase. Adult signature required at delivery. Not available in all states — check your local laws before ordering.
          </p>
        </div>

      </div>

      {/* ── LIGHTBOX OVERLAY ── */}
      {lightboxOpen && allImages[lightboxIdx] && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "oklch(0 0 0 / 92%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "oklch(0.12 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "oklch(0.70 0 0)", zIndex: 1 }}
          >
            <X size={18} />
          </button>

          {/* Prev button */}
          {lightboxIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i - 1); }}
              style={{ position: "absolute", left: "1.5rem", background: "oklch(0.12 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "oklch(0.70 0 0)" }}
            >
              <ChevLeft size={20} />
            </button>
          )}

          {/* Next button */}
          {lightboxIdx < allImages.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i + 1); }}
              style={{ position: "absolute", right: "1.5rem", background: "oklch(0.12 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "oklch(0.70 0 0)" }}
            >
              <ChevRight size={20} />
            </button>
          )}

          {/* Full-size image */}
          <img
            src={allImages[lightboxIdx].imageUrl}
            alt={allImages[lightboxIdx].altText ?? ""}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 0 80px oklch(0 0 0 / 80%)",
              cursor: "default",
            }}
          />

          {/* Caption */}
          <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            {lightboxIdx + 1} / {allImages.length} · Press ESC or click outside to close
          </div>
        </div>
      )}
    </div>
  );
}
