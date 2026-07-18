/**
 * Privacy Policy — Luxurious Habbits
 * Required for bank approval and legal compliance
 */

import SEO from "@/components/SEO";

const EFFECTIVE_DATE = "June 1, 2025";
const COMPANY_NAME = "Luxurious Habbits";
const WEBSITE = "www.luxurioushabbits.com";

export default function Privacy() {
  const sectionStyle: React.CSSProperties = {
    marginBottom: "3rem",
  };
  const h2Style: React.CSSProperties = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.6rem",
    letterSpacing: "0.08em",
    color: "oklch(0.96 0 0)",
    marginBottom: "1rem",
    lineHeight: 1.1,
  };
  const pStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.82rem",
    color: "oklch(0.50 0 0)",
    lineHeight: 1.9,
    fontWeight: 300,
    marginBottom: "1rem",
  };
  const liStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.82rem",
    color: "oklch(0.50 0 0)",
    lineHeight: 1.9,
    fontWeight: 300,
    marginBottom: "0.4rem",
    paddingLeft: "0.5rem",
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for Luxurious Habbits. Learn how we protect your data when you shop for premium THCA flower and hemp products."
        canonical="/privacy"
        noIndex={true}
      />

      {/* ── HEADER ── */}
      <section style={{ padding: "6rem 0 5rem", position: "relative", overflow: "hidden", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #00f5ff, transparent)", opacity: 0.2, animation: "scan-line 12s linear infinite" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up" style={{ marginBottom: "1rem" }}>Legal</div>
          <h1 className="animate-fade-up-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            PRIVACY
          </h1>
          <h1 className="animate-fade-up-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "#bf5fff", lineHeight: 1, marginBottom: "2rem" }}>
            POLICY.
          </h1>
          <p className="animate-fade-up-3" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em" }}>
            Effective Date: {EFFECTIVE_DATE}
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section style={{ padding: "6rem 0" }}>
        <div className="container" style={{ maxWidth: "800px" }}>

          <div style={sectionStyle}>
            <p style={pStyle}>
              {COMPANY_NAME} ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit {WEBSITE} or make a purchase from us. Please read this policy carefully. If you disagree with its terms, please discontinue use of our site.
            </p>
          </div>

          <div className="gold-divider" style={{ marginBottom: "3rem" }} />

          <div style={sectionStyle}>
            <h2 style={h2Style}>1. Information We Collect</h2>
            <p style={pStyle}>We may collect the following categories of personal information:</p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              {[
                "Identifiers: name, email address, shipping address, billing address, phone number",
                "Payment information: credit/debit card details (processed securely through our payment processor — we do not store full card numbers)",
                "Order history and transaction data",
                "Age verification data (date of birth or age confirmation)",
                "Communications you send us via our contact form",
                "Technical data: IP address, browser type, device information, pages visited, and referring URLs (collected automatically via cookies and similar technologies)",
              ].map((item, i) => (
                <li key={i} style={liStyle}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>2. How We Use Your Information</h2>
            <p style={pStyle}>We use the information we collect to:</p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              {[
                "Process and fulfill your orders, including shipping and delivery",
                "Verify that you are 21 years of age or older",
                "Communicate with you about your orders, inquiries, and account",
                "Send you marketing communications if you have opted in (you may opt out at any time)",
                "Improve our website, products, and customer experience",
                "Comply with legal obligations and prevent fraud",
                "Enforce our Terms of Service",
              ].map((item, i) => (
                <li key={i} style={liStyle}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>3. Sharing Your Information</h2>
            <p style={pStyle}>
              We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted third parties only as necessary to operate our business:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              {[
                "Payment processors to securely process transactions",
                "Shipping carriers (e.g., UPS) to fulfill and deliver your orders",
                "Email service providers to send transactional and marketing communications",
                "Analytics providers to understand website usage (data is anonymized where possible)",
                "Law enforcement or government authorities when required by law or to protect our rights",
              ].map((item, i) => (
                <li key={i} style={liStyle}>{item}</li>
              ))}
            </ul>
            <p style={pStyle}>
              All third-party service providers are required to protect your information and may only use it for the specific purposes we authorize.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>4. Cookies and Tracking Technologies</h2>
            <p style={pStyle}>
              We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small data files stored on your device. We use them to:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              {[
                "Remember your age verification status during your session",
                "Maintain your shopping cart and session preferences",
                "Analyze website traffic and usage patterns",
                "Deliver relevant marketing content",
              ].map((item, i) => (
                <li key={i} style={liStyle}>{item}</li>
              ))}
            </ul>
            <p style={pStyle}>
              You can control cookies through your browser settings. Disabling cookies may affect certain features of our website.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>5. Data Security</h2>
            <p style={pStyle}>
              We implement reasonable administrative, technical, and physical security measures to protect your personal information from unauthorized access, use, or disclosure. All payment transactions are encrypted using SSL/TLS technology.
            </p>
            <p style={pStyle}>
              However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>6. Data Retention</h2>
            <p style={pStyle}>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order records are typically retained for a minimum of 7 years for tax and legal compliance purposes.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>7. Your Rights and Choices</h2>
            <p style={pStyle}>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              {[
                "Access: request a copy of the personal information we hold about you",
                "Correction: request that we correct inaccurate or incomplete information",
                "Deletion: request that we delete your personal information, subject to certain legal exceptions",
                "Opt-out of marketing: unsubscribe from marketing emails at any time using the unsubscribe link in any email",
                "Data portability: request your data in a portable format where technically feasible",
              ].map((item, i) => (
                <li key={i} style={liStyle}>{item}</li>
              ))}
            </ul>
            <p style={pStyle}>
              To exercise any of these rights, please contact us through our <a href="/contact" style={{ color: "#bf5fff", textDecoration: "none" }}>Contact page</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>8. Children's Privacy</h2>
            <p style={pStyle}>
              Our website is intended for adults 21 years of age and older. We do not knowingly collect personal information from individuals under 21. If we become aware that we have inadvertently collected information from a minor, we will promptly delete it.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>9. Third-Party Links</h2>
            <p style={pStyle}>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies before providing any personal information.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>10. California Privacy Rights (CCPA)</h2>
            <p style={pStyle}>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your personal information, and the right to opt out of the sale of your personal information. We do not sell personal information. To exercise your CCPA rights, contact us through our Contact page.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>11. Changes to This Policy</h2>
            <p style={pStyle}>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Your continued use of our website after any changes constitutes your acceptance of the revised policy.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>12. Contact Us</h2>
            <p style={pStyle}>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us through our <a href="/contact" style={{ color: "#bf5fff", textDecoration: "none" }}>Contact page</a>.
            </p>
          </div>

          <div className="gold-divider" style={{ marginBottom: "2rem" }} />
          <p style={{ ...pStyle, fontSize: "0.7rem", color: "oklch(0.30 0 0)" }}>
            Last updated: {EFFECTIVE_DATE} · {COMPANY_NAME} · {WEBSITE}
          </p>

        </div>
      </section>

    </div>
  );
}
