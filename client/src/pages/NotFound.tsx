/**
 * 404 Not Found — Luxurious Habbits
 * Black luxury theme consistent with site design
 */
import { Link } from "wouter";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <div style={{
      background: "oklch(0.04 0 0)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to Luxurious Habbits for premium THCA flower and hemp extracts."
        canonical="/404"
        noIndex={true}
      />
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(8rem, 25vw, 18rem)",
          letterSpacing: "0.05em",
          color: "oklch(1 0 0 / 4%)",
          lineHeight: 1,
          marginBottom: "-2rem",
          userSelect: "none",
        }}>
          404
        </div>
        <div className="section-label" style={{ marginBottom: "1rem" }}>Page Not Found</div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(2rem, 6vw, 4rem)",
          letterSpacing: "0.05em",
          color: "oklch(0.96 0 0)",
          lineHeight: 1,
          marginBottom: "1.5rem",
        }}>
          LOST IN THE <span className="text-holo">DARK.</span>
        </h1>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "1.1rem",
          color: "oklch(0.50 0 0)",
          marginBottom: "3rem",
          fontWeight: 300,
        }}>
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <button className="btn-gold"><span>Return Home</span></button>
        </Link>
      </div>
    </div>
  );
}
