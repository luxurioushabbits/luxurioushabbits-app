/**
 * Strain Type Color System — Luxurious Habbits
 * Consistent color language used across the entire site:
 *   Sativa  → Red   (energizing, uplifting)
 *   Indica  → Purple (relaxing, sedating)
 *   Hybrid  → Green  (balanced)
 *
 * These match the animated strain-type cards on the Products page.
 */

export type StrainType = "sativa" | "indica" | "hybrid";

export const STRAIN_COLORS: Record<StrainType, {
  primary: string;
  glow: string;
  bg: string;
  border: string;
  gradient: string;
  label: string;
}> = {
  sativa: {
    primary: "#ff4444",
    glow: "#c0392b22",
    bg: "#ff444415",
    border: "#ff444440",
    gradient: "linear-gradient(90deg, #7a0000, #ff4444)",
    label: "Sativa",
  },
  indica: {
    primary: "#bf5fff",
    glow: "#7b2fff22",
    bg: "#bf5fff15",
    border: "#bf5fff40",
    gradient: "linear-gradient(90deg, #4b0082, #bf5fff)",
    label: "Indica",
  },
  hybrid: {
    primary: "#2ecc71",
    glow: "#1a7a1a22",
    bg: "#2ecc7115",
    border: "#2ecc7140",
    gradient: "linear-gradient(90deg, #004d00, #2ecc71)",
    label: "Hybrid",
  },
};

export function getStrainColors(type: string) {
  const normalized = type.toLowerCase() as StrainType;
  return STRAIN_COLORS[normalized] ?? STRAIN_COLORS.hybrid;
}
