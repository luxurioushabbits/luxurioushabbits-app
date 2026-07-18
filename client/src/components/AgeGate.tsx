/**
 * AgeGate — Luxurious Habbits
 * 21+ age verification overlay. Black luxury with glitch effect.
 *
 * SEO Architecture:
 * - Children (page content) ALWAYS render in the DOM — Googlebot can read everything.
 * - The age gate is a CSS position:fixed overlay that sits on top visually.
 * - Real users see the gate and must click through.
 * - Returning visitors who already confirmed are skipped immediately (localStorage).
 * - This is NOT cloaking — the same content is served to everyone.
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [declined, setDeclined] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [bgGlitchKey, setBgGlitchKey] = useState(0);
  const [bgGlitchPhase, setBgGlitchPhase] = useState<"off" | "pre" | "burst" | "settle">("off");
  // Autonomous logo flash state for age gate
  const [ageLogoOpacity, setAgeLogoOpacity] = useState(0);
  const [ageLogoMode, setAgeLogoMode] = useState(0);
  const [ageLogoKey, setAgeLogoKey] = useState(0);

  useEffect(() => {
    // Admin users bypass age gate entirely
    if (user?.role === "admin") {
      setVerified(true);
      return;
    }

    // 1. Check localStorage first — fastest, survives browser restarts
    const ls = localStorage.getItem("lh_age_verified");
    if (ls === "true") {
      setVerified(true);
      return;
    }

    // 2. Check server-side cookie (survives page refresh within session)
    fetch("/api/age-verified", { credentials: "include" })
      .then(r => r.json())
      .then((data: { verified: boolean }) => {
        if (data.verified) {
          // Persist to localStorage so future visits skip the gate
          localStorage.setItem("lh_age_verified", "true");
          setVerified(true);
        } else {
          // 3. Fall back to legacy sessionStorage flag
          const stored = sessionStorage.getItem("lh_age_verified");
          if (stored === "true") {
            // Migrate to localStorage + server cookie
            localStorage.setItem("lh_age_verified", "true");
            fetch("/api/age-verify", { method: "POST", credentials: "include" }).catch(() => {});
            setVerified(true);
          } else {
            setVerified(false);
          }
        }
      })
      .catch(() => {
        // If server is unreachable, fall back to sessionStorage
        const stored = sessionStorage.getItem("lh_age_verified");
        setVerified(stored === "true");
      });
  }, [user]);

  // Autonomous logo flash on age gate — fires every 8-20s, behind text
  useEffect(() => {
    const LOGO = "/manus-storage/logo_skull_transparent_ad0d5e8b.png";
    void LOGO; // referenced in render
    let timer: ReturnType<typeof setTimeout>;
    function fire() {
      const mode = Math.floor(Math.random() * 5);
      setAgeLogoMode(mode);
      setAgeLogoKey(k => k + 1);
      // Flicker sequence: on, off, on, off, on
      const flickers = [
        { op: 0.7, dur: 120 },
        { op: 0,   dur: 80  },
        { op: 0.8, dur: 180 },
        { op: 0,   dur: 60  },
        { op: 0.6, dur: 150 },
        { op: 0,   dur: 0   },
      ];
      let delay = 0;
      flickers.forEach(({ op, dur }) => {
        setTimeout(() => setAgeLogoOpacity(op), delay);
        delay += dur;
      });
      setTimeout(() => setAgeLogoOpacity(0), delay);
      // Schedule next
      timer = setTimeout(fire, 8000 + Math.random() * 12000);
    }
    timer = setTimeout(fire, 5000 + Math.random() * 5000);
    return () => clearTimeout(timer);
  }, []);

  // Periodic glitch on the logo text
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Background glitch — fires every 12s, same timing as main CyclingBackground
  useEffect(() => {
    const interval = setInterval(() => {
      setBgGlitchKey((k) => k + 1);
      setBgGlitchPhase("pre");
      const t1 = setTimeout(() => setBgGlitchPhase("burst"), 400);
      const t2 = setTimeout(() => setBgGlitchPhase("settle"), 900);
      const t3 = setTimeout(() => setBgGlitchPhase("off"), 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = () => {
    // Persist to localStorage (survives browser restarts — returning visitors skip gate)
    localStorage.setItem("lh_age_verified", "true");
    // Also set server-side cookie and legacy sessionStorage
    fetch("/api/age-verify", { method: "POST", credentials: "include" }).catch(() => {});
    sessionStorage.setItem("lh_age_verified", "true");
    setVerified(true);
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  // ── CSS-ONLY OVERLAY ARCHITECTURE ──
  // Children ALWAYS render in the DOM (for SEO / Googlebot).
  // The overlay is position:fixed on top — visually blocks users but not crawlers.

  return (
    <>
      {/* Page content — always in DOM for SEO */}
      <div
        style={{
          // When gate is showing, prevent interaction with page content behind it
          pointerEvents: verified ? "auto" : "none",
          userSelect: verified ? "auto" : "none",
        }}
        aria-hidden={verified === false ? true : undefined}
      >
        {children}
      </div>

      {/* Age gate overlay — only shown when not yet verified */}
      {verified === false && !declined && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(0.04 0 0)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "2rem",
            overflow: "hidden",
          }}
        >
          {/* Optical illusion background — seamless rotation using inset:-30% so edges never show */}
          <div
            style={{
              position: "absolute",
              inset: "-30%",
              backgroundImage: "url('/manus-storage/optical_illusion_549ade92.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.22) contrast(1.4) saturate(0.8)",
              pointerEvents: "none",
              animation: "slow-rotate 60s linear infinite",
            }}
          />
          {/* Holographic color overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, #bf5fff14 0%, #00f5ff08 50%, transparent 70%)",
              pointerEvents: "none",
              mixBlendMode: "screen",
            }}
          />
          {/* Dark center vignette to keep text readable */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 60% 60% at center, oklch(0.04 0 0 / 70%) 0%, oklch(0.04 0 0 / 20%) 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Background grid lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              pointerEvents: "none",
              opacity: 0.5,
            }}
          />

          {/* Glitch scan line */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                width: "100%",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #00f5ff, transparent)",
                opacity: 0.3,
                animation: "scan-line 8s linear infinite",
              }}
            />
          </div>

          {/* Corner accents */}
          {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "40px",
                height: "40px",
                borderTop: i < 2 ? "1px solid #bf5fff80" : "none",
                borderBottom: i >= 2 ? "1px solid #bf5fff80" : "none",
                borderLeft: i % 2 === 0 ? "1px solid #bf5fff80" : "none",
                borderRight: i % 2 === 1 ? "1px solid #bf5fff80" : "none",
                top: i < 2 ? "24px" : undefined,
                bottom: i >= 2 ? "24px" : undefined,
                left: i % 2 === 0 ? "24px" : undefined,
                right: i % 2 === 1 ? "24px" : undefined,
              }}
            />
          ))}

          {/* ── Age Gate Glitch Overlay — slice displacement + RGB + noise ── */}
          {bgGlitchPhase !== "off" && (
            <div
              key={`age-glitch-${bgGlitchKey}`}
              style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}
            >
              {/* RGB channel ghost layers */}
              {bgGlitchPhase === "burst" && [
                { x: "-6px", y: "2px",  rot: 0 },
                { x: "6px",  y: "-2px", rot: 1 },
                { x: "3px",  y: "4px",  rot: 2 },
              ].map((ch, i) => (
                <div key={`age-rgb-${i}`} style={{
                  position: "absolute",
                  inset: "-30%",
                  backgroundImage: "url('/manus-storage/optical_illusion_549ade92.webp')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: `translate(${ch.x}, ${ch.y})`,
                  opacity: 0.18,
                  mixBlendMode: "screen",
                  filter: `saturate(8) brightness(1.5) sepia(1) hue-rotate(${ch.rot * 120}deg)`,
                  animation: `glitch-rgb-${i} 80ms steps(1) 3 alternate forwards`,
                }} />
              ))}

              {/* Horizontal slice displacement */}
              {[
                { top: "10%", h: "6%",  shift: "20px",  color: "#00f5ff", opacity: 0.55 },
                { top: "25%", h: "4%",  shift: "-22px", color: "#ff00e5", opacity: 0.50 },
                { top: "40%", h: "7%",  shift: "28px",  color: "#00f5ff", opacity: 0.60 },
                { top: "55%", h: "3%",  shift: "-16px", color: "#bf5fff", opacity: 0.45 },
                { top: "68%", h: "6%",  shift: "24px",  color: "#ff00e5", opacity: 0.55 },
                { top: "80%", h: "4%",  shift: "-18px", color: "#00f5ff", opacity: 0.50 },
              ].map((slice, i) => (
                <div key={`age-slice-${i}`} style={{
                  position: "absolute",
                  left: 0, right: 0,
                  top: slice.top, height: slice.h,
                  overflow: "hidden",
                  opacity: bgGlitchPhase === "burst" ? 1 : bgGlitchPhase === "pre" ? 0.5 : 0.2,
                  animation: `glitch-slice 60ms steps(1) ${i % 3 === 0 ? "0ms" : i % 3 === 1 ? "40ms" : "80ms"} ${bgGlitchPhase === "burst" ? "5" : "2"} alternate forwards`,
                }}>
                  <div style={{
                    position: "absolute",
                    inset: "-100% 0",
                    backgroundImage: "url('/manus-storage/optical_illusion_549ade92.webp')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transform: `translateX(${slice.shift})`,
                    filter: `brightness(0.6) saturate(4) hue-rotate(${i * 50}deg)`,
                    mixBlendMode: "screen",
                    opacity: slice.opacity,
                  }} />
                </div>
              ))}

              {/* Noise blocks */}
              {bgGlitchPhase === "burst" && [
                { top: "18%", left: "8%",  w: "38%", h: "3%",  color: "#00f5ff" },
                { top: "45%", left: "52%", w: "30%", h: "2%",  color: "#ff00e5" },
                { top: "70%", left: "15%", w: "42%", h: "3%",  color: "#bf5fff" },
              ].map((block, i) => (
                <div key={`age-noise-${i}`} style={{
                  position: "absolute",
                  top: block.top, left: block.left,
                  width: block.w, height: block.h,
                  background: `repeating-linear-gradient(
                    90deg,
                    ${block.color}cc 0px, ${block.color}cc 2px,
                    transparent 2px, transparent 4px,
                    #ff00e566 4px, #ff00e566 5px,
                    transparent 5px, transparent 8px
                  )`,
                  mixBlendMode: "screen",
                  opacity: 0.7,
                  animation: "glitch-noise 50ms steps(1) 4 alternate forwards",
                }} />
              ))}

              {/* Brief flash */}
              {bgGlitchPhase !== "settle" && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "oklch(1 0 0 / 4%)",
                  mixBlendMode: "screen",
                  animation: "bg-flash 300ms steps(3) forwards",
                }} />
              )}
            </div>
          )}

          {/* ── Autonomous logo flash — z-index 0 so it sits behind the content (z-index 1) ── */}
          {ageLogoOpacity > 0 && (() => {
            const LOGO = "/manus-storage/logo_skull_transparent_ad0d5e8b.png";
            const SIZE = "min(90vw, 90vh)";
            const baseStyle: React.CSSProperties = {
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: SIZE, height: SIZE, objectFit: "contain",
              pointerEvents: "none",
            };
            return (
              <div key={ageLogoKey} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", opacity: ageLogoOpacity }}>
                {ageLogoMode === 0 && <img src={LOGO} alt="" aria-hidden style={{ ...baseStyle, filter: "saturate(0) contrast(2) brightness(1.4)" }} />}
                {ageLogoMode === 1 && <img src={LOGO} alt="" aria-hidden style={{ ...baseStyle, filter: "contrast(1.2) brightness(1.1)" }} />}
                {ageLogoMode === 2 && (
                  <>
                    <svg width="0" height="0" style={{ position: "absolute" }}>
                      <defs>
                        <filter id="ag-r"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
                        <filter id="ag-g"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
                        <filter id="ag-b"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
                      </defs>
                    </svg>
                    <img src={LOGO} alt="" aria-hidden style={{ ...baseStyle, filter: "url(#ag-r)", transform: "translate(calc(-50% - 12px), -50%)", opacity: 0.85, mixBlendMode: "screen" }} />
                    <img src={LOGO} alt="" aria-hidden style={{ ...baseStyle, filter: "url(#ag-g)", transform: "translate(-50%, calc(-50% + 8px))", opacity: 0.85, mixBlendMode: "screen" }} />
                    <img src={LOGO} alt="" aria-hidden style={{ ...baseStyle, filter: "url(#ag-b)", transform: "translate(calc(-50% + 12px), calc(-50% - 8px))", opacity: 0.85, mixBlendMode: "screen" }} />
                  </>
                )}
                {ageLogoMode === 3 && [0,1,2,3,4,5].map(i => (
                  <img key={i} src={LOGO} alt="" aria-hidden style={{
                    ...baseStyle,
                    clipPath: `inset(${i*16.6}% 0 ${(5-i)*16.6}% 0)`,
                    filter: `sepia(1) hue-rotate(${i*60}deg) saturate(4) brightness(1.3)`,
                    transform: `translate(calc(-50% + ${(i%2===0?1:-1)*((i+1)*8)}px), -50%)`,
                  }} />
                ))}
                {ageLogoMode === 4 && Array.from({length:8}).map((_,i) => (
                  <img key={i} src={LOGO} alt="" aria-hidden style={{
                    ...baseStyle,
                    clipPath: `inset(${Math.floor(i/2)*25}% ${(i%2)*50}% ${(3-Math.floor(i/2))*25}% ${(1-i%2)*50}%)`,
                    filter: `sepia(1) hue-rotate(${i*45}deg) saturate(5) brightness(1.4)`,
                    transform: `translate(calc(-50% + ${(i%3-1)*20}px), calc(-50% + ${(Math.floor(i/3)-1)*20}px))`,
                  }} />
                ))}
              </div>
            );
          })()}

          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "480px", width: "100%" }}>
            {/* Logo */}
            <div style={{ marginBottom: "3rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src="/manus-storage/logo_14152948.png" alt="Luxurious Habbits" style={{ width: "160px", height: "160px", objectFit: "contain", marginBottom: "1.5rem" }} />
              <div
                className={glitching ? "glitch" : ""}
                data-text="LUXURIOUS HABBITS"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(2rem, 8vw, 3.5rem)",
                  letterSpacing: "0.15em",
                  color: "oklch(0.96 0 0)",
                  lineHeight: 1,
                }}
              >
                LUXURIOUS HABBITS
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.4em",
                  color: "#bf5fff",
                  textTransform: "uppercase",
                  marginTop: "0.5rem",
                }}
              >
                Premium Hemp
              </div>
            </div>

            {/* Gold divider */}
            <div className="gold-divider" style={{ marginBottom: "3rem" }} />

            {/* Age check */}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
                color: "oklch(0.80 0 0)",
                fontStyle: "italic",
                marginBottom: "0.75rem",
                fontWeight: 300,
              }}
            >
              You must be 21 or older to enter.
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                color: "oklch(0.45 0 0)",
                marginBottom: "3rem",
                textTransform: "uppercase",
              }}
            >
              By entering, you confirm your age and agree to{" "}
              <a href="/terms" style={{ color: "oklch(0.75 0.08 280)", textDecoration: "underline", textUnderlineOffset: "2px" }}>our terms</a>.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-gold" onClick={handleVerify}>
                <span>I Am 21 or Older — Enter</span>
              </button>
              <button
                onClick={handleDecline}
                style={{
                  background: "transparent",
                  border: "1px solid oklch(1 0 0 / 15%)",
                  color: "oklch(0.45 0 0)",
                  padding: "0.8rem 2rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  transition: "all 200ms ease",
                }}
              >
                I Am Under 21
              </button>
            </div>

            {/* Legal note */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6rem",
                color: "oklch(0.30 0 0)",
                marginTop: "3rem",
                lineHeight: 1.6,
                letterSpacing: "0.05em",
              }}
            >
              This website contains information about hemp products. By entering, you confirm that you are 21 years of age or older and that hemp products are legal in your state or jurisdiction. All products are Farm Bill compliant (≤0.3% Δ9-THC). These statements have not been evaluated by the FDA. Hemp products are not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </div>
      )}

      {/* Declined screen */}
      {declined && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <p style={{ color: "oklch(0.55 0 0)", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Access Denied
          </p>
          <p style={{ color: "oklch(0.35 0 0)", fontSize: "0.65rem", marginTop: "1rem", letterSpacing: "0.1em" }}>
            You must be 21 or older to enter this site.
          </p>
        </div>
      )}
    </>
  );
}

