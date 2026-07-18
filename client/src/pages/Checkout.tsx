/**
 * Checkout Page — Luxurious Habbits
 * Full checkout form with order summary. Payment placeholder until Authorize.net.
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import SEO from "@/components/SEO";
import { ShoppingBag, Lock, ChevronRight, Sparkles, Bitcoin } from "lucide-react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { STRAIN_COLORS } from "@/data/strainColors";
import { RESTRICTED_STATES, RESTRICTED_STATE_NAMES } from "@shared/const";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "oklch(0.07 0 0)",
  border: "1px solid oklch(1 0 0 / 12%)",
  borderRadius: "6px",
  padding: "0.7rem 0.9rem",
  color: "oklch(0.85 0 0)",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.8rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 150ms ease",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.65rem",
  color: "oklch(0.45 0 0)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "0.35rem",
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function Checkout() {
  const { items, total, clearCart, addItem } = useCart();
  const [, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Redirect to products if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      setLocation("/products");
    }
  }, [items.length, setLocation]);

  // Upsell: get the dominant strain type from cart items
  const cartProductIds = useMemo(() => items.map(i => i.productId), [items]);
  const dominantStrainType = useMemo(() => {
    const types = items.map(i => (i as any).strainType).filter(Boolean);
    if (!types.length) return undefined;
    const counts: Record<string, number> = {};
    types.forEach((t: string) => { counts[t] = (counts[t] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as "indica" | "sativa" | "hybrid" | undefined;
  }, [items]);

  const { data: relatedProducts } = trpc.catalog.getRelated.useQuery(
    { strainType: dominantStrainType, excludeProductIds: cartProductIds, limit: 3 },
    { enabled: items.length > 0 }
  );

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address1: "", address2: "", city: "", state: "", zip: "",
  });
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  // Restricted state check — accessories are exempt from hemp restrictions
  const cartHasHempProducts = items.some(i => i.category !== "accessory");
  const cartIsAccessoriesOnly = items.length > 0 && items.every(i => i.category === "accessory");
  // Subscription box detection — credits cannot be applied to subscription box orders
  const cartIsSubscriptionOrder = items.some(i =>
    i.name?.toLowerCase().includes("habbits box") ||
    i.name?.toLowerCase().includes("stoner box")
  );
  const isRestrictedState = form.state.length === 2 && RESTRICTED_STATES.includes(form.state.toUpperCase()) && cartHasHempProducts;
  const restrictedStateName = isRestrictedState ? (RESTRICTED_STATE_NAMES[form.state.toUpperCase()] ?? form.state) : null;
  const [referralInput, setReferralInput] = useState("");
  const [appliedReferral, setAppliedReferral] = useState<string | null>(null);
  const createOrder = trpc.orders.create.useMutation();
  const markCartRecovered = trpc.abandonedCarts.markRecovered.useMutation();
  const saveCart = trpc.abandonedCarts.saveCart.useMutation();
  const { data: testModeData, refetch: refetchTestMode } = trpc.siteSettings.getTestMode.useQuery(
    undefined,
    { refetchInterval: 30_000 } // re-check every 30s in case admin disables it
  );
  const isTestMode = testModeData?.enabled ?? false;
  const testModeExpiresAt = testModeData?.expiresAt ?? null;
  const recordCustomerAttempt = trpc.siteSettings.recordCustomerAttempt.useMutation();

  // 4:20 countdown for customers blocked by test mode
  const [customerCountdown, setCustomerCountdown] = useState<number>(260); // 4min 20sec = 260s
  const [showTestModeBlock, setShowTestModeBlock] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // When a non-admin customer tries to submit while test mode is on, show the countdown
  const triggerCustomerBlock = () => {
    if (showTestModeBlock) return; // already showing
    setCustomerCountdown(260);
    setShowTestModeBlock(true);
    recordCustomerAttempt.mutate();
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCustomerCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setShowTestModeBlock(false);
          refetchTestMode(); // re-check if test mode is still on
          return 260;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const shipping = total >= 50 ? 0 : 9.99;
  const { isAuthenticated, user } = useAuth();

  // Saved addresses
  const { data: savedAddresses } = trpc.addresses.list.useQuery(undefined, { enabled: isAuthenticated });
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const applySavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setForm(f => ({
      ...f,
      firstName: addr.firstName,
      lastName: addr.lastName,
      address1: addr.address1,
      address2: addr.address2 ?? "",
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      phone: addr.phone ?? f.phone,
    }));
  };

  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0); // in dollars
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);
  const [reviewCreditDiscount, setReviewCreditDiscount] = useState(0); // in dollars
  const [reviewCreditsToRedeem, setReviewCreditsToRedeem] = useState(0);
  const [reviewCreditApplied, setReviewCreditApplied] = useState(false);
  const { data: loyaltyBalance } = trpc.loyalty.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  const { data: loyaltyBreakdown } = trpc.loyalty.getBalanceBreakdown.useQuery(undefined, { enabled: isAuthenticated });
  const redeemMutation = trpc.loyalty.redeemPoints.useMutation();
  const redeemReviewMutation = trpc.loyalty.redeemReviewCredits.useMutation();

  // Coupon code state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  // PayPal state
  const [paypalCaptureId, setPaypalCaptureId] = useState<string | null>(null);
  const [paypalApproved, setPaypalApproved] = useState(false);
  const createPaypalOrder = trpc.paypal.createOrder.useMutation();
  const capturePaypalOrder = trpc.paypal.captureOrder.useMutation();
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "";
  const paypalEnabled = paypalClientId !== "";

  // Keep a ref to the latest form/cart state for PayPal callbacks (avoids stale closures)
  const checkoutStateRef = useRef<any>({});
  useEffect(() => {
    const couponDiscount = appliedCoupon ? (total * appliedCoupon.discountPct) / 100 : 0;
    checkoutStateRef.current = { form, items, total, shipping, loyaltyDiscount, reviewCreditDiscount, couponDiscount, appliedCoupon, appliedReferral, smsOptIn, tosAccepted, isRestrictedState, user, loyaltyApplied, pointsToRedeem, reviewCreditApplied, reviewCreditsToRedeem };
  });

  // Authorize.net Accept.js state
  const [paymentNonce, setPaymentNonce] = useState<string | null>(null);
  const [paymentDataDescriptor, setPaymentDataDescriptor] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState(""); // MM/YY
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);
  const [tokenizing, setTokenizing] = useState(false);
  const authNetClientKey = import.meta.env.VITE_AUTHORIZE_NET_CLIENT_KEY ?? "";
  const authNetApiLoginId = import.meta.env.VITE_AUTHORIZE_NET_API_LOGIN_ID ?? "";
  const authNetEnabled = authNetClientKey !== "" && authNetApiLoginId !== "";
  const authNetEnvironment = import.meta.env.VITE_AUTHORIZE_NET_ENVIRONMENT ?? "production";

  // Load Accept.js script when Authorize.net is configured
  useEffect(() => {
    if (!authNetEnabled) return;
    const scriptUrl = authNetEnvironment === "sandbox"
      ? "https://jstest.authorize.net/v1/Accept.js"
      : "https://js.authorize.net/v1/Accept.js";
    if (document.querySelector(`script[src="${scriptUrl}"]`)) return;
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    document.head.appendChild(script);
  }, [authNetEnabled, authNetEnvironment]);

  // Tokenize card data via Accept.js before submitting order
  const tokenizeCard = (): Promise<{ nonce: string; descriptor: string }> => {
    return new Promise((resolve, reject) => {
      const Accept = (window as any).Accept;
      if (!Accept) {
        reject(new Error("Payment processor not loaded. Please refresh and try again."));
        return;
      }
      const [expMonth, expYear] = cardExpiry.split("/").map(s => s.trim());
      const secureData = {
        authData: { clientKey: authNetClientKey, apiLoginID: authNetApiLoginId },
        cardData: {
          cardNumber: cardNumber.replace(/\s/g, ""),
          month: expMonth,
          year: expYear?.length === 2 ? `20${expYear}` : expYear,
          cardCode: cardCvv,
          fullName: cardName,
        },
      };
      Accept.dispatchData(secureData, (response: any) => {
        if (response.messages.resultCode === "Error") {
          const msg = response.messages.message?.[0]?.text ?? "Card tokenization failed.";
          reject(new Error(msg));
        } else {
          resolve({
            nonce: response.opaqueData.dataValue,
            descriptor: response.opaqueData.dataDescriptor,
          });
        }
      });
    });
  };
  const validateCoupon = trpc.coupons.validate.useQuery(
    { code: couponInput.toUpperCase().trim() },
    { enabled: false }
  );
  const utils = trpc.useUtils();

  const couponDiscount = appliedCoupon ? (total * appliedCoupon.discountPct) / 100 : 0;
  const orderTotal = Math.max(0, total + shipping - loyaltyDiscount - reviewCreditDiscount - couponDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    // If test mode is on and this is NOT an admin, block with the 4:20 countdown
    if (isTestMode && user?.role !== "admin") {
      triggerCustomerBlock();
      return;
    }
    if (!form.firstName || !form.lastName || !form.email || !form.address1 || !form.city || !form.state || !form.zip) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (isRestrictedState) {
      toast.error(`We cannot ship hemp products to ${restrictedStateName}. Remove hemp items or order accessories only.`);
      return;
    }
    if (!tosAccepted) {
      toast.error("Please accept the Terms of Service to continue.");
      return;
    }

    // Tokenize card via Accept.js if Authorize.net is configured (skip in test mode)
    let finalNonce: string | undefined;
    let finalDescriptor: string | undefined;
    if (authNetEnabled && !isTestMode) {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        toast.error("Please fill in all payment card fields.");
        return;
      }
      setTokenizing(true);
      setCardError(null);
      try {
        const tokenResult = await tokenizeCard();
        finalNonce = tokenResult.nonce;
        finalDescriptor = tokenResult.descriptor;
        setPaymentNonce(finalNonce);
        setPaymentDataDescriptor(finalDescriptor);
      } catch (tokenErr: any) {
        setCardError(tokenErr?.message ?? "Card tokenization failed. Please check your card details.");
        setTokenizing(false);
        return;
      } finally {
        setTokenizing(false);
      }
    }

    setSubmitting(true);
    try {
      const result = await createOrder.mutateAsync({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        customerEmail: form.email,
        customerName: `${form.firstName} ${form.lastName}`,
        shippingAddress: {
          address1: form.address1,
          address2: form.address2 || undefined,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        customerPhone: form.phone || undefined,
        smsOptIn,
        couponCode: appliedCoupon?.code || undefined,
        discountAmount: loyaltyDiscount + reviewCreditDiscount + couponDiscount || undefined,
        referralCode: appliedReferral || undefined,
        affiliateCode: (() => {
          try {
            const stored = localStorage.getItem("lh_affiliate_ref");
            if (!stored) return undefined;
            const parsed = JSON.parse(stored) as { code: string; expiry: number };
            if (Date.now() > parsed.expiry) { localStorage.removeItem("lh_affiliate_ref"); return undefined; }
            return parsed.code || undefined;
          } catch { return undefined; }
        })(),
        userId: user?.id ?? undefined, // link order to logged-in user for loyalty points
        paymentNonce: finalNonce,
        paymentDataDescriptor: finalDescriptor,
        paymentTransactionId: paypalCaptureId ?? undefined,
      });
      const orderId = result.orderId;
      // Deduct loyalty points if applied (non-blocking — order already created)
      if (loyaltyApplied && pointsToRedeem > 0 && isAuthenticated) {
        try {
          await redeemMutation.mutateAsync({ pointsToRedeem, orderId });
        } catch (loyaltyErr) {
          console.error("[Loyalty] Redemption deduction failed:", loyaltyErr);
        }
      }
      // Deduct review credits if applied
      if (reviewCreditApplied && reviewCreditsToRedeem > 0 && isAuthenticated) {
        try {
          await redeemReviewMutation.mutateAsync({ creditCents: reviewCreditsToRedeem, orderId });
        } catch (reviewErr) {
          console.error("[Loyalty] Review credit deduction failed:", reviewErr);
        }
      }
      // Mark abandoned cart as recovered
      if (form.email) {
        markCartRecovered.mutate({ email: form.email, orderId });
      }
      clearCart();
      // In test mode, always go straight to confirmation — skip payment entirely
      if (isTestMode) {
        setLocation(`/order-confirmation/${result.orderNumber}`);
      } else if (cartHasHempProducts) {
        // Hemp carts go to crypto payment page
        setLocation(`/pay/crypto?order=${result.orderNumber}`);
      } else {
        // Accessories-only (PayPal) go to confirmation
        setLocation(`/order-confirmation/${result.orderNumber}`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Order submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SEO title="Checkout — Luxurious Habbits" canonical="/checkout" />
        <div style={{ textAlign: "center" }}>
          <ShoppingBag size={48} style={{ color: "oklch(0.20 0 0)", marginBottom: "1.5rem" }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em", color: "oklch(0.60 0 0)", marginBottom: "1rem" }}>YOUR CART IS EMPTY</div>
          <button
            onClick={() => setLocation("/products")}
            style={{ background: "none", border: "1px solid #bf5fff", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}
          >
            Shop Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Checkout — Luxurious Habbits"
        description="Secure checkout for premium THCA hemp flower and extracts."
        canonical="/checkout"
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "1.5rem 1rem" : "3rem 1.5rem", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr min(400px, 40%)", gap: isMobile ? "2rem" : "3rem", alignItems: "start" }}>

        {/* ── LEFT: FORM ── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "1.25rem" }}>
              CONTACT INFORMATION
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                <FormField label="First Name *">
                  <input style={inputStyle} required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                </FormField>
                <FormField label="Last Name *">
                  <input style={inputStyle} required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Email *">
                <input
                  style={inputStyle}
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  onBlur={e => {
                    const email = e.target.value.trim();
                    if (!email || !email.includes("@")) return;
                    // Save cart for abandoned cart recovery
                    saveCart.mutate({
                      email,
                      userId: user?.id ?? undefined,
                      items: items.map(i => ({
                        productId: i.productId,
                        name: i.name,
                        quantity: i.quantity,
                        price: Math.round(parseFloat(i.price) * 100),
                        imageUrl: i.imageUrl,
                        slug: undefined,
                      })),
                      totalCents: Math.round(total * 100),
                    });
                  }}
                />
              </FormField>
              <FormField label="Phone">
                <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" />
              </FormField>
              {/* SMS Opt-in */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0" }}>
                <input
                  type="checkbox"
                  id="sms-opt-in"
                  checked={smsOptIn}
                  onChange={e => setSmsOptIn(e.target.checked)}
                  style={{ width: "14px", height: "14px", accentColor: "#bf5fff", cursor: "pointer", flexShrink: 0 }}
                />
                <label htmlFor="sms-opt-in" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.50 0 0)", cursor: "pointer", lineHeight: 1.4 }}>
                  Text me order updates &amp; shipping notifications
                </label>
              </div>
              {/* Referral Code */}
              <FormField label="Referral Code (optional)">
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    style={{ ...inputStyle, flex: 1, textTransform: "uppercase" }}
                    value={referralInput}
                    onChange={e => setReferralInput(e.target.value.toUpperCase())}
                    placeholder="Friend's referral code"
                    disabled={!!appliedReferral}
                  />
                  {!appliedReferral ? (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!referralInput.trim()) return;
                        setAppliedReferral(referralInput.trim());
                        toast.success("Referral code applied!");
                      }}
                      style={{ background: "oklch(0.12 0 0)", color: "oklch(0.75 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.5rem 0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}
                    >Apply</button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAppliedReferral(null); setReferralInput(""); }}
                      style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", color: "oklch(0.40 0 0)", borderRadius: "6px", padding: "0.5rem 0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}
                    >Remove</button>
                  )}
                </div>
                {appliedReferral && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#00e5a0", marginTop: "0.3rem" }}>✓ Referral code {appliedReferral} applied</div>}
              </FormField>
            </div>
          </div>

          {/* Saved Address Selector */}
          {isAuthenticated && savedAddresses && savedAddresses.length > 0 && (
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid #bf5fff30", borderRadius: "10px", padding: "1.25rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "0.85rem" }}>USE A SAVED ADDRESS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {savedAddresses.map((addr: any) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applySavedAddress(addr)}
                    style={{
                      background: selectedAddressId === addr.id ? "oklch(0.10 0 0)" : "oklch(0.07 0 0)",
                      border: `1px solid ${selectedAddressId === addr.id ? "#bf5fff" : "oklch(1 0 0 / 10%)"}`,
                      borderRadius: "8px",
                      padding: "0.85rem 1rem",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                      transition: "border-color 150ms ease",
                    }}
                  >
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: `2px solid ${selectedAddressId === addr.id ? "#bf5fff" : "oklch(1 0 0 / 20%)"}`, background: selectedAddressId === addr.id ? "#bf5fff" : "transparent", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.85 0 0)", marginBottom: "0.15rem" }}>
                        {addr.label} — {addr.firstName} {addr.lastName}
                        {addr.isDefault && <span style={{ marginLeft: "0.5rem", fontSize: "0.6rem", color: "#bf5fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>Default</span>}
                      </div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.50 0 0)" }}>
                        {addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}, {addr.city}, {addr.state} {addr.zip}
                      </div>
                    </div>
                  </button>
                ))}
                {selectedAddressId !== null && (
                  <button
                    type="button"
                    onClick={() => { setSelectedAddressId(null); setForm(f => ({ ...f, firstName: "", lastName: "", address1: "", address2: "", city: "", state: "", zip: "" })); }}
                    style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", cursor: "pointer", textDecoration: "underline", padding: "0.25rem 0", textAlign: "left" }}
                  >
                    Enter a different address
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Shipping */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "1.25rem" }}>
              SHIPPING ADDRESS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FormField label="Address Line 1 *">
                <input style={inputStyle} required value={form.address1} onChange={e => setForm(f => ({ ...f, address1: e.target.value }))} placeholder="123 Main St" />
              </FormField>
              <FormField label="Address Line 2">
                <input style={inputStyle} value={form.address2} onChange={e => setForm(f => ({ ...f, address2: e.target.value }))} placeholder="Apt, Suite, Unit" />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "1rem" }}>
                <FormField label="City *">
                  <input style={inputStyle} required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </FormField>
                <FormField label="State *">
                  <input
                    style={{
                      ...inputStyle,
                      borderColor: isRestrictedState ? "#ff4444" : undefined,
                    }}
                    required
                    maxLength={2}
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))}
                    placeholder="NC"
                  />
                </FormField>
                <FormField label="ZIP *">
                  <input style={inputStyle} required value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Payment section */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "1.25rem" }}>
              PAYMENT
            </div>
            {/* ── TEST MODE: customer countdown block ── */}
            {isTestMode && user?.role !== "admin" && showTestModeBlock ? (
              <div style={{ background: "oklch(0.08 0.03 240)", border: "2px solid oklch(0.55 0.18 240)", borderRadius: "10px", padding: "2rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⏳</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em", color: "oklch(0.85 0 0)", marginBottom: "0.5rem" }}>TEMPORARILY UNAVAILABLE</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.55 0 0)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                  Checkout is briefly unavailable for maintenance. Please try again shortly.
                </div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "oklch(0.12 0.04 240)",
                  border: "1px solid oklch(0.45 0.15 240 / 60%)",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em", color: "oklch(0.75 0.18 240)" }}>
                    {String(Math.floor(customerCountdown / 60)).padStart(2, "0")}:{String(customerCountdown % 60).padStart(2, "0")}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>remaining</span>
                </div>
              </div>
            ) : isTestMode && user?.role !== "admin" ? (
              /* Non-admin, test mode on but countdown not started yet — show a subtle notice */
              <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "8px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ fontSize: "1.1rem" }}>🔒</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.55 0 0)", lineHeight: 1.6 }}>
                  Checkout is currently undergoing brief maintenance. Click Place Order to see when it will be available.
                </div>
              </div>
            ) : isTestMode && user?.role === "admin" ? (
              /* Admin sees the full test mode panel */
              <div style={{ background: "oklch(0.12 0.06 60)", border: "2px solid #f5a623", borderRadius: "10px", padding: "1.25rem 1.5rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>🧪</div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.08em", color: "#f5a623", marginBottom: "0.4rem" }}>TEST MODE ACTIVE</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.70 0 0)", lineHeight: 1.7 }}>
                    Payment is bypassed for testing. Your order will be created and submitted to our fulfillment system exactly as a real order — no charge will occur.
                  </div>
                  {testModeExpiresAt && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#f5a623", marginTop: "0.5rem" }}>
                      ⏱ Auto-disables in {Math.max(0, Math.ceil((testModeExpiresAt - Date.now()) / 60000))} min
                    </div>
                  )}
                </div>
              </div>
            ) : authNetEnabled ? (
              /* ── Authorize.net Accept.js card form ── */
              <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "8px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <Lock size={14} style={{ color: "#bf5fff" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Secure Card Payment — Powered by Authorize.net</span>
                </div>
                <FormField label="Name on Card">
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    autoComplete="cc-name"
                  />
                </FormField>
                <FormField label="Card Number">
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCardNumber(v.replace(/(\d{4})(?=\d)/g, "$1 "));
                      setPaymentNonce(null); // reset nonce on card change
                    }}
                    autoComplete="cc-number"
                    inputMode="numeric"
                  />
                </FormField>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0.75rem" }}>
                  <FormField label="Expiry (MM/YY)">
                    <input
                      style={inputStyle}
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                        setCardExpiry(v);
                        setPaymentNonce(null);
                      }}
                      autoComplete="cc-exp"
                      inputMode="numeric"
                    />
                  </FormField>
                  <FormField label="CVV">
                    <input
                      style={inputStyle}
                      type="text"
                      placeholder="123"
                      value={cardCvv}
                      onChange={e => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setPaymentNonce(null); }}
                      autoComplete="cc-csc"
                      inputMode="numeric"
                    />
                  </FormField>
                </div>
                {cardError && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#ff6666", background: "oklch(0.10 0.05 25)", border: "1px solid #ff4444", borderRadius: "6px", padding: "0.6rem 0.9rem" }}>
                    {cardError}
                  </div>
                )}
              </div>
            ) : paypalEnabled ? (
              /* ── PayPal button (accessories-only) ── */
              <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "8px", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <Lock size={14} style={{ color: "#bf5fff" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Secure Payment — Powered by PayPal</span>
                </div>
                {cartHasHempProducts ? (
                  /* Cart has hemp items — PayPal not available, show crypto/other options */
                  <div style={{ background: "oklch(0.08 0.02 270)", border: "1px solid oklch(0.4 0.1 270 / 40%)", borderRadius: "6px", padding: "1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>ℹ️</span>
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.80 0 0)", marginBottom: "0.3rem" }}>PayPal not available for hemp products</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.50 0 0)", lineHeight: 1.6 }}>
                        Due to PayPal's policies on hemp products, PayPal checkout is only available for accessory orders. Please use <strong style={{ color: "#f5a623" }}>crypto payment</strong> below, or contact us to arrange an alternative.
                      </div>
                    </div>
                  </div>
                ) : paypalApproved ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", background: "oklch(0.08 0.06 145)", border: "1px solid oklch(0.55 0.18 145 / 40%)", borderRadius: "6px" }}>
                    <span style={{ color: "oklch(0.75 0.18 145)", fontSize: "1rem" }}>✓</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.75 0.18 145)" }}>PayPal payment approved — click Place Order to complete</span>
                  </div>
                ) : (
                  <>
                  {!tosAccepted && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#ffaa44", background: "oklch(0.09 0.04 60)", border: "1px solid oklch(0.5 0.15 60 / 40%)", borderRadius: "6px", padding: "0.6rem 0.9rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      ⚠ Please check the Terms of Service box below to enable PayPal checkout.
                    </div>
                  )}
                  <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD", intent: "capture" }}>
                    <PayPalButtons
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                      disabled={!tosAccepted || isRestrictedState}
                      createOrder={async () => {
                        const s = checkoutStateRef.current;
                        const couponDiscount = s.appliedCoupon ? (s.total * s.appliedCoupon.discountPct) / 100 : 0;
                        const orderTotal = Math.max(1, Math.round((s.total + s.shipping - s.loyaltyDiscount - s.reviewCreditDiscount - couponDiscount) * 100));
                        const result = await createPaypalOrder.mutateAsync({ amountCents: orderTotal });
                        return result.paypalOrderId;
                      }}
                      onApprove={async (data) => {
                        try {
                          const capture = await capturePaypalOrder.mutateAsync({ paypalOrderId: data.orderID });
                          setPaypalCaptureId(capture.captureId ?? data.orderID);
                          setPaypalApproved(true);
                          toast.success("PayPal payment approved! Click Place Order to finish.");
                        } catch (err: any) {
                          toast.error(err?.message ?? "PayPal capture failed. Please try again.");
                        }
                      }}
                      onError={(err) => {
                        console.error("[PayPal] Error:", err);
                        toast.error("PayPal encountered an error. Please try again.");
                      }}
                      onCancel={() => toast.info("PayPal payment cancelled.")}
                    />
                  </PayPalScriptProvider>
                  </>
                )}
              </div>
            ) : (
              /* ── Payment coming soon placeholder ── */
              <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(0.5 0.15 30 / 50%)", borderRadius: "8px", padding: "1.5rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ fontSize: "1.2rem", flexShrink: 0 }}>⚠️</div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 700, color: "#ffaa44", marginBottom: "0.35rem" }}>Payment Processing Not Yet Active</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.50 0 0)", lineHeight: 1.7 }}>
                    Card payments are not yet enabled on this store. Orders cannot be placed until payment processing is activated. Please check back soon.
                  </div>
                </div>
              </div>
            )}
            {/* Crypto payment option — always shown for hemp carts, or when feature flag is enabled */}
            {(cartHasHempProducts || import.meta.env.VITE_CRYPTO_PAYMENTS_ENABLED === "true") && (
              <div style={{
                marginTop: "0.75rem",
                background: "oklch(0.06 0.02 270)",
                border: "1px solid oklch(0.4 0.15 270 / 40%)",
                borderRadius: "8px",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}>
                <Bitcoin size={20} style={{ color: "#f5a623", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.85 0 0)", marginBottom: "0.15rem" }}>
                    Prefer to pay with crypto?
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.48 0 0)", lineHeight: 1.5 }}>
                    Place your order first, then pay with BTC, ETH, or DOGE — no account needed.
                  </div>
                </div>
                <Link href="/pay/crypto">
                  <button
                    type="button"
                    style={{
                      background: "transparent",
                      border: "1px solid #f5a623",
                      borderRadius: "6px",
                      padding: "0.45rem 0.9rem",
                      color: "#f5a623",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background 150ms ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.10 0.04 60)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    Pay with Crypto
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Restricted state error banner */}
          {isRestrictedState && (
            <div style={{
              background: "oklch(0.10 0.05 25)",
              border: "1px solid #ff4444",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}>
              <div style={{ color: "#ff4444", fontSize: "1.1rem", flexShrink: 0, marginTop: "0.05rem" }}>⚠</div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 700, color: "#ff6666", marginBottom: "0.3rem" }}>
                  Hemp products cannot ship to {restrictedStateName}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.55 0 0)", lineHeight: 1.6 }}>
                  Hemp and Farm Bill products are restricted by state law in {restrictedStateName}. Remove hemp items from your cart to continue — accessories can still be shipped to your state.
                </div>
              </div>
            </div>
          )}

          {/* Compliance notice */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1rem 1.25rem" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.40 0 0)", lineHeight: 1.8 }}>
              <strong style={{ color: "oklch(0.55 0 0)" }}>Adult Signature Required.</strong> By placing this order you confirm you are 21 years of age or older. All products are Farm Bill compliant hemp containing ≤0.3% Delta-9 THC. UPS adult signature required at delivery. Plain, unmarked packaging.
            </div>
          </div>

          {/* Terms of Service checkbox */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={tosAccepted}
              onChange={e => setTosAccepted(e.target.checked)}
              style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "1px", accentColor: "#bf5fff", cursor: "pointer" }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.55 0 0)", lineHeight: 1.6 }}>
              I have read and agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#bf5fff", textDecoration: "underline", textUnderlineOffset: "2px" }}>Terms of Service</a>
              {" "}and confirm I am 21 years of age or older. I understand that adult signature is required at delivery.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || isRestrictedState || !tosAccepted || (!isTestMode && !authNetEnabled && !paypalApproved && !cartHasHempProducts) || tokenizing}
            className="btn-gold"
            style={{
              width: "100%",
              justifyContent: "center",
              opacity: (submitting || isRestrictedState || !tosAccepted || (!isTestMode && !authNetEnabled && !paypalApproved && !cartHasHempProducts) || tokenizing) ? 0.5 : 1,
              cursor: (isRestrictedState || !tosAccepted || (!isTestMode && !authNetEnabled && !paypalApproved && !cartHasHempProducts) || tokenizing) ? "not-allowed" : undefined,
              ...(isTestMode ? { background: "linear-gradient(135deg, #f5a623, #e8941a)", boxShadow: "0 0 20px #f5a62340" } : {}),
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {tokenizing ? "Verifying card..." : submitting ? "Processing..." : isTestMode ? <>🧪 Place Test Order <ChevronRight size={14} /></> : <>Place Order <ChevronRight size={14} /></>}
            </span>
          </button>
        </form>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <div style={{ position: "sticky", top: "88px" }}>
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "12px", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)" }}>
              ORDER SUMMARY
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {items.map(item => (
                <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.75 0 0)", lineHeight: 1.4 }}>{item.name}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.85 0 0)", flexShrink: 0 }}>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)" }}>Subtotal</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.75 0 0)" }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)" }}>Shipping</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: shipping === 0 ? "#00f5ff" : "oklch(0.75 0 0)" }}>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping === 0 && (
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.35 0 0)" }}>
                  Free shipping on orders over $50
                </div>
              )}
            </div>

            {/* Loyalty Points Redemption */}
            {isAuthenticated && loyaltyBreakdown && loyaltyBreakdown.loyaltyPoints >= 100 && !cartIsSubscriptionOrder && (
              <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1rem" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#f5a623", marginBottom: "0.25rem" }}>
                  ★ Purchase Points — {loyaltyBreakdown.loyaltyPoints} pts available
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", marginBottom: "0.6rem" }}>Max ${loyaltyBreakdown.maxLoyaltyDiscount} per order · Does not apply to shipping</div>
                {!loyaltyApplied ? (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="number"
                      min={100}
                      max={Math.min(loyaltyBreakdown.loyaltyPoints, loyaltyBreakdown.maxLoyaltyDiscount * 100)}
                      step={100}
                      value={pointsToRedeem || ""}
                      onChange={e => setPointsToRedeem(Math.min(Number(e.target.value), Math.min(loyaltyBreakdown.loyaltyPoints, loyaltyBreakdown.maxLoyaltyDiscount * 100)))}
                      placeholder="Points to use (100 = $1)"
                      style={{ ...inputStyle, flex: 1, padding: "0.5rem 0.7rem", fontSize: "0.75rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!pointsToRedeem || pointsToRedeem < 100) { toast.error("Minimum 100 points"); return; }
                        const pts = Math.min(Math.floor(pointsToRedeem / 100) * 100, loyaltyBreakdown.maxLoyaltyDiscount * 100);
                        setLoyaltyDiscount(pts / 100);
                        setPointsToRedeem(pts);
                        setLoyaltyApplied(true);
                        toast.success(`${pts} pts applied — $${(pts/100).toFixed(2)} off!`);
                      }}
                      style={{ background: "#f5a623", color: "oklch(0.04 0 0)", border: "none", borderRadius: "6px", padding: "0.5rem 0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00e5a0" }}>✓ {pointsToRedeem} pts applied (−${loyaltyDiscount.toFixed(2)})</span>
                    <button type="button" onClick={() => { setLoyaltyApplied(false); setLoyaltyDiscount(0); setPointsToRedeem(0); }} style={{ background: "none", border: "none", color: "oklch(0.40 0 0)", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Inter', sans-serif" }}>Remove</button>
                  </div>
                )}
              </div>
            )}

            {/* Subscription box notice — credits not applicable */}
            {isAuthenticated && cartIsSubscriptionOrder && (
              <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1rem" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", padding: "0.6rem 0.75rem", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "6px", lineHeight: 1.5 }}>
                  Site credits cannot be applied to subscription box orders. Subscription boxes must be paid in full.
                </div>
              </div>
            )}

            {/* Review Credits Redemption */}
            {isAuthenticated && loyaltyBreakdown && loyaltyBreakdown.reviewCredits >= 100 && !cartIsSubscriptionOrder && (
              <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1rem" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#bf5fff", marginBottom: "0.25rem" }}>
                  ✍ Review Credits — {loyaltyBreakdown.reviewCredits} pts available
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", marginBottom: "0.6rem" }}>Max ${loyaltyBreakdown.maxReviewDiscount} per order · Stacks with purchase points</div>
                {!reviewCreditApplied ? (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="number"
                      min={100}
                      max={Math.min(loyaltyBreakdown.reviewCredits, loyaltyBreakdown.maxReviewDiscount * 100)}
                      step={100}
                      value={reviewCreditsToRedeem || ""}
                      onChange={e => setReviewCreditsToRedeem(Math.min(Number(e.target.value), Math.min(loyaltyBreakdown.reviewCredits, loyaltyBreakdown.maxReviewDiscount * 100)))}
                      placeholder="Credits to use (100 = $1)"
                      style={{ ...inputStyle, flex: 1, padding: "0.5rem 0.7rem", fontSize: "0.75rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!reviewCreditsToRedeem || reviewCreditsToRedeem < 100) { toast.error("Minimum 100 credits"); return; }
                        const credits = Math.min(Math.floor(reviewCreditsToRedeem / 100) * 100, loyaltyBreakdown.maxReviewDiscount * 100);
                        setReviewCreditDiscount(credits / 100);
                        setReviewCreditsToRedeem(credits);
                        setReviewCreditApplied(true);
                        toast.success(`$${(credits/100).toFixed(2)} review credits applied!`);
                      }}
                      style={{ background: "#bf5fff", color: "#fff", border: "none", borderRadius: "6px", padding: "0.5rem 0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00e5a0" }}>✓ Review credits applied (−${reviewCreditDiscount.toFixed(2)})</span>
                    <button type="button" onClick={() => { setReviewCreditApplied(false); setReviewCreditDiscount(0); setReviewCreditsToRedeem(0); }} style={{ background: "none", border: "none", color: "oklch(0.40 0 0)", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Inter', sans-serif" }}>Remove</button>
                  </div>
                )}
              </div>
            )}

            {loyaltyDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#f5a623" }}>Purchase Points</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#f5a623" }}>-${loyaltyDiscount.toFixed(2)}</span>
              </div>
            )}
            {reviewCreditDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#bf5fff" }}>Review Credits</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#bf5fff" }}>-${reviewCreditDiscount.toFixed(2)}</span>
              </div>
            )}

            {/* Coupon Code */}
            <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1rem" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.45 0 0)", marginBottom: "0.6rem" }}>
                Coupon Code
              </div>
              {!appliedCoupon ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. LH-ABC12345)"
                    style={{ ...inputStyle, flex: 1, padding: "0.5rem 0.7rem", fontSize: "0.75rem", textTransform: "uppercase" }}
                    onKeyDown={async e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!couponInput.trim()) return;
                        setCouponChecking(true);
                        try {
                          const result = await utils.coupons.validate.fetch({ code: couponInput.trim() });
                          if (result.valid) {
                            setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discountPct: result.discountPct! });
                            toast.success(result.message);
                          } else {
                            toast.error(result.message);
                          }
                        } catch { toast.error("Could not validate coupon."); }
                        setCouponChecking(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={couponChecking || !couponInput.trim()}
                    onClick={async () => {
                      if (!couponInput.trim()) return;
                      setCouponChecking(true);
                      try {
                        const result = await utils.coupons.validate.fetch({ code: couponInput.trim() });
                        if (result.valid) {
                          setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discountPct: result.discountPct! });
                          toast.success(result.message);
                        } else {
                          toast.error(result.message);
                        }
                      } catch { toast.error("Could not validate coupon."); }
                      setCouponChecking(false);
                    }}
                    style={{ background: "oklch(0.12 0 0)", color: "oklch(0.75 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.5rem 0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: couponChecking ? "wait" : "pointer", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}
                  >
                    {couponChecking ? "..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00e5a0" }}>✓ {appliedCoupon.code} ({appliedCoupon.discountPct}% off)</span>
                  <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(""); }} style={{ background: "none", border: "none", color: "oklch(0.40 0 0)", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Inter', sans-serif" }}>Remove</button>
                </div>
              )}
              {couponDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00e5a0" }}>Coupon Discount</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00e5a0" }}>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)" }}>TOTAL</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#bf5fff", letterSpacing: "0.05em" }}>
                ${orderTotal.toFixed(2)}
              </span>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "0.25rem" }}>
              {[
                { icon: "🔒", label: "SSL Encrypted" },
                { icon: "🌿", label: "Farm Bill Compliant" },
                { icon: "🧪", label: "3rd Party Tested" },
                { icon: "📦", label: "Discreet Shipping" },
              ].map((b) => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ fontSize: "0.7rem" }}>{b.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.35 0 0)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── UPSELL: YOU MIGHT ALSO LIKE ── */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
          <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
              <Sparkles size={18} style={{ color: "#bf5fff" }} />
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)" }}>
                YOU MIGHT ALSO LIKE
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em", textTransform: "uppercase", marginLeft: "0.5rem" }}>
                Based on your cart
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {relatedProducts.map(({ product }) => {
                const strainColors = product.strainType ? STRAIN_COLORS[product.strainType as keyof typeof STRAIN_COLORS] : STRAIN_COLORS.hybrid;
                const basePrice = product.retailPrice ? parseFloat(product.retailPrice) : null;
                return (
                  <div
                    key={product.id}
                    style={{
                      background: "oklch(0.06 0 0)",
                      border: `1px solid ${strainColors?.border ?? "oklch(1 0 0 / 10%)"}`,
                      borderRadius: "10px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Strain type bar */}
                    <div style={{ height: "3px", background: strainColors?.gradient ?? "#bf5fff" }} />
                    <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {/* Strain type badge */}
                      {product.strainType && (
                        <span style={{
                          display: "inline-block",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.55rem",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: strainColors?.primary,
                          background: strainColors?.bg,
                          border: `1px solid ${strainColors?.border}`,
                          borderRadius: "3px",
                          padding: "0.2rem 0.5rem",
                          width: "fit-content",
                        }}>
                          {strainColors?.label}
                        </span>
                      )}
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.15rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1.1 }}>
                        {product.name}
                      </div>
                      {product.thcaPercent && (
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)" }}>
                          THCA: <span style={{ color: "#00f5ff" }}>{product.thcaPercent}%</span>
                        </div>
                      )}
                      {basePrice && (
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.25rem", color: "#bf5fff", letterSpacing: "0.05em", marginTop: "auto" }}>
                          ${basePrice.toFixed(2)}
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", marginLeft: "0.35rem", letterSpacing: "0.05em" }}>
                            / 3.5g
                          </span>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem" }}>
                        <button
                          onClick={() => {
                            if (!basePrice) return;
                            addItem({
                              productId: product.id,
                              name: product.name,
                              price: basePrice.toFixed(2),
                              quantity: 1,
                            });
                            toast.success(`${product.name} added to cart!`);
                          }}
                          disabled={!basePrice}
                          style={{
                            flex: 1,
                            background: "#bf5fff",
                            border: "none",
                            color: "#000",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "5px",
                            cursor: basePrice ? "pointer" : "not-allowed",
                            opacity: basePrice ? 1 : 0.5,
                            transition: "opacity 150ms ease",
                          }}
                        >
                          Add to Cart
                        </button>
                        <Link href={`/products/${product.slug}`}>
                          <button style={{
                            background: "none",
                            border: "1px solid oklch(1 0 0 / 15%)",
                            color: "oklch(0.55 0 0)",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.65rem",
                            letterSpacing: "0.08em",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}>
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
