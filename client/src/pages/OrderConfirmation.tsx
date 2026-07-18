/**
 * Order Confirmation Page — Luxurious Habbits
 * Shown after successful order placement. Links to share page.
 */
import { useRoute, Link } from "wouter";
import { CheckCircle, Package, Share2, ArrowRight, Bitcoin } from "lucide-react";
import SEO from "@/components/SEO";

export default function OrderConfirmation() {
  const [, params] = useRoute("/order-confirmation/:orderNumber");
  const orderNumber = params?.orderNumber ?? "";

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <SEO title="Order Confirmed — Luxurious Habbits" canonical={`/order-confirmation/${orderNumber}`} />

      <div style={{ maxWidth: "560px", width: "100%", padding: "2rem 1.5rem", textAlign: "center" }}>

        {/* Success icon */}
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "72px", height: "72px", background: "oklch(0.08 0 0)", border: "1px solid #00e5a044", borderRadius: "50%", marginBottom: "2rem" }}>
          <CheckCircle size={36} style={{ color: "#00e5a0" }} />
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 8vw, 4rem)", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.5rem", lineHeight: 1 }}>
          ORDER CONFIRMED
        </h1>

        {orderNumber && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", color: "oklch(0.40 0 0)", marginBottom: "1.5rem" }}>
            ORDER #{orderNumber}
          </div>
        )}

        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "oklch(0.55 0 0)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          Thank you for your order. You'll receive a confirmation email shortly. We'll notify you when your order ships.
        </p>

        {/* Action cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>

          <Link href={`/share/${orderNumber}`}>
            <div style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid #bf5fff33",
              borderRadius: "10px",
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              cursor: "pointer",
              transition: "border-color 150ms ease",
              textDecoration: "none",
            }}>
              <Share2 size={20} style={{ color: "#bf5fff", flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "oklch(0.85 0 0)", marginBottom: "0.2rem" }}>
                  Share & Earn Rewards
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>
                  Leave a Google review for $1 credit · Refer friends for $5 each
                </div>
              </div>
              <ArrowRight size={16} style={{ color: "oklch(0.35 0 0)", flexShrink: 0 }} />
            </div>
          </Link>

          <Link href="/track-order">
            <div style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "10px",
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              cursor: "pointer",
              textDecoration: "none",
            }}>
              <Package size={20} style={{ color: "#d4af37", flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "oklch(0.85 0 0)", marginBottom: "0.2rem" }}>
                  Track Your Order
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>
                  Enter your tracking number once your order ships
                </div>
              </div>
              <ArrowRight size={16} style={{ color: "oklch(0.35 0 0)", flexShrink: 0 }} />
            </div>
          </Link>

          {/* Crypto payment option — shown when feature flag is enabled */}
          {import.meta.env.VITE_CRYPTO_PAYMENTS_ENABLED === "true" && (
            <Link href={`/pay/crypto${orderNumber ? `?order=${orderNumber}` : ""}`}>
              <div style={{
                background: "oklch(0.06 0.02 270)",
                border: "1px solid oklch(0.4 0.15 270 / 35%)",
                borderRadius: "10px",
                padding: "1.25rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                textDecoration: "none",
                transition: "border-color 150ms ease",
              }}>
                <Bitcoin size={20} style={{ color: "#f5a623", flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "oklch(0.85 0 0)", marginBottom: "0.2rem" }}>
                    Pay with Crypto
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>
                    Pay your order with BTC, ETH, or DOGE — no account needed
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: "oklch(0.35 0 0)", flexShrink: 0 }} />
              </div>
            </Link>
          )}

        </div>

        <Link href="/products">
          <button style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", color: "oklch(0.45 0 0)", padding: "0.75rem 2rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.05em" }}>
            Continue Shopping
          </button>
        </Link>

      </div>
    </div>
  );
}