/**
 * SEOContent — Invisible to users but visible to search engine crawlers.
 * Provides H1, H2 tags and keyword-rich text that crawlers index.
 * Rendered outside the fixed age gate overlay so it's in the document flow.
 */
export function AgeGateSEOContent() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      <h1>Luxurious Habbits — Premium THCA Flower &amp; Hemp Products</h1>
      <h2>Farm Bill Compliant THCA Flower, Indica, Sativa &amp; Hybrid Strains</h2>
      <h2>Third-Party Lab Tested Hemp — COA Verified</h2>
      <p>
        Luxurious Habbits is a premium hemp brand offering Farm Bill compliant THCA flower, hemp extracts, and accessories.
        All products are third-party lab tested with full-panel Certificates of Analysis (COA) covering cannabinoids, pesticides, heavy metals, and microbials.
        We carry Indica, Sativa, and Hybrid strains sourced from top-tier cultivators. Discreet shipping nationwide.
        Adults 21 and older only.
      </p>
      <nav>
        <a href="/products">Shop All Hemp Products</a>
        <a href="/products/flower">THCA Flower</a>
        <a href="/products/extracts">Hemp Extracts</a>
        <a href="/products/accessories">Hemp Accessories</a>
        <a href="/habbits-box">Habbits Box Subscription</a>
        <a href="/coa">Certificates of Analysis</a>
        <a href="/blog">Hemp &amp; THCA Blog</a>
        <a href="/our-story">Our Story</a>
      </nav>
    </div>
  );
}
