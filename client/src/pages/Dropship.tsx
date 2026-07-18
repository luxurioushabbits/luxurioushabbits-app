/**
 * Dropship Partner Application Page — Luxurious Habbits
 * Application-gated: no pricing shown, apply to be considered.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { Package, TrendingUp, Shield, Truck, CheckCircle } from "lucide-react";

const MONTHLY_VOLUME_OPTIONS = [
  "Under $1,000/mo",
  "$1,000 – $5,000/mo",
  "$5,000 – $10,000/mo",
  "$10,000 – $25,000/mo",
  "$25,000+/mo",
  "Just getting started",
];

const VALUE_PROPS = [
  {
    icon: <Package size={22} />,
    title: "Zero Inventory Risk",
    desc: "We handle all storage, packing, and fulfillment. You focus on selling — we handle the rest.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Premium Margins",
    desc: "Approved partners receive wholesale pricing on our full catalog with competitive margins.",
  },
  {
    icon: <Shield size={22} />,
    title: "Fully Compliant",
    desc: "Every product meets 2018 Farm Bill standards. COAs available for every batch.",
  },
  {
    icon: <Truck size={22} />,
    title: "Fast Fulfillment",
    desc: "Orders ship within 1–2 business days in discreet, plain packaging with adult signature.",
  },
];

export default function Dropship() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    contactName: "",
    email: "",
    phone: "",
    businessName: "",
    website: "",
    instagram: "",
    currentPlatforms: "",
    monthlyVolume: "",
    whyPartner: "",
  });

  const submitMutation = trpc.dropshipApplications.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message || "Failed to submit application. Please try again."),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName.trim() || !form.email.trim() || !form.businessName.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate({
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      businessName: form.businessName.trim(),
      website: form.website.trim() || undefined,
      instagram: form.instagram.trim() || undefined,
      currentPlatforms: form.currentPlatforms.trim() || undefined,
      monthlyVolume: form.monthlyVolume || undefined,
      whyPartner: form.whyPartner.trim() || undefined,
    });
  };

  const inputStyle: React.CSSProperties = {
    background: "oklch(0.07 0 0)",
    border: "1px solid oklch(1 0 0 / 12%)",
    borderRadius: "6px",
    padding: "0.65rem 1rem",
    color: "oklch(0.85 0 0)",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.82rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 150ms ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.65rem",
    color: "oklch(0.45 0 0)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.4rem",
  };

  return (
    <>
      <SEO
        title="Dropship Partner Application — Luxurious Habbits"
        description="Apply to become a Luxurious Habbits dropship partner. Zero inventory, premium hemp products, fully compliant fulfillment."
      />

      <div style={{ minHeight: "100vh", paddingTop: "6rem", paddingBottom: "6rem" }}>
        {/* ── HERO ── */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1.5rem 4rem", textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#bf5fff",
            border: "1px solid #bf5fff44",
            padding: "0.3rem 0.9rem",
            borderRadius: "2px",
            marginBottom: "1.5rem",
          }}>
            Partner Program
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
            letterSpacing: "0.05em",
            color: "oklch(0.96 0 0)",
            lineHeight: 0.95,
            marginBottom: "1.5rem",
          }}>
            SELL THE FINEST.<br />
            <span style={{ color: "#bf5fff" }}>WE HANDLE THE REST.</span>
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "oklch(0.55 0 0)",
            maxWidth: "560px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Join a curated network of resellers carrying premium, Farm Bill–compliant hemp products.
            No inventory. No fulfillment headaches. Just sell.
          </p>
        </section>

        {/* ── VALUE PROPS ── */}
        <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
            {VALUE_PROPS.map((vp) => (
              <div key={vp.title} style={{
                background: "oklch(0.06 0 0)",
                border: "1px solid oklch(1 0 0 / 8%)",
                borderRadius: "10px",
                padding: "1.5rem",
              }}>
                <div style={{ color: "#bf5fff", marginBottom: "0.75rem" }}>{vp.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)", marginBottom: "0.4rem" }}>{vp.title}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.45 0 0)", lineHeight: 1.6 }}>{vp.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── APPLICATION FORM ── */}
        <section style={{ maxWidth: "680px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{
            background: "oklch(0.06 0 0)",
            border: "1px solid oklch(1 0 0 / 10%)",
            borderRadius: "12px",
            padding: "2.5rem",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <CheckCircle size={48} style={{ color: "#22c55e", margin: "0 auto 1rem" }} />
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "0.75rem" }}>
                  APPLICATION RECEIVED
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.50 0 0)", lineHeight: 1.7, maxWidth: "420px", margin: "0 auto" }}>
                  Thank you for applying. We review all applications carefully and will be in touch within 3–5 business days.
                  Check your email for a confirmation.
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "0.4rem" }}>
                  APPLY TO PARTNER
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", marginBottom: "2rem", lineHeight: 1.6 }}>
                  All applications are reviewed manually. We partner with a limited number of resellers to maintain brand integrity.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {/* Contact info */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input style={inputStyle} name="contactName" value={form.contactName} onChange={handleChange} placeholder="Jane Smith" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input style={inputStyle} type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@yourbrand.com" required />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input style={inputStyle} name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <label style={labelStyle}>Business Name *</label>
                      <input style={inputStyle} name="businessName" value={form.businessName} onChange={handleChange} placeholder="Your Brand LLC" required />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Website</label>
                      <input style={inputStyle} name="website" value={form.website} onChange={handleChange} placeholder="https://yourbrand.com" />
                    </div>
                    <div>
                      <label style={labelStyle}>Instagram Handle</label>
                      <input style={inputStyle} name="instagram" value={form.instagram} onChange={handleChange} placeholder="@yourbrand" />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Current Selling Platforms</label>
                    <input style={inputStyle} name="currentPlatforms" value={form.currentPlatforms} onChange={handleChange} placeholder="e.g. Shopify, Amazon, TikTok Shop, own website..." />
                  </div>

                  <div>
                    <label style={labelStyle}>Estimated Monthly Sales Volume</label>
                    <select
                      name="monthlyVolume"
                      value={form.monthlyVolume}
                      onChange={handleChange}
                      style={{ ...inputStyle, appearance: "none" as const }}
                    >
                      <option value="">Select range...</option>
                      {MONTHLY_VOLUME_OPTIONS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Why do you want to partner with Luxurious Habbits?</label>
                    <textarea
                      name="whyPartner"
                      value={form.whyPartner}
                      onChange={handleChange}
                      placeholder="Tell us about your brand, your audience, and why you think we'd be a great fit..."
                      style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="btn-gold"
                    style={{ marginTop: "0.5rem" }}
                  >
                    <span>{submitMutation.isPending ? "Submitting..." : "Submit Application"}</span>
                  </button>

                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.35 0 0)", textAlign: "center", lineHeight: 1.5 }}>
                    By submitting, you confirm you are 21+ and agree to our{" "}
                    <a href="/terms" style={{ color: "#bf5fff", textDecoration: "none" }}>Terms of Service</a>.
                    We review all applications within 3–5 business days.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
