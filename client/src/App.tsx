import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import GiftCelebrationPopup from "./components/GiftCelebrationPopup";
import AdminMessagePopup from "./components/AdminMessagePopup";
import StealthChatWindow from "./components/StealthChatWindow";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import OurStory from "./pages/OurStory";
import Products from "./pages/Products";
import COA from "./pages/COA";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Loyalty from "./pages/Loyalty";
import Terms from "./pages/Terms";
import Shipping from "./pages/Shipping";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import HabbitsBox from "./pages/HabbitsBox";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import AdminProduct from "./pages/AdminProduct";
import TopShelfDashboard from "./pages/admin/TopShelfDashboard";
import BlogEditor from "./pages/admin/BlogEditor";
import Blog from "./pages/Blog";
import StrainGuide from "./pages/StrainGuide";
import BlogPost from "./pages/BlogPost";
import MySubscription from "./pages/MySubscription";
import Wholesale from "./pages/Wholesale";
import Account from "./pages/Account";
import TerpeneGuide from "./pages/TerpeneGuide";
import TerpenePage from "./pages/TerpenePage";
import CategoryComingSoon from "./pages/CategoryComingSoon";
import StrainComparison from "./pages/StrainComparison";
import TrackOrder from "./pages/TrackOrder";
import ShareExperience from "./pages/ShareExperience";
import OrderConfirmation from "./pages/OrderConfirmation";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import CryptoPayment from "./pages/CryptoPayment";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dropship from "./pages/Dropship";
import CartDrawer from "./components/CartDrawer";
import EmailCapturePopup from "./components/EmailCapturePopup";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AgeGate, { AgeGateSEOContent } from "./components/AgeGate";
import { memo, useEffect, useState } from "react";
import { useAnalyticsTracker } from "./hooks/useAnalyticsTracker";
import { useLocation } from "wouter";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";

// All optical illusion images to cycle through
const BG_IMAGES = [
  "/manus-storage/optical_illusion_549ade92.webp",       // original spiral swirl
  "/manus-storage/optical_swirls_27b9cf4e.webp",         // multi-swirl spiral
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663729872981/kfSRtBTLcfiebpgEWg2wEe/optical_tunnel_v2-dzVSF9n6ovDz3g3zAzQvE9.webp", // spiral tunnel vortex (no zebra)
];

// All available background images
const ALL_BG_IMAGES = [
  "/manus-storage/optical_illusion_549ade92.webp",
  "/manus-storage/optical_swirls_27b9cf4e.webp",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663729872981/kfSRtBTLcfiebpgEWg2wEe/optical_tunnel_v2-dzVSF9n6ovDz3g3zAzQvE9.webp",
  "/manus-storage/zebra-tunnel-optical-illusion_3c96324c.webp",
];

// Pick one random journal background at module load — never changes for the session
const JOURNAL_BG = (() => {
  const imgs = ALL_BG_IMAGES;
  const durs = ["70s", "80s", "75s", "85s"];
  const dirs: string[] = ["normal", "reverse", "normal", "reverse"];
  const i = Math.floor(Math.random() * imgs.length);
  return { image: imgs[i], duration: durs[i], direction: dirs[i] };
})();

// Preload all images at module load
if (typeof window !== "undefined") {
  ALL_BG_IMAGES.forEach(src => { const img = new Image(); img.src = src; });
}

// Memoized journal layer — receives no props so it NEVER re-renders after mount.
// Visibility is controlled by directly mutating the DOM ref (no React re-render).
const journalLayerRef = { current: null as HTMLDivElement | null };

