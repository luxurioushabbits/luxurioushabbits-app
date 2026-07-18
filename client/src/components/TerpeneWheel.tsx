/**
 * TerpeneWheel — Interactive SVG donut chart of terpene percentages.
 *
 * Bug fixes:
 * 1. Removed segment pop-out transform — it caused an infinite shake loop
 *    (segment moves away from cursor → mouseLeave → transform removed → segment
 *    moves back under cursor → mouseEnter → repeat).
 * 2. Click-to-lock tooltip — hovering shows the tooltip; clicking a segment
 *    locks it open so the user can click "Learn More" without it disappearing.
 *    Clicking anywhere else or clicking the same segment again unlocks it.
 */
import { useState } from "react";
import { Link } from "wouter";

interface TerpeneEntry {
  terpeneSlug: string;
  terpeneName: string;
  percentage: string | null;
}

interface Props {
  terpenes: TerpeneEntry[];
}

const TERPENE_COLORS: Record<string, string> = {
  limonene: "#f59e0b",
  "d-limonene": "#f59e0b",
  myrcene: "#78716c",
  "beta-myrcene": "#78716c",
  linalool: "#c084fc",
  "beta-linalool": "#c084fc",
  "alpha-pinene": "#22c55e",
  "beta-pinene": "#16a34a",
  pinene: "#22c55e",
  "beta-caryophyllene": "#ef4444",
  caryophyllene: "#ef4444",
  "alpha-humulene": "#dc2626",
  humulene: "#dc2626",
  terpinolene: "#06b6d4",
  ocimene: "#0ea5e9",
  "beta-ocimene": "#0ea5e9",
  "alpha-bisabolol": "#a78bfa",
  bisabolol: "#a78bfa",
  nerolidol: "#8b5cf6",
  "trans-nerolidol": "#8b5cf6",
  guaiol: "#7c3aed",
  "alpha-terpineol": "#fb923c",
  terpineol: "#fb923c",
  geraniol: "#f97316",
  valencene: "#fbbf24",
  "gamma-terpinene": "#34d399",
  "alpha-terpinene": "#10b981",
  "3-carene": "#6ee7b7",
  camphene: "#a3e635",
  fenchone: "#bef264",
  "caryophyllene-oxide": "#fca5a5",
  cedrol: "#c4b5fd",
  "hexahydrothymol": "#93c5fd",
  "geranyl-acetate": "#fdba74",
  eucalyptol: "#67e8f9",
  "alpha-phellandrene": "#86efac",
  "alpha-cedrene": "#d8b4fe",
  "sabinene-hydrate": "#fde68a",
  isopulegol: "#bbf7d0",
  pulegone: "#fcd34d",
  "p-cymene": "#a5f3fc",
  default: "#64748b",
};

