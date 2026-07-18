/**
 * Track Order Page — Luxurious Habbits
 * Public lookup by order number + email. Shows status timeline and carrier tracking link.
 * Also includes a universal tracking number lookup with carrier auto-detection.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import { Package, Truck, CheckCircle, Clock, XCircle, ExternalLink, Search } from "lucide-react";

const CARRIERS: Record<string, { name: string; color: string; trackUrl: (n: string) => string }> = {
  ups: { name: "UPS", color: "#f5a623", trackUrl: n => `https://www.ups.com/track?tracknum=${n}&requester=ST/trackdetails` },
  usps: { name: "USPS", color: "#004b87", trackUrl: n => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}` },
  fedex: { name: "FedEx", color: "#4d148c", trackUrl: n => `https://www.fedex.com/fedextrack/?trknbr=${n}` },
  dhl: { name: "DHL", color: "#ffcc00", trackUrl: n => `https://www.dhl.com/en/express/tracking.html?AWB=${n}` },
};

/** Detect carrier from tracking number format */
function detectCarrier(num: string): keyof typeof CARRIERS | null {
  const n = num.replace(/\s/g, "").toUpperCase();
  // UPS: starts with 1Z
  if (/^1Z[A-Z0-9]{16}$/i.test(n)) return "ups";
  // USPS: 20-22 digit numeric, or starts with 94/93/92/91/90/70/23/82
  if (/^(94|93|92|91|90|70|23|82)\d{18,20}$/.test(n)) return "usps";
  if (/^\d{20,22}$/.test(n)) return "usps";
  // FedEx: 12-digit, 15-digit, or 20-digit numeric
  if (/^\d{12}$/.test(n)) return "fedex";
  if (/^\d{15}$/.test(n)) return "fedex";
  if (/^\d{20}$/.test(n)) return "fedex";
  // DHL: starts with JD or 10-digit numeric
  if (/^JD\d{18}$/.test(n)) return "dhl";
  return null;
}

const CARRIER_LOGOS: Record<string, string> = {
  ups: "UPS",
  usps: "USPS",
  fedex: "FedEx",
  dhl: "DHL",
};

