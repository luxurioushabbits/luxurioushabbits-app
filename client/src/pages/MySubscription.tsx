/**
 * My Subscription — Customer portal for managing The Habbits Box
 * Allows logged-in subscribers to view status, pause, resume, or cancel.
 */
import { useState } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "#00e5a0" },
  paused: { label: "Paused", color: "#f5a623" },
  cancelled: { label: "Cancelled", color: "#ff4444" },
  pending_approval: { label: "Pending Approval", color: "#bf5fff" },
};

const FREQ_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
};

export default function MySubscription() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data, isLoading, refetch } = trpc.subscriptions.mySubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const pause = trpc.subscriptions.pause.useMutation({ onSuccess: () => refetch() });
  const resume = trpc.subscriptions.resume.useMutation({ onSuccess: () => refetch() });
  const cancel = trpc.subscriptions.cancel.useMutation({
    onSuccess: () => {
      setConfirmCancel(false);
      refetch();
    },
  });

  const containerStyle: React.CSSProperties = {
    background: "oklch(0.04 0 0)",
    minHeight: "100vh",
    padding: "8rem 1.5rem 5rem",
    fontFamily: "'Inter', sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "oklch(0.07 0 0)",
    border: "1px solid oklch(1 0 0 / 8%)",
    borderRadius: "4px",
    padding: "2.5rem",
    maxWidth: "640px",
    margin: "0 auto",
  };

  if (authLoading) {
    return (
      <div style={containerStyle}>
        <SEO title="My Subscription" description="Manage your Habbits Box subscription." canonical="/my-subscription" />
        <div style={{ textAlign: "center", color: "oklch(0.40 0 0)", paddingTop: "4rem" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={containerStyle}>
        <SEO title="My Subscription" description="Manage your Habbits Box subscription." canonical="/my-subscription" />
        <div style={cardStyle}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>
            MY SUBSCRIPTION
          </h1>
          <p style={{ color: "oklch(0.50 0 0)", fontSize: "0.85rem", marginBottom: "2rem" }}>
            Please sign in to manage your Habbits Box subscription.
          </p>
          <a href={getLoginUrl()}>
            <button className="btn-gold"><span>Sign In</span></button>
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <SEO title="My Subscription" description="Manage your Habbits Box subscription." canonical="/my-subscription" />
        <div style={{ textAlign: "center", color: "oklch(0.40 0 0)", paddingTop: "4rem" }}>Loading your subscription...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={containerStyle}>
        <SEO title="My Subscription" description="Manage your Habbits Box subscription." canonical="/my-subscription" />
        <div style={cardStyle}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>
            NO ACTIVE SUBSCRIPTION
          </h1>
          <p style={{ color: "oklch(0.50 0 0)", fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            You don't have a Habbits Box subscription yet. Join today and receive a curated surprise box of premium THCA hemp every month.
          </p>
          <Link href="/habbits-box">
            <button className="btn-gold"><span>Explore The Habbits Box</span></button>
          </Link>
        </div>
      </div>
    );
  }

  const { subscription, plan } = data;
  const statusInfo = STATUS_LABELS[subscription.status] ?? { label: subscription.status, color: "#aaa" };
  const isActive = subscription.status === "active";
  const isPaused = subscription.status === "paused";
  const isCancelled = subscription.status === "cancelled";

  return (
    <div style={containerStyle}>
      <SEO title="My Subscription" description="Manage your Habbits Box subscription." canonical="/my-subscription" />

      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            The Habbits Box
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            MY SUBSCRIPTION
          </h1>
        </div>

        {/* Status Card */}
        <div style={cardStyle}>
          {/* Plan info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)" }}>
                {plan?.name ?? "The Habbits Box"}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.45 0 0)", marginTop: "0.25rem" }}>
                {FREQ_LABELS[subscription.frequency] ?? subscription.frequency} · 10% off + Free Shipping
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusInfo.color }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: statusInfo.color, letterSpacing: "0.05em" }}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Shipping address */}
          <div style={{ borderTop: "1px solid oklch(1 0 0 / 6%)", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "oklch(0.35 0 0)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Ships To
            </div>
            <div style={{ fontSize: "0.8rem", color: "oklch(0.60 0 0)", lineHeight: 1.7 }}>
              <div>{subscription.shippingName}</div>
              <div>{subscription.shippingAddress1}{subscription.shippingAddress2 ? `, ${subscription.shippingAddress2}` : ""}</div>
              <div>{subscription.shippingCity}, {subscription.shippingState} {subscription.shippingZip}</div>
            </div>
          </div>

          {/* Next billing */}
          {subscription.nextBillingDate && (
            <div style={{ borderTop: "1px solid oklch(1 0 0 / 6%)", paddingTop: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "oklch(0.35 0 0)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Next Box Ships
              </div>
              <div style={{ fontSize: "0.85rem", color: "oklch(0.70 0 0)" }}>
                {new Date(subscription.nextBillingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isCancelled && (
            <div style={{ borderTop: "1px solid oklch(1 0 0 / 6%)", paddingTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {isActive && (
                <button
                  className="btn-outline-white"
                  onClick={() => pause.mutate()}
                  disabled={pause.isPending}
                  style={{ fontSize: "0.75rem", padding: "0.6rem 1.5rem" }}
                >
                  <span>{pause.isPending ? "Pausing..." : "Pause Subscription"}</span>
                </button>
              )}
              {isPaused && (
                <button
                  className="btn-gold"
                  onClick={() => resume.mutate()}
                  disabled={resume.isPending}
                  style={{ fontSize: "0.75rem", padding: "0.6rem 1.5rem" }}
                >
                  <span>{resume.isPending ? "Resuming..." : "Resume Subscription"}</span>
                </button>
              )}
              {!confirmCancel ? (
                <button
                  onClick={() => setConfirmCancel(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "oklch(0.40 0 0)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.72rem",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    padding: "0.6rem 0",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  Cancel Subscription
                </button>
              ) : (
                <div style={{ width: "100%", background: "oklch(0.05 0 0)", border: "1px solid #ff444433", borderRadius: "4px", padding: "1rem", marginTop: "0.5rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "oklch(0.60 0 0)", marginBottom: "1rem" }}>
                    Are you sure? Your subscription will be cancelled immediately and no further boxes will be sent.
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => cancel.mutate()}
                      disabled={cancel.isPending}
                      style={{
                        background: "#ff4444",
                        border: "none",
                        color: "#fff",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.72rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "0.6rem 1.25rem",
                        cursor: "pointer",
                        borderRadius: "2px",
                      }}
                    >
                      {cancel.isPending ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                    <button
                      onClick={() => setConfirmCancel(false)}
                      style={{
                        background: "transparent",
                        border: "1px solid oklch(1 0 0 / 15%)",
                        color: "oklch(0.60 0 0)",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.72rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "0.6rem 1.25rem",
                        cursor: "pointer",
                        borderRadius: "2px",
                      }}
                    >
                      Keep Subscription
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isCancelled && (
            <div style={{ borderTop: "1px solid oklch(1 0 0 / 6%)", paddingTop: "1.5rem" }}>
              <p style={{ fontSize: "0.8rem", color: "oklch(0.40 0 0)", marginBottom: "1.5rem" }}>
                Your subscription has been cancelled. We hope to see you back soon.
              </p>
              <Link href="/habbits-box">
                <button className="btn-gold" style={{ fontSize: "0.75rem" }}><span>Resubscribe</span></button>
              </Link>
            </div>
          )}
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", color: "oklch(0.35 0 0)", textTransform: "uppercase", cursor: "pointer" }}>
              ← Back to Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
