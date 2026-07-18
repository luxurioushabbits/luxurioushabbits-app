/**
 * About Us — Luxurious Habbits
 * Black luxury + glitch aesthetic
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";

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

const values = [
  { number: "01", title: "Uncompromising Quality", body: "We source exclusively from cultivators who meet our strict standards. Every batch is evaluated before it ever reaches our shelves." },
  { number: "02", title: "Personal Standard", body: "We only sell what we would personally use. That's not a marketing line — it's the filter every single product passes through." },
  { number: "03", title: "Full Transparency", body: "Third-party Certificates of Analysis are available for every product. You deserve to know exactly what you're getting." },
  { number: "04", title: "Federal Compliance", body: "All products are 2018 Farm Bill compliant, containing ≤0.3% Δ9-THC. We operate within every applicable federal regulation." },
];

export default function About() {
  const [glitch, setGlitch] = useState(false);
  const valuesSection = useInView();
  const missionSection = useInView();

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 350);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="About Luxurious Habbits"
        description="Learn about Luxurious Habbits — a premium hemp brand built on quality, transparency, and Farm Bill compliance. Only the finest THCA flower and hemp extracts, sourced and curated to the highest standard."
        keywords="about luxurious habbits, premium hemp brand, luxury hemp company, THCA flower brand, farm bill compliant hemp brand"
        canonical="/about"
      />

      {/* ── PAGE HEADER ── */}
      <section className="glitch-tear" style={{ padding: "6rem 0 5rem", position: "relative", overflow: "hidden", borderBottom: "1px solid oklch(1 0 0 / 6%)", background: "oklch(0.04 0 0)" }}>
        {/* Rotating swirl background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/manus-storage/optical_illusion_549ade92.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.12) contrast(1.3) saturate(0.6)",
          pointerEvents: "none",
          animation: "slow-rotate 80s linear infinite",
        }} />
        {/* Diagonal stripe texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(45deg, oklch(1 0 0 / 2%) 0px, oklch(1 0 0 / 2%) 1px, transparent 1px, transparent 12px)",
          pointerEvents: "none",
        }} />
        {/* Gold radial glow top-right */}
        <div style={{
          position: "absolute", top: "-100px", right: "-100px",
          width: "500px", height: "500px",
          background: "radial-gradient(circle, #bf5fff14 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Fine grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(oklch(1 0 0 / 2%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 2%) 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #00f5ff, transparent)", opacity: 0.2, animation: "scan-line 12s linear infinite" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up" style={{ marginBottom: "1rem" }}>About Us</div>
          <h1
            className={`animate-fade-up-1${glitch ? " glitch" : ""}`}
            data-text="WHO WE ARE"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1, marginBottom: "0.25rem" }}
          >
            WHO WE
          </h1>
          <h1 className="animate-fade-up-2 text-holo" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", lineHeight: 1, marginBottom: "2rem" }}>
            ARE.
          </h1>
          <p className="animate-fade-up-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "oklch(0.55 0 0)", maxWidth: "580px", lineHeight: 1.8, fontWeight: 300 }}>
            A premium hemp brand built on one principle: if it's not good enough for us, it's not good enough for you.
          </p>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section ref={missionSection.ref} className="glitch-tear" style={{ padding: "7rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
            <div style={{ opacity: missionSection.visible ? 1 : 0, transform: missionSection.visible ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
              <div className="section-label" style={{ marginBottom: "1.5rem" }}>Our Mission</div>
              <h2 className="glitch glitch-intense" data-text="THE FINEST HEMP." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1.1, marginBottom: "2rem" }}>
                THE FINEST HEMP.<br /><span className="text-holo">NOTHING LESS.</span>
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.50 0 0)", lineHeight: 1.9, marginBottom: "1.5rem", fontWeight: 300 }}>
                Luxurious Habbits was founded on a simple but uncompromising belief: the hemp market deserves a brand that holds itself to the highest possible standard. We are that brand.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.50 0 0)", lineHeight: 1.9, marginBottom: "1.5rem", fontWeight: 300 }}>
                We operate as a fully e-commerce business, bringing premium hemp flower and extracts directly to customers who refuse to settle. Sometimes you gotta pay a little more for quality — because you get what you pay for.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.50 0 0)", lineHeight: 1.9, fontWeight: 300 }}>
                Every product we carry has passed our personal test first. We don't list anything we wouldn't use ourselves. That's not a policy — it's who we are.
              </p>
            </div>

            <div style={{ opacity: missionSection.visible ? 1 : 0, transform: missionSection.visible ? "translateX(0)" : "translateX(30px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s" }}>
              {/* Decorative stat block */}
              <div className="" style={{ border: "1px solid oklch(1 0 0 / 8%)", padding: "3rem", background: "oklch(0.06 0 0)", position: "relative" }}>
                <div style={{ position: "absolute", top: "-1px", left: "2rem", right: "2rem", height: "1px", background: "linear-gradient(90deg, #00f5ff, #bf5fff, #ff00e5)" }} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.4rem", color: "oklch(0.70 0 0)", lineHeight: 1.7, fontWeight: 300, marginBottom: "2.5rem" }}>
                  "Sometimes you gotta pay a little more for quality. Because you get what you pay for. That's Luxurious Habbits."
                </div>
                <div className="gold-divider" style={{ marginBottom: "2rem" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  {[
                    { val: "100%", label: "Farm Bill Compliant" },
                    { val: "21+", label: "Age Verified" },
                    { val: "E-COM", label: "Operations" },
                    { val: "0.3%", label: "Max THC" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-holo" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em" }}>{s.val}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "oklch(0.35 0 0)", textTransform: "uppercase" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section ref={valuesSection.ref} className="glitch-tear" style={{ padding: "4rem 0 7rem", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>What We Stand For</div>
            <h2 className="glitch glitch-slow" data-text="OUR VALUES" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              OUR <span className="text-holo">VALUES</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "oklch(1 0 0 / 6%)" }}>
            {values.map((v, i) => (
              <div
                key={v.number}
                className="rgb-hover"
                style={{
                  background: "oklch(0.06 0 0)",
                  padding: "2.5rem 2rem",
                  opacity: valuesSection.visible ? 1 : 0,
                  transform: valuesSection.visible ? "translateY(0)" : "translateY(30px)",
                  transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
                  borderBottom: "2px solid transparent",
                  cursor: "default",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "#bf5fff")}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: "oklch(1 0 0 / 6%)", lineHeight: 1, marginBottom: "1rem" }}>{v.number}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.75rem" }}>{v.title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.48 0 0)", lineHeight: 1.8, fontWeight: 300 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "6rem 0", textAlign: "center" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: "1rem" }}>Ready to Experience the Difference?</div>
          <h2 className="glitch glitch-slow" data-text="EXPLORE OUR PRODUCTS" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "2.5rem", lineHeight: 1 }}>
            EXPLORE OUR <span className="text-holo">PRODUCTS</span>
          </h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products"><button className="btn-gold"><span>Shop Now</span></button></Link>
            <Link href="/our-story"><button className="btn-outline-white"><span>Our Story</span></button></Link>
          </div>
        </div>
      </section>

    </div>
  );
}
