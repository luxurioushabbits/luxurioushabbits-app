import { Link } from "wouter";
import { Gift, Star, Zap, Users, MessageSquare, Camera, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";

const tiers = [
  {
    name: "STANDARD",
    tag: "Entry Tier",
    desc: "Start earning from your very first order. Every dollar spent and every review you leave builds toward your next reward.",
    perks: ["1 pt per $1 spent", "$1 review credit per approved review", "Stack up to $100 loyalty + $100 review credits per order", "Redeem on any product (not shipping)"],
  },
  {
    name: "ELEVATED",
    tag: "Required for Subscription Box",
    desc: "Elevated tier is required to subscribe to the Habbits Box or Stoner Box. Earn 1.5x points on every purchase and get early access to new drops.",
    perks: ["1.5x points multiplier on all purchases", "Required to subscribe to Habbits Box & Stoner Box", "$1 review credit per approved review", "Stack up to $150 loyalty + $150 review credits per order ($300 total)", "Early access to new drops"],
  },
  {
    name: "LUXURIOUS CONNOISSEUR",
    tag: "Top Tier — 3 Consecutive Box Orders",
    desc: "Subscribe to the Habbits Box or Stoner Box for 3 consecutive orders to unlock Luxurious Connoisseur tier. Maximum rewards, maximum access.",
    perks: ["2x points multiplier", "$1 review credit per approved review", "Stack up to $200 loyalty + $200 review credits per order ($400 total)", "First access to limited releases", "Dedicated account support"],
  },
];

const affiliatePerks = [
  { icon: <Zap size={20} />, title: "Competitive Commission", desc: "Earn a percentage on every sale generated through your unique referral link." },
  { icon: <Users size={20} />, title: "Real-Time Tracking", desc: "Monitor your clicks, conversions, and earnings through your affiliate dashboard." },
  { icon: <Star size={20} />, title: "Exclusive Affiliate Codes", desc: "Share custom discount codes with your audience — they save, you earn." },
  { icon: <Gift size={20} />, title: "Instant Site Credit", desc: "Commissions are issued as site credit directly to your account — no minimum balance, redeemable at checkout." },
];

export default function Loyalty() {
  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh" }}>
      <SEO
        title="Loyalty & Affiliates Program"
        description="Join the Luxurious Habbits loyalty and affiliates program. Earn rewards on premium THCA flower and hemp extract purchases. Refer friends and earn commissions."
        keywords="hemp loyalty program, THCA flower rewards, hemp affiliate program, luxurious habbits rewards, hemp store points"
        canonical="/loyalty"
      />

      {/* ── HERO ── */}
      <section className="glitch-tear scanlines" style={{ padding: "8rem 0 5rem", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)",
          backgroundSize: "80px 80px", pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "700px", height: "400px", background: "radial-gradient(ellipse, #bf5fff08 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="section-label" style={{ marginBottom: "1.5rem" }}>Rewards & Affiliates</div>
          <h1
            className="glitch glitch-intense"
            data-text="LOYALTY."
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3.5rem, 12vw, 8rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 0.95, marginBottom: "0.25rem" }}
          >
            LOYALTY.
          </h1>
          <h1
            className="text-holo glitch glitch-slow"
            data-text="REWARDED."
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3.5rem, 12vw, 8rem)", letterSpacing: "0.05em", lineHeight: 0.95, marginBottom: "2rem" }}
          >
            REWARDED.
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "oklch(0.55 0 0)", maxWidth: "560px", margin: "0 auto 3rem", lineHeight: 1.7, fontWeight: 300 }}>
            We believe in rewarding those who choose quality. Earn points on every purchase, stack review credits, and unlock exclusive tiers — built for those who settle for nothing less.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products"><button className="btn-gold"><span>Start Earning</span></button></Link>
            <Link href="/account"><button className="btn-outline-white"><span>View My Points</span></button></Link>
          </div>
        </div>
      </section>

      {/* ── LOYALTY TIERS ── */}
      <section style={{ padding: "6rem 0", background: "oklch(0.04 0 0)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Loyalty Program</div>
            <h2 className="glitch glitch-slow" data-text="THREE TIERS. ONE STANDARD." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              THREE TIERS. <span className="text-holo">ONE STANDARD.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1px" }}>
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className="card-hover"
                style={{ background: i === 2 ? "oklch(0.07 0 0)" : "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", padding: "2.5rem 2rem", position: "relative", overflow: "hidden" }}
              >
                {i === 2 && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #00f5ff, #bf5fff, #00ffb3)" }} />
                )}
                <div style={{ position: "absolute", top: "1rem", right: "1.5rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "4rem", color: "oklch(1 0 0 / 3%)", lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ display: "inline-block", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", background: i === 2 ? "linear-gradient(90deg, #00f5ff, #bf5fff)" : "oklch(0.20 0 0)", padding: "0.25rem 0.75rem", marginBottom: "1.25rem", textTransform: "uppercase", fontWeight: 600, color: i === 2 ? "oklch(0.04 0 0)" : "oklch(0.50 0 0)" }}>{tier.tag}</div>
                <h3 className="glitch" data-text={tier.name} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1, marginBottom: "1rem" }}>{tier.name}</h3>
                <div className="gold-divider" style={{ marginBottom: "1.25rem" }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.8, fontWeight: 300, marginBottom: "1.5rem" }}>{tier.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tier.perks.map((perk) => (
                    <li key={perk} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.55 0 0)", letterSpacing: "0.05em", padding: "0.4rem 0", borderBottom: "1px solid oklch(1 0 0 / 5%)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "linear-gradient(90deg, #00f5ff, #bf5fff)", flexShrink: 0 }} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AFFILIATE PROGRAM ── */}
      <section className="glitch-tear" style={{ padding: "6rem 0", background: "oklch(0.05 0 0)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Affiliate Program</div>
            <h2 className="glitch glitch-slow" data-text="EARN WITH US." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              EARN <span className="text-holo">WITH US.</span>
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "oklch(0.50 0 0)", maxWidth: "500px", margin: "1.5rem auto 0", lineHeight: 1.7 }}>
              Share what you believe in. Earn on every sale you generate. Our affiliate program is built for creators, enthusiasts, and advocates of quality.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "1px" }}>
            {affiliatePerks.map((perk) => (
              <div key={perk.title} className="card-hover" style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", padding: "2rem 1.75rem" }}>
                <div style={{ color: "#bf5fff", marginBottom: "1rem" }}>{perk.icon}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)", marginBottom: "0.75rem" }}>{perk.title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.8, fontWeight: 300 }}>{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARN $1 OFF — LEAVE A REVIEW ── */}
      <section style={{ padding: "6rem 0", background: "oklch(0.05 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Earn Credits</div>
            <h2 className="glitch glitch-slow" data-text="EARN $1 OFF." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              EARN <span className="text-holo">$1 OFF.</span>
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "oklch(0.50 0 0)", maxWidth: "520px", margin: "1.5rem auto 0", lineHeight: 1.7 }}>
              Share your experience and we'll credit your account $1 toward your next order. Two ways to earn:
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "1px" }}>
            {/* On-site Review */}
            <div className="card-hover" style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", padding: "2.5rem 2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#bf5fff22", border: "1px solid #bf5fff44", display: "flex", alignItems: "center", justifyContent: "center", color: "#bf5fff" }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)" }}>Product Review</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#bf5fff", textTransform: "uppercase" }}>On-Site</div>
                </div>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Drop a comment on any product you've purchased — tell us what you thought, how it hit, what you'd pair it with. Every approved review earns you $1 off your next order, automatically.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.75rem" }}>
                {["Must be a verified buyer", "One review per purchase — buy again, review again", "Any length — just be real", "$1 credit per approved review, no cap on how many products"].map(step => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle size={13} style={{ color: "#bf5fff", flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.55 0 0)" }}>{step}</span>
                  </div>
                ))}
              </div>
              <Link href="/products">
                <button className="btn-gold" style={{ width: "100%", justifyContent: "center" }}><span>Start Earning</span></button>
              </Link>
            </div>

            {/* GBP Review */}
            <div className="card-hover" style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", padding: "2.5rem 2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#00f5ff22", border: "1px solid #00f5ff44", display: "flex", alignItems: "center", justifyContent: "center", color: "#00f5ff" }}>
                  <Camera size={20} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)" }}>Google Review</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#00f5ff", textTransform: "uppercase" }}>Google Business Profile</div>
                </div>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Already left us a Google review? Take a screenshot showing your name and the review text, submit it through your Account page, and we'll credit you $1 within 48 hours.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.75rem" }}>
                {["Any star rating accepted", "Screenshot must show your reviewer name", "Max 3 Google review submissions per week", "$1 credit per approved submission — verified manually"].map(step => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle size={13} style={{ color: "#00f5ff", flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.55 0 0)" }}>{step}</span>
                  </div>
                ))}
              </div>
              <Link href="/account">
                <button className="btn-outline-white" style={{ width: "100%", justifyContent: "center" }}><span>Submit Screenshot</span></button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "6rem 0", textAlign: "center", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div className="container" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "1.5rem" }}>How It Works</div>
          <h2 className="glitch glitch-slow" data-text="EARN. STACK. REDEEM." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1, marginBottom: "2.5rem" }}>
            EARN. STACK. <span className="text-holo">REDEEM.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1px" }}>
            {[
              { step: "01", title: "Shop", desc: "Every dollar you spend earns loyalty points. Tier multipliers apply automatically." },
              { step: "02", title: "Review", desc: "Leave an approved product review and earn $1 in review credits — no cap on products." },
              { step: "03", title: "Redeem", desc: "Apply points and review credits at checkout. Stack both for maximum savings." },
            ].map(s => (
              <div key={s.step} className="card-hover" style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", padding: "2rem 1.5rem" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: "oklch(1 0 0 / 6%)", lineHeight: 1, marginBottom: "0.75rem" }}>{s.step}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)", marginBottom: "0.75rem" }}>{s.title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.45 0 0)", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "3rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products"><button className="btn-gold"><span>Start Earning Now</span></button></Link>
            <Link href="/account"><button className="btn-outline-white"><span>View My Balance</span></button></Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 0 7rem", textAlign: "center", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div className="container">
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "oklch(0.45 0 0)", marginBottom: "2.5rem", lineHeight: 1.7 }}>
            "Sometimes you gotta pay a little more for quality. Because you get what you pay for."
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products"><button className="btn-gold"><span>Shop Products</span></button></Link>
            <Link href="/contact"><button className="btn-outline-white"><span>Contact Us</span></button></Link>
          </div>
        </div>
      </section>

    </div>
  );
}
