/**
 * Affiliate Dashboard — Luxurious Habbits
 * Unique affiliate link, click tracking, commission history, site credit info.
 */
import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { Copy, CheckCheck, ExternalLink, TrendingUp, DollarSign, MousePointer, ShoppingBag } from "lucide-react";

export default function AffiliateDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);
  const { data: dashboard, isLoading, refetch } = trpc.affiliates.getDashboard.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const applyMutation = trpc.affiliates.applyForAffiliate.useMutation({
    onSuccess: () => {
      toast.success("Welcome to the affiliate program!");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (authLoading) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)" }}>LOADING...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <SEO title="Affiliate Program — Luxurious Habbits" canonical="/affiliate" />
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)" }}>AFFILIATE PROGRAM</div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.45 0 0)" }}>Please log in to access your affiliate dashboard.</p>
        <a href={getLoginUrl()}>
          <button className="btn-gold"><span>Log In</span></button>
        </a>
      </div>
    );
  }

  const affiliateLink = dashboard?.affiliate
    ? `https://www.luxurioushabbits.com/?ref=${dashboard.affiliate.affiliateCode}`
    : null;

  const handleCopyLink = async () => {
    if (!affiliateLink) return;
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success("Affiliate link copied!");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Affiliate Dashboard — Luxurious Habbits"
        description="Track your affiliate earnings, clicks, and conversions."
        canonical="/affiliate"
      />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.5rem" }}>
            AFFILIATE DASHBOARD
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.6 }}>
            Earn {dashboard?.affiliate?.commissionPercent ?? "10"}% commission on every sale you refer — paid as site credit to your account.
          </p>
        </div>

        {/* Not enrolled yet */}
        {!isLoading && !dashboard && (
          <div style={{ background: "oklch(0.07 0 0)", border: "1px solid #bf5fff33", borderRadius: "12px", padding: "3rem 2rem", textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>
              JOIN THE AFFILIATE PROGRAM
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.50 0 0)", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 2rem" }}>
              Share your unique link. Earn 10% commission on every order placed through it. No cap. Commissions are issued as site credit — redeemable at checkout.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {[["10%", "Commission Rate"], ["$0", "Minimum Balance"], ["30 days", "Cookie Window"]].map(([val, label]) => (
                <div key={label} style={{ textAlign: "center", padding: "1rem 1.5rem", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#bf5fff" }}>{val}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => applyMutation.mutate({})}
              disabled={applyMutation.isPending}
              className="btn-gold"
            >
              <span>{applyMutation.isPending ? "Joining..." : "Join Now — It's Free"}</span>
            </button>
          </div>
        )}

        {/* Dashboard */}
        {dashboard && (
          <>
            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { icon: <MousePointer size={18} />, label: "Total Clicks", value: dashboard.totalClicks.toLocaleString(), color: "#bf5fff" },
                { icon: <ShoppingBag size={18} />, label: "Conversions", value: dashboard.totalConversions.toLocaleString(), color: "#d4af37" },
                { icon: <TrendingUp size={18} />, label: "Total Earned", value: `$${(dashboard.totalEarnedCents / 100).toFixed(2)}`, color: "#00e5a0" },
                { icon: <DollarSign size={18} />, label: "Pending Credit", value: `$${(dashboard.unpaidCents / 100).toFixed(2)}`, color: "#00f5ff" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "10px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: stat.color }}>
                    {stat.icon}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)" }}>{stat.label}</span>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.05em", color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Affiliate link */}
            <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "12px", padding: "1.75rem", marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>
                YOUR AFFILIATE LINK
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "6px", padding: "0.7rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.60 0 0)", wordBreak: "break-all", minWidth: "200px" }}>
                  {affiliateLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: copied ? "#00e5a022" : "oklch(0.10 0 0)", border: `1px solid ${copied ? "#00e5a044" : "oklch(1 0 0 / 12%)"}`, color: copied ? "#00e5a0" : "oklch(0.65 0 0)", padding: "0.65rem 1.1rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", transition: "all 150ms ease", whiteSpace: "nowrap" }}
                >
                  {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={affiliateLink ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 12%)", color: "oklch(0.55 0 0)", padding: "0.65rem 1.1rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, textDecoration: "none" }}
                >
                  <ExternalLink size={14} />
                  Preview
                </a>
              </div>
              <div style={{ marginTop: "0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.35 0 0)" }}>
                Code: <strong style={{ color: "oklch(0.50 0 0)" }}>{dashboard.affiliate.affiliateCode}</strong> · Commission: <strong style={{ color: "#bf5fff" }}>{dashboard.affiliate.commissionPercent}%</strong> · Status: <strong style={{ color: dashboard.affiliate.status === "active" ? "#00e5a0" : "#ff4444" }}>{dashboard.affiliate.status}</strong>
              </div>
            </div>

            {/* Site credit info */}
            <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "12px", padding: "1.75rem", marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>
                CREDIT INFORMATION
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.55 0 0)", lineHeight: 1.6 }}>
                Commissions are issued as <strong style={{ color: "#bf5fff" }}>site credit</strong> directly to your Luxurious Habbits account. Credit is redeemable at checkout on any order — no minimum balance required.
              </div>
              <div style={{ marginTop: "0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.30 0 0)" }}>
                Total site credit issued: <strong style={{ color: "oklch(0.45 0 0)" }}>${(dashboard.totalPaidCents / 100).toFixed(2)}</strong>
              </div>
            </div>

            {/* Conversion history */}
            {dashboard.conversions.length > 0 && (
              <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "12px", padding: "1.75rem" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "1.25rem" }}>
                  CONVERSION HISTORY
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {dashboard.conversions.slice(0, 20).map(conv => (
                    <div key={conv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "oklch(0.05 0 0)", borderRadius: "6px", gap: "1rem" }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.45 0 0)" }}>
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.65 0 0)" }}>
                        Order #{conv.orderId} · ${(conv.orderTotalCents / 100).toFixed(2)}
                      </div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#00e5a0" }}>
                        +${(conv.commissionCents / 100).toFixed(2)}
                      </div>
                      <div style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.62rem",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        background: conv.status === "paid" ? "#00e5a022" : conv.status === "approved" ? "#bf5fff22" : "#d4af3722",
                        color: conv.status === "paid" ? "#00e5a0" : conv.status === "approved" ? "#bf5fff" : "#d4af37",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {conv.status === "paid" ? "credited" : conv.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Back to account */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link href="/account">
            <button style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", color: "oklch(0.40 0 0)", padding: "0.65rem 1.5rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer" }}>
              ← Back to Account
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