const JournalBgLayer = memo(function JournalBgLayer() {
  return (
    <div
      ref={(el) => { journalLayerRef.current = el; }}
      style={{
        position: "absolute",
        inset: "-50%",
        zIndex: 2,
        backgroundImage: `url('${JOURNAL_BG.image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(0.28) contrast(1.3) saturate(0.9)",
        animation: `slow-rotate ${JOURNAL_BG.duration} linear infinite ${JOURNAL_BG.direction}`,
        willChange: "transform",
        opacity: 0,
        transition: "opacity 0.15s ease-out",
      }}
    />
  );
});

// Unified always-mounted background — never unmounts, so there's never a black flash.
// On journal pages: shows the session-fixed static spinning image, no glitch.
// On all other pages: cycles through images with glitch transitions.
function UnifiedBackground() {
  const [location] = useLocation();
  const isJournal = isJournalPath(location);

  // Directly mutate the journal layer's opacity via DOM ref — zero React re-renders on the animated div.
  useEffect(() => {
    const el = journalLayerRef.current;
    if (!el) return;
    el.style.opacity = isJournal ? "1" : "0";
  }, [isJournal]);

  // Cycling state (only active on non-journal pages)
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [fading, setFading] = useState(false);
  const [glitchKey, setGlitchKey] = useState(0);
  const [glitchPhase, setGlitchPhase] = useState<"off" | "pre" | "burst" | "settle">("off");

  useEffect(() => {
    if (isJournal) return; // no cycling on journal pages
    const interval = setInterval(() => {
      setGlitchKey((k) => k + 1);
      setGlitchPhase("pre");
      const t1 = setTimeout(() => { setGlitchPhase("burst"); setFading(true); }, 400);
      const t2 = setTimeout(() => setGlitchPhase("settle"), 900);
      const t3 = setTimeout(() => {
        setCurrent((c) => (c + 1) % BG_IMAGES.length);
        setNext((n) => (n + 1) % BG_IMAGES.length);
        setFading(false);
        setGlitchPhase("off");
      }, 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, 12000);
    return () => clearInterval(interval);
  }, [isJournal]);

  const currentCfg = BG_CONFIGS[current % BG_CONFIGS.length];
  const nextCfg = BG_CONFIGS[next % BG_CONFIGS.length];

  const SLICES = [
    { top: "15%", h: "4%",  shift: "12px",  color: "#00f5ff", opacity: 0.28 },
    { top: "32%", h: "3%",  shift: "-14px", color: "#ff00e5", opacity: 0.24 },
    { top: "50%", h: "5%",  shift: "18px",  color: "#00f5ff", opacity: 0.30 },
    { top: "68%", h: "3%",  shift: "-10px", color: "#bf5fff", opacity: 0.22 },
    { top: "82%", h: "4%",  shift: "14px",  color: "#ff00e5", opacity: 0.26 },
  ];
  const RGB_OFFSETS = [
    { x: "-4px", y: "1px",  color: "255,0,200",  opacity: 0.09 },
    { x: "4px",  y: "-1px", color: "0,245,255",  opacity: 0.09 },
    { x: "2px",  y: "3px",  color: "0,255,100",  opacity: 0.06 },
  ];
  const NOISE_BLOCKS = [
    { top: "28%", left: "12%", w: "28%", h: "2%",   color: "#00f5ff" },
    { top: "58%", left: "52%", w: "22%", h: "1.5%", color: "#ff00e5" },
    { top: "76%", left: "22%", w: "32%", h: "2%",   color: "#bf5fff" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>

      {/* ── CYCLING LAYERS: always in DOM, opacity:0 on journal pages (animation keeps running) ── */}
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          backgroundImage: `url('${BG_IMAGES[current]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: fading
            ? "brightness(0.45) contrast(2.5) saturate(0) hue-rotate(120deg)"
            : "brightness(0.22) contrast(1.4) saturate(0.8)",
          animation: `slow-rotate ${currentCfg.duration} linear infinite ${currentCfg.direction}`,
          opacity: fading ? 0 : 1,
          transition: "opacity 1.4s ease-in-out, filter 0.35s ease-out",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          backgroundImage: `url('${BG_IMAGES[next]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: fading
            ? "brightness(0.22) contrast(1.4) saturate(0.8)"
            : "brightness(0.45) contrast(2.5) saturate(0) hue-rotate(-120deg)",
          animation: `slow-rotate ${nextCfg.duration} linear infinite ${nextCfg.direction}`,
          opacity: fading ? 1 : 0,
          transition: "opacity 1.4s ease-in-out, filter 0.8s ease-in",
        }}
      />

      {/* ── JOURNAL LAYER: memoized, opacity controlled via DOM ref (no re-render) ── */}
      <JournalBgLayer />

      {/* ── GLITCH OVERLAY (only on non-journal pages) ── */}
      {!isJournal && glitchPhase !== "off" && (
        <div
          key={`glitch-${glitchKey}`}
          style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}
        >
          {glitchPhase === "burst" && RGB_OFFSETS.map((ch, i) => (
            <div key={`rgb-${i}`} style={{
              position: "absolute", inset: "-50%",
              backgroundImage: `url('${BG_IMAGES[current]}')`,
              backgroundSize: "cover", backgroundPosition: "center",
              transform: `translate(${ch.x}, ${ch.y})`,
              opacity: ch.opacity, mixBlendMode: "screen",
              filter: `saturate(8) brightness(1.5) sepia(1) hue-rotate(${i * 120}deg)`,
              animation: `glitch-rgb-${i} 80ms steps(1) 3 alternate forwards`,
            }} />
          ))}
          {SLICES.map((slice, i) => (
            <div key={`slice-${i}`} style={{
              position: "absolute", left: 0, right: 0, top: slice.top, height: slice.h,
              overflow: "hidden",
              opacity: glitchPhase === "burst" ? 1 : glitchPhase === "pre" ? 0.5 : 0.2,
              animation: `glitch-slice 60ms steps(1) ${i % 3 === 0 ? "0ms" : i % 3 === 1 ? "40ms" : "80ms"} ${
                glitchPhase === "burst" ? "3" : "1"} alternate forwards`,
            }}>
              <div style={{
                position: "absolute", inset: "-100% 0",
                backgroundImage: `url('${BG_IMAGES[next]}')`,
                backgroundSize: "cover", backgroundPosition: "center",
                transform: `translateX(${slice.shift})`,
                filter: `brightness(0.6) saturate(4) hue-rotate(${i * 50}deg)`,
                mixBlendMode: "screen", opacity: slice.opacity,
              }} />
            </div>
          ))}
          {glitchPhase === "burst" && NOISE_BLOCKS.map((block, i) => (
            <div key={`noise-${i}`} style={{
              position: "absolute", top: block.top, left: block.left, width: block.w, height: block.h,
              background: `repeating-linear-gradient(90deg,${block.color}cc 0px,${block.color}cc 2px,transparent 2px,transparent 4px,#ff00e566 4px,#ff00e566 5px,transparent 5px,transparent 8px)`,
              mixBlendMode: "screen", opacity: 0.35,
              animation: "glitch-noise 50ms steps(1) 2 alternate forwards",
            }} />
          ))}
          {glitchPhase !== "settle" && (
            <div style={{
              position: "absolute", inset: 0,
              background: "oklch(1 0 0 / 2%)", mixBlendMode: "screen",
              animation: "bg-flash 200ms steps(2) forwards",
            }} />
          )}
          {/* Logo flash removed from background cycling glitch — only fires via RandomLogoGlitch on home page */}
        </div>
      )}

      {/* Radial vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 80% at center, transparent 35%, oklch(0.04 0 0) 100%)",
      }} />
    </div>
  );
}

// Each image gets a different rotation speed and direction for variety
// BG_CONFIGS used by UnifiedBackground cycling layers
const BG_CONFIGS = [
  { duration: "70s", direction: "normal" },
  { duration: "80s", direction: "reverse" },
  { duration: "65s", direction: "normal" },
  { duration: "90s", direction: "reverse" },
  { duration: "75s", direction: "normal" },
  { duration: "85s", direction: "reverse" },
  { duration: "95s", direction: "normal" },
  { duration: "72s", direction: "reverse" },
];

function isJournalPath(path: string) {
  return (
    path === "/blog" ||
    path.startsWith("/blog/") ||
    path === "/strain-comparison"
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Single always-mounted background — handles both journal (static) and main site (cycling+glitch) */}
      <UnifiedBackground />
      {/* Dark overlay to keep content readable */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "oklch(0.04 0 0 / 30%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <Navbar />
      <main style={{ flex: 1, position: "relative", zIndex: 1 }}>
        {children}
      </main>
      <Footer />
      <EmailCapturePopup />
    </div>
  );
}

