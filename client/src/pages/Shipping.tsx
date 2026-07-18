/**
 * Shipping Policy — Luxurious Habbits
 * UPS compliant, adult signature, discreet packaging, restricted states.
 */
import SEO from "@/components/SEO";
import { Link } from "wouter";

const EFFECTIVE_DATE = "June 1, 2025";
const COMPANY_NAME = "Luxurious Habbits";
const CONTACT_EMAIL = "support@luxurioushabbits.com";
const WEBSITE = "www.luxurioushabbits.com";

export default function Shipping() {
  const sectionStyle: React.CSSProperties = { marginBottom: "3rem" };
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
  const ulStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.82rem",
    color: "oklch(0.50 0 0)",
    lineHeight: 1.9,
    fontWeight: 300,
    paddingLeft: "1.5rem",
    marginBottom: "1rem",
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", padding: "6rem 1.5rem 4rem" }}>
      <SEO
        title="Shipping Policy | Luxurious Habbits"
        description="Luxurious Habbits shipping policy — UPS compliant, adult signature required, discreet packaging, processing times, and restricted states."
        canonical="/shipping"
      />
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            color: "oklch(0.40 0 0)",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            Legal · {WEBSITE}
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            letterSpacing: "0.06em",
            color: "oklch(0.96 0 0)",
            lineHeight: 1,
            marginBottom: "0.75rem",
          }}>
            Shipping Policy
          </h1>
          <p style={{ ...pStyle, color: "oklch(0.40 0 0)", fontSize: "0.72rem" }}>
            Effective Date: {EFFECTIVE_DATE} · {COMPANY_NAME}
          </p>
          <div style={{ width: "60px", height: "1px", background: "oklch(0.75 0.18 300)", marginTop: "1.5rem" }} />
        </div>

        {/* Overview */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Overview</h2>
          <p style={pStyle}>
            {COMPANY_NAME} ships all orders via UPS in full compliance with UPS carrier policies for hemp-derived products. Every shipment is handled with the utmost discretion — your privacy is our priority. All orders require an adult signature upon delivery.
          </p>
          <p style={pStyle}>
            By placing an order on {WEBSITE}, you agree to the terms outlined in this Shipping Policy. Please read it carefully before completing your purchase.
          </p>
        </div>

        {/* Processing Time */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Processing Time</h2>
          <p style={pStyle}>
            All orders are processed within <strong style={{ color: "oklch(0.75 0.18 300)" }}>1–3 business days</strong> of payment confirmation. Orders placed on weekends or federal holidays will begin processing the next business day. You will receive an email confirmation with your order number immediately after purchase, and a separate shipping confirmation with tracking information once your order has been dispatched.
          </p>
          <ul style={ulStyle}>
            <li>Business days: Monday through Friday, excluding federal holidays</li>
            <li>Orders placed before 12:00 PM EST may ship same day during high-volume periods</li>
            <li>During promotional periods or high-demand seasons, processing may take up to 5 business days</li>
          </ul>
        </div>

        {/* Shipping Methods & Timeframes */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Shipping Methods & Estimated Delivery</h2>
          <p style={pStyle}>
            We currently ship via UPS Ground and UPS 2-Day Air. Estimated delivery timeframes are provided by UPS and are not guaranteed. Delays caused by weather, carrier disruptions, or other circumstances outside our control are not the responsibility of {COMPANY_NAME}.
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: "oklch(0.70 0 0)" }}>UPS Ground:</strong> 3–7 business days (varies by destination)</li>
            <li><strong style={{ color: "oklch(0.70 0 0)" }}>UPS 2-Day Air:</strong> 2 business days after dispatch</li>
          </ul>
          <p style={pStyle}>
            Shipping rates are calculated at checkout based on order weight, dimensions, and destination zip code.
          </p>
        </div>

        {/* Adult Signature */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Adult Signature Required</h2>
          <p style={pStyle}>
            <strong style={{ color: "oklch(0.75 0.18 300)" }}>All orders require an adult signature (21+) upon delivery — no exceptions.</strong> This is a mandatory requirement under our UPS shipping agreement for hemp-derived products. You must be 21 years of age or older to sign for and accept delivery. If no eligible adult is available to sign at the time of delivery, UPS will make up to three delivery attempts before returning the package to us.
          </p>
          <p style={pStyle}>
            If a package is returned to us due to failed delivery attempts or refusal of signature, the customer is responsible for re-shipping costs. Refunds will not be issued for returned packages due to failed delivery attempts.
          </p>
          <p style={pStyle}>
            We strongly recommend ensuring an adult (21+) is available at the delivery address during the expected delivery window. You may use your UPS tracking number to schedule a specific delivery time or redirect to a UPS Access Point location where you can pick up your package with valid ID.
          </p>
        </div>

        {/* Discreet Packaging */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Discreet Packaging</h2>
          <p style={pStyle}>
            All orders are shipped in plain, unmarked boxes with no external branding, product names, or any indication of the contents. Internal packaging uses vacuum-sealed, odor-barrier materials to ensure complete discretion. The return address on the label will read "{COMPANY_NAME}" or a neutral business name.
          </p>
          <p style={pStyle}>
            We take your privacy seriously. Your order details will never appear on the outside of the package.
          </p>
        </div>

        {/* Restricted States */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Restricted States — We Cannot Ship To</h2>
          <p style={pStyle}>
            Due to varying state laws regarding hemp-derived THCA products, we are currently <strong style={{ color: "#ff6b6b" }}>unable to ship to the following states</strong>:
          </p>
          <ul style={ulStyle}>
            <li>Idaho</li>
            <li>Kansas</li>
            <li>Minnesota</li>
            <li>Oregon</li>
            <li>Rhode Island</li>
            <li>Utah</li>
            <li>Virginia</li>
          </ul>
          <p style={pStyle}>
            If you attempt to place an order with a shipping address in a restricted state, your order will be automatically declined at checkout. This list is subject to change as state laws evolve. It is the customer's responsibility to verify that hemp-derived THCA products are legal in their jurisdiction before placing an order.
          </p>
          <p style={pStyle}>
            {COMPANY_NAME} is not responsible for packages seized or delayed by state authorities due to the customer providing an address in a restricted or prohibited jurisdiction.
          </p>
        </div>

        {/* All Sales Final / No Returns */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>All Sales Final — No Returns on Opened Items</h2>
          <p style={pStyle}>
            <strong style={{ color: "oklch(0.75 0.18 300)" }}>All sales are final. We do not accept returns, exchanges, or refunds on any opened, used, or consumed products.</strong> Due to the nature of hemp-derived consumable goods, we are unable to resell returned products and cannot guarantee the integrity of any item once it has left our facility.
          </p>
          <p style={pStyle}>
            <strong style={{ color: "oklch(0.70 0 0)" }}>Exceptions — Damaged, Defective, or Incorrect Items:</strong> If you receive a package that is visibly damaged, contains a defective product, or includes an item that does not match your order, please contact us within <strong style={{ color: "oklch(0.75 0.18 300)" }}>7 days of delivery</strong> at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#bf5fff", textDecoration: "none" }}>{CONTACT_EMAIL}</a> with the following:
          </p>
          <ul style={ulStyle}>
            <li>Your order number</li>
            <li>Clear photos of the damaged or incorrect item(s)</li>
            <li>Photos of the outer packaging showing any visible damage</li>
            <li>A brief description of the issue</li>
          </ul>
          <p style={pStyle}>
            We will review your claim and, at our sole discretion, offer a replacement, store credit, or partial refund. Claims submitted after 7 days of delivery will not be honored. We reserve the right to request additional information or photos before processing any claim.
          </p>
          <p style={pStyle}>
            <strong style={{ color: "oklch(0.70 0 0)" }}>Unopened, Sealed Items:</strong> Unopened items in their original, factory-sealed packaging may be eligible for a return within 7 days of delivery. The customer is responsible for all return shipping costs. Items must be returned in the same condition as received. Once we receive and inspect the return, we will issue a store credit (minus original shipping costs) within 5–7 business days. Cash refunds are not available.
          </p>
        </div>

        {/* Lost / Stolen Packages */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Lost or Stolen Packages</h2>
          <p style={pStyle}>
            <strong style={{ color: "oklch(0.75 0.18 300)" }}>Lost in Transit:</strong> If UPS loses your package while it is in transit (i.e., tracking has not updated or shows the package is stuck/missing before a delivery scan), we will send a <strong style={{ color: "oklch(0.75 0.18 300)" }}>full replacement</strong> at no charge once UPS confirms the package is lost. Please contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#bf5fff", textDecoration: "none" }}>{CONTACT_EMAIL}</a> with your order number and we will open a UPS claim on your behalf.
          </p>
          <p style={pStyle}>
            <strong style={{ color: "oklch(0.70 0 0)" }}>Marked as Delivered but Not Received:</strong> Once a package has been marked as delivered by UPS, {COMPANY_NAME} is not responsible for lost or stolen packages. If your tracking shows "Delivered" but you have not received your package:
          </p>
          <ul style={ulStyle}>
            <li>Check with neighbors, building management, or any secure locations where UPS may have left the package</li>
            <li>Wait 24 hours — carriers sometimes mark packages as delivered before the physical delivery occurs</li>
            <li>File a claim directly with UPS using your tracking number</li>
            <li>Contact us at {CONTACT_EMAIL} and we will do our best to assist in the investigation</li>
          </ul>
          <p style={pStyle}>
            We strongly recommend shipping to a secure location where an adult (21+) will be present to sign for the package.
          </p>
        </div>

        {/* Order Changes / Cancellations */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Order Changes & Cancellations</h2>
          <p style={pStyle}>
            Orders may be modified or cancelled within <strong style={{ color: "oklch(0.75 0.18 300)" }}>2 hours</strong> of placement, provided the order has not yet entered the processing or fulfillment stage. To request a change or cancellation, contact us immediately at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#bf5fff", textDecoration: "none" }}>{CONTACT_EMAIL}</a> with your order number.
          </p>
          <p style={pStyle}>
            Once an order has been processed and a shipping label has been generated, we are unable to cancel or modify it. In this case, you may refuse the delivery (do not open the package), and it will be returned to us. Upon receipt of the unopened return, we will issue a store credit minus the original shipping cost.
          </p>
        </div>

        {/* Contact */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>Contact Us</h2>
          <p style={pStyle}>
            For all shipping inquiries, please contact our support team:
          </p>
          <ul style={ulStyle}>
            <li>Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#bf5fff", textDecoration: "none" }}>{CONTACT_EMAIL}</a></li>
            <li>Website: <a href={`https://${WEBSITE}`} style={{ color: "#bf5fff", textDecoration: "none" }}>{WEBSITE}</a></li>
          </ul>
          <p style={pStyle}>
            We aim to respond to all inquiries within 1–2 business days.
          </p>
        </div>

        {/* Footer nav */}
        <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <Link href="/terms">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#bf5fff", letterSpacing: "0.1em", cursor: "pointer" }}>TERMS OF SERVICE</span>
          </Link>
          <Link href="/privacy">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#bf5fff", letterSpacing: "0.1em", cursor: "pointer" }}>PRIVACY POLICY</span>
          </Link>
          <Link href="/contact">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#bf5fff", letterSpacing: "0.1em", cursor: "pointer" }}>CONTACT US</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