function UniversalTracker() {
  const [trackingInput, setTrackingInput] = useState("");
  const [result, setResult] = useState<{ carrier: keyof typeof CARRIERS | null; number: string } | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = trackingInput.trim();
    if (!cleaned) return;
    const carrier = detectCarrier(cleaned);
    setResult({ carrier, number: cleaned });
  };

  const carrierInfo = result?.carrier ? CARRIERS[result.carrier] : null;

  return (
    <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem", marginBottom: "2rem" }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
        Track Any Package
      </div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.9rem", color: "oklch(0.50 0 0)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
        Enter any UPS, USPS, FedEx, or DHL tracking number — from any order, anywhere.
      </p>
      <form onSubmit={handleTrack} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <input
          type="text"
          value={trackingInput}
          onChange={e => { setTrackingInput(e.target.value); setResult(null); }}
          placeholder="e.g. 1Z999AA10123456784 or 9400111899223397910908"
          style={{
            flex: 1,
            minWidth: "220px",
            background: "oklch(0.05 0 0)",
            border: "1px solid oklch(1 0 0 / 12%)",
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            color: "oklch(0.85 0 0)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.8rem",
            outline: "none",
          }}
        />
        <button type="submit" className="btn-gold" style={{ whiteSpace: "nowrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Search size={14} /> Detect & Track
          </span>
        </button>
      </form>

      {/* Result */}
      {result && (
        <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "oklch(0.05 0 0)", borderRadius: "8px", border: `1px solid ${carrierInfo ? carrierInfo.color + "44" : "oklch(1 0 0 / 8%)"}` }}>
          {carrierInfo ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <span style={{
                  padding: "0.3rem 0.9rem",
                  borderRadius: "20px",
                  fontSize: "0.7rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: carrierInfo.color + "22",
                  color: carrierInfo.color,
                  border: `1px solid ${carrierInfo.color}44`,
                }}>
                  {CARRIER_LOGOS[result.carrier!]} Detected
                </span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", color: "oklch(0.80 0 0)" }}>
                  {result.number}
                </span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.50 0 0)", marginBottom: "1rem", lineHeight: 1.6 }}>
                Carrier detected as <strong style={{ color: carrierInfo.color }}>{carrierInfo.name}</strong>. Click below to view the full tracking history, current location, and estimated delivery date directly from {carrierInfo.name}.
              </p>
              <a
                href={carrierInfo.trackUrl(result.number)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.7rem 1.5rem",
                  background: carrierInfo.color + "22",
                  border: `1px solid ${carrierInfo.color}66`,
                  borderRadius: "6px",
                  color: carrierInfo.color,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "all 200ms ease",
                }}
              >
                View Live Tracking on {carrierInfo.name} <ExternalLink size={13} />
              </a>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <XCircle size={18} style={{ color: "#ff6b6b" }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.70 0 0)", fontWeight: 600 }}>Carrier not auto-detected</span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)", lineHeight: 1.6, margin: 0 }}>
                We couldn't identify the carrier from this number. Try tracking it directly:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {Object.entries(CARRIERS).map(([key, c]) => (
                  <a
                    key={key}
                    href={c.trackUrl(result.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: "6px",
                      background: c.color + "18",
                      border: `1px solid ${c.color}44`,
                      color: c.color,
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                    }}
                  >
                    Try {c.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: <Clock size={18} /> },
  { key: "processing", label: "Processing", icon: <Package size={18} /> },
  { key: "shipped", label: "Shipped", icon: <Truck size={18} /> },
  { key: "delivered", label: "Delivered", icon: <CheckCircle size={18} /> },
];

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "oklch(0.07 0 0)",
  border: "1px solid oklch(1 0 0 / 12%)",
  borderRadius: "6px",
  padding: "0.75rem 1rem",
  color: "oklch(0.85 0 0)",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.8rem",
  outline: "none",
  boxSizing: "border-box",
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [queryKey, setQueryKey] = useState<{ orderNumber: string; email: string } | null>(null);

  const { data, isLoading, error } = trpc.orders.getByNumber.useQuery(
    queryKey ?? { orderNumber: "", email: "" },
    { enabled: !!queryKey, retry: false }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;
    setSubmitted(true);
    setQueryKey({ orderNumber: orderNumber.trim().toUpperCase(), email: email.trim().toLowerCase() });
  };

  const order = data?.order;
  const items = data?.items ?? [];

  const currentStatusIdx = order ? STATUS_ORDER.indexOf(order.status) : -1;
  const isCancelled = order?.status === "cancelled";

  const getCarrierLink = () => {
    if (!order?.trackingNumber) return null;
    const carrier = CARRIERS[order.trackingCarrier?.toLowerCase() ?? "ups"] ?? CARRIERS.ups;
    return { url: carrier.trackUrl(order.trackingNumber), name: carrier.name };
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO title="Track Your Order — Luxurious Habbits" canonical="/track-order" />

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="section-label" style={{ marginBottom: "0.75rem" }}>Order Tracking</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            TRACK YOUR <span className="text-holo">ORDER</span>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "oklch(0.45 0 0)", marginTop: "0.75rem" }}>
            Enter your order number and email to check your shipment status.
          </p>
        </div>

        {/* Universal Package Tracker */}
        <UniversalTracker />

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ flex: 1, height: "1px", background: "oklch(1 0 0 / 6%)" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.30 0 0)", letterSpacing: "0.15em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Or track a Luxurious Habbits order</span>
          <div style={{ flex: 1, height: "1px", background: "oklch(1 0 0 / 6%)" }} />
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleSubmit} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g. LH-2024-00001"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="The email used at checkout"
                style={inputStyle}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-gold"
              style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
              disabled={isLoading}
            >
              <span>{isLoading ? "Looking up..." : "Track Order"}</span>
            </button>
          </div>
        </form>

        {/* Results */}
        {submitted && !isLoading && (
          <>
            {error || !order ? (
              <div style={{ background: "oklch(0.07 0 0)", border: "1px solid #ff444433", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
                <XCircle size={32} style={{ color: "#ff4444", marginBottom: "1rem" }} />
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "oklch(0.80 0 0)", letterSpacing: "0.05em" }}>ORDER NOT FOUND</div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", marginTop: "0.5rem" }}>
                  Please double-check your order number and email address. Contact us at support@luxurioushabbits.com if you need help.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Order Summary Card */}
                <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "1.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.96 0 0)", letterSpacing: "0.1em" }}>{order.orderNumber}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", marginTop: "0.2rem" }}>
                        Placed {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    </div>
                    <span style={{
                      padding: "0.3rem 0.8rem",
                      borderRadius: "20px",
                      fontSize: "0.65rem",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      background: isCancelled ? "#ff444422" : order.status === "delivered" ? "#00e5a022" : order.status === "shipped" ? "#00f5ff22" : "#bf5fff22",
                      color: isCancelled ? "#ff4444" : order.status === "delivered" ? "#00e5a0" : order.status === "shipped" ? "#00f5ff" : "#bf5fff",
                      border: `1px solid ${isCancelled ? "#ff444444" : order.status === "delivered" ? "#00e5a044" : order.status === "shipped" ? "#00f5ff44" : "#bf5fff44"}`,
                    }}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {items.map((item: any) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.75 0 0)" }}>{item.productName}</div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)" }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.65 0 0)" }}>
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", color: "oklch(0.70 0 0)", letterSpacing: "0.08em" }}>TOTAL</span>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "#bf5fff", letterSpacing: "0.05em" }}>${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled && (
                  <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "1.75rem" }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                      Shipment Status
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0", position: "relative" }}>
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStatusIdx;
                        const isCurrent = idx === currentStatusIdx;
                        return (
                          <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                            {/* Connector line */}
                            {idx < STATUS_STEPS.length - 1 && (
                              <div style={{
                                position: "absolute",
                                top: "18px",
                                left: "50%",
                                width: "100%",
                                height: "2px",
                                background: idx < currentStatusIdx ? "#bf5fff" : "oklch(1 0 0 / 10%)",
                                transition: "background 300ms ease",
                              }} />
                            )}
                            {/* Icon circle */}
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: isCompleted ? (isCurrent ? "#bf5fff" : "#bf5fff44") : "oklch(0.10 0 0)",
                              border: `2px solid ${isCompleted ? "#bf5fff" : "oklch(1 0 0 / 12%)"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isCompleted ? (isCurrent ? "#fff" : "#bf5fff") : "oklch(0.30 0 0)",
                              position: "relative",
                              zIndex: 1,
                              transition: "all 300ms ease",
                            }}>
                              {step.icon}
                            </div>
                            <div style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.6rem",
                              color: isCompleted ? (isCurrent ? "oklch(0.90 0 0)" : "oklch(0.60 0 0)") : "oklch(0.30 0 0)",
                              marginTop: "0.5rem",
                              textAlign: "center",
                              letterSpacing: "0.05em",
                              fontWeight: isCurrent ? 700 : 400,
                            }}>
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div style={{ background: "oklch(0.07 0 0)", border: "1px solid #00f5ff22", borderRadius: "12px", padding: "1.5rem" }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                      Tracking Information
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                      <div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", marginBottom: "0.2rem" }}>
                          {order.trackingCarrier ? order.trackingCarrier.toUpperCase() : "CARRIER"} Tracking Number
                        </div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.15em", color: "#00f5ff" }}>
                          {order.trackingNumber}
                        </div>
                      </div>
                      {getCarrierLink() && (
                        <a
                          href={getCarrierLink()!.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.6rem 1.2rem",
                            background: "#00f5ff22",
                            border: "1px solid #00f5ff44",
                            borderRadius: "6px",
                            color: "#00f5ff",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textDecoration: "none",
                            textTransform: "uppercase",
                          }}
                        >
                          Track on {getCarrierLink()!.name}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {order.shippingAddress1 && (
                  <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "12px", padding: "1.5rem" }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                      Shipping To
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.65 0 0)", lineHeight: 1.7 }}>
                      <div>{order.shippingName}</div>
                      <div>{order.shippingAddress1}{order.shippingAddress2 ? `, ${order.shippingAddress2}` : ""}</div>
                      <div>{order.shippingCity}, {order.shippingState} {order.shippingZip}</div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </>
        )}

        {/* Help footer */}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.30 0 0)", letterSpacing: "0.05em" }}>
            Questions about your order?{" "}
            <a href="mailto:support@luxurioushabbits.com" style={{ color: "oklch(0.50 0 0)", textDecoration: "underline" }}>
              support@luxurioushabbits.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