// ── Admin Route Guard — blocks non-admins ───────────────────────────────────
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)" }}>LOADING...</div>
      </div>
    );
  }

  // Only require login for actual admin pages, not for browsing the site
  if (!isAuthenticated || (user as any)?.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)" }}>ACCESS DENIED</div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.45 0 0)" }}>You don't have permission to view this page.</p>
        <a href="/"><button className="btn-outline-white" style={{ fontSize: "0.75rem" }}><span>Go Home</span></button></a>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Scroll to top on every route change ────────────────────────────────────
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

// Capture ?ref= affiliate code on landing and persist for 30 days
function AffiliateCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.length <= 20 && /^[A-Z0-9_-]+$/i.test(ref)) {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      localStorage.setItem("lh_affiliate_ref", JSON.stringify({ code: ref, expiry }));
    }
  }, []);
  return null;
}

// Fires a slice-displacement glitch on every route change
function RouteGlitch() {
  const [location] = useLocation();
  const [glitchKey, setGlitchKey] = useState(0);
  const [phase, setPhase] = useState<"off" | "burst" | "settle">("off");
  const isFirst = useState(true);

  useEffect(() => {
    // Skip the very first mount (initial page load)
    if (isFirst[0]) { isFirst[1](false); return; }
    // No glitch on any journal/blog/education pages
    const noGlitchPaths = ["/blog", "/strain-comparison"];
    if (noGlitchPaths.some(p => location === p || location.startsWith(p + "/"))) return;
    setGlitchKey((k) => k + 1);
    setPhase("burst");
    const t1 = setTimeout(() => setPhase("settle"), 600);
    const t2 = setTimeout(() => setPhase("off"), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (phase === "off") return null;

  // Colored slices — each has a subtle tint
  const SLICES = [
    { top: "18%", h: "3%",  shift: "10px",  color: "#00f5ff", opacity: 0.18 },
    { top: "38%", h: "2.5%", shift: "-12px", color: "#ff00e5", opacity: 0.16 },
    { top: "56%", h: "4%",  shift: "14px",  color: "#bf5fff", opacity: 0.20 },
    { top: "76%", h: "2.5%", shift: "-9px",  color: "#00f5ff", opacity: 0.16 },
  ];

  return (
    <div
      key={`route-glitch-${glitchKey}`}
      style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none", overflow: "hidden" }}
    >
      {/* Subtle color tint flash — very low opacity */}
      {phase === "burst" && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #00f5ff08 0%, #bf5fff0a 50%, #ff00e508 100%)",
          mixBlendMode: "screen",
          animation: "bg-flash 180ms steps(2) forwards",
        }} />
      )}

      {/* Horizontal slice displacement — colored tinted strips */}
      {SLICES.map((slice, i) => (
        <div key={`rs-${i}`} style={{
          position: "absolute",
          left: 0, right: 0,
          top: slice.top, height: slice.h,
          overflow: "hidden",
          opacity: phase === "burst" ? 1 : 0.1,
          animation: `glitch-slice 55ms steps(1) ${i % 2 === 0 ? "0ms" : "45ms"} 2 alternate forwards`,
        }}>
          <div style={{
            position: "absolute",
            inset: "-200% 0",
            background: `linear-gradient(90deg, transparent 0%, ${slice.color}22 20%, ${slice.color}33 50%, ${slice.color}22 80%, transparent 100%)`,
            transform: `translateX(${slice.shift})`,
            mixBlendMode: "screen",
            opacity: slice.opacity,
          }} />
        </div>
      ))}

      {/* Noise blocks — 2 only, very faint */}
      {phase === "burst" && [
        { top: "30%", left: "8%",  w: "25%", h: "1.5%", color: "#00f5ff" },
        { top: "62%", left: "55%", w: "20%", h: "1.5%", color: "#bf5fff" },
      ].map((block, i) => (
        <div key={`rn-${i}`} style={{
          position: "absolute",
          top: block.top, left: block.left,
          width: block.w, height: block.h,
          background: `repeating-linear-gradient(90deg, ${block.color}55 0px, ${block.color}55 2px, transparent 2px, transparent 6px)`,
          mixBlendMode: "screen",
          opacity: 0.25,
          animation: "glitch-noise 50ms steps(1) 2 alternate forwards",
        }} />
      ))}
      {/* Logo flash removed — only fires on age gate and home page */}
    </div>
  );
}

