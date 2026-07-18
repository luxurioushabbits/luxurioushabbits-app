/**
 * COA (Certificate of Analysis) — Luxurious Habbits
 * Auto-populated from active products with COA URLs in the DB
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { FlaskConical, ShieldCheck, FileText, ExternalLink, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fallback = setTimeout(() => setVisible(true), 800);
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); clearTimeout(fallback); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return { ref, visible };
}

const whatWeTest = [
  { icon: <ShieldCheck size={18} />, title: "Cannabinoid Profile", desc: "Full cannabinoid panel including CBD, CBG, CBN, CBC, and Δ9-THC to confirm ≤0.3% Farm Bill compliance." },
  { icon: <FlaskConical size={18} />, title: "Pesticide Screening", desc: "Comprehensive screening for herbicides, fungicides, and insecticides. If residues are detected above acceptable limits, the product is rejected." },
  { icon: <FileText size={18} />, title: "Heavy Metals", desc: "Full heavy metals panel: lead, arsenic, cadmium, and mercury. Because what's NOT in the product matters just as much as what is." },
  { icon: <ShieldCheck size={18} />, title: "Microbials", desc: "Microbiological testing for mold, yeast, E. coli, salmonella, and other harmful bacteria to guarantee product safety." },
  { icon: <FlaskConical size={18} />, title: "Residual Solvents", desc: "Verification that no harmful solvents remain in the product. Especially critical for our solventless hash rosin — zero tolerance." },
  { icon: <ShieldCheck size={18} />, title: "Mycotoxins", desc: "Screening for aflatoxins and ochratoxin A — harmful mold-produced toxins that can occur in plant-based products." },
];

function COADocuments() {
  const { data: coaProducts, isLoading } = trpc.catalog.getCOAs.useQuery();

  return (
    <section style={{ padding: "6rem 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="section-label" style={{ marginBottom: "1rem" }}>Lab Reports</div>
          <h2 className="glitch glitch-slow" data-text="PRODUCT COA DOCUMENTS" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            PRODUCT <span className="text-holo">COA DOCUMENTS</span>
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.40 0 0)", marginTop: "1rem", fontWeight: 300 }}>
            Third-party lab reports for every active product. Updated per batch.
          </p>
        </div>

        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Loader2 size={28} style={{ color: "#bf5fff", animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {!isLoading && coaProducts && coaProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.1em", color: "oklch(0.35 0 0)", marginBottom: "0.75rem" }}>COA REPORTS COMING SOON</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.30 0 0)", fontWeight: 300 }}>Lab reports are uploaded per product. Check back after products are published.</p>
          </div>
        )}

        {!isLoading && coaProducts && coaProducts.length > 0 && (() => {
          // Group by category
          const groups: Record<string, typeof coaProducts> = {};
          for (const p of coaProducts) {
            const cat = p.category ?? 'other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
          }
          const catOrder = ['flower', 'extract', 'edible', 'tincture', 'topical', 'other'];
          const catLabels: Record<string, string> = {
            flower: 'Hemp Flower',
            extract: 'Extracts & Concentrates',
            edible: 'Edibles',
            tincture: 'Tinctures',
            topical: 'Topicals',
            other: 'Other',
          };
          const maxTerpPct = (terpenes: { percentage: string | null }[]) =>
            Math.max(...terpenes.map(t => parseFloat(t.percentage ?? '0')), 0.01);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {catOrder.filter(cat => groups[cat]?.length).map(cat => (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.15em', color: '#bf5fff' }}>{catLabels[cat]}</div>
                    <div style={{ flex: 1, height: '1px', background: 'oklch(1 0 0 / 8%)' }} />
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', color: 'oklch(0.40 0 0)', letterSpacing: '0.1em' }}>{groups[cat].length} PRODUCTS</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'oklch(1 0 0 / 6%)' }}>
                    {groups[cat].map((p) => {
                      const terpenes = (p as any).terpenes ?? [];
                      const maxPct = maxTerpPct(terpenes);
                      const thca = (p as any).thcaPercent;
                      const strainColor = p.strainType === 'indica' ? '#9b59b6' : p.strainType === 'sativa' ? '#e67e22' : '#27ae60';
                      return (
                        <div
                          key={p.id}
                          className="rgb-hover"
                          style={{ background: 'oklch(0.04 0 0)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        >
                          {/* Product image with THCA % overlay */}
                          <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: 'oklch(0.07 0 0)', overflow: 'hidden' }}>
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', transition: 'transform 0.4s ease' }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={40} style={{ color: '#bf5fff44' }} />
                              </div>
                            )}
                            {/* Dark gradient overlay at bottom */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 45%, transparent 70%)', pointerEvents: 'none' }} />
                            {/* Strain type badge — top left */}
                            {p.strainType && (
                              <div style={{
                                position: 'absolute', top: '0.75rem', left: '0.75rem',
                                background: `${strainColor}22`,
                                border: `1px solid ${strainColor}66`,
                                borderRadius: '4px',
                                padding: '3px 10px',
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.55rem',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                color: strainColor,
                              }}>
                                {p.strainType}
                              </div>
                            )}
                            {/* THCA % badge — top right, bold and prominent */}
                            {thca && (
                              <div style={{
                                position: 'absolute', top: '0.75rem', right: '0.75rem',
                                background: 'rgba(0,0,0,0.75)',
                                border: '1px solid #00e5a066',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                              }}>
                                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', lineHeight: 1, color: '#00e5a0', letterSpacing: '0.05em' }}>
                                  {parseFloat(thca).toFixed(1)}%
                                </span>
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.45rem', color: '#00e5a0aa', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '1px' }}>
                                  THCa
                                </span>
                              </div>
                            )}
                            {/* Product name overlay at bottom of image */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.75rem 1rem' }}>
                              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'oklch(0.95 0 0)', fontWeight: 600, letterSpacing: '0.01em', lineHeight: 1.3 }}>{p.name}</div>
                            </div>
                          </div>

                          {/* Card body */}
                          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>

                          {/* Terpene bars */}
                          {terpenes.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.55rem', color: 'oklch(0.40 0 0)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Top Terpenes</div>
                              {terpenes.map((t: any) => (
                                <div key={t.terpeneSlug} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', color: 'oklch(0.55 0 0)', width: '110px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.terpeneName}</div>
                                  <div style={{ flex: 1, height: '3px', background: 'oklch(1 0 0 / 6%)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(parseFloat(t.percentage) / maxPct) * 100}%`, background: 'linear-gradient(90deg, #bf5fff, #00e5a0)', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                                  </div>
                                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.55rem', color: 'oklch(0.50 0 0)', width: '38px', textAlign: 'right', flexShrink: 0 }}>{parseFloat(t.percentage).toFixed(3)}%</div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ height: '1px', background: 'oklch(1 0 0 / 6%)' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', color: '#00e5a0', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>✓ 3rd Party Lab Tested &amp; Verified</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {p.slug && (
                                <a
                                  href={`/products/${p.slug}`}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: "'Inter', sans-serif", fontSize: '0.62rem', color: 'oklch(0.55 0 0)', fontWeight: 500, letterSpacing: '0.04em', textDecoration: 'none' }}
                                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#bf5fff'}
                                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'oklch(0.55 0 0)'}
                                >
                                  Learn More ↗
                                </a>
                              )}
                              <a
                                href={p.coaUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: '#bf5fff', fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none' }}
                              >
                                View Full COA <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </section>
  );
}

export default function COA() {
  const [glitch, setGlitch] = useState(false);
  const infoSection = useInView();
  const testSection = useInView();

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 350);
    }, 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO
        title="Certificates of Analysis — Lab Tested THCA Flower"
        description="View Certificates of Analysis (COA) for all Luxurious Habbits THCA flower and hemp products. Full-panel third-party lab testing for cannabinoids, pesticides, heavy metals, microbials, and more."
        keywords="hemp COA, certificate of analysis hemp, lab tested THCA flower, hemp lab results, third party tested hemp, COA verified hemp flower, full panel hemp testing"
        canonical="/coa"
      />

      {/* ── HEADER ── */}
      <section className="glitch-tear" style={{ padding: "6rem 0 5rem", position: "relative", overflow: "hidden", borderBottom: "1px solid oklch(1 0 0 / 6%)", background: "oklch(0.04 0 0)" }}>
        {/* Fine dot matrix — lab/scientific feel */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, oklch(1 0 0 / 8%) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }} />
        {/* Cyan glow bottom-left — lab accent */}
        <div style={{
          position: "absolute", bottom: "-80px", left: "-80px",
          width: "450px", height: "450px",
          background: "radial-gradient(circle, oklch(0.75 0.15 200 / 6%) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Gold glow top-right */}
        <div style={{
          position: "absolute", top: "-60px", right: "10%",
          width: "350px", height: "350px",
          background: "radial-gradient(circle, #bf5fff0f 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Horizontal rule lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px)",
          backgroundSize: "100% 80px",
          pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, #00f5ff, transparent)", opacity: 0.25, animation: "scan-line 13s linear infinite" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up" style={{ marginBottom: "1rem" }}>Transparency</div>
          <h1 className="animate-fade-up-1 glitch glitch-intense" data-text="CERTIFICATES" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 9vw, 6.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
            CERTIFICATES
          </h1>
          <h1 className="animate-fade-up-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 9vw, 6.5rem)", letterSpacing: "0.05em", color: "#bf5fff", lineHeight: 1, marginBottom: "2rem" }}>
            OF ANALYSIS.
          </h1>
          <p className="animate-fade-up-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "oklch(0.55 0 0)", maxWidth: "580px", lineHeight: 1.8, fontWeight: 300 }}>
            Every product. Every batch. Third-party verified. Because transparency is not optional — it's the standard.
          </p>
        </div>
      </section>

      {/* ── WHAT IS A COA ── */}
      <section ref={infoSection.ref} className="glitch-tear" style={{ padding: "7rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "start" }}>
            <div style={{ opacity: infoSection.visible ? 1 : 0, transform: infoSection.visible ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
              <div className="section-label" style={{ marginBottom: "1.5rem" }}>What Is a COA?</div>
              <h2 className="glitch glitch-slow" data-text="YOUR PROOF OF" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1.1, marginBottom: "2rem" }}>
                YOUR PROOF OF<br /><span className="text-holo">QUALITY.</span>
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.48 0 0)", lineHeight: 1.9, marginBottom: "1.5rem", fontWeight: 300 }}>
                A Certificate of Analysis (COA) is an official document issued by an accredited, independent third-party laboratory. It verifies the exact composition of a hemp product — including cannabinoid levels, purity, and the absence of harmful contaminants.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.48 0 0)", lineHeight: 1.9, marginBottom: "1.5rem", fontWeight: 300 }}>
                At Luxurious Habbits, every product we sell is accompanied by a COA from an independent lab. We don't self-certify. We don't cut corners. You deserve to know exactly what you're getting — and we make that possible.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.48 0 0)", lineHeight: 1.9, fontWeight: 300 }}>
                All products are confirmed to contain ≤0.3% Δ9-THC on a dry weight basis, in full compliance with the 2018 Agriculture Improvement Act.
              </p>
            </div>

            <div style={{ opacity: infoSection.visible ? 1 : 0, transform: infoSection.visible ? "translateX(0)" : "translateX(30px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s" }}>
              <div className="" style={{ border: "1px solid oklch(1 0 0 / 8%)", padding: "2.5rem", background: "oklch(0.06 0 0)", position: "relative" }}>
                <div style={{ position: "absolute", top: "-1px", left: "2rem", right: "2rem", height: "1px", background: "linear-gradient(90deg, #00f5ff, #bf5fff, #ff00e5)" }} />
                <div className="section-label" style={{ marginBottom: "1.5rem" }}>Why It Matters</div>
                {[
                  { label: "Legal Compliance", val: "Confirms ≤0.3% Δ9-THC" },
                  { label: "Purity Verified", val: "No pesticides or heavy metals" },
                  { label: "Potency Confirmed", val: "Accurate cannabinoid levels" },
                  { label: "Independent Testing", val: "Third-party accredited labs" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)", letterSpacing: "0.05em" }}>{item.label}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#bf5fff", letterSpacing: "0.05em", fontWeight: 500 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE TEST ── */}
      <section ref={testSection.ref} className="glitch-tear" style={{ padding: "4rem 0 7rem", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div className="section-label" style={{ marginBottom: "1rem" }}>Our Testing Protocol</div>
            <h2 className="glitch glitch-slow" data-text="WHAT WE TEST FOR" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", lineHeight: 1 }}>
              WHAT WE <span className="text-holo">TEST FOR</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "oklch(1 0 0 / 6%)" }}>
            {whatWeTest.map((item, i) => (
              <div
                key={item.title}
                className="rgb-hover"
                style={{
                  background: "oklch(0.06 0 0)",
                  padding: "2.5rem 2rem",
                  opacity: testSection.visible ? 1 : 0,
                  transform: testSection.visible ? "translateY(0)" : "translateY(30px)",
                  transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
                }}
              >
                <div style={{ color: "#bf5fff", marginBottom: "1.25rem" }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.75rem" }}>{item.title}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.45 0 0)", lineHeight: 1.8, fontWeight: 300 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COA DOCUMENTS — AUTO-POPULATED ── */}
      <COADocuments />

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 0", background: "oklch(0.06 0 0)", borderTop: "1px solid oklch(1 0 0 / 6%)", textAlign: "center" }}>
        <div className="container">
          <div className="section-label" style={{ marginBottom: "1rem" }}>Questions About Our Testing?</div>
          <h2 className="glitch glitch-slow" data-text="WE'RE HAPPY TO ANSWER THEM." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.5rem, 4vw, 3rem)", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", marginBottom: "2.5rem", lineHeight: 1 }}>
            WE'RE HAPPY TO <span className="text-holo">ANSWER THEM.</span>
          </h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact"><button className="btn-gold"><span>Contact Us</span></button></Link>
            <Link href="/faq"><button className="btn-outline-white"><span>View FAQ</span></button></Link>
          </div>
        </div>
      </section>

    </div>
  );
}