const TERPENE_INFO: Record<string, { aroma: string; effects: string }> = {
  myrcene: { aroma: "Earthy, musky, herbal", effects: "Studied for relaxing character" },
  "beta-myrcene": { aroma: "Earthy, musky, herbal", effects: "Studied for relaxing character" },
  limonene: { aroma: "Citrus, lemon, orange", effects: "Studied for uplifting character" },
  "d-limonene": { aroma: "Citrus, lemon", effects: "Studied for uplifting character" },
  linalool: { aroma: "Floral, lavender", effects: "Studied for calming character" },
  "beta-linalool": { aroma: "Floral, lavender", effects: "Studied for calming character" },
  "alpha-pinene": { aroma: "Pine, fresh forest", effects: "Studied for alerting character" },
  "beta-pinene": { aroma: "Pine, woody", effects: "Studied for alerting character" },
  "beta-caryophyllene": { aroma: "Spicy, peppery, woody", effects: "Studied for grounding character" },
  caryophyllene: { aroma: "Spicy, peppery", effects: "Studied for grounding character" },
  "alpha-humulene": { aroma: "Hoppy, earthy, woody", effects: "Studied for earthy character" },
  humulene: { aroma: "Hoppy, earthy", effects: "Studied for earthy character" },
  terpinolene: { aroma: "Floral, piney, herbal", effects: "Studied for uplifting character" },
  ocimene: { aroma: "Sweet, herbal, woody", effects: "Studied for uplifting character" },
  "beta-ocimene": { aroma: "Sweet, herbal", effects: "Studied for uplifting character" },
  "alpha-bisabolol": { aroma: "Floral, sweet, chamomile", effects: "Studied for soothing character" },
  bisabolol: { aroma: "Floral, sweet", effects: "Studied for soothing character" },
  nerolidol: { aroma: "Woody, citrus, floral", effects: "Studied for sedating character" },
  "trans-nerolidol": { aroma: "Woody, citrus", effects: "Studied for sedating character" },
  guaiol: { aroma: "Pine, rose, woody", effects: "Studied for grounding character" },
  "alpha-terpineol": { aroma: "Floral, lilac, citrus", effects: "Studied for relaxing character" },
  terpineol: { aroma: "Floral, lilac", effects: "Studied for relaxing character" },
  geraniol: { aroma: "Rose, floral, fruity", effects: "Studied for neuroprotective properties" },
  valencene: { aroma: "Sweet orange, citrus, woody", effects: "Studied for anti-inflammatory character" },
  "gamma-terpinene": { aroma: "Citrus, herbal", effects: "Studied for antioxidant properties" },
  "alpha-terpinene": { aroma: "Citrus, herbal, spicy", effects: "Studied for antioxidant properties" },
  "3-carene": { aroma: "Sweet, earthy, piney", effects: "Studied for anti-inflammatory character" },
  camphene: { aroma: "Herbal, earthy, musky", effects: "Studied for antioxidant properties" },
  fenchone: { aroma: "Minty, camphor, herbal", effects: "Studied for digestive character" },
  "caryophyllene-oxide": { aroma: "Spicy, woody, dry", effects: "Studied for antifungal properties" },
  cedrol: { aroma: "Woody, cedar, earthy", effects: "Studied for sedating character" },
  "hexahydrothymol": { aroma: "Minty, herbal, cool", effects: "Studied for cooling character" },
  "geranyl-acetate": { aroma: "Floral, rose, fruity", effects: "Studied for calming character" },
  eucalyptol: { aroma: "Minty, cool, camphor", effects: "Studied for respiratory character" },
  "alpha-phellandrene": { aroma: "Citrus, herbal, minty", effects: "Studied for energizing character" },
  "alpha-cedrene": { aroma: "Woody, cedar, earthy", effects: "Studied for grounding character" },
  isopulegol: { aroma: "Minty, herbal, cool", effects: "Studied for anti-anxiety character" },
  pulegone: { aroma: "Minty, camphor, sweet", effects: "Studied for memory-enhancing character" },
};

