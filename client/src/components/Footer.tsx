/**
 * Footer — Luxurious Habbits
 * Black luxury, gold accents, no social links, no email displayed
 */
import { Link } from "wouter";
import { Instagram } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="scanlines" style={{ background: "oklch(0.04 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)", paddingTop: "4rem", paddingBottom: "2rem", position: "relative" }}>
      <div className="container">
        {/* Top section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem", marginBottom: "3rem" }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <img src="/manus-storage/logo_14152948.png" alt="Luxurious Habbits" className="rgb-hover" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
              <div className="glitch glitch-slow" data-text="LUXURIOUS HABBITS" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.15em", color: "oklch(0.96 0 0)" }}>
                LUXURIOUS HABBITS
              </div>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", letterSpacing: "0.4em", color: "#bf5fff", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Premium Hemp
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.95rem", color: "oklch(0.62 0 0)", lineHeight: 1.7, fontWeight: 300 }}>
              Only the finest. Always.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.50 0 0)", marginTop: "0.75rem", letterSpacing: "0.05em" }}>
              Premium Hemp Brand
            </p>
            {/* Social links */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <a
                href="https://www.instagram.com/luxurious_habbits"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow us on Instagram"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", border: "1px solid oklch(1 0 0 / 12%)", color: "oklch(0.55 0 0)", background: "oklch(0.07 0 0)", transition: "color 200ms ease, border-color 200ms ease, background 200ms ease", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#bf5fff"; (e.currentTarget as HTMLElement).style.borderColor = "#bf5fff44"; (e.currentTarget as HTMLElement).style.background = "oklch(0.10 0 0)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0 0)"; (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 12%)"; (e.currentTarget as HTMLElement).style.background = "oklch(0.07 0 0)"; }}
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="section-label" style={{ marginBottom: "1.25rem" }}>Navigation</div>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Our Story", href: "/our-story" },
                { label: "Products", href: "/products" },
                { label: "COA", href: "/coa" },
                { label: "Track Order", href: "/track-order" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact", href: "/contact" },
                { label: "Loyalty & Affiliates", href: "/loyalty" },
                { label: "Journal", href: "/blog" },
                { label: "Wholesale", href: "/wholesale" },
                { label: "Dropship With Us", href: "/dropship" },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", color: "oklch(0.58 0 0)", textDecoration: "none", transition: "color 200ms ease", cursor: "pointer", display: "block" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#bf5fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.58 0 0)")}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Compliance */}
          <div>
            <div className="section-label" style={{ marginBottom: "1.25rem" }}>Compliance</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.55 0 0)", lineHeight: 1.8, letterSpacing: "0.03em" }}>
              All products are compliant with the 2018 Agriculture Improvement Act (Farm Bill). Hemp-derived products contain ≤0.3% Δ9-THC on a dry weight basis.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.50 0 0)", lineHeight: 1.8, marginTop: "0.75rem", letterSpacing: "0.03em" }}>
              We do not ship to all states. Customers are responsible for knowing their local laws prior to ordering.
            </p>
            <div className="gold-divider" style={{ margin: "1.25rem 0" }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.48 0 0)", lineHeight: 1.7 }}>
              Must be 21+ to purchase. These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>

          {/* Contact */}
          <div>
            <div className="section-label" style={{ marginBottom: "1.25rem" }}>Get In Touch</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.58 0 0)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Have a question? We'd love to hear from you. Use our contact form and we'll get back to you promptly.
            </p>
            <Link href="/contact">
              <button className="btn-gold"><span>Contact Us</span></button>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="gold-divider" style={{ marginBottom: "1.5rem" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.46 0 0)", letterSpacing: "0.1em" }}>
            © {year} LUXURIOUS HABBITS LLC. ALL RIGHTS RESERVED.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <Link href="/terms">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.50 0 0)", letterSpacing: "0.1em", cursor: "pointer", textDecoration: "none", transition: "color 200ms ease" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#bf5fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.50 0 0)")}>
                TERMS OF SERVICE
              </span>
            </Link>
            <Link href="/privacy">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.50 0 0)", letterSpacing: "0.1em", cursor: "pointer", textDecoration: "none", transition: "color 200ms ease" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#bf5fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.50 0 0)")}>
                PRIVACY POLICY
              </span>
            </Link>
            <Link href="/shipping">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.50 0 0)", letterSpacing: "0.1em", cursor: "pointer", textDecoration: "none", transition: "color 200ms ease" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#bf5fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.50 0 0)")}>
                SHIPPING POLICY
              </span>
            </Link>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.42 0 0)", letterSpacing: "0.05em", margin: 0 }}>
              2018 FARM BILL COMPLIANT · 21+
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
