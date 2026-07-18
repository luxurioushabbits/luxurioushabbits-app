/**
 * Home Page — Luxurious Habbits
 * Black luxury + glitch aesthetic. Exotic car elegance.
 */
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { ArrowRight, Shield, Leaf, Award, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const subscribe = trpc.coupons.newsletterSubscribe.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setCouponCode(data.code);
      setEmail("");
    },
    onError: () => setStatus("error"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("idle");
    subscribe.mutate({ email });
  };

  const handleCopy = () => {
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (status === "success" && couponCode) {
    return (
      <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "0.5rem" }}>YOU'RE ON THE LIST.</div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.95rem", color: "oklch(0.55 0 0)", marginBottom: "1.25rem" }}>Here's your exclusive 15% off welcome code:</p>
        <div
          onClick={handleCopy}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.75rem",
            background: "oklch(0.08 0 0)", border: "1px solid #bf5fff66",
            borderRadius: "8px", padding: "0.75rem 1.5rem",
            cursor: "pointer", transition: "border-color 150ms ease",
          }}
        >
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.2em", color: "#bf5fff" }}>{couponCode}</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: copied ? "#00e5a0" : "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {copied ? "Copied!" : "Click to copy"}
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", marginTop: "0.75rem", letterSpacing: "0.05em" }}>Valid for 1 year · One use only · Enter at checkout</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0", maxWidth: "480px", margin: "0 auto" }}>
      <input
        type="email"
        placeholder="your@email.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: 1,
          background: "oklch(0.08 0 0)",
          border: "1px solid oklch(1 0 0 / 12%)",
          borderRight: "none",
          color: "oklch(0.96 0 0)",
          padding: "0.85rem 1.25rem",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.75rem",
          outline: "none",
          letterSpacing: "0.05em",
        }}
      />
      <button type="submit" className="btn-gold" style={{ whiteSpace: "nowrap" }} disabled={subscribe.isPending}>
        <span>{subscribe.isPending ? "..." : "Get 15% Off"}</span>
      </button>
      {status === "error" && (
        <p style={{ position: "absolute", marginTop: "3.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#ff4444", letterSpacing: "0.05em" }}>Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

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

const pillars = [
  { icon: <Shield size={22} />, title: "Strict Compliance", desc: "Every product meets 2018 Farm Bill standards. No exceptions, no compromises." },
  { icon: <Leaf size={22} />, title: "Premium Sourcing", desc: "We source only from the highest-tier cultivators. If we wouldn't use it ourselves, we don't sell it." },
  { icon: <Award size={22} />, title: "Full Panel Tested", desc: "Every product undergoes full-panel third-party lab testing — cannabinoids, heavy metals, pesticides, microbials, and more. COAs available for every batch." },
  { icon: <Truck size={22} />, title: "Discreet Shipping", desc: "UPS compliant. Adult signature required. Vacuum-sealed with odor-barrier materials. Plain, unmarked packaging — smell control handled, privacy guaranteed." },
];

const categories = [
  {
    title: "Flower",
    subtitle: "Premium Hemp Flower",
    desc: "Hand-selected, small-batch hemp flower. Cultivated for potency, aroma, and purity. The standard for connoisseurs.",
    tag: "Shop Flower",
    href: "/products/flower",
    tagStyle: { color: "oklch(0.75 0.18 145)", borderColor: "oklch(0.45 0.18 145 / 50%)" },
  },
  {
    title: "Extracts",
    subtitle: "Concentrated Excellence",
    desc: "Full-spectrum and broad-spectrum extracts crafted through precision processes. Maximum efficacy, zero compromise.",
    tag: "Shop Extracts",
    href: "/products/extracts",
    tagStyle: { color: "oklch(0.75 0.18 280)", borderColor: "oklch(0.45 0.18 280 / 50%)" },
  },
  {
    title: "Accessories",
    subtitle: "Premium Smoking Accessories",
    desc: "Top-shelf rigs, vaporizers, and accessories from the most respected names in the industry. Shipped direct to your door.",
    tag: "Shop Accessories",
    href: "/products/accessories",
    tagStyle: { color: "oklch(0.75 0.18 60)", borderColor: "oklch(0.45 0.18 60 / 50%)" },
  },
];

export default function Home() {
  const [glitch, setGlitch] = useState(false);
  const pillarsSection = useInView();
  const categoriesSection = useInView();
  const storySection = useInView();

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 350);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <SEO
        title="Premium THCA Flower & Hemp Extracts"
        description="Luxurious Habbits — premium Farm Bill compliant THCA flower. Shop Indica, Sativa & Hybrid hemp strains. Third-party lab tested, COA verified, discreet shipping nationwide."
        keywords="THCA flower, buy THCA flower online, premium hemp flower, indica sativa hybrid, farm bill compliant hemp, lab tested hemp flower, best THCA flower online, luxury hemp brand"
        canonical="/"
      />
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://www.luxurioushabbits.com/#organization",
                "name": "Luxurious Habbits",
                "url": "https://www.luxurioushabbits.com",
                "description": "Premium Farm Bill compliant THCA flower and hemp extracts. Indica, Sativa & Hybrid strains. Third-party lab tested, COA verified, discreet nationwide shipping.",
                "sameAs": [
                  "https://www.luxurioushabbits.com"
                ]
              },
              {
                "@type": "WebSite",
                "@id": "https://www.luxurioushabbits.com/#website",
                "url": "https://www.luxurioushabbits.com",
                "name": "Luxurious Habbits",
                "description": "Premium THCA Flower & Hemp Extracts",
                "publisher": {
                  "@id": "https://www.luxurioushabbits.com/#organization"
                },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://www.luxurioushabbits.com/products?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "OnlineStore",
                "@id": "https://www.luxurioushabbits.com/#store",
                "name": "Luxurious Habbits",
                "url": "https://www.luxurioushabbits.com",
                "description": "Premium Farm Bill compliant THCA flower and hemp extracts. Curated for connoisseurs.",
                "priceRange": "$$",
                "currenciesAccepted": "USD",
                "paymentAccepted": "Credit Card",
                "areaServed": "US",
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "THCA Flower & Hemp Products",
                  "itemListElement": [
                    { "@type": "OfferCatalog", "name": "THCA Flower" },
                    { "@type": "OfferCatalog", "name": "Hemp Extracts" },
                    { "@type": "OfferCatalog", "name": "The Habbits Box Subscription" }
                  ]
                }
              }
            ]
          })
        }}
      />

      {/* ── HERO ── */}
      <section
        className="glitch-tear scanlines"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "8rem 1.5rem 4rem",
        }}
      >

        {/* Grid background overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }} />

        {/* Radial glow */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, #bf5fff0f 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Scan line */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", left: 0, width: "100%", height: "1px",
            background: "linear-gradient(90deg, transparent, #00f5ff, transparent)",
            opacity: 0.25,
            animation: "scan-line 10s linear infinite",
          }} />
          {/* Second tear line */}
          <div style={{
            position: "absolute", left: 0, width: "100%", height: "2px",
            background: "linear-gradient(90deg, transparent 10%, #ff00e5 30%, transparent 50%, #00f5ff 70%, transparent 90%)",
            opacity: 0,
            animation: "screen-tear 9s infinite 2s",
          }} />
        </div>

        {/* Corner marks */}
        {[
          { top: "2rem", left: "2rem", borderTop: true, borderLeft: true },
          { top: "2rem", right: "2rem", borderTop: true, borderRight: true },
          { bottom: "2rem", left: "2rem", borderBottom: true, borderLeft: true },
          { bottom: "2rem", right: "2rem", borderBottom: true, borderRight: true },
        ].map((c, i) => (
          <div key={i} style={{
            position: "absolute",
            width: "32px", height: "32px",
            top: c.top, left: c.left, right: (c as any).right, bottom: (c as any).bottom,
            borderTop: c.borderTop ? "1px solid #bf5fff66" : "none",
            borderBottom: (c as any).borderBottom ? "1px solid #bf5fff66" : "none",
            borderLeft: c.borderLeft ? "1px solid #bf5fff66" : "none",
            borderRight: (c as any).borderRight ? "1px solid #bf5fff66" : "none",
            pointerEvents: "none",
          }} />
        ))}

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "900px" }}>
          <div className="section-label animate-fade-up" style={{ marginBottom: "1.5rem" }}>
            Premium Hemp · Est. 2024 · Farm Bill Compliant
          </div>

          <h1
            className="animate-fade-up-1 glitch glitch-intense"
            data-text="ONLY THE"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3.5rem, 12vw, 9rem)",
              letterSpacing: "0.05em",
              color: "oklch(0.96 0 0)",
              lineHeight: 1,
              marginBottom: "1.8rem",
            }}
          >
            ONLY THE
          </h1>
          <h1
            className="animate-fade-up-2 text-holo glitch glitch-slow"
            data-text="FINEST."
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3.5rem, 12vw, 9rem)",
              letterSpacing: "0.05em",
              lineHeight: 1,
              marginBottom: "2rem",
            }}
          >
            FINEST.
          </h1>

          <p className="animate-fade-up-3" style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
            color: "oklch(0.60 0 0)",
            maxWidth: "560px",
            margin: "0 auto 3rem",
            lineHeight: 1.7,
            fontWeight: 300,
          }}>
            Premium hemp sourced to the highest standard. If we wouldn't use it ourselves, we don't sell it. Always.
          </p>

          <div className="animate-fade-up-4" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products">
              <button className="btn-gold"><span>Explore Products</span></button>
            </Link>
            <Link href="/our-story">
              <button className="btn-outline-white"><span>Our Story</span></button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="animate-fade-up-5" style={{
            display: "flex", gap: "3rem", justifyContent: "center",
            marginTop: "5rem", flexWrap: "wrap",
          }}>
            {[
              { value: "100%", label: "Farm Bill Compliant" },
              { value: "21+", label: "Age Verified" },
              { value: "3rd Party", label: "Lab Tested" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div className="text-holo" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em" }}>{s.value}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "oklch(0.40 0 0)", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="scanlines" style={{ borderTop: "1px solid oklch(1 0 0 / 6%)", borderBottom: "1px solid oklch(1 0 0 / 6%)", padding: "1rem 0", overflow: "hidden", background: "oklch(0.06 0 0 / 70%)", position: "relative" }}>
        <div className="ticker-track">
          {Array(6).fill(null).map((_, i) => (
            <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.3em", color: "oklch(0.30 0 0)", whiteSpace: "nowrap", paddingRight: "4rem" }}>
              PREMIUM HEMP &nbsp;·&nbsp; FARM BILL COMPLIANT &nbsp;·&nbsp; THIRD-PARTY TESTED &nbsp;·&nbsp; 21+ ONLY &nbsp;·&nbsp; FLOWER &amp; EXTRACTS &amp; ACCESSORIES &nbsp;·&nbsp; LUXURIOUS LAVISH HABITS &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── PILLARS ── */}
      <section ref={pillarsSection.ref} className="glitch-tear" style={{ padding: "7rem 0", position: "relative", overflow: "hidden", background: "oklch(0.04 0 0)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Why Luxurious Habbits</div>
            <h2 className="glitch glitch-slow" data-text="THE STANDARD" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              THE STANDARD<br /><span className="text-holo">WE HOLD OURSELVES TO</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "oklch(1 0 0 / 6%)" }}>
            {pillars.map((p, i) => (
              <div
                key={p.title}
                className="card-hover"
                style={{
                  background: "oklch(0.04 0 0)",
                  padding: "2.5rem 2rem",
                  opacity: pillarsSection.visible ? 1 : 0,
                  transform: pillarsSection.visible ? "translateY(0)" : "translateY(30px)",
                  transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
                  border: "1px solid transparent",
                }}
              >
                <div className="text-holo" style={{ marginBottom: "1.25rem", display: "inline-block" }}>{p.icon}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.75rem" }}>{p.title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.50 0 0)", lineHeight: 1.8, fontWeight: 300 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section ref={categoriesSection.ref} style={{ padding: "4rem 0 7rem", background: "transparent", position: "relative", overflow: "hidden" }}>
        {/* Categories — hypnotic swirl background */}
        <div style={{
          position: "absolute",
          inset: "-30%",
          backgroundImage: "url('/manus-storage/optical_swirls_27b9cf4e.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.22) contrast(1.4) saturate(0.8)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "slow-rotate 80s linear infinite",
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Product Categories</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              FLOWER, EXTRACTS &amp; <span className="text-holo">ACCESSORIES</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2px" }}>
            {categories.map((cat, i) => (
              <div
                key={cat.title}
                className=""
                style={{
                  position: "relative",
                  background: "oklch(0.04 0 0 / 55%)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  padding: "3.5rem 2.5rem",
                  overflow: "hidden",
                  opacity: categoriesSection.visible ? 1 : 0,
                  transform: categoriesSection.visible ? "translateY(0)" : "translateY(30px)",
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
                }}
              >
                {/* Number */}
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "5rem", color: "oklch(1 0 0 / 4%)", position: "absolute", top: "1rem", right: "1.5rem", lineHeight: 1, letterSpacing: "0.05em" }}>
                  0{i + 1}
                </div>
                <div className="section-label" style={{ marginBottom: "1rem" }}>{cat.subtitle}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "1rem", lineHeight: 1 }}>{cat.title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.50 0 0)", lineHeight: 1.8, marginBottom: "2rem", fontWeight: 300 }}>{cat.desc}</p>
                <Link href={cat.href}>
                  <div style={{ display: "inline-block", border: `1px solid ${cat.tagStyle.borderColor}`, padding: "0.4rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cat.tagStyle.color, cursor: "pointer", transition: "opacity 150ms" }}>
                    {cat.tag} →
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/products">
              <button className="btn-outline-white" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>View All Products <ArrowRight size={14} /></span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STORY TEASER ── */}
      <section ref={storySection.ref} style={{ padding: "7rem 0", position: "relative", overflow: "hidden", background: "oklch(0.04 0 0)" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(oklch(1 0 0 / 2%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 2%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "700px" }}>
            <div className="section-label" style={{ marginBottom: "1.5rem" }}>Our Philosophy</div>
            <h2
              className="glitch glitch-intense"
              data-text="WE ONLY SELL WHAT"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                letterSpacing: "0.04em",
                color: "oklch(0.96 0 0)",
                lineHeight: 1,
                marginBottom: "2rem",
                opacity: storySection.visible ? 1 : 0,
                transform: storySection.visible ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              WE ONLY SELL WHAT<br /><span className="text-holo">WE'D USE OURSELVES.</span>
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "oklch(0.55 0 0)",
              lineHeight: 1.8,
              marginBottom: "2.5rem",
              fontWeight: 300,
              opacity: storySection.visible ? 1 : 0,
              transition: "opacity 0.7s ease 0.15s",
            }}>
              Sometimes you gotta pay a little more for quality — because you get what you pay for. That's the principle Luxurious Habbits was built on, and it's the standard we hold every product to.
            </p>
            <div style={{ opacity: storySection.visible ? 1 : 0, transition: "opacity 0.7s ease 0.25s" }}>
              <Link href="/our-story">
                <button className="btn-gold"><span>Read Our Story</span></button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative large text */}
        <div
          className="glitch glitch-slow"
          data-text="LUXURY"
          style={{
            position: "absolute", right: "-2rem", top: "50%", transform: "translateY(-50%)",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(6rem, 18vw, 16rem)",
            letterSpacing: "0.05em",
            color: "oklch(1 0 0 / 2%)",
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          LUXURY
        </div>
      </section>

      {/* ── COA BANNER ── */}
      <section style={{ background: "oklch(0.06 0 0 / 70%)", borderTop: "1px solid oklch(1 0 0 / 6%)", borderBottom: "1px solid oklch(1 0 0 / 6%)", padding: "4rem 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div className="section-label" style={{ marginBottom: "0.75rem" }}>Transparency First</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              CERTIFICATES OF ANALYSIS
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.45 0 0)", marginTop: "0.5rem", fontWeight: 300 }}>
              Every product. Every batch. Third-party verified.
            </p>
          </div>
          <Link href="/coa">
            <button className="btn-gold"><span>View Lab Results</span></button>
          </Link>
        </div>
      </section>

      {/* ── ZEBRA TUNNEL BANNER ── */}
      <section
        className="glitch-tear"
        style={{
          position: "relative",
          minHeight: "560px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Zebra tunnel optical illusion — slowly rotating */}
        <div style={{
          position: "absolute",
          inset: "-10%",
          backgroundImage: "url('/manus-storage/zebra-tunnel-optical-illusion_3c96324c.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.22) contrast(1.4) saturate(0.8)",
          animation: "slow-rotate 80s linear infinite",
        }} />
        {/* Holographic color overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #00f5ff0a 0%, #bf5fff0d 50%, #00ffb30a 100%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }} />
        {/* Dark vignette — heavy center so text pops */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 70% at center, oklch(0.04 0 0 / 60%) 0%, oklch(0.04 0 0 / 85%) 100%)",
          pointerEvents: "none",
        }} />
        {/* Scan line */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #00f5ff, transparent)", opacity: 0.2, animation: "scan-line 14s linear infinite" }} />
        </div>
        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "4rem 1.5rem" }}>
          <div className="section-label" style={{ marginBottom: "1.5rem", color: "oklch(0.55 0 0)" }}>The Habit</div>
          <h2
            className="glitch glitch-intense"
            data-text="LUXURIOUS LAVISH HABITS."
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(2.5rem, 8vw, 7rem)",
              letterSpacing: "0.05em",
              color: "oklch(0.96 0 0)",
              lineHeight: 0.95,
              marginBottom: "1.5rem",
              textShadow: "0 0 60px oklch(1 0 0 / 20%)",
            }}
          >
            LUXURIOUS LAVISH HABITS.
          </h2>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            color: "oklch(0.60 0 0)",
            maxWidth: "560px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
            fontWeight: 300,
          }}>
            Sometimes you gotta pay a little more for quality. Because you get what you pay for.
          </p>
          <Link href="/products">
            <button className="btn-gold"><span>Explore Products</span></button>
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding: "7rem 0" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>Stay in the Know</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "1rem", lineHeight: 1 }}>
            JOIN THE LIST
          </h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "oklch(0.50 0 0)", marginBottom: "2.5rem", fontWeight: 300 }}>
            Be first to know when products drop. No spam. Just the finest.
          </p>
<NewsletterForm />
        </div>
      </section>

    </div>
  );
}