function getColor(slug: string): string {
  return TERPENE_COLORS[slug] ?? TERPENE_COLORS.default;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSegmentPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startAngle: number, endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd   = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd   = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc   = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

export default function TerpeneWheel({ terpenes }: Props) {
  // hoveredIdx: which segment the mouse is currently over (null = none)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  // lockedIdx: which segment was clicked and should stay shown (null = unlocked)
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);

  const entries = terpenes
    .filter(t => t.percentage && parseFloat(t.percentage) > 0)
    .sort((a, b) => parseFloat(b.percentage!) - parseFloat(a.percentage!));

  if (entries.length === 0) return null;

  const total = entries.reduce((sum, t) => sum + parseFloat(t.percentage!), 0);

  const cx = 100, cy = 100, outerR = 80, innerR = 48;
  const gap = 1.5;
  let currentAngle = 0;

  const segments = entries.map((t, idx) => {
    const pct = parseFloat(t.percentage!) / total;
    const sweep = pct * 360 - gap;
    const startAngle = currentAngle + gap / 2;
    const endAngle = startAngle + sweep;
    currentAngle += pct * 360;
    const midAngle = startAngle + sweep / 2;
    return { ...t, idx, startAngle, endAngle, midAngle, pct, sweep };
  });

  // Active index = locked (if set) otherwise hovered
  const activeIdx = lockedIdx !== null ? lockedIdx : hoveredIdx;
  const activeEntry = activeIdx !== null ? entries[activeIdx] ?? null : null;
  const info = activeEntry ? TERPENE_INFO[activeEntry.terpeneSlug] : null;

  const handleSegmentClick = (idx: number) => {
    // Toggle lock: clicking the same segment unlocks; clicking a different one locks it
    setLockedIdx(prev => (prev === idx ? null : idx));
  };

  const handleBackgroundClick = () => {
    setLockedIdx(null);
  };

  return (
    <div
      style={{
        background: "oklch(0.06 0 0)",
        border: "1px solid oklch(1 0 0 / 8%)",
        borderRadius: "12px",
        padding: "2rem",
      }}
      onClick={handleBackgroundClick}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "0.85rem" }}>🌿</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.12em", color: "oklch(0.80 0 0)" }}>
          TERPENE PROFILE
        </span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em", marginLeft: "auto" }}>
          FROM COA
        </span>
      </div>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
        {/* SVG Donut — no transform on hover to prevent shake */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg
            viewBox="0 0 200 200"
            width="200"
            height="200"
            style={{ overflow: "visible" }}
            onClick={e => e.stopPropagation()}
          >
            {segments.map(seg => {
              const isActive = activeIdx === seg.idx;
              const isLocked = lockedIdx === seg.idx;
              const color = getColor(seg.terpeneSlug);
              const showLabel = seg.sweep > 18;
              return (
                <g key={seg.idx}>
                  <path
                    d={donutSegmentPath(cx, cy, outerR, innerR, seg.startAngle, seg.endAngle)}
                    fill={color}
                    opacity={activeIdx !== null && !isActive ? 0.3 : 0.9}
                    stroke={isLocked ? "white" : "oklch(0.04 0 0)"}
                    strokeWidth={isLocked ? 1.5 : 1}
                    style={{
                      cursor: "pointer",
                      transition: "opacity 150ms ease, stroke 150ms ease",
                      // NO transform — that was causing the shake
                    }}
                    onMouseEnter={() => setHoveredIdx(seg.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={e => { e.stopPropagation(); handleSegmentClick(seg.idx); }}
                  />
                  {showLabel && (
                    <text
                      x={polarToCartesian(cx, cy, (outerR + innerR) / 2, seg.midAngle).x}
                      y={polarToCartesian(cx, cy, (outerR + innerR) / 2, seg.midAngle).y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "6px", fill: "white", fontWeight: 700, pointerEvents: "none", opacity: 0.9 }}
                    >
                      {parseFloat(seg.percentage!).toFixed(2)}%
                    </text>
                  )}
                </g>
              );
            })}
            {/* Center label */}
            <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "11px", fill: "oklch(0.85 0 0)", letterSpacing: "0.08em" }}>
              {activeEntry ? activeEntry.terpeneName.split(" ").slice(-1)[0].toUpperCase() : "TERPS"}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontFamily: "Inter, sans-serif", fontSize: "7px", fill: "oklch(0.45 0 0)" }}>
              {activeEntry ? `${parseFloat(activeEntry.percentage!).toFixed(3)}%` : `${entries.length} detected`}
            </text>
          </svg>
          {/* Click hint */}
          {lockedIdx === null && (
            <div style={{ textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.30 0 0)", marginTop: "0.25rem", letterSpacing: "0.08em" }}>
              CLICK SEGMENT TO LOCK
            </div>
          )}
          {lockedIdx !== null && (
            <div style={{ textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "#00f5ff66", marginTop: "0.25rem", letterSpacing: "0.08em" }}>
              CLICK AGAIN TO UNLOCK
            </div>
          )}
        </div>

        {/* Legend + tooltip */}
        <div style={{ flex: 1, minWidth: "160px" }}>
          {/* Tooltip card — stays visible when locked */}
          {activeEntry && (
            <div
              style={{
                background: "oklch(0.09 0 0)",
                border: `1px solid ${getColor(activeEntry.terpeneSlug)}44`,
                borderRadius: "8px",
                padding: "0.85rem 1rem",
                marginBottom: "1rem",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, color: getColor(activeEntry.terpeneSlug), marginBottom: "0.3rem" }}>
                {activeEntry.terpeneName}
              </div>
              {info && (
                <>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.55 0 0)", marginBottom: "0.2rem" }}>
                    <span style={{ color: "oklch(0.40 0 0)" }}>Aroma: </span>{info.aroma}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.55 0 0)" }}>
                    <span style={{ color: "oklch(0.40 0 0)" }}>Research Notes: </span>{info.effects}
                  </div>
                </>
              )}
              <Link
                href={`/blog/terpene-guide/${activeEntry.terpeneSlug}`}
                onClick={e => e.stopPropagation()}
              >
                <div style={{
                  marginTop: "0.6rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.65rem",
                  color: "#00f5ff",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "4px 8px",
                  border: "1px solid #00f5ff33",
                  borderRadius: "4px",
                  background: "#00f5ff0a",
                }}>
                  Learn more →
                </div>
              </Link>
            </div>
          )}

          {/* Legend list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "180px", overflowY: "auto" }}>
            {entries.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  cursor: "pointer",
                  opacity: activeIdx !== null && activeIdx !== idx ? 0.4 : 1,
                  transition: "opacity 150ms ease",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  background: lockedIdx === idx ? `${getColor(t.terpeneSlug)}15` : "transparent",
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={e => { e.stopPropagation(); handleSegmentClick(idx); }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: getColor(t.terpeneSlug), flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.65 0 0)", flex: 1 }}>
                  {t.terpeneName}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "oklch(0.40 0 0)" }}>
                  {parseFloat(t.percentage!).toFixed(3)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
