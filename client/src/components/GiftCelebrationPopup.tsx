/**
 * GiftCelebrationPopup
 * Polls for admin-gifted loyalty credits every 30 seconds.
 * When a pending gift is found, shows an animated congratulations modal.
 * The popup dismisses itself and marks the gift as seen.
 */
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function GiftCelebrationPopup() {
  const { isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Poll every 10 seconds when user is logged in, also refetch on mount and window focus
  const { data: gift, refetch } = trpc.loyalty.checkPendingGift.useQuery(undefined, {
    enabled: isAuthenticated && !dismissed,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  const dismissMutation = trpc.loyalty.dismissGift.useMutation();

  useEffect(() => {
    if (gift && !dismissed) {
      setVisible(true);
    }
  }, [gift, dismissed]);

  const handleClose = () => {
    if (gift) {
      dismissMutation.mutate({ giftId: gift.id });
    }
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || !gift) return null;

  const dollarValue = (gift.points / 100).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "oklch(0 0 0 / 75%)",
          backdropFilter: "blur(6px)",
          animation: "fadeIn 0.3s ease-out",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99999,
          width: "min(480px, 92vw)",
          background: "oklch(0.06 0 0)",
          border: "1px solid oklch(1 0 0 / 15%)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: "0 0 80px oklch(0.55 0.25 300 / 30%), 0 0 0 1px oklch(0.55 0.25 300 / 20%)",
          animation: "celebrationPop 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
          overflow: "hidden",
        }}
      >
        {/* Glow ring */}
        <div style={{
          position: "absolute",
          top: "-60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, oklch(0.55 0.25 300 / 25%) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Confetti particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "6px",
              height: "6px",
              borderRadius: i % 3 === 0 ? "50%" : "1px",
              background: ["#bf5fff", "#00f5ff", "#f5a623", "#00e5a0", "#ff6b6b"][i % 5],
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 13) % 90}%`,
              opacity: 0,
              animation: `confettiFall 1.2s ease-out ${i * 0.08}s forwards`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Trophy emoji */}
        <div style={{
          fontSize: "3.5rem",
          marginBottom: "1rem",
          animation: "bounceIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.1s both",
          display: "block",
          lineHeight: 1,
        }}>
          🎁
        </div>

        {/* Heading */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
          letterSpacing: "0.08em",
          color: "oklch(0.96 0 0)",
          marginBottom: "0.4rem",
          animation: "fadeSlideUp 0.5s ease-out 0.15s both",
        }}>
          YOU'VE BEEN SELECTED
        </div>

        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(1rem, 3vw, 1.3rem)",
          letterSpacing: "0.12em",
          background: "linear-gradient(135deg, #bf5fff, #00f5ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "1.25rem",
          animation: "fadeSlideUp 0.5s ease-out 0.2s both",
        }}>
          FOR A SPECIAL REWARD
        </div>

        {/* Points badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1.5rem",
          background: "oklch(0.10 0 0)",
          border: "1px solid oklch(0.55 0.25 300 / 30%)",
          borderRadius: "50px",
          marginBottom: "1.25rem",
          animation: "fadeSlideUp 0.5s ease-out 0.25s both",
        }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.05em", color: "#bf5fff" }}>
            +{gift.points.toLocaleString()}
          </span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.40 0 0)" }}>Loyalty Points</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "#00e5a0" }}>${dollarValue} store credit</div>
          </div>
        </div>

        {/* Message */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "0.95rem",
          color: "oklch(0.55 0 0)",
          lineHeight: 1.6,
          marginBottom: "1.75rem",
          maxWidth: "320px",
          margin: "0 auto 1.75rem",
          animation: "fadeSlideUp 0.5s ease-out 0.3s both",
        }}>
          {gift.message}
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", animation: "fadeSlideUp 0.5s ease-out 0.35s both" }}>
          <button
            onClick={handleClose}
            style={{
              padding: "0.65rem 2rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #bf5fff, #9b3fd4)",
              color: "white",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: "0 4px 20px oklch(0.55 0.25 300 / 30%)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            Claim My Reward
          </button>
        </div>

        {/* Fine print */}
        <div style={{
          marginTop: "1rem",
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.58rem",
          color: "oklch(0.28 0 0)",
          letterSpacing: "0.06em",
          animation: "fadeSlideUp 0.5s ease-out 0.4s both",
        }}>
          Points added to your account · Redeemable at checkout
        </div>
      </div>

      <style>{`
        @keyframes celebrationPop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bounceIn {
          0%   { opacity: 0; transform: scale(0.5); }
          60%  { transform: scale(1.15); }
          80%  { transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(-20px) rotate(0deg); }
          100% { opacity: 0; transform: translateY(60px) rotate(360deg); }
        }
      `}</style>
    </>
  );
}