function AnalyticsTracker() {
  useAnalyticsTracker();
  return null;
}

// 5 distinct logo glitch modes — each fires as a clean, intentional style
// Glitch modes:
// 0: B&W clean flicker
// 1: Full color (cream/gold)
// 2: Chromatic aberration (R/G/B offset copies)
// 3: Horizontal slice tears (vivid colors)
// 4: Datamosh blocks (scattered fragments)
// Pages where the random logo flash is suppressed entirely
const GLITCH_SUPPRESSED_PATHS = [
  // Transactional / content-heavy pages
  "/products/",
  "/checkout",
  "/admin",
  "/account",
  "/my-subscription",
  "/track-order",
  "/pay/crypto",
  "/wholesale",
  // Journal / blog / strain guide — all entries
  "/blog",
  "/strain-comparison",
  "/terpene",
];

function RandomLogoGlitch() {
  const [location] = useLocation();
  // opacity is React-state driven — no CSS keyframes, no animation timing bugs
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [mode, setMode] = useState(0);
  const [glitchKey, setGlitchKey] = useState(0);

  // Suppress on content-heavy / transactional pages
  const suppressed = GLITCH_SUPPRESSED_PATHS.some(p => location.startsWith(p));

  useEffect(() => {
    let scheduleTimer: ReturnType<typeof setTimeout>;

    function runFlicker(flickerTimes: { op: number; dur: number }[], onDone: () => void) {
      let i = 0;
      function step() {
        if (i >= flickerTimes.length) { onDone(); return; }
        const { op, dur } = flickerTimes[i++];
        setOpacity(op);
        setTimeout(step, dur);
      }
      step();
    }

    function fire() {
      const newMode = Math.floor(Math.random() * 5);
      const newKey = Date.now();
      setMode(newMode);
      setGlitchKey(newKey);
      setVisible(true);
      setOpacity(0);

      // Build flicker sequence: 2-4 on/off bursts
      const count = 2 + Math.floor(Math.random() * 3);
      const steps: { op: number; dur: number }[] = [];
      for (let i = 0; i < count; i++) {
        const peak = 0.80 + Math.random() * 0.18;
        const onDur = 80 + Math.floor(Math.random() * 120);
        const offDur = 60 + Math.floor(Math.random() * 100);
        steps.push({ op: peak, dur: onDur });
        steps.push({ op: 0, dur: offDur });
      }

      runFlicker(steps, () => {
        setVisible(false);
        setOpacity(0);
        // schedule next
        const delay = 3000 + Math.random() * 5000; // 3-8s
        scheduleTimer = setTimeout(fire, delay);
      });
    }

    // First fire after 1-3s
    scheduleTimer = setTimeout(fire, 1000 + Math.random() * 2000);
    return () => clearTimeout(scheduleTimer);
  }, []);

  if (!visible || suppressed) return null;

  const SIZE = "min(90vw, 90vh)";
  const LOGO = "/manus-storage/logo_skull_transparent_ad0d5e8b.png";

  // Seeded RNG stable per glitchKey
  const rng = (seed: number) => ((Math.sin(seed * 127.1 + glitchKey * 0.001) * 43758.5453) % 1 + 1) % 1;

  const containerStyle: React.CSSProperties = {
    // zIndex 5 — sits above the moving background but below all page text/UI (which starts at z-index 1+)
    position: "fixed", inset: 0, zIndex: 5,
    pointerEvents: "none", overflow: "hidden",
    opacity,
    transition: "none",
  };

  const baseImgStyle: React.CSSProperties = {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: SIZE, height: SIZE,
    objectFit: "contain",
    pointerEvents: "none",
  };

  return (
    <div style={containerStyle}>
      {/* MODE 0: B&W — desaturated skull/flower */}
      {mode === 0 && (
        <img src={LOGO} alt="" aria-hidden="true" style={{
          ...baseImgStyle,
          filter: "saturate(0) contrast(2) brightness(1.3)",
        }} />
      )}

      {/* MODE 1: Full color — original cream/gold */}
      {mode === 1 && (
        <img src={LOGO} alt="" aria-hidden="true" style={{
          ...baseImgStyle,
          filter: "brightness(1.2) saturate(1.4) contrast(1.1)",
        }} />
      )}

      {/* MODE 2: Chromatic aberration — R/G/B offset copies */}
      {mode === 2 && (
        <>
          {/* Red layer — shifted left */}
          <img src={LOGO} alt="" aria-hidden="true" style={{
            ...baseImgStyle,
            transform: "translate(calc(-50% - 14px), calc(-50% - 5px))",
            filter: "saturate(0) sepia(1) hue-rotate(320deg) saturate(10) brightness(1.5) contrast(1.6)",
            mixBlendMode: "screen",
          }} />
          {/* Cyan layer — shifted right */}
          <img src={LOGO} alt="" aria-hidden="true" style={{
            ...baseImgStyle,
            transform: "translate(calc(-50% + 14px), calc(-50% + 5px))",
            filter: "saturate(0) sepia(1) hue-rotate(160deg) saturate(10) brightness(1.5) contrast(1.6)",
            mixBlendMode: "screen",
          }} />
          {/* Green layer — center */}
          <img src={LOGO} alt="" aria-hidden="true" style={{
            ...baseImgStyle,
            transform: "translate(-50%, calc(-50% + 7px))",
            filter: "saturate(0) sepia(1) hue-rotate(80deg) saturate(8) brightness(1.3) contrast(1.5)",
            mixBlendMode: "screen",
          }} />
          {/* Base B&W underneath */}
          <img src={LOGO} alt="" aria-hidden="true" style={{
            ...baseImgStyle,
            filter: "saturate(0) brightness(0.6) contrast(1.4)",
          }} />
        </>
      )}

      {/* MODE 3: Horizontal slice tears */}
      {mode === 3 && [
        { top: "0%",  h: "18%", shift: "-20px", hue: 180 },
        { top: "18%", h: "14%", shift: "22px",  hue: 300 },
        { top: "32%", h: "20%", shift: "-10px", hue: 60  },
        { top: "52%", h: "18%", shift: "16px",  hue: 200 },
        { top: "70%", h: "16%", shift: "-18px", hue: 330 },
        { top: "86%", h: "14%", shift: "12px",  hue: 90  },
      ].map((slice, i) => (
        <div key={i} style={{
          position: "absolute",
          top: slice.top, height: slice.h,
          left: 0, right: 0,
          overflow: "hidden",
        }}>
          <img src={LOGO} alt="" aria-hidden="true" style={{
            position: "absolute",
            top: `calc(-${slice.top})`,
            left: "50%",
            transform: `translate(calc(-50% + ${slice.shift}), 0)`,
            width: SIZE, height: SIZE,
            objectFit: "contain",
            filter: `sepia(1) hue-rotate(${slice.hue}deg) saturate(5) brightness(1.4) contrast(1.5)`,
          }} />
        </div>
      ))}

      {/* MODE 4: Datamosh — scattered color-tinted logo fragments */}
      {mode === 4 && Array.from({ length: 14 }, (_, i) => ({
        top: `${(rng(i * 3) * 82).toFixed(1)}%`,
        left: `${(rng(i * 3 + 1) * 72).toFixed(1)}%`,
        w: `${(10 + rng(i * 3 + 2) * 22).toFixed(1)}%`,
        h: `${(6 + rng(i * 5) * 15).toFixed(1)}%`,
        shiftX: `${((rng(i * 7) - 0.5) * 55).toFixed(1)}px`,
        shiftY: `${((rng(i * 11) - 0.5) * 28).toFixed(1)}px`,
        hue: Math.floor(rng(i * 13) * 360),
      })).map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          top: b.top, left: b.left,
          width: b.w, height: b.h,
          overflow: "hidden",
        }}>
          <img src={LOGO} alt="" aria-hidden="true" style={{
            position: "absolute",
            top: `calc(-${b.top})`,
            left: `calc(-${b.left})`,
            transform: `translate(${b.shiftX}, ${b.shiftY})`,
            width: "100vw", height: "100vh",
            objectFit: "contain",
            filter: `sepia(1) hue-rotate(${b.hue}deg) saturate(6) brightness(1.5) contrast(1.6)`,
          }} />
        </div>
      ))}
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <ScrollToTop />
      <RouteGlitch />
      <RandomLogoGlitch />
      <AnalyticsTracker />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/our-story" component={OurStory} />
        <Route path="/products" component={Products} />
        <Route path="/coa" component={COA} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/loyalty" component={Loyalty} />
        <Route path="/terms" component={Terms} />
        <Route path="/shipping" component={Shipping} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/habbits-box" component={HabbitsBox} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/track-order" component={TrackOrder} />
        <Route path="/products/flower">{() => <CategoryComingSoon category="flower" />}</Route>
        <Route path="/products/extracts">{() => <CategoryComingSoon category="extracts" />}</Route>
        <Route path="/products/accessories">{() => <CategoryComingSoon category="accessories" />}</Route>
        <Route path="/strain-comparison" component={StrainComparison} />
        <Route path="/products/:slug" component={ProductDetail} />
        <Route path="/admin/products/new" component={AdminProduct} />
        <Route path="/admin/products/:id/edit" component={AdminProduct} />
        <Route path="/admin/topshelf">{() => <AdminGuard><TopShelfDashboard /></AdminGuard>}</Route>
        <Route path="/admin/blog">{() => <AdminGuard><BlogEditor /></AdminGuard>}</Route>
        <Route path="/blog" component={Blog} />
        <Route path="/blog/strain-guide" component={StrainGuide} />
        <Route path="/blog/terpene-guide" component={TerpeneGuide} />
        <Route path="/blog/terpene-guide/:slug" component={TerpenePage} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/my-subscription" component={MySubscription} />
        <Route path="/wholesale" component={Wholesale} />
        <Route path="/dropship" component={Dropship} />
        <Route path="/account" component={Account} />
        <Route path="/order-confirmation/:orderNumber" component={OrderConfirmation} />
        <Route path="/share/:orderNumber" component={ShareExperience} />
        <Route path="/affiliate" component={AffiliateDashboard} />
        <Route path="/pay/crypto" component={CryptoPayment} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/admin">{() => <AdminGuard><Admin /></AdminGuard>}</Route>
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            <AffiliateCapture />
            <AgeGateSEOContent />
            <AgeGate>
              <Router />
              <CartDrawer />
              <GiftCelebrationPopup />
              <AdminMessagePopup />
              <StealthChatWindow />
            </AgeGate>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
