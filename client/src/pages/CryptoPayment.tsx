/**
 * CryptoPayment Page — /pay/crypto
 *
 * Hidden behind VITE_CRYPTO_PAYMENTS_ENABLED feature flag.
 * Flow: enter order # → pick coin → see read-only address + amount → poll for confirmation
 */

import { useEffect, useRef, useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Bitcoin, Copy, CheckCircle2, Clock, AlertCircle, Loader2, ChevronLeft, RefreshCw } from "lucide-react";

// Crypto payments are always enabled for hemp orders
const CRYPTO_ENABLED = true;

// ── QR Code component (pure SVG via qrcode.js-like encoding) ─────────────────
// We use a simple approach: embed a data URL via the QR code API
function QRCodeDisplay({ value, size = 200 }: { value: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=0a0a0a&color=bf5fff&margin=8`;
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "1px solid oklch(1 0 0 / 12%)",
        borderRadius: "8px",
        overflow: "hidden",
        background: "oklch(0.06 0 0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={qrUrl}
        alt="Payment QR Code"
        width={size}
        height={size}
        style={{ display: "block" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

// ── Countdown Timer ───────────────────────────────────────────────────────────
function CountdownTimer({ expiresAt }: { expiresAt: string | null }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const expiry = new Date(expiresAt).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, expiry - now);
      setRemaining(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remaining === null) return null;

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 120000; // < 2 min
  const expired = remaining === 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.85rem",
        color: expired ? "#ff4444" : isUrgent ? "#ffaa00" : "oklch(0.55 0 0)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Clock size={14} />
      {expired ? (
        <span>Rate expired — please refresh</span>
      ) : (
        <span>
          Rate locked for{" "}
          <strong style={{ color: isUrgent ? "#ffaa00" : "oklch(0.75 0 0)" }}>
            {mins}:{secs.toString().padStart(2, "0")}
          </strong>
        </span>
      )}
    </div>
  );
}

// ── Coin selector ─────────────────────────────────────────────────────────────
const COINS = [
  { id: "btc" as const, label: "Bitcoin", symbol: "BTC", color: "#f7931a" },
  { id: "eth" as const, label: "Ethereum", symbol: "ETH", color: "#627eea" },
  { id: "doge" as const, label: "Dogecoin", symbol: "DOGE", color: "#c2a633" },
];

type CoinId = "btc" | "eth" | "doge";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    waiting: { label: "Waiting for payment", color: "#888" },
    confirming: { label: "Confirming…", color: "#ffaa00" },
    confirmed: { label: "Confirmed!", color: "#22c55e" },
    finished: { label: "Payment complete!", color: "#22c55e" },
    failed: { label: "Payment failed", color: "#ff4444" },
    expired: { label: "Expired", color: "#ff4444" },
    partially_paid: { label: "Partial payment received", color: "#ffaa00" },
  };
  const info = map[status] ?? { label: status, color: "#888" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.25rem 0.75rem",
        borderRadius: "999px",
        background: `${info.color}22`,
        border: `1px solid ${info.color}55`,
        color: info.color,
        fontSize: "0.8rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {status === "confirmed" || status === "finished" ? (
        <CheckCircle2 size={12} />
      ) : status === "failed" || status === "expired" ? (
        <AlertCircle size={12} />
      ) : (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: info.color,
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
      {info.label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CryptoPayment() {
  // ── State ────────────────────────────────────────────────────────────────
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialOrderNumber = params.get("order") ?? "";

  const [orderInput, setOrderInput] = useState(initialOrderNumber);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState(initialOrderNumber || "");
  const [selectedCoin, setSelectedCoin] = useState<CoinId>("btc");
  const [paymentCreated, setPaymentCreated] = useState<{
    paymentId: string;
    payAddress: string;
    payAmount: string;
    payCurrency: string;
    orderNumber: string;
    amountUsd: number;
    expiresAt: string | null;
    status: string;
  } | null>(null);
  const [copied, setCopied] = useState<"address" | "amount" | null>(null);
  const [pollEnabled, setPollEnabled] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setLocation] = useLocation();

  // ── Queries ──────────────────────────────────────────────────────────────
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = trpc.cryptoPayments.lookupOrder.useQuery(
    { orderNumber: submittedOrderNumber },
    { enabled: !!submittedOrderNumber, retry: false }
  );

  const createPaymentMutation = trpc.cryptoPayments.createPayment.useMutation({
    onSuccess: (data) => {
      setPaymentCreated(data);
      setPollEnabled(true);
      setPaymentStatus(data.status);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create payment");
    },
  });

  const { data: statusData, refetch: refetchStatus } = trpc.cryptoPayments.getPaymentStatus.useQuery(
    { paymentId: paymentCreated?.paymentId ?? "" },
    { enabled: pollEnabled && !!paymentCreated?.paymentId, refetchInterval: 15000, retry: false }
  );

  useEffect(() => {
    if (statusData) {
      setPaymentStatus(statusData.status);
      if (statusData.status === "finished" || statusData.status === "confirmed") {
        setPollEnabled(false);
        toast.success("Payment confirmed! Your order is being processed.");
        // Redirect to order confirmation after a short delay
        const orderNum = paymentCreated?.orderNumber || submittedOrderNumber;
        if (orderNum) {
          setTimeout(() => setLocation(`/order-confirmation/${orderNum}`), 2500);
        }
      } else if (statusData.status === "failed" || statusData.status === "expired") {
        setPollEnabled(false);
        toast.error(`Payment ${statusData.status}. Please try again.`);
      }
    }
  }, [statusData]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleLookupOrder(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = orderInput.trim().toUpperCase();
    if (!trimmed) return;
    setSubmittedOrderNumber(trimmed);
    setPaymentCreated(null);
    setPaymentStatus(null);
    setPollEnabled(false);
  }

  function handleCreatePayment() {
    if (!orderData) return;
    createPaymentMutation.mutate({ orderIdNum: orderData.id, coin: selectedCoin });
  }

  async function handleCopy(text: string, type: "address" | "amount") {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast.success(`${type === "address" ? "Address" : "Amount"} copied!`);
  }

  const isPaid =
    paymentStatus === "finished" ||
    paymentStatus === "confirmed" ||
    orderData?.paymentStatus === "paid";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "oklch(0.04 0 0)",
        padding: "6rem 1.5rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Moving background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 2%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 2%) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
          zIndex: 0,
          animation: "slow-rotate 120s linear infinite",
        }}
      />
      {/* Purple glow */}
      <div
        style={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, #bf5fff08 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto" }}>
        {/* Back link */}
        <Link href="/">
          <a
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "oklch(0.45 0 0)",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "2rem",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            <ChevronLeft size={14} />
            Back to store
          </a>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="section-label" style={{ marginBottom: "0.75rem" }}>
            Secure Crypto Checkout
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(2.5rem, 8vw, 4rem)",
              color: "oklch(0.96 0 0)",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            Pay with Crypto
          </h1>
          <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Enter your order number to pay with Bitcoin, Ethereum, or Dogecoin.
            The exact amount is set automatically — do not send a different amount.
          </p>
        </div>

        {/* ── Step 1: Order Lookup ── */}
        <div
          style={{
            background: "oklch(0.07 0 0)",
            border: "1px solid oklch(1 0 0 / 8%)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "oklch(0.45 0 0)",
              textTransform: "uppercase",
              marginBottom: "1rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Step 1 — Enter Order Number
          </div>
          <form onSubmit={handleLookupOrder} style={{ display: "flex", gap: "0.75rem" }}>
            <input
              type="text"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              placeholder="e.g. LH-00042"
              style={{
                flex: 1,
                background: "oklch(0.04 0 0)",
                border: "1px solid oklch(1 0 0 / 12%)",
                borderRadius: "8px",
                padding: "0.65rem 1rem",
                color: "oklch(0.96 0 0)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9rem",
                outline: "none",
                letterSpacing: "0.05em",
              }}
            />
            <button
              type="submit"
              disabled={orderLoading || !orderInput.trim()}
              className="btn-gold"
              style={{ whiteSpace: "nowrap", padding: "0.65rem 1.25rem" }}
            >
              <span>{orderLoading ? "Looking up…" : "Look Up"}</span>
            </button>
          </form>

          {/* Order error */}
          {orderError && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.65rem 1rem",
                background: "#ff444422",
                border: "1px solid #ff444444",
                borderRadius: "8px",
                color: "#ff8888",
                fontSize: "0.85rem",
              }}
            >
              <AlertCircle size={14} style={{ display: "inline", marginRight: "0.4rem" }} />
              {orderError.message}
            </div>
          )}

          {/* Order found */}
          {orderData && !orderError && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.65rem 1rem",
                background: "#22c55e11",
                border: "1px solid #22c55e33",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#22c55e",
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "0.2rem",
                  }}
                >
                  Order Found
                </div>
                <div style={{ color: "oklch(0.96 0 0)", fontWeight: 600 }}>
                  {orderData.orderNumber}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "oklch(0.55 0 0)", fontSize: "0.75rem" }}>Total</div>
                <div
                  className="text-holo"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem" }}
                >
                  ${orderData.amountUsd.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Step 2: Coin Selection ── */}
        {orderData && !isPaid && (
          <div
            style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "oklch(0.45 0 0)",
                textTransform: "uppercase",
                marginBottom: "1rem",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Step 2 — Select Coin
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {COINS.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => {
                    setSelectedCoin(coin.id);
                    setPaymentCreated(null);
                    setPaymentStatus(null);
                    setPollEnabled(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem 0.5rem",
                    borderRadius: "8px",
                    border: `1px solid ${selectedCoin === coin.id ? coin.color : "oklch(1 0 0 / 10%)"}`,
                    background:
                      selectedCoin === coin.id ? `${coin.color}18` : "oklch(0.04 0 0)",
                    color: selectedCoin === coin.id ? coin.color : "oklch(0.55 0 0)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "center",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  <div style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>{coin.symbol}</div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>{coin.label}</div>
                </button>
              ))}
            </div>

            {!paymentCreated && (
              <button
                onClick={handleCreatePayment}
                disabled={createPaymentMutation.isPending}
                className="btn-gold"
                style={{ width: "100%", padding: "0.75rem" }}
              >
                <span>
                  {createPaymentMutation.isPending ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      Generating payment address…
                    </span>
                  ) : (
                    `Generate ${COINS.find((c) => c.id === selectedCoin)?.symbol} Address`
                  )}
                </span>
              </button>
            )}
          </div>
        )}

        {/* ── Step 3: Payment Details ── */}
        {paymentCreated && !isPaid && (
          <div
            style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "oklch(0.45 0 0)",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Step 3 — Send Payment</span>
              {paymentStatus && <StatusBadge status={paymentStatus} />}
            </div>

            {/* QR + address */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                alignItems: "flex-start",
                marginBottom: "1.25rem",
                flexWrap: "wrap",
              }}
            >
              <QRCodeDisplay value={paymentCreated.payAddress} size={160} />
              <div style={{ flex: 1, minWidth: 200 }}>
                {/* Amount — READ ONLY */}
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      color: "oklch(0.45 0 0)",
                      textTransform: "uppercase",
                      marginBottom: "0.4rem",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Exact Amount to Send
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      background: "oklch(0.04 0 0)",
                      border: "1px solid oklch(1 0 0 / 12%)",
                      borderRadius: "8px",
                      padding: "0.6rem 0.9rem",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "oklch(0.96 0 0)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {paymentCreated.payAmount}{" "}
                      <span style={{ color: COINS.find((c) => c.id === selectedCoin)?.color }}>
                        {paymentCreated.payCurrency}
                      </span>
                    </span>
                    <button
                      onClick={() => handleCopy(paymentCreated.payAmount, "amount")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: copied === "amount" ? "#22c55e" : "oklch(0.45 0 0)",
                        padding: "0.2rem",
                        transition: "color 0.2s",
                      }}
                      title="Copy amount"
                    >
                      {copied === "amount" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "oklch(0.35 0 0)",
                      marginTop: "0.3rem",
                      fontStyle: "italic",
                    }}
                  >
                    ≈ ${paymentCreated.amountUsd.toFixed(2)} USD — send the exact crypto amount above
                  </div>
                </div>

                {/* Countdown */}
                <CountdownTimer expiresAt={paymentCreated.expiresAt} />
              </div>
            </div>

            {/* Wallet address */}
            <div>
              <div
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  color: "oklch(0.45 0 0)",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Send to Address
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "oklch(0.04 0 0)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: "8px",
                  padding: "0.6rem 0.9rem",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontFamily: "'Inter', monospace",
                    fontSize: "0.78rem",
                    color: "oklch(0.75 0 0)",
                    wordBreak: "break-all",
                    letterSpacing: "0.02em",
                  }}
                >
                  {paymentCreated.payAddress}
                </span>
                <button
                  onClick={() => handleCopy(paymentCreated.payAddress, "address")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: copied === "address" ? "#22c55e" : "oklch(0.45 0 0)",
                    padding: "0.2rem",
                    flexShrink: 0,
                    transition: "color 0.2s",
                  }}
                  title="Copy address"
                >
                  {copied === "address" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Polling indicator */}
            <div
              style={{
                marginTop: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "oklch(0.45 0 0)",
                  fontSize: "0.78rem",
                }}
              >
                <RefreshCw size={13} style={{ animation: pollEnabled ? "spin 3s linear infinite" : "none" }} />
                {pollEnabled ? "Checking for payment every 15 seconds…" : "Polling paused"}
              </div>
              <button
                onClick={() => refetchStatus()}
                style={{
                  background: "none",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: "6px",
                  padding: "0.3rem 0.75rem",
                  color: "oklch(0.55 0 0)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Check now
              </button>
            </div>

            {/* Warning */}
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                background: "#ffaa0011",
                border: "1px solid #ffaa0033",
                borderRadius: "8px",
                color: "#ffaa00",
                fontSize: "0.78rem",
                lineHeight: 1.5,
              }}
            >
              <strong>Important:</strong> Send the exact amount shown above. Sending a different amount may
              result in a delayed or failed payment. Do not close this page until payment is confirmed.
            </div>
          </div>
        )}

        {/* ── Payment Confirmed ── */}
        {isPaid && (
          <div
            style={{
              background: "#22c55e0d",
              border: "1px solid #22c55e44",
              borderRadius: "12px",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <CheckCircle2 size={48} style={{ color: "#22c55e", margin: "0 auto 1rem" }} />
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2rem",
                color: "#22c55e",
                marginBottom: "0.5rem",
              }}
            >
              Payment Confirmed!
            </h2>
            <p style={{ color: "oklch(0.55 0 0)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Your order <strong style={{ color: "oklch(0.85 0 0)" }}>{orderData?.orderNumber}</strong> is
              now being processed. You will receive an email confirmation shortly.
            </p>
            <Link href="/">
              <button className="btn-gold"><span>Return to Store</span></button>
            </Link>
          </div>
        )}

        {/* Footer note */}
        <p
          style={{
            marginTop: "2rem",
            textAlign: "center",
            color: "oklch(0.30 0 0)",
            fontSize: "0.72rem",
            lineHeight: 1.6,
          }}
        >
          Powered by NOWPayments. Crypto payments are processed on-chain and may take up to 30 minutes to
          confirm depending on network conditions.
          <br />
          Need help? <Link href="/contact"><a style={{ color: "oklch(0.45 0 0)" }}>Contact us</a></Link>.
        </p>
      </div>
    </div>
  );
}
