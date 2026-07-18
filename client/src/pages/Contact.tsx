/**
 * Contact — Luxurious Habbits
 * Contact form wired to backend — no email displayed publicly
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";

export default function Contact() {
  const [glitch, setGlitch] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 350);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    submitMutation.mutate({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "oklch(0.07 0 0)",
    border: "1px solid oklch(1 0 0 / 10%)",
    color: "oklch(0.96 0 0)",
    padding: "0.9rem 1.25rem",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.8rem",
    outline: "none",
    letterSpacing: "0.03em",
    transition: "border-color 200ms ease",
    display: "block",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.6rem",
    letterSpacing: "0.25em",
    color: "oklch(0.45 0 0)",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "0.5rem",
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Contact Us"
        description="Get in touch with Luxurious Habbits. Questions about our premium THCA flower, hemp extracts, The Habbits Box subscription, or your order? We're here to help."
        keywords="contact luxurious habbits, hemp flower customer service, THCA flower support, hemp store contact"
        canonical="/contact"
      />

      {/* ── HEADER ── */}
      <section style={{ padding: "6rem 0 5rem", position: "relative", overflow: "hidden", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #00f5ff, transparent)", opacity: 0.2, animation: "scan-line 12s linear infinite" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up" style={{ marginBottom: "1rem" }}>Contact</div>
          <h1 className={`animate-fade-up-1${glitch ? " glitch" : ""}`} data-text="GET IN" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            GET IN
          </h1>
          <h1 className="animate-fade-up-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "0.05em", color: "#bf5fff", lineHeight: 1, marginBottom: "2rem" }}>
            TOUCH.
          </h1>
          <p className="animate-fade-up-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "oklch(0.55 0 0)", maxWidth: "520px", lineHeight: 1.8, fontWeight: 300 }}>
            Questions, feedback, or just want to know more? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <section className="glitch-tear" style={{ padding: "7rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "4rem", alignItems: "start" }}>

            {/* Left info */}
            <div>
              <div className="section-label" style={{ marginBottom: "1.5rem" }}>Reach Out</div>
              <h2 className="glitch glitch-slow" data-text="WE RESPOND" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1.1, marginBottom: "2rem" }}>
                WE RESPOND<br /><span className="text-holo">PROMPTLY.</span>
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.45 0 0)", lineHeight: 1.9, marginBottom: "2rem", fontWeight: 300 }}>
                We're a small, dedicated team based in the USA. Whether you have a question about our products, need help with an order, or just want to connect — we take every message seriously.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.45 0 0)", lineHeight: 1.9, fontWeight: 300 }}>
                We aim to respond to all inquiries within 1–2 business days.
              </p>

              <div className="gold-divider" style={{ margin: "2.5rem 0" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { label: "Location", value: "USA" },
                  { label: "Response Time", value: "1–2 Business Days" },
                  { label: "Operations", value: "E-Commerce Only" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.25em", color: "#bf5fff", textTransform: "uppercase", marginBottom: "0.25rem" }}>{item.label}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.55 0 0)" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="gold-divider" style={{ margin: "2.5rem 0" }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.30 0 0)", lineHeight: 1.7 }}>
                For order-related issues, please include your order number in your message.
              </p>
            </div>

            {/* Right form */}
            <div>
              {submitted ? (
                <div className="animate-fade-up" style={{ border: "1px solid #bf5fff4d", padding: "4rem 3rem", textAlign: "center", background: "oklch(0.06 0 0)" }}>
                  <CheckCircle size={40} style={{ color: "#bf5fff", margin: "0 auto 1.5rem" }} />
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>MESSAGE SENT</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.48 0 0)", lineHeight: 1.8, marginBottom: "2rem", fontWeight: 300 }}>
                    Thank you for reaching out. We'll get back to you within 1–2 business days.
                  </p>
                  <button className="btn-gold" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                    <span>Send Another Message</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1.5rem" }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#bf5fff80")}
                        onBlur={e => (e.target.style.borderColor = "oklch(1 0 0 / 10%)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#bf5fff80")}
                        onBlur={e => (e.target.style.borderColor = "oklch(1 0 0 / 10%)")}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Subject *</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, cursor: "pointer" }}
                      onFocus={e => (e.target.style.borderColor = "#bf5fff80")}
                      onBlur={e => (e.target.style.borderColor = "oklch(1 0 0 / 10%)")}
                    >
                      <option value="" style={{ background: "oklch(0.07 0 0)" }}>Select a subject</option>
                      <option value="Product Inquiry" style={{ background: "oklch(0.07 0 0)" }}>Product Inquiry</option>
                      <option value="Order Support" style={{ background: "oklch(0.07 0 0)" }}>Order Support</option>
                      <option value="COA / Lab Results" style={{ background: "oklch(0.07 0 0)" }}>COA / Lab Results</option>
                      <option value="Shipping Question" style={{ background: "oklch(0.07 0 0)" }}>Shipping Question</option>
                      <option value="Wholesale / Partnership" style={{ background: "oklch(0.07 0 0)" }}>Wholesale / Partnership</option>
                      <option value="Other" style={{ background: "oklch(0.07 0 0)" }}>Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us how we can help..."
                      rows={6}
                      style={{ ...inputStyle, resize: "vertical", minHeight: "140px" }}
                      onFocus={e => (e.target.style.borderColor = "#bf5fff80")}
                      onBlur={e => (e.target.style.borderColor = "oklch(1 0 0 / 10%)")}
                    />
                  </div>

                  {errorMsg && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "oklch(0.08 0 0)", border: "1px solid #ff444466", padding: "0.75rem 1rem" }}>
                      <AlertCircle size={14} style={{ color: "#ff4444", flexShrink: 0 }} />
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#ff6666", margin: 0 }}>{errorMsg}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.30 0 0)", fontWeight: 300 }}>
                      * Required fields. Your information is never shared or sold.
                    </p>
                    <button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="btn-gold"
                      style={{ opacity: submitMutation.isPending ? 0.6 : 1, display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {submitMutation.isPending ? "Sending..." : <><Send size={13} /> Send Message</>}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ LINK ── */}
      <section style={{ padding: "4rem 0", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)", textAlign: "center" }}>
        <div className="container">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.40 0 0)", marginBottom: "1.25rem" }}>
            Looking for quick answers? Check our FAQ first.
          </p>
          <Link href="/faq">
            <button className="btn-outline-white"><span>View FAQ</span></button>
          </Link>
        </div>
      </section>

    </div>
  );
}
