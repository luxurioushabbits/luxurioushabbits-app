/**
 * Post-Purchase Share Your Experience Page — Luxurious Habbits
 * Shown after order confirmation. Encourages social sharing + Google review.
 */
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Share2, Star, Copy, CheckCheck, MessageSquare, ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const GOOGLE_REVIEW_URL = "https://g.page/r/luxurioushabbits/review";

export default function ShareExperience() {
  const [, params] = useRoute("/share/:orderNumber");
  const orderNumber = params?.orderNumber ?? "";
  const [copied, setCopied] = useState(false);
  const [shareTarget, setShareTarget] = useState<string | null>(null);

  const shareUrl = "https://www.luxurioushabbits.com";
  const shareText = "Just ordered from Luxurious Habbits — premium THCA hemp flower. Quality is unmatched. Use my link to check them out:";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const shareOptions = [
    {
      id: "twitter",
      label: "Share on X",
      icon: "𝕏",
      color: "#000",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: "facebook",
      label: "Share on Facebook",
      icon: "f",
      color: "#1877f2",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: "sms",
      label: "Text a Friend",
      icon: "💬",
      color: "#00e5a0",
      url: `sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
  ];

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Share Your Experience — Luxurious Habbits"
        canonical={`/share/${orderNumber}`}
      />

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "4rem 1.5rem" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", background: "oklch(0.08 0 0)", border: "1px solid #bf5fff44", borderRadius: "50%", marginBottom: "1.5rem" }}>
            <Share2 size={28} style={{ color: "#bf5fff" }} />
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.75rem", lineHeight: 1 }}>
            SPREAD THE WORD
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "oklch(0.55 0 0)", lineHeight: 1.6 }}>
            Your order is confirmed. Help others discover premium hemp — and earn rewards when they order.
          </p>
          {orderNumber && (
            <div style={{ marginTop: "0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.35 0 0)", letterSpacing: "0.1em" }}>
              ORDER #{orderNumber}
            </div>
          )}
        </div>

        {/* Google Review CTA — highest value */}
        <div style={{
          background: "oklch(0.07 0 0)",
          border: "1px solid #d4af3744",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #d4af37, #bf5fff)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
            <div style={{ display: "flex", gap: "2px", flexShrink: 0, marginTop: "2px" }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="#d4af37" stroke="none" />)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.08em", color: "#d4af37", marginBottom: "0.4rem" }}>
                LEAVE A GOOGLE REVIEW
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.55 0 0)", lineHeight: 1.6, marginBottom: "1rem" }}>
                A 5-star Google review helps us grow and earns you <strong style={{ color: "#d4af37" }}>$1 store credit</strong>. Screenshot your review and submit it in your account to claim your reward.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#d4af37", color: "#000", textDecoration: "none", padding: "0.65rem 1.25rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em" }}
                >
                  <ExternalLink size={13} />
                  Write a Review
                </a>
                <Link href="/account">
                  <button style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "1px solid #d4af3744", color: "#d4af37", padding: "0.65rem 1.25rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer" }}>
                    Submit Screenshot
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Social Share */}
        <div style={{
          background: "oklch(0.07 0 0)",
          border: "1px solid oklch(1 0 0 / 10%)",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.5rem" }}>
            SHARE WITH FRIENDS
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            When a friend orders using your referral link, you both earn rewards.
          </p>

          {/* Share buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {shareOptions.map(opt => (
              <a
                key={opt.id}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShareTarget(opt.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: shareTarget === opt.id ? "oklch(0.12 0 0)" : "oklch(0.09 0 0)",
                  border: `1px solid ${opt.color}44`,
                  color: opt.color,
                  textDecoration: "none",
                  padding: "0.6rem 1rem",
                  borderRadius: "6px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  transition: "all 150ms ease",
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>{opt.icon}</span>
                {opt.label}
              </a>
            ))}
          </div>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "oklch(0.09 0 0)",
              border: "1px solid oklch(1 0 0 / 12%)",
              color: copied ? "#00e5a0" : "oklch(0.60 0 0)",
              padding: "0.6rem 1rem",
              borderRadius: "6px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Link + Message"}
          </button>
        </div>

        {/* Referral CTA */}
        <div style={{
          background: "oklch(0.07 0 0)",
          border: "1px solid #bf5fff33",
          borderRadius: "12px",
          padding: "1.5rem 2rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}>
          <MessageSquare size={22} style={{ color: "#bf5fff", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.75 0 0)", lineHeight: 1.5 }}>
              Get your unique referral link from your account page. When a friend places their first order, you earn <strong style={{ color: "#bf5fff" }}>$5 in points</strong>.
            </div>
          </div>
          <Link href="/account">
            <button style={{ background: "#bf5fff22", border: "1px solid #bf5fff44", color: "#bf5fff", padding: "0.55rem 1rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
              Get My Link
            </button>
          </Link>
        </div>

        {/* Back to shop */}
        <div style={{ textAlign: "center" }}>
          <Link href="/products">
            <button style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", color: "oklch(0.45 0 0)", padding: "0.75rem 2rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "0.05em" }}>
              Continue Shopping
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
