/**
 * Our Story — Luxurious Habbits
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Fallback: force visible after 800ms in case observer doesn't fire (SSR, screenshots, etc.)
    const fallback = setTimeout(() => setVisible(true), 800);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); clearTimeout(fallback); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return { ref, visible };
}

const timeline = [
  { year: "The Problem", title: "A Market Full of Compromise", body: "We looked at the hemp market and saw the same thing everywhere: products that cut corners, brands that prioritized margins over quality, and customers left wondering what they were actually getting. We knew there had to be a better way." },
  { year: "The Standard", title: "If We Wouldn't Use It, We Don't Sell It", body: "Before Luxurious Habbits carried a single product, we set one rule that has never changed: every item must pass our personal standard. Not a checklist — a genuine personal test. Would we use this ourselves? If the answer is anything less than an enthusiastic yes, it doesn't make the cut." },
  { year: "The Build", title: "Sourcing the Highest End", body: "We spent time identifying the cultivators and producers who operate at the top of the industry. Strict compliance, premium genetics, precise extraction methods. We built relationships with partners who share our obsession with quality." },
  { year: "Today", title: "Luxurious Habbits, the USA", body: "We launched as a fully e-commerce operation based in the USA, bringing the finest hemp flower and extracts directly to customers who refuse to settle. Every product is 2018 Farm Bill compliant, third-party tested, and held to the standard that started this whole thing." },
];

export default function OurStory() {
  const [glitch, setGlitch] = useState(false);
  const timelineSection = useInView();
  const closingSection = useInView();

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 350);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Our Story — Premium Hemp Since 2024"
        description="The story behind Luxurious Habbits — why we built a premium hemp brand focused on quality, transparency, and only the finest THCA flower and extracts. If we wouldn't use it ourselves, we don't sell it."
        keywords="luxurious habbits story, premium hemp brand story, THCA flower brand history, luxury hemp company, small batch hemp flower"
        canonical="/our-story"
      />

      {/* ── HEADER ── */}
      <section className="glitch-tear" style={{ padding: "6rem 0 5rem", position: "relative", overflow: "hidden", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/manus-storage/optical_illusion_549ade92.webp')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.12) contrast(1.3) saturate(0.6)", pointerEvents: "none", animation: "slow-rotate 80s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #ff00e5, transparent)", opacity: 0.15, animation: "scan-line 14s linear infinite" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up" style={{ marginBottom: "1rem" }}>Our Story</div>
          <h1 className="animate-fade-up-1 glitch glitch-intense" data-text="HOW IT" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            HOW IT
          </h1>
          <h1 className="glitch glitch-slow animate-fade-up-2" data-text="STARTED." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", lineHeight: 1, marginBottom: "2rem" }}>
            <span className="text-holo">STARTED.</span>
          </h1>
          <p className="animate-fade-up-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "oklch(0.55 0 0)", maxWidth: "560px", lineHeight: 1.8, fontWeight: 300 }}>
            A brand born from frustration with the ordinary — and a refusal to accept anything less than the finest.
          </p>
        </div>
      </section>

      {/* ── OPENING STATEMENT ── */}
      <section style={{ padding: "7rem 0", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", letterSpacing: "0.08em", color: "#bf5fff", marginBottom: "2rem" }}>
            "SOMETIMES YOU GOTTA PAY A LITTLE MORE FOR QUALITY."
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", color: "oklch(0.60 0 0)", lineHeight: 1.8, fontWeight: 300 }}>
            Because you get what you pay for. That's not just a tagline — it's the founding philosophy of Luxurious Habbits, and it shapes every single decision we make.
          </p>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section ref={timelineSection.ref} className="glitch-tear" style={{ padding: "7rem 0", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>The Journey</div>
            <h2 className="glitch glitch-slow" data-text="BUILT ON PRINCIPLE" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              BUILT ON <span className="text-holo">PRINCIPLE</span>
            </h2>
          </div>

          <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: "0", top: 0, bottom: 0, width: "1px", background: "oklch(1 0 0 / 8%)" }} />

            {timeline.map((item, i) => (
              <div
                key={item.year}
                style={{
                  paddingLeft: "3rem",
                  paddingBottom: "4rem",
                  position: "relative",
                  opacity: timelineSection.visible ? 1 : 0,
                  transform: timelineSection.visible ? "translateX(0)" : "translateX(-20px)",
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
                }}
              >
                {/* Dot */}
                <div style={{ position: "absolute", left: "-5px", top: "4px", width: "11px", height: "11px", border: "1px solid #bf5fff", background: "oklch(0.06 0 0)", transform: "rotate(45deg)" }} />

                <div className="section-label" style={{ marginBottom: "0.75rem" }}>{item.year}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.06em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>{item.title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.48 0 0)", lineHeight: 1.9, fontWeight: 300, maxWidth: "600px" }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section ref={closingSection.ref} style={{ padding: "7rem 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
          <div style={{ opacity: closingSection.visible ? 1 : 0, transform: closingSection.visible ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            <div className="section-label" style={{ marginBottom: "1.5rem" }}>Where We Are Now</div>
            <h2 className="glitch glitch-intense" data-text="THE STANDARD" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1.1, marginBottom: "2rem" }}>
              THE STANDARD<br /><span className="text-holo">CONTINUES.</span>
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.48 0 0)", lineHeight: 1.9, marginBottom: "1.5rem", fontWeight: 300 }}>
              Luxurious Habbits is an e-commerce brand based in the USA, operating with full federal compliance under the 2018 Farm Bill. We carry premium hemp flower and extracts — two categories where quality matters most.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.48 0 0)", lineHeight: 1.9, fontWeight: 300 }}>
              As we grow, the standard never changes. Every new product, every new partner, every new customer — held to the same principle that started everything.
            </p>
          </div>

          <div style={{ opacity: closingSection.visible ? 1 : 0, transition: "opacity 0.7s ease 0.2s" }}>
            <div className="" style={{ border: "1px solid oklch(1 0 0 / 8%)", padding: "3rem", background: "oklch(0.06 0 0)", position: "relative" }}>
              <div style={{ position: "absolute", top: "-1px", left: "2rem", right: "2rem", height: "1px", background: "linear-gradient(90deg, #00f5ff, #bf5fff, #ff00e5)" }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.2em", color: "#bf5fff", lineHeight: 1, marginBottom: "0.5rem" }}>LUXURIOUS HABBITS</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.3em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginBottom: "2rem" }}>Premium Hemp · E-Commerce</div>
              <div className="gold-divider" style={{ marginBottom: "2rem" }} />
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "oklch(0.55 0 0)", lineHeight: 1.7, fontWeight: 300 }}>
                "We are e-commerce first — bringing the finest hemp directly to those who demand the best, wherever they are."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 0", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)", textAlign: "center" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: "1rem" }}>Experience It Yourself</div>
          <h2 className="glitch glitch-slow" data-text="SHOP LUXURIOUS HABBITS" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "2.5rem", lineHeight: 1 }}>
            SHOP <span className="text-holo">LUXURIOUS HABBITS</span>
          </h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products"><button className="btn-gold"><span>View Products</span></button></Link>
            <Link href="/about"><button className="btn-outline-white"><span>About Us</span></button></Link>
          </div>
        </div>
      </section>

    </div>
  );
}
