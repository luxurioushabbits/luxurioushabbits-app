/**
 * EmailCapturePopup — Luxurious Habbits
 * Shows after 5s on first visit. Offers 15% off in exchange for email.
 * Uses localStorage to only show once per browser.
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const STORAGE_KEY = "lh_email_popup_dismissed";

export default function EmailCapturePopup() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = trpc.emailCaptures.capture.useMutation();

  useEffect(() => {
    // Don't show for admin users or if already dismissed/submitted
    if (user?.role === "admin") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [user]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    try {
      const result = await capture.mutateAsync({ email: email.trim() });
      setCouponCode(result.couponCode);
      setSubmitted(true);
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(0 0 0 / 75%)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
        animation: "fadeIn 0.3s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        style={{
          position: "relative",
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(1 0 0 / 12%)",
          borderRadius: "12px",
          padding: "2.5rem 2rem",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 0 60px oklch(0.55 0.25 290 / 0.15)",
        }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: "oklch(0.40 0 0)",
            cursor: "pointer",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            transition: "color 150ms ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "oklch(0.70 0 0)")}
          onMouseLeave={e => (e.currentTarget.style.color = "oklch(0.40 0 0)")}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <>
            {/* Accent line */}
            <div style={{
              width: "40px",
              height: "2px",
              background: "linear-gradient(90deg, #bf5fff, #00e5a0)",
              margin: "0 auto 1.5rem",
              borderRadius: "2px",
            }} />

            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2rem",
              letterSpacing: "0.08em",
              color: "oklch(0.96 0 0)",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}>
              GET 15% OFF
            </div>

            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "oklch(0.55 0 0)",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
            }}>
              your first order when you join the inner circle
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  background: "oklch(0.09 0 0)",
                  border: "1px solid oklch(1 0 0 / 15%)",
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  color: "oklch(0.85 0 0)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  outline: "none",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              />
              {error && (
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "#ff6666" }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={capture.isPending}
                className="btn-gold"
                style={{ width: "100%", justifyContent: "center", opacity: capture.isPending ? 0.7 : 1 }}
              >
                <span>{capture.isPending ? "Claiming..." : "Claim My 15% Off"}</span>
              </button>
            </form>

            <button
              onClick={dismiss}
              style={{
                marginTop: "1rem",
                background: "none",
                border: "none",
                color: "oklch(0.35 0 0)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.05em",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              No thanks, I'll pay full price
            </button>

            <div style={{
              marginTop: "1.25rem",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.6rem",
              color: "oklch(0.28 0 0)",
              lineHeight: 1.6,
            }}>
              By subscribing you agree to receive marketing emails. Unsubscribe anytime. One-time use coupon.
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "oklch(0.12 0.05 150)",
              border: "1px solid #00e5a0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "1.5rem",
            }}>
              ✓
            </div>

            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.8rem",
              letterSpacing: "0.08em",
              color: "oklch(0.96 0 0)",
              marginBottom: "0.5rem",
            }}>
              YOU'RE IN.
            </div>

            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "oklch(0.55 0 0)",
              marginBottom: "1.5rem",
            }}>
              Your exclusive discount code:
            </div>

            <div style={{
              background: "oklch(0.09 0 0)",
              border: "1px solid #bf5fff",
              borderRadius: "8px",
              padding: "1rem",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.6rem",
              letterSpacing: "0.2em",
              color: "#bf5fff",
              marginBottom: "1.25rem",
            }}>
              {couponCode}
            </div>

            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.7rem",
              color: "oklch(0.45 0 0)",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
            }}>
              Use this code at checkout for 15% off your first order. We've also sent it to your email.
            </div>

            <button
              onClick={dismiss}
              className="btn-gold"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <span>Shop Now</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
