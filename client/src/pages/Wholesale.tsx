/**
 * Wholesale — Lead Qualification Page
 * SEO-optimized. Dark luxury aesthetic matching the site.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Building2, ShoppingCart, Shield, ChevronRight } from "lucide-react";

const SECTION_STYLE: React.CSSProperties = {
  borderTop: "1px solid oklch(1 0 0 / 8%)",
  paddingTop: "2rem",
  marginTop: "2rem",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.7rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "oklch(0.45 0 0)",
  marginBottom: "0.5rem",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "oklch(0.08 0 0)",
  border: "1px solid oklch(1 0 0 / 12%)",
  borderRadius: "4px",
  padding: "0.75rem 1rem",
  color: "oklch(0.92 0 0)",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
};

const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  cursor: "pointer",
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 1rem center",
  paddingRight: "2.5rem",
};

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  resize: "vertical" as const,
  minHeight: "100px",
};

const GRID2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.25rem",
};

const GRID3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "1.25rem",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

type PreferredContact = "email" | "phone" | "text" | "whatsapp";
const CONTACT_OPTIONS: { value: PreferredContact; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Call" },
  { value: "text", label: "Text Message" },
  { value: "whatsapp", label: "WhatsApp" },
];

type PreferredPayment = "bank_transfer" | "check" | "credit_card" | "crypto" | "net_terms" | "other";
const PAYMENT_OPTIONS: { value: PreferredPayment; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer (ACH/Wire)" },
  { value: "check", label: "Check" },
  { value: "credit_card", label: "Credit / Debit Card" },
  { value: "crypto", label: "Crypto" },
  { value: "net_terms", label: "Net Terms (Net 15/30)" },
  { value: "other", label: "Other" },
];

export default function Wholesale() {
  const [submitted, setSubmitted] = useState(false);
  const [leadResult, setLeadResult] = useState<{ grade: string; score: number } | null>(null);

  const [form, setForm] = useState({
    contactName: "",
    title: "",
    email: "",
    phone: "",
    preferredContact: "email" as PreferredContact,
    preferredPayment: "" as PreferredPayment | "",
    businessName: "",
    businessType: "" as any,
    businessTypeOther: "",
    state: "",
    city: "",
    yearsInBusiness: "" as any,
    numberOfLocations: "" as any,
    averageMonthlyRevenue: "" as any,
    targetDemographic: "",
    avgCustomerAge: "" as any,
    productsInterested: "",
    monthlyVolume: "" as any,
    timeline: "" as any,
    currentSupplier: "",
    currentSpendMonthly: "" as any,
    whySwitch: "",
    website: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    twitter: "",
    youtube: "",
    otherSocials: "",
    farmBillAware: false,
    hasRetailLicense: false,
    stateCompliant: false,
    howHeard: "" as any,
    additionalNotes: "",
  });

  const submitMutation = trpc.wholesale.submit.useMutation({
    onSuccess: (data) => {
      setLeadResult({ grade: data.leadGrade, score: data.leadScore });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err) => toast.error(err.message ?? "Submission failed. Please try again."),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName.trim()) { toast.error("Please enter your full name"); return; }
    if (!form.email.trim()) { toast.error("Please enter your email address"); return; }
    if (!form.state.trim()) { toast.error("Please enter your state"); return; }
    if (!form.businessType) { toast.error("Please select your business type"); return; }
    if (!form.monthlyVolume) { toast.error("Please select your monthly volume"); return; }
    if (!form.timeline) { toast.error("Please select your purchase timeline"); return; }
    if (!form.yearsInBusiness) { toast.error("Please select years in business"); return; }
    if (!form.numberOfLocations) { toast.error("Please select number of locations"); return; }
    if (!form.productsInterested.trim()) { toast.error("Please describe what products you're looking for"); return; }

    submitMutation.mutate({
      ...form,
      title: form.title || undefined,
      phone: form.phone || undefined,
      businessTypeOther: form.businessTypeOther || undefined,
      city: form.city || undefined,
      averageMonthlyRevenue: form.averageMonthlyRevenue || undefined,
      targetDemographic: form.targetDemographic || undefined,
      avgCustomerAge: form.avgCustomerAge || undefined,
      currentSupplier: form.currentSupplier || undefined,
      currentSpendMonthly: form.currentSpendMonthly || undefined,
      whySwitch: form.whySwitch || undefined,
      website: form.website || undefined,
      instagram: form.instagram || undefined,
      facebook: form.facebook || undefined,
      tiktok: form.tiktok || undefined,
      twitter: form.twitter || undefined,
      youtube: form.youtube || undefined,
      otherSocials: form.otherSocials || undefined,
      howHeard: form.howHeard || undefined,
      additionalNotes: form.additionalNotes || undefined,
      preferredPayment: (form.preferredPayment || undefined) as PreferredPayment | undefined,
    });
  };

  const gradeColor = leadResult?.grade === "hot" ? "#ff6b35" : leadResult?.grade === "warm" ? "#bf5fff" : "#00f5ff";
  const gradeEmoji = leadResult?.grade === "hot" ? "🔥" : leadResult?.grade === "warm" ? "♨️" : "❄️";

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        canonical="/wholesale"
        title="Wholesale THCA Hemp — Bulk Pricing for Retailers & Distributors | Luxurious Habbits"
        description="Apply for wholesale access to premium THCA flower, extracts, and hemp products. Competitive bulk pricing for smoke shops, dispensaries, and retailers. Farm Bill compliant. Apply today."
        keywords="wholesale THCA hemp, bulk hemp flower wholesale, THCA wholesale pricing, hemp distributor, smoke shop wholesale hemp, bulk CBD flower, wholesale hemp extracts"
      />

      {submitted && leadResult ? (
        /* ── SUCCESS STATE ── */
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>{gradeEmoji}</div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            color: gradeColor,
            letterSpacing: "0.05em",
            marginBottom: "1rem",
          }}>
            APPLICATION RECEIVED
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "oklch(0.65 0 0)", lineHeight: 1.7, marginBottom: "2rem" }}>
            Thank you for applying to the Luxurious Habbits wholesale program. Our team reviews every application personally and will reach out within <strong style={{ color: "oklch(0.85 0 0)" }}>1–2 business days</strong>.
          </p>
          <div style={{
            background: "oklch(0.08 0 0)",
            border: `1px solid ${gradeColor}33`,
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2.5rem",
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              Lead Score
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: gradeColor, lineHeight: 1 }}>
              {leadResult.score}<span style={{ fontSize: "1.5rem", color: "oklch(0.40 0 0)" }}>/100</span>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.50 0 0)", marginTop: "0.25rem" }}>
              {leadResult.grade === "hot" ? "Priority lead — expect a call soon." : leadResult.grade === "warm" ? "Strong candidate — we'll be in touch." : "We'll review and follow up by email."}
            </div>
          </div>
          <Link href="/products">
            <button className="btn-gold"><span>Browse Our Catalog</span></button>
          </Link>
        </div>
      ) : (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem 6rem" }}>

          {/* Back link */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", letterSpacing: "0.1em", textDecoration: "none", marginBottom: "3rem" }}>
            <ArrowLeft size={14} /> BACK TO HOME
          </Link>

          {/* Header */}
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.25em", color: "oklch(0.45 0 0)", textTransform: "uppercase", marginBottom: "1rem" }}>
              Wholesale Program
            </div>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(3rem, 10vw, 6rem)",
              letterSpacing: "0.05em",
              color: "oklch(0.96 0 0)",
              lineHeight: 0.95,
              marginBottom: "1.5rem",
            }}>
              PARTNER WITH<br />
              <span className="text-holo">THE FINEST.</span>
            </h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.15rem", color: "oklch(0.55 0 0)", maxWidth: "600px", lineHeight: 1.7 }}>
              We work with a select group of retailers, smoke shops, and distributors who share our commitment to quality and compliance. Fill out the application below — we review every submission personally.
            </p>
          </div>

          {/* Value props */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
            {[
              { icon: <Shield size={18} />, title: "Farm Bill Compliant", desc: "100% legal, fully documented" },
              { icon: <CheckCircle2 size={18} />, title: "Full-Panel COAs", desc: "Every batch, every product" },
              { icon: <Building2 size={18} />, title: "Dedicated Rep", desc: "Personal account management" },
              { icon: <ShoppingCart size={18} />, title: "Flexible MOQs", desc: "Scalable to your volume" },
            ].map(v => (
              <div key={v.title} style={{
                background: "oklch(0.07 0 0)",
                border: "1px solid oklch(1 0 0 / 8%)",
                borderRadius: "6px",
                padding: "1.25rem",
              }}>
                <div style={{ color: "#bf5fff", marginBottom: "0.5rem" }}>{v.icon}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "oklch(0.85 0 0)", marginBottom: "0.25rem" }}>{v.title}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)" }}>{v.desc}</div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>

            {/* ── Section 1: Contact ── */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#bf5fff22", border: "1px solid #bf5fff66", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "0.85rem", color: "#bf5fff" }}>1</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)" }}>CONTACT INFORMATION</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={GRID2}>
                  <Field label="Full Name *">
                    <input required style={INPUT_STYLE} value={form.contactName} onChange={set("contactName")} placeholder="Jane Smith" />
                  </Field>
                  <Field label="Title / Role">
                    <input style={INPUT_STYLE} value={form.title} onChange={set("title")} placeholder="Owner, Buyer, Manager…" />
                  </Field>
                  <Field label="Email Address *">
                    <input required type="email" style={INPUT_STYLE} value={form.email} onChange={set("email")} placeholder="jane@yourstore.com" />
                  </Field>
                  <Field label="Phone Number">
                    <input type="tel" style={INPUT_STYLE} value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
                  </Field>
                </div>
                {/* Best way to reach */}
                <Field label="Best Way to Reach You *">
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" as const }}>
                    {CONTACT_OPTIONS.map(opt => {
                      const active = form.preferredContact === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, preferredContact: opt.value }))}
                          style={{
                            padding: "0.5rem 1.1rem",
                            borderRadius: "100px",
                            border: active ? "1px solid #bf5fff" : "1px solid oklch(1 0 0 / 12%)",
                            background: active ? "#bf5fff22" : "oklch(0.08 0 0)",
                            color: active ? "#bf5fff" : "oklch(0.55 0 0)",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.78rem",
                            fontWeight: active ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
              {/* Preferred payment */}
              <div style={{ marginTop: "1.25rem" }}>
                <Field label="Preferred Payment Method">
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" as const }}>
                    {PAYMENT_OPTIONS.map(opt => {
                      const active = form.preferredPayment === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, preferredPayment: opt.value }))}
                          style={{
                            padding: "0.5rem 1.1rem",
                            borderRadius: "100px",
                            border: active ? "1px solid #bf5fff" : "1px solid oklch(1 0 0 / 12%)",
                            background: active ? "#bf5fff22" : "oklch(0.08 0 0)",
                            color: active ? "#bf5fff" : "oklch(0.55 0 0)",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.78rem",
                            fontWeight: active ? 600 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            </div>

            {/* ── Section 2: Business ── */}
            <div style={SECTION_STYLE}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#bf5fff22", border: "1px solid #bf5fff66", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "0.85rem", color: "#bf5fff" }}>2</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)" }}>BUSINESS DETAILS</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={GRID2}>
                  <Field label="Business Name *">
                    <input required style={INPUT_STYLE} value={form.businessName} onChange={set("businessName")} placeholder="Your Store Name" />
                  </Field>
                  <Field label="Business Type *">
                    <select required style={SELECT_STYLE} value={form.businessType} onChange={set("businessType")}>
                      <option value="">Select type…</option>
                      <option value="smoke_shop">Smoke Shop</option>
                      <option value="dispensary">Dispensary / Cannabis Retailer</option>
                      <option value="vape_shop">Vape Shop</option>
                      <option value="online_retailer">Online Retailer</option>
                      <option value="distributor">Distributor / Wholesaler</option>
                      <option value="convenience_store">Convenience Store</option>
                      <option value="gym_wellness">Gym / Wellness Center</option>
                      <option value="bar_restaurant">Bar / Restaurant</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                </div>
                {form.businessType === "other" && (
                  <Field label="Please Describe">
                    <input style={INPUT_STYLE} value={form.businessTypeOther} onChange={set("businessTypeOther")} placeholder="Describe your business type" />
                  </Field>
                )}
                <div style={GRID3}>
                  <Field label="City">
                    <input style={INPUT_STYLE} value={form.city} onChange={set("city")} placeholder="Charlotte" />
                  </Field>
                  <Field label="State *">
                    <input required style={INPUT_STYLE} value={form.state} onChange={set("state")} placeholder="NC" maxLength={50} />
                  </Field>
                  <Field label="Years in Business *">
                    <select required style={SELECT_STYLE} value={form.yearsInBusiness} onChange={set("yearsInBusiness")}>
                      <option value="">Select…</option>
                      <option value="less_than_1">Less than 1 year</option>
                      <option value="1_2">1–2 years</option>
                      <option value="3_5">3–5 years</option>
                      <option value="6_10">6–10 years</option>
                      <option value="over_10">10+ years</option>
                    </select>
                  </Field>
                </div>
                <div style={GRID3}>
                  <Field label="Number of Locations *">
                    <select required style={SELECT_STYLE} value={form.numberOfLocations} onChange={set("numberOfLocations")}>
                      <option value="">Select…</option>
                      <option value="1">1 location</option>
                      <option value="2_5">2–5 locations</option>
                      <option value="6_10">6–10 locations</option>
                      <option value="over_10">10+ locations</option>
                    </select>
                  </Field>
                  <Field label="Avg Monthly Revenue">
                    <select style={SELECT_STYLE} value={form.averageMonthlyRevenue} onChange={set("averageMonthlyRevenue")}>
                      <option value="">Select…</option>
                      <option value="under_10k">Under $10k</option>
                      <option value="10k_50k">$10k – $50k</option>
                      <option value="50k_100k">$50k – $100k</option>
                      <option value="100k_500k">$100k – $500k</option>
                      <option value="over_500k">$500k+</option>
                    </select>
                  </Field>
                  <Field label="Avg Customer Age">
                    <select style={SELECT_STYLE} value={form.avgCustomerAge} onChange={set("avgCustomerAge")}>
                      <option value="">Select…</option>
                      <option value="21_25">21–25</option>
                      <option value="26_35">26–35</option>
                      <option value="36_45">36–45</option>
                      <option value="46_plus">46+</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </Field>
                </div>
                <Field label="Target Customer Demographics">
                  <textarea style={TEXTAREA_STYLE} value={form.targetDemographic} onChange={set("targetDemographic")} placeholder="Describe your typical customer — lifestyle, interests, spending habits…" rows={3} />
                </Field>
              </div>
            </div>

            {/* ── Section 3: Online Presence ── */}
            <div style={SECTION_STYLE}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#bf5fff22", border: "1px solid #bf5fff66", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "0.85rem", color: "#bf5fff" }}>3</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)" }}>ONLINE PRESENCE</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={GRID2}>
                  <Field label="Website">
                    <input style={INPUT_STYLE} value={form.website} onChange={set("website")} placeholder="https://yourstore.com" />
                  </Field>
                  <Field label="Instagram Handle">
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>@</span>
                      <input style={{ ...INPUT_STYLE, paddingLeft: "1.75rem" }} value={form.instagram} onChange={set("instagram")} placeholder="yourstorex" />
                    </div>
                  </Field>
                  <Field label="TikTok Handle">
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>@</span>
                      <input style={{ ...INPUT_STYLE, paddingLeft: "1.75rem" }} value={form.tiktok} onChange={set("tiktok")} placeholder="yourstorex" />
                    </div>
                  </Field>
                  <Field label="Facebook">
                    <input style={INPUT_STYLE} value={form.facebook} onChange={set("facebook")} placeholder="https://facebook.com/yourpage" />
                  </Field>
                  <Field label="Twitter / X Handle">
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>@</span>
                      <input style={{ ...INPUT_STYLE, paddingLeft: "1.75rem" }} value={form.twitter} onChange={set("twitter")} placeholder="yourstorex" />
                    </div>
                  </Field>
                  <Field label="YouTube Channel">
                    <input style={INPUT_STYLE} value={form.youtube} onChange={set("youtube")} placeholder="https://youtube.com/@yourchannel" />
                  </Field>
                </div>
                <Field label="Other Social Media / Platforms">
                  <input style={INPUT_STYLE} value={form.otherSocials} onChange={set("otherSocials")} placeholder="LinkedIn, Snapchat, Leafly, Weedmaps, etc." />
                </Field>
              </div>
            </div>

            {/* ── Section 4: Purchase Intent ── */}
            <div style={SECTION_STYLE}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#bf5fff22", border: "1px solid #bf5fff66", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "0.85rem", color: "#bf5fff" }}>4</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)" }}>PURCHASE INTENT</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Products free-text */}
                <Field label="What Products Are You Looking For? *">
                  <textarea
                    required
                    style={{ ...TEXTAREA_STYLE, minHeight: "90px" }}
                    value={form.productsInterested}
                    onChange={set("productsInterested")}
                    placeholder="e.g. THCA flower — indoor, 3.5g and ounce packs. Also interested in live resin carts and disposables. Looking for consistent supply of top-shelf strains."
                    rows={3}
                  />
                </Field>

                <div style={GRID2}>
                  <Field label="Monthly Purchase Volume *">
                    <select required style={SELECT_STYLE} value={form.monthlyVolume} onChange={set("monthlyVolume")}>
                      <option value="">Select…</option>
                      <option value="under_500">Under $500/mo</option>
                      <option value="500_2000">$500 – $2,000/mo</option>
                      <option value="2000_5000">$2,000 – $5,000/mo</option>
                      <option value="5000_10000">$5,000 – $10,000/mo</option>
                      <option value="over_10000">$10,000+/mo</option>
                    </select>
                  </Field>
                  <Field label="Purchase Timeline *">
                    <select required style={SELECT_STYLE} value={form.timeline} onChange={set("timeline")}>
                      <option value="">Select…</option>
                      <option value="immediately">Ready to order immediately</option>
                      <option value="within_30_days">Within 30 days</option>
                      <option value="1_3_months">1–3 months</option>
                      <option value="just_exploring">Just exploring options</option>
                    </select>
                  </Field>
                </div>

                <div style={GRID2}>
                  <Field label="Current Hemp / CBD Supplier">
                    <input style={INPUT_STYLE} value={form.currentSupplier} onChange={set("currentSupplier")} placeholder="Supplier name or 'None'" />
                  </Field>
                  <Field label="Current Monthly Hemp Spend">
                    <select style={SELECT_STYLE} value={form.currentSpendMonthly} onChange={set("currentSpendMonthly")}>
                      <option value="">Select…</option>
                      <option value="none">None (new to hemp)</option>
                      <option value="under_500">Under $500</option>
                      <option value="500_2000">$500 – $2,000</option>
                      <option value="2000_5000">$2,000 – $5,000</option>
                      <option value="over_5000">$5,000+</option>
                    </select>
                  </Field>
                </div>

                <Field label="Why are you looking to add / switch suppliers?">
                  <textarea style={TEXTAREA_STYLE} value={form.whySwitch} onChange={set("whySwitch")} placeholder="Tell us what you're looking for that your current supplier isn't providing…" rows={3} />
                </Field>
              </div>
            </div>

            {/* ── Section 5: Compliance ── */}
            <div style={SECTION_STYLE}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#bf5fff22", border: "1px solid #bf5fff66", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "0.85rem", color: "#bf5fff" }}>5</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)" }}>COMPLIANCE</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { key: "farmBillAware" as const, label: "I am aware of and comply with the 2018 Farm Bill" },
                  { key: "hasRetailLicense" as const, label: "My business holds a valid retail / business license" },
                  { key: "stateCompliant" as const, label: "I operate in compliance with my state's hemp laws" },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      style={{ width: "16px", height: "16px", accentColor: "#bf5fff", cursor: "pointer" }}
                    />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.65 0 0)" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Section 6: Additional ── */}
            <div style={SECTION_STYLE}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#bf5fff22", border: "1px solid #bf5fff66", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "0.85rem", color: "#bf5fff" }}>6</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)" }}>ANYTHING ELSE?</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <Field label="How Did You Hear About Us?">
                  <select style={SELECT_STYLE} value={form.howHeard} onChange={set("howHeard")}>
                    <option value="">Select…</option>
                    <option value="google">Google Search</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="referral">Referral / Word of Mouth</option>
                    <option value="trade_show">Trade Show / Event</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Additional Notes or Questions">
                  <textarea style={{ ...TEXTAREA_STYLE, minHeight: "120px" }} value={form.additionalNotes} onChange={set("additionalNotes")} placeholder="Anything else you'd like us to know? Specific product requests, special requirements, questions about our program…" rows={4} />
                </Field>
              </div>
            </div>

            {/* Submit */}
            <div style={{ ...SECTION_STYLE, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.35 0 0)", textAlign: "center", maxWidth: "480px", lineHeight: 1.6 }}>
                By submitting this form you confirm that all information provided is accurate. We review every application and respond within 1–2 business days.
              </p>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="btn-gold"
                style={{ minWidth: "280px", opacity: submitMutation.isPending ? 0.6 : 1 }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {submitMutation.isPending ? "Submitting…" : <>Submit Application <ChevronRight size={16} /></>}
                </span>
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
