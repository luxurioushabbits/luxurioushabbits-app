/**
 * Terms of Service — Luxurious Habbits
 * Required for bank approval and legal compliance
 */

import SEO from "@/components/SEO";

const EFFECTIVE_DATE = "June 1, 2025";
const COMPANY_NAME = "Luxurious Habbits";
const CONTACT_EMAIL = "support@luxurioushabbits.com";
const WEBSITE = "www.luxurioushabbits.com";

export default function Terms() {
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
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Terms of Service"
        description="Terms of Service for Luxurious Habbits. Read our terms before purchasing premium THCA flower and hemp products."
        canonical="/terms"
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
            TERMS OF
          </h1>
          <h1 className="animate-fade-up-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "#bf5fff", lineHeight: 1, marginBottom: "2rem" }}>
            SERVICE.
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
              Welcome to {COMPANY_NAME} ("{COMPANY_NAME}", "we", "us", or "our"). By accessing or using our website at {WEBSITE} and purchasing our products, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully before using our site or placing an order.
            </p>
            <p style={pStyle}>
              If you do not agree to these Terms, you must not access or use our website or services.
            </p>
          </div>

          <div className="gold-divider" style={{ marginBottom: "3rem" }} />

          <div style={sectionStyle}>
            <h2 style={h2Style}>1. Age Requirement</h2>
            <p style={pStyle}>
              You must be 21 years of age or older to access this website, browse our products, or place an order. By using this site, you represent and warrant that you are at least 21 years old. We reserve the right to refuse service, cancel orders, or terminate accounts if we believe you do not meet this requirement.
            </p>
            <p style={pStyle}>
              An adult signature is required upon delivery of all orders. If no qualifying adult is available to sign at the time of delivery, the package will not be released.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>2. Product Compliance</h2>
            <p style={pStyle}>
              All products sold by {COMPANY_NAME} are derived from hemp and contain a delta-9 THC concentration of no more than 0.3% on a dry weight basis, in compliance with the Agriculture Improvement Act of 2018 (the "2018 Farm Bill") and applicable federal law.
            </p>
            <p style={pStyle}>
              Hemp-derived products are not intended to diagnose, treat, cure, or prevent any disease or medical condition. These statements have not been evaluated by the Food and Drug Administration (FDA). You are solely responsible for understanding and complying with the laws in your jurisdiction regarding the purchase, possession, and use of hemp products.
            </p>
            <p style={pStyle}>
              It is your responsibility to verify that hemp products are legal in your state or locality before placing an order. {COMPANY_NAME} does not ship to states or jurisdictions where hemp-derived products are prohibited. We reserve the right to refuse or cancel orders shipping to restricted locations.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>3. Orders and Payment</h2>
            <p style={pStyle}>
              By placing an order, you represent that all information you provide is accurate and complete. We reserve the right to refuse or cancel any order at our discretion, including but not limited to orders that appear fraudulent, orders to restricted jurisdictions, or orders that cannot be verified.
            </p>
            <p style={pStyle}>
              Prices are subject to change without notice. We are not responsible for typographical errors in pricing. Payment must be received in full before an order is processed and shipped.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>4. Shipping Policy</h2>
            <p style={pStyle}>
              We ship via UPS in compliance with applicable carrier policies for hemp products. All shipments require an adult signature upon delivery. Packages are shipped in plain, discreet packaging with no external branding that identifies the contents.
            </p>
            <p style={pStyle}>
              Shipping times are estimates only and are not guaranteed. {COMPANY_NAME} is not responsible for delays caused by carriers, weather, customs, or other factors outside our control. Risk of loss and title for products pass to you upon delivery to the carrier.
            </p>
            <p style={pStyle}>
              We do not ship to the following states where hemp-derived products may be restricted: Idaho, Iowa, and any other jurisdiction that has enacted laws prohibiting the sale or possession of hemp-derived cannabinoid products. This list is subject to change as laws evolve.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>5. Returns and Refunds</h2>
            <p style={pStyle}>
              Due to the nature of our products, all sales are final. We do not accept returns on opened or used products. If you receive a damaged, defective, or incorrect item, please contact us within 7 days of delivery at {CONTACT_EMAIL} with your order number and photos of the issue. We will work with you to resolve the matter.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>6. Intellectual Property</h2>
            <p style={pStyle}>
              All content on this website — including text, images, logos, graphics, and design — is the property of {COMPANY_NAME} and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content on this site without our prior written consent.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>7. Disclaimer of Warranties</h2>
            <p style={pStyle}>
              This website and all products are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p style={pStyle}>
              We do not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components. Individual results from using our products may vary.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>8. Limitation of Liability</h2>
            <p style={pStyle}>
              To the fullest extent permitted by applicable law, {COMPANY_NAME} and its owners, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our website or products, even if we have been advised of the possibility of such damages.
            </p>
            <p style={pStyle}>
              Our total liability to you for any claim arising out of or relating to these Terms or our products shall not exceed the amount you paid for the specific product giving rise to the claim.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>9. Indemnification</h2>
            <p style={pStyle}>
              You agree to indemnify, defend, and hold harmless {COMPANY_NAME} and its owners, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of our website or products, your violation of these Terms, or your violation of any applicable law.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>10. Governing Law</h2>
            <p style={pStyle}>
              These Terms shall be governed by and construed in accordance with the laws of the United States and the state in which {COMPANY_NAME} is incorporated, without regard to conflict of law principles. Any disputes shall be resolved in the courts of competent jurisdiction in that state.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>11. Changes to These Terms</h2>
            <p style={pStyle}>
              We reserve the right to update or modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the website after any changes constitutes your acceptance of the revised Terms.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>12. Contact Us</h2>
            <p style={pStyle}>
              If you have any questions about these Terms of Service, please contact us through our <a href="/contact" style={{ color: "#bf5fff", textDecoration: "none" }}>Contact page</a>.
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
