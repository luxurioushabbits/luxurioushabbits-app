/**
 * The Habbits Box — Subscription Page
 * Baby Lungs / Stoner / Connoisseur / Smoke Shop tiers
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import SEO from "@/components/SEO";
import { Check, Package, Star, Sparkles, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// ─── Tier Config ──────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "baby_lungs",
    name: "Baby Lungs",
    price: "$49",
    period: "/mo",
    tagline: "Just getting started",
    promise: "A curated selection of premium hemp — chosen for you.",
    color: "#00f5ff",
    glow: "#00f5ff18",
    border: "#00f5ff33",
    icon: <Package size={22} />,
    perks: ["10% off retail", "Free shipping", "Surprise curated selection", "Monthly, bi-weekly, or weekly"],
  },
  {
    id: "stoner",
    name: "Stoner",
    price: "$99",
    period: "/mo",
    tagline: "The regular",
    promise: "An elevated experience — only the finest in stock.",
    color: "#bf5fff",
    glow: "#bf5fff18",
    border: "#bf5fff44",
    icon: <Star size={22} />,
    featured: true,
    perks: ["10% off retail", "Free shipping", "Elevated mystery selection", "Monthly, bi-weekly, or weekly", "Early access to new drops"],
  },
  {
    id: "connoisseur",
    name: "Connoisseur",
    price: "$199",
    period: "/mo",
    tagline: "The pinnacle",
    promise: "Reserved for those who accept nothing less.",
    color: "#ffd700",
    glow: "#ffd70018",
    border: "#ffd70044",
    icon: <Sparkles size={22} />,
    perks: ["10% off retail", "Free shipping", "Pinnacle mystery selection", "Monthly, bi-weekly, or weekly", "Early access to new drops", "Priority customer support"],
  },
];

// ─── Frequency Selector ───────────────────────────────────────────────────────
function FrequencySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: "monthly", label: "Monthly" },
    { value: "biweekly", label: "Bi-Weekly" },
    { value: "weekly", label: "Weekly" },
  ];
  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem" }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "100px",
            border: value === o.value ? "1px solid #bf5fff" : "1px solid oklch(1 0 0 / 15%)",
            background: value === o.value ? "#bf5fff22" : "none",
            color: value === o.value ? "#bf5fff" : "oklch(0.50 0 0)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.72rem",
            fontWeight: value === o.value ? 600 : 400,
            letterSpacing: "0.05em",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Tier Card ────────────────────────────────────────────────────────────────
function TierCard({ tier, frequency, onSelect }: { tier: typeof TIERS[0]; frequency: string; onSelect: () => void }) {
  return (
    <div
      style={{
        background: tier.featured ? `${tier.glow}` : "oklch(0.06 0 0)",
        border: `1px solid ${tier.border}`,
        borderRadius: "12px",
        padding: "2.5rem 2rem",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 200ms ease, box-shadow 200ms ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${tier.glow}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {tier.featured && (
        <div style={{ position: "absolute", top: "1rem", right: "1rem", background: tier.color, color: "oklch(0.04 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.15em", padding: "0.25rem 0.6rem", borderRadius: "100px" }}>
          MOST POPULAR
        </div>
      )}

      {/* Glow corner */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "200px", height: "200px", background: `radial-gradient(circle at 0% 0%, ${tier.glow} 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ color: tier.color, marginBottom: "1.25rem" }}>{tier.icon}</div>

      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1, marginBottom: "0.35rem" }}>
        {tier.name}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.85rem", color: "oklch(0.45 0 0)", marginBottom: "1.5rem" }}>
        {tier.tagline}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: tier.color, letterSpacing: "0.02em" }}>{tier.price}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.40 0 0)" }}>
          {frequency === "monthly" ? "/mo" : frequency === "biweekly" ? "/2 weeks" : "/week"}
        </span>
      </div>

      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.85rem", color: "oklch(0.55 0 0)", marginBottom: "2rem", lineHeight: 1.6 }}>
        {tier.promise}
      </div>

      <div className="gold-divider" style={{ marginBottom: "1.5rem" }} />

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
        {tier.perks.map(perk => (
          <li key={perk} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.65 0 0)" }}>
            <Check size={13} style={{ color: tier.color, flexShrink: 0 }} />
            {perk}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        style={{
          width: "100%",
          padding: "0.85rem",
          borderRadius: "6px",
          border: `1px solid ${tier.color}`,
          background: tier.featured ? tier.color : "none",
          color: tier.featured ? "oklch(0.04 0 0)" : tier.color,
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 150ms ease",
        }}
        onMouseEnter={e => {
          if (!tier.featured) {
            (e.currentTarget as HTMLElement).style.background = `${tier.color}22`;
          }
        }}
        onMouseLeave={e => {
          if (!tier.featured) {
            (e.currentTarget as HTMLElement).style.background = "none";
          }
        }}
      >
        Subscribe — {tier.name}
      </button>
    </div>
  );
}

// ─── Smoke Shop Form ──────────────────────────────────────────────────────────
function SmokeShopForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    businessName: "", contactName: "", email: "", phone: "",
    monthlyBudget: 1000,
    address1: "", address2: "", city: "", state: "", zip: "",
    notes: "",
  });

  const inquiry = trpc.subscriptions.smokeShopInquiry.useMutation({
    onSuccess: () => {
      toast.success("Inquiry submitted! We'll reach out within 24 hours.");
      onClose();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inquiry.mutate({
      businessName: form.businessName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone || undefined,
      monthlyBudget: form.monthlyBudget,
      shippingAddress: {
        address1: form.address1,
        address2: form.address2 || undefined,
        city: form.city,
        state: form.state,
        zip: form.zip,
      },
      notes: form.notes || undefined,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "oklch(0.07 0 0)",
    border: "1px solid oklch(1 0 0 / 12%)",
    borderRadius: "6px",
    padding: "0.65rem 0.85rem",
    color: "oklch(0.85 0 0)",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.78rem",
    outline: "none",
    boxSizing: "border-box",
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

  return (
    <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 80%)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "12px", padding: "2.5rem", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <Building2 size={24} style={{ color: "#bf5fff" }} />
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>SMOKE SHOP INQUIRY</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.85rem", color: "oklch(0.45 0 0)" }}>Custom monthly budget — minimum $1,000</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Business Name *</label>
              <input style={inputStyle} required value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} placeholder="Your Shop Name" />
            </div>
            <div>
              <label style={labelStyle}>Contact Name *</label>
              <input style={inputStyle} required value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Your Name" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input style={inputStyle} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@yourshop.com" />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Monthly Budget * (minimum $1,000)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#bf5fff" }}>${form.monthlyBudget.toLocaleString()}</span>
              <input
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={form.monthlyBudget}
                onChange={e => setForm(f => ({ ...f, monthlyBudget: Number(e.target.value) }))}
                style={{ flex: 1, accentColor: "#bf5fff" }}
              />
            </div>
          </div>

          <div className="gold-divider" />

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Shipping Address</div>

          <div>
            <label style={labelStyle}>Address Line 1 *</label>
            <input style={inputStyle} required value={form.address1} onChange={e => setForm(f => ({ ...f, address1: e.target.value }))} placeholder="123 Main St" />
          </div>
          <div>
            <label style={labelStyle}>Address Line 2</label>
            <input style={inputStyle} value={form.address2} onChange={e => setForm(f => ({ ...f, address2: e.target.value }))} placeholder="Suite, Unit, etc." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>City *</label>
              <input style={inputStyle} required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>State *</label>
              <input style={inputStyle} required maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} placeholder="NC" />
            </div>
            <div>
              <label style={labelStyle}>ZIP *</label>
              <input style={inputStyle} required value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="27601" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any specific preferences, strain types, or requirements..."
            />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "0.85rem", borderRadius: "6px", border: "1px solid oklch(1 0 0 / 15%)", background: "none", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inquiry.isPending}
              style={{ flex: 2, padding: "0.85rem", borderRadius: "6px", border: "1px solid #bf5fff", background: "#bf5fff", color: "oklch(0.04 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: inquiry.isPending ? "not-allowed" : "pointer", opacity: inquiry.isPending ? 0.7 : 1 }}
            >
              {inquiry.isPending ? "Submitting..." : "Submit Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
const BOX_FAQS = [
  { q: "What's in the box?", a: "That's the beauty of it — it's a surprise. We curate each box based on what's in stock and what we think is exceptional that month. Every box is different." },
  { q: "Can I choose my strains?", a: "Not for the standard tiers — that's what makes it a curator experience. If you have strong preferences, the Smoke Shop tier allows you to submit notes with your inquiry." },
  { q: "When does my box ship?", a: "Monthly boxes ship in the first week of each month. Bi-weekly boxes ship every other Monday. Weekly boxes ship every Monday." },
  { q: "Can I skip or pause?", a: "Yes. You can skip a month, pause your subscription, or cancel at any time from your account dashboard. No penalties, no questions asked." },
  { q: "Is it discreet?", a: "Always. Plain, unmarked packaging. No logos, no labels, no indication of contents. Adult signature required per UPS compliance." },
  { q: "What's the Smoke Shop tier?", a: "The Smoke Shop tier is designed for retail shops and bulk buyers. You submit your monthly budget (minimum $1,000) and we curate a wholesale-level box. We'll reach out within 24 hours to confirm and set up your account." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "1rem" }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.80 0 0)", fontWeight: 500 }}>{q}</span>
        {open ? <ChevronUp size={16} style={{ color: "#bf5fff", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "oklch(0.40 0 0)", flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ paddingBottom: "1.25rem", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.55 0 0)", lineHeight: 1.8 }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HabbitsBox() {
  const [frequency, setFrequency] = useState("monthly");
  const [showSmokeShop, setShowSmokeShop] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const loyaltyTier = (user as any)?.loyaltyTier ?? "standard";

  const handleTierSelect = (tierId: string) => {
    if (tierId === "smoke_shop") {
      setShowSmokeShop(true);
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to subscribe.", { action: { label: "Log In", onClick: () => { window.location.href = getLoginUrl(); } } });
      return;
    }
    // No tier gate — anyone can subscribe. Subscribing automatically upgrades your loyalty tier.
    toast.info("Subscriptions launch when payment processing goes live. Join the newsletter to be notified!");
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="The Habbits Box — Premium Hemp Subscription"
        description="Subscribe to The Habbits Box — a curated surprise selection of premium THCA hemp delivered to your door. Baby Lungs, Stoner, and Connoisseur tiers. 10% off + free shipping."
        canonical="/habbits-box"
        keywords="hemp subscription box, THCA flower subscription, premium hemp box, monthly hemp delivery, hemp subscription service"
      />

      {showSmokeShop && <SmokeShopForm onClose={() => setShowSmokeShop(false)} />}

      {/* ── HERO ── */}
      <section style={{ padding: "5rem 1.5rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(oklch(1 0 0 / 2%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 2%) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
          <div className="section-label" style={{ marginBottom: "1.25rem" }}>Monthly Subscription</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", lineHeight: 0.95, marginBottom: "1.5rem" }}>
            <span style={{ color: "oklch(0.96 0 0)" }}>THE </span>
            <span className="text-holo">HABBITS</span>
            <br />
            <span style={{ color: "oklch(0.96 0 0)" }}>BOX</span>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "oklch(0.55 0 0)", maxWidth: "560px", margin: "0 auto 3rem", lineHeight: 1.8 }}>
            Every month, we curate a surprise selection of the finest hemp in stock — chosen by us, delivered to you. No lists. No previews. Just the best.
          </p>

          {/* Perks strip */}
          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
            {[
              { icon: "✦", label: "10% Off Retail" },
              { icon: "✦", label: "Free Shipping" },
              { icon: "✦", label: "Surprise Contents" },
              { icon: "✦", label: "Skip Anytime" },
            ].map(p => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.50 0 0)", letterSpacing: "0.08em" }}>
                <span style={{ color: "#bf5fff", fontSize: "0.5rem" }}>{p.icon}</span>
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREQUENCY SELECTOR ── */}
      <div style={{ textAlign: "center", padding: "0 1.5rem 1rem" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
          Choose Your Frequency
        </div>
        <FrequencySelector value={frequency} onChange={setFrequency} />
      </div>

      {/* ── TIER UPGRADE BENEFIT NOTICE ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem 1.5rem" }}>
        <div style={{
          background: "oklch(0.07 0 0)",
          border: "1px solid #bf5fff40",
          borderRadius: "10px",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <div style={{ color: "#bf5fff", flexShrink: 0 }}><Star size={18} /></div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "#bf5fff", marginBottom: "0.2rem" }}>UNLOCK ELEVATED STATUS</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.45 0 0)", lineHeight: 1.5 }}>
              Subscribing to any Habbits Box automatically upgrades you to <strong style={{ color: "oklch(0.60 0 0)" }}>Elevated</strong> tier — unlocking <strong style={{ color: "oklch(0.60 0 0)" }}>1.5x loyalty points</strong> on every purchase, exclusive early access, and member-only perks.
            </div>
          </div>
        </div>
      </div>

      {/* ── TIER CARDS ── */}
      <section style={{ padding: "1rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {TIERS.map(tier => (
            <TierCard key={tier.id} tier={tier} frequency={frequency} onSelect={() => handleTierSelect(tier.id)} />
          ))}

          {/* Smoke Shop Card */}
          <div
            style={{
              background: "oklch(0.06 0 0)",
              border: "1px solid #ffd70033",
              borderRadius: "12px",
              padding: "2.5rem 2rem",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "transform 200ms ease",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: "200px", height: "200px", background: "radial-gradient(circle at 0% 0%, #ffd70012 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ color: "#ffd700", marginBottom: "1.25rem" }}><Building2 size={22} /></div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1, marginBottom: "0.35rem" }}>Smoke Shop</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.85rem", color: "oklch(0.45 0 0)", marginBottom: "1.5rem" }}>Wholesale tier</div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#ffd700", letterSpacing: "0.02em" }}>Custom</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.40 0 0)" }}>budget</span>
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.85rem", color: "oklch(0.55 0 0)", marginBottom: "2rem", lineHeight: 1.6 }}>
              Submit your monthly budget (min. $1,000). We curate at wholesale scale.
            </div>

            <div className="gold-divider" style={{ marginBottom: "1.5rem" }} />

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
              {["10% off retail", "Free shipping", "Custom curated selection", "Wholesale pricing", "Priority fulfillment", "Dedicated account contact"].map(perk => (
                <li key={perk} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.65 0 0)" }}>
                  <Check size={13} style={{ color: "#ffd700", flexShrink: 0 }} />
                  {perk}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowSmokeShop(true)}
              style={{ width: "100%", padding: "0.85rem", borderRadius: "6px", border: "1px solid #ffd700", background: "none", color: "#ffd700", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "background 150ms ease" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#ffd70018"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}
            >
              Submit Inquiry
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "5rem 1.5rem", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Questions</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)" }}>
              HOW IT <span className="text-holo">WORKS</span>
            </h2>
          </div>
          {BOX_FAQS.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>
    </div>
  );
}
