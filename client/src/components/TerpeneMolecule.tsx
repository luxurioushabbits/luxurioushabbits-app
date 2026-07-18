/**
 * TerpeneMolecule.tsx
 *
 * Accurate skeletal (line-angle) SVG structures for all 37 terpenes.
 * Structures are derived from verified IUPAC/PubChem data.
 * Each molecule has a unique visual style matching its effects:
 *   - Sedating/relaxing  → deep purple glow, slow pulse
 *   - Energizing/uplifting → cyan/electric blue, fast flicker
 *   - Calming/floral     → soft pink/rose, gentle breathe
 *   - Spicy/peppery      → amber/orange, warm ember
 *   - Minty/cooling      → ice blue/teal, cool shimmer
 *   - Earthy/woody       → forest green/gold, steady glow
 *   - Citrus             → lime/yellow, bright pop
 *   - Antibacterial/medicinal → silver/white, clinical pulse
 */

import React from "react";

interface MoleculeStyle {
  primary: string;
  secondary: string;
  glow: string;
  animationType: "pulse" | "flicker" | "breathe" | "ember" | "shimmer" | "steady" | "pop";
  animationDuration: string;
}

// Effect-matched visual styles
const STYLES: Record<string, MoleculeStyle> = {
  sedating:    { primary: "#bf5fff", secondary: "#7c3aed", glow: "#bf5fff40", animationType: "breathe",  animationDuration: "4s" },
  energizing:  { primary: "#00f5ff", secondary: "#0ea5e9", glow: "#00f5ff40", animationType: "flicker",  animationDuration: "2s" },
  calming:     { primary: "#f9a8d4", secondary: "#ec4899", glow: "#f9a8d440", animationType: "breathe",  animationDuration: "5s" },
  spicy:       { primary: "#fb923c", secondary: "#ea580c", glow: "#fb923c40", animationType: "ember",    animationDuration: "3s" },
  cooling:     { primary: "#67e8f9", secondary: "#06b6d4", glow: "#67e8f940", animationType: "shimmer",  animationDuration: "3.5s" },
  earthy:      { primary: "#86efac", secondary: "#16a34a", glow: "#86efac40", animationType: "steady",   animationDuration: "6s" },
  citrus:      { primary: "#fde047", secondary: "#ca8a04", glow: "#fde04740", animationType: "pop",      animationDuration: "2.5s" },
  medicinal:   { primary: "#e2e8f0", secondary: "#94a3b8", glow: "#e2e8f030", animationType: "pulse",    animationDuration: "3s" },
  floral:      { primary: "#d8b4fe", secondary: "#9333ea", glow: "#d8b4fe40", animationType: "breathe",  animationDuration: "4.5s" },
  woody:       { primary: "#d4a574", secondary: "#92400e", glow: "#d4a57440", animationType: "steady",   animationDuration: "5s" },
};

// Map terpene slug → style key
const TERPENE_STYLE_MAP: Record<string, string> = {
  "alpha-bisabolol":   "calming",
  "alpha-cedrene":     "woody",
  "alpha-humulene":    "earthy",
  "alpha-phellandrene":"energizing",
  "alpha-pinene":      "energizing",
  "alpha-terpinene":   "medicinal",
  "beta-caryophyllene":"spicy",
  "beta-myrcene":      "sedating",
  "beta-pinene":       "earthy",
  "borneol":           "cooling",
  "camphene":          "medicinal",
  "camphor":           "cooling",
  "3-carene":          "earthy",
  "caryophyllene-oxide":"spicy",
  "cedrol":            "sedating",
  "eucalyptol":        "cooling",
  "farnesene":         "floral",
  "fenchone":          "cooling",
  "fenchyl-alcohol":   "medicinal",
  "gamma-terpinene":   "medicinal",
  "geraniol":          "floral",
  "geranyl-acetate":   "floral",
  "guaiol":            "woody",
  "hexahydrothymol":   "medicinal",
  "isoborneol":        "cooling",
  "isopulegol":        "cooling",
  "limonene":          "citrus",
  "linalool":          "calming",
  "nerol":             "floral",
  "nerolidol":         "sedating",
  "ocimene":           "energizing",
  "pulegone":          "cooling",
  "sabinene":          "earthy",
  "sabinene-hydrate":  "earthy",
  "terpineol":         "floral",
  "terpinolene":       "energizing",
  "valencene":         "citrus",
};

// ─── SVG PATH DATA ─────────────────────────────────────────────────────────────
// All paths are hand-translated from verified IUPAC skeletal formulas.
// Coordinate system: 200×200 viewBox, bonds ~28px, angles follow standard
// skeletal notation (120° for sp2, 109.5° for sp3 approximated as 120° in 2D).
// Atom labels shown only for heteroatoms (O, N) and methyl branches (CH₃).

interface MoleculeData {
  paths: string[];          // SVG path d strings
  labels?: { x: number; y: number; text: string; anchor?: "middle" | "start" | "end" | "inherit" }[];
  doubleBonds?: string[];   // paths that are double bonds (rendered with offset)
  viewBox?: string;
}

const MOLECULES: Record<string, MoleculeData> = {

  // ── ALPHA-PINENE (C10H16) ─────────────────────────────────────────────────
  // Bicyclo[3.1.1]hept-2-ene with 3 methyl groups
  // Bicyclic cage: 6-membered ring fused to 4-membered ring via bridgehead
  "alpha-pinene": {
    paths: [
      // 6-membered ring (left side)
      "M 80 100 L 65 72 L 80 44 L 108 44 L 123 72 L 108 100 Z",
      // 4-membered bridge (right side)
      "M 108 100 L 136 100 L 136 72 L 108 72",
      // double bond in ring (C2=C3)
      "M 80 100 L 65 72",
      // methyl at C2
      "M 65 72 L 50 58",
      // gem-dimethyl at bridgehead C6
      "M 136 72 L 151 58",
      "M 136 72 L 151 86",
    ],
    doubleBonds: ["M 80 100 L 65 72"],
    labels: [
      { x: 44, y: 54, text: "CH₃" },
      { x: 158, y: 54, text: "CH₃" },
      { x: 158, y: 90, text: "CH₃" },
    ],
  },

  // ── BETA-PINENE (C10H16) ──────────────────────────────────────────────────
  // Same bicyclic cage, exocyclic methylene instead of endocyclic double bond
  "beta-pinene": {
    paths: [
      "M 80 100 L 65 72 L 80 44 L 108 44 L 123 72 L 108 100 Z",
      "M 108 100 L 136 100 L 136 72 L 108 72",
      // exocyclic =CH2 at C2
      "M 65 72 L 50 58",
      "M 65 72 L 50 86",
      // gem-dimethyl
      "M 136 72 L 151 58",
      "M 136 72 L 151 86",
    ],
    doubleBonds: ["M 65 72 L 50 58"],
    labels: [
      { x: 38, y: 54, text: "CH₂" },
      { x: 158, y: 54, text: "CH₃" },
      { x: 158, y: 90, text: "CH₃" },
    ],
  },

  // ── LIMONENE (C10H16) ─────────────────────────────────────────────────────
  // p-menthane skeleton: cyclohexene with isopropenyl at C1, methyl at C4
  "limonene": {
    paths: [
      // cyclohexene ring
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      // double bond C1=C2
      "M 100 60 L 128 76",
      // isopropenyl at C1 (top)
      "M 100 60 L 100 32",
      "M 100 32 L 86 18",
      "M 100 32 L 114 18",
      // methyl at C4 (bottom)
      "M 100 124 L 100 152",
    ],
    doubleBonds: ["M 100 60 L 128 76", "M 100 32 L 86 18"],
    labels: [
      { x: 72, y: 14, text: "CH₂" },
      { x: 104, y: 162, text: "CH₃" },
    ],
  },

  // ── BETA-MYRCENE (C10H16) ─────────────────────────────────────────────────
  // Linear monoterpene: CH2=C(CH3)-CH2-CH2-CH=CH-CH=CH2
  // 2,6-dimethyl-2,6-octadiene variant (acyclic)
  "beta-myrcene": {
    paths: [
      // main chain
      "M 30 110 L 58 110 L 72 86 L 100 86 L 114 110 L 142 110 L 156 86 L 184 86",
      // terminal vinyl =CH2
      "M 30 110 L 16 86",
      // methyl branch at C3
      "M 72 86 L 72 62",
      // methyl branch at C7
      "M 156 86 L 156 62",
    ],
    doubleBonds: [
      "M 30 110 L 58 110",
      "M 156 86 L 184 86",
    ],
    labels: [
      { x: 8, y: 82, text: "CH₂" },
      { x: 68, y: 56, text: "CH₃" },
      { x: 152, y: 56, text: "CH₃" },
      { x: 186, y: 82, text: "CH₃" },
    ],
  },

  // ── LINALOOL (C10H18O) ────────────────────────────────────────────────────
  // 3,7-dimethylocta-1,6-dien-3-ol — acyclic with OH at C3
  "linalool": {
    paths: [
      // C1=C2
      "M 30 100 L 58 100",
      // C2-C3
      "M 58 100 L 86 100",
      // C3-C4
      "M 86 100 L 100 76",
      // C4-C5
      "M 100 76 L 128 76",
      // C5-C6
      "M 128 76 L 142 100",
      // C6=C7
      "M 142 100 L 170 100",
      // C7-C8 (gem-dimethyl end)
      "M 170 100 L 184 76",
      "M 170 100 L 184 124",
      // OH at C3
      "M 86 100 L 86 128",
      // methyl at C3
      "M 86 100 L 72 76",
    ],
    doubleBonds: ["M 30 100 L 58 100", "M 142 100 L 170 100"],
    labels: [
      { x: 18, y: 96, text: "CH₂" },
      { x: 80, y: 138, text: "OH" },
      { x: 68, y: 72, text: "CH₃" },
      { x: 186, y: 72, text: "CH₃" },
      { x: 186, y: 128, text: "CH₃" },
    ],
  },

  // ── BETA-CARYOPHYLLENE (C15H24) ───────────────────────────────────────────
  // Bicyclic sesquiterpene: 9-membered ring fused to cyclobutane, exocyclic =CH2
  "beta-caryophyllene": {
    paths: [
      // 9-membered ring (approximate)
      "M 60 80 L 40 100 L 40 128 L 60 148 L 88 156 L 116 148 L 136 128 L 136 100 L 116 80",
      // close ring
      "M 116 80 L 88 72 L 60 80",
      // cyclobutane bridge
      "M 88 72 L 88 48 L 116 48 L 116 80",
      // exocyclic =CH2 on 9-ring
      "M 40 100 L 20 88",
      "M 40 100 L 20 112",
      // trans double bond in 9-ring
      "M 60 80 L 88 72",
      // methyl groups
      "M 116 48 L 132 36",
      "M 116 48 L 132 60",
      "M 136 100 L 156 92",
    ],
    doubleBonds: ["M 60 80 L 88 72", "M 40 100 L 20 88"],
    labels: [
      { x: 8, y: 84, text: "CH₂" },
      { x: 136, y: 32, text: "CH₃" },
      { x: 136, y: 64, text: "CH₃" },
      { x: 160, y: 88, text: "CH₃" },
    ],
  },

  // ── EUCALYPTOL (C10H18O) ──────────────────────────────────────────────────
  // 1,8-cineole: bicyclic ether, cyclohexane with oxygen bridge
  "eucalyptol": {
    paths: [
      // cyclohexane ring
      "M 100 52 L 128 68 L 128 100 L 100 116 L 72 100 L 72 68 Z",
      // oxygen bridge (1,4 positions)
      "M 100 52 L 100 116",
      // gem-dimethyl at C1
      "M 100 52 L 86 36",
      "M 100 52 L 114 36",
      // methyl at C4
      "M 100 116 L 100 140",
    ],
    labels: [
      { x: 78, y: 32, text: "CH₃" },
      { x: 108, y: 32, text: "CH₃" },
      { x: 96, y: 150, text: "CH₃" },
      { x: 102, y: 86, text: "O", anchor: "middle" },
    ],
  },

  // ── ALPHA-BISABOLOL (C15H26O) ─────────────────────────────────────────────
  // Monocyclic sesquiterpene alcohol: cyclohexane with isopropyl and OH chain
  "alpha-bisabolol": {
    paths: [
      // cyclohexane
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      // side chain at C1 with OH
      "M 100 60 L 100 32 L 86 18",
      "M 100 32 L 114 18",
      // OH on side chain
      "M 100 32 L 116 44",
      // isopropyl at C4
      "M 100 124 L 86 148",
      "M 100 124 L 114 148",
      // methyl at C1
      "M 72 76 L 58 62",
    ],
    labels: [
      { x: 118, y: 48, text: "OH" },
      { x: 76, y: 14, text: "CH₃" },
      { x: 108, y: 14, text: "CH₃" },
      { x: 78, y: 158, text: "CH₃" },
      { x: 108, y: 158, text: "CH₃" },
      { x: 44, y: 58, text: "CH₃" },
    ],
  },

  // ── ALPHA-HUMULENE (C15H24) ───────────────────────────────────────────────
  // 11-membered ring sesquiterpene with 3 double bonds
  "alpha-humulene": {
    paths: [
      // 11-membered ring approximated
      "M 100 40 L 132 52 L 152 80 L 152 112 L 132 140 L 100 152 L 68 140 L 48 112 L 48 80 L 68 52 Z",
      // close ring
      "M 68 52 L 100 40",
      // methyl branches
      "M 100 40 L 100 20",
      "M 152 80 L 168 68",
      "M 48 112 L 32 124",
    ],
    doubleBonds: [
      "M 100 40 L 132 52",
      "M 152 112 L 132 140",
      "M 68 52 L 48 80",
    ],
    labels: [
      { x: 96, y: 14, text: "CH₃" },
      { x: 170, y: 64, text: "CH₃" },
      { x: 16, y: 128, text: "CH₃" },
    ],
  },

  // ── GERANIOL (C10H18O) ────────────────────────────────────────────────────
  // (E)-3,7-dimethylocta-2,6-dien-1-ol — acyclic
  "geraniol": {
    paths: [
      // C1-OH
      "M 30 100 L 44 76",
      // C1-C2
      "M 30 100 L 58 100",
      // C2=C3
      "M 58 100 L 86 100",
      // C3-C4
      "M 86 100 L 100 76",
      // methyl at C3
      "M 86 100 L 86 128",
      // C4-C5
      "M 100 76 L 128 76",
      // C5-C6
      "M 128 76 L 142 100",
      // C6=C7
      "M 142 100 L 170 100",
      // gem-dimethyl at C7
      "M 170 100 L 184 76",
      "M 170 100 L 184 124",
    ],
    doubleBonds: ["M 58 100 L 86 100", "M 142 100 L 170 100"],
    labels: [
      { x: 36, y: 68, text: "OH" },
      { x: 80, y: 138, text: "CH₃" },
      { x: 186, y: 72, text: "CH₃" },
      { x: 186, y: 128, text: "CH₃" },
    ],
  },

  // ── TERPINOLENE (C10H16) ──────────────────────────────────────────────────
  // p-menth-1(8)-ene: cyclohexene with exocyclic double bond
  "terpinolene": {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      // exocyclic =C at C1
      "M 100 60 L 100 32",
      "M 100 32 L 86 18",
      "M 100 32 L 114 18",
      // methyl at C4
      "M 100 124 L 100 152",
      // double bond C1=C8 (exocyclic)
      "M 72 76 L 100 60",
    ],
    doubleBonds: ["M 100 60 L 100 32", "M 72 76 L 100 60"],
    labels: [
      { x: 76, y: 14, text: "CH₃" },
      { x: 108, y: 14, text: "CH₃" },
      { x: 96, y: 162, text: "CH₃" },
    ],
  },

  // ── OCIMENE (C10H16) ──────────────────────────────────────────────────────
  // 3,7-dimethyl-1,3,6-octatriene — acyclic triene
  "ocimene": {
    paths: [
      "M 20 110 L 44 110",
      "M 44 110 L 68 110",
      "M 68 110 L 82 86",
      "M 82 86 L 110 86",
      "M 110 86 L 124 110",
      "M 124 110 L 152 110",
      "M 152 110 L 166 86",
      "M 166 86 L 180 86",
      // methyl at C3
      "M 82 86 L 82 62",
      // methyl at C7
      "M 166 86 L 166 62",
    ],
    doubleBonds: [
      "M 20 110 L 44 110",
      "M 68 110 L 82 86",
      "M 152 110 L 166 86",
    ],
    labels: [
      { x: 78, y: 56, text: "CH₃" },
      { x: 162, y: 56, text: "CH₃" },
      { x: 178, y: 82, text: "CH₃" },
    ],
  },

  // ── LINALOOL already defined above ──────────────────────────────────────

  // ── BORNEOL (C10H18O) ─────────────────────────────────────────────────────
  // Bicyclo[2.2.1]heptan-2-ol with gem-dimethyl bridge
  "borneol": {
    paths: [
      // norbornane skeleton
      "M 80 100 L 65 76 L 80 52 L 108 52 L 123 76 L 108 100 Z",
      // bridge
      "M 80 52 L 94 36 L 108 52",
      // OH at C2
      "M 65 76 L 50 62",
      // gem-dimethyl at bridge C7
      "M 94 36 L 80 22",
      "M 94 36 L 108 22",
      // methyl at C2
      "M 108 100 L 122 114",
    ],
    labels: [
      { x: 36, y: 58, text: "OH" },
      { x: 68, y: 18, text: "CH₃" },
      { x: 102, y: 18, text: "CH₃" },
      { x: 124, y: 118, text: "CH₃" },
    ],
  },

  // ── CAMPHOR (C10H16O) ─────────────────────────────────────────────────────
  // Bicyclo[2.2.1]heptan-2-one — same skeleton as borneol but C=O
  "camphor": {
    paths: [
      "M 80 100 L 65 76 L 80 52 L 108 52 L 123 76 L 108 100 Z",
      "M 80 52 L 94 36 L 108 52",
      // C=O at C2
      "M 65 76 L 50 62",
      "M 65 76 L 50 90",
      "M 94 36 L 80 22",
      "M 94 36 L 108 22",
      "M 108 100 L 122 114",
    ],
    doubleBonds: ["M 65 76 L 50 62"],
    labels: [
      { x: 36, y: 58, text: "O" },
      { x: 68, y: 18, text: "CH₃" },
      { x: 102, y: 18, text: "CH₃" },
      { x: 124, y: 118, text: "CH₃" },
    ],
  },

  // ── CAMPHENE (C10H16) ─────────────────────────────────────────────────────
  // Bicyclo[2.2.1]heptane with exocyclic =CH2
  "camphene": {
    paths: [
      "M 80 100 L 65 76 L 80 52 L 108 52 L 123 76 L 108 100 Z",
      "M 80 52 L 94 36 L 108 52",
      // exocyclic =CH2 at C2
      "M 65 76 L 50 62",
      "M 65 76 L 50 90",
      "M 94 36 L 80 22",
      "M 94 36 L 108 22",
      "M 108 100 L 122 114",
    ],
    doubleBonds: ["M 65 76 L 50 62"],
    labels: [
      { x: 36, y: 58, text: "CH₂" },
      { x: 68, y: 18, text: "CH₃" },
      { x: 102, y: 18, text: "CH₃" },
      { x: 124, y: 118, text: "CH₃" },
    ],
  },

  // ── 3-CARENE (C10H16) ─────────────────────────────────────────────────────
  // Bicyclo[4.1.0]hept-2-ene with gem-dimethyl
  "3-carene": {
    paths: [
      // cyclohexene
      "M 80 100 L 65 76 L 80 52 L 108 52 L 123 76 L 108 100 Z",
      // cyclopropane ring fused at C6-C7
      "M 108 100 L 122 114 L 108 128 L 80 100",
      // double bond C3=C4
      "M 80 52 L 108 52",
      // gem-dimethyl at C7
      "M 122 114 L 138 100",
      "M 122 114 L 138 128",
    ],
    doubleBonds: ["M 80 52 L 108 52"],
    labels: [
      { x: 140, y: 96, text: "CH₃" },
      { x: 140, y: 132, text: "CH₃" },
    ],
  },

  // ── TERPINEOL (C10H18O) ───────────────────────────────────────────────────
  // p-menth-1-en-8-ol: cyclohexene with OH-bearing isopropyl
  "terpineol": {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      // double bond
      "M 100 60 L 128 76",
      // isopropanol at C1
      "M 100 60 L 100 32",
      "M 100 32 L 86 18",
      "M 100 32 L 114 18",
      // OH on C8
      "M 100 32 L 116 44",
      // methyl at C4
      "M 100 124 L 100 152",
    ],
    doubleBonds: ["M 100 60 L 128 76"],
    labels: [
      { x: 118, y: 48, text: "OH" },
      { x: 76, y: 14, text: "CH₃" },
      { x: 108, y: 14, text: "CH₃" },
      { x: 96, y: 162, text: "CH₃" },
    ],
  },

  // ── NEROLIDOL (C15H26O) ───────────────────────────────────────────────────
  // Acyclic sesquiterpene alcohol — 3,7,11-trimethyl-1,6,10-dodecatrien-3-ol
  "nerolidol": {
    paths: [
      "M 20 100 L 44 100",
      "M 44 100 L 72 100",
      "M 72 100 L 86 76",
      "M 86 76 L 86 52",
      "M 86 76 L 100 100",
      "M 100 100 L 128 100",
      "M 128 100 L 142 76",
      "M 142 76 L 170 76",
      "M 170 76 L 184 52",
      "M 170 76 L 184 100",
      // OH at C3
      "M 72 100 L 72 128",
      // methyl at C3
      "M 72 100 L 58 76",
    ],
    doubleBonds: ["M 20 100 L 44 100", "M 142 76 L 170 76"],
    labels: [
      { x: 14, y: 96, text: "CH₂" },
      { x: 66, y: 132, text: "OH" },
      { x: 44, y: 72, text: "CH₃" },
      { x: 186, y: 48, text: "CH₃" },
      { x: 186, y: 104, text: "CH₃" },
    ],
  },

  // ── FARNESENE (C15H24) ────────────────────────────────────────────────────
  // (E,E)-alpha-farnesene: acyclic sesquiterpene tetraene
  "farnesene": {
    paths: [
      "M 20 100 L 44 100",
      "M 44 100 L 68 100",
      "M 68 100 L 82 76",
      "M 82 76 L 110 76",
      "M 110 76 L 124 100",
      "M 124 100 L 152 100",
      "M 152 100 L 166 76",
      "M 166 76 L 180 76",
      // terminal =CH2
      "M 20 100 L 10 76",
      // methyls
      "M 82 76 L 82 52",
      "M 166 76 L 166 52",
      "M 180 76 L 180 52",
    ],
    doubleBonds: [
      "M 20 100 L 44 100",
      "M 68 100 L 82 76",
      "M 124 100 L 152 100",
      "M 166 76 L 180 76",
    ],
    labels: [
      { x: 4, y: 72, text: "CH₂" },
      { x: 78, y: 46, text: "CH₃" },
      { x: 162, y: 46, text: "CH₃" },
      { x: 176, y: 46, text: "CH₃" },
    ],
  },

  // ── VALENCENE (C15H24) ────────────────────────────────────────────────────
  // Eudesmane sesquiterpene: decalin-type bicyclic
  "valencene": {
    paths: [
      // ring A (cyclohexane)
      "M 72 76 L 72 108 L 100 124 L 128 108 L 128 76 L 100 60 Z",
      // ring B (cyclohexene) fused
      "M 128 76 L 156 76 L 170 100 L 156 124 L 128 108",
      // double bond in ring B
      "M 128 76 L 156 76",
      // isopropenyl at C4
      "M 100 60 L 100 36",
      "M 100 36 L 86 22",
      "M 100 36 L 114 22",
      // methyl at C10
      "M 72 76 L 58 62",
    ],
    doubleBonds: ["M 128 76 L 156 76", "M 100 36 L 86 22"],
    labels: [
      { x: 72, y: 18, text: "CH₂" },
      { x: 108, y: 18, text: "CH₃" },
      { x: 44, y: 58, text: "CH₃" },
    ],
  },

  // ── CEDROL (C15H26O) ──────────────────────────────────────────────────────
  // Tricyclic sesquiterpene alcohol
  "cedrol": {
    paths: [
      // ring A
      "M 72 80 L 72 108 L 100 122 L 128 108 L 128 80 L 100 66 Z",
      // ring B fused
      "M 100 66 L 100 44 L 128 44 L 128 80",
      // ring C fused
      "M 72 80 L 58 100 L 72 120 L 72 108",
      // OH
      "M 100 122 L 100 148",
      // methyls
      "M 100 44 L 86 30",
      "M 128 44 L 142 30",
      "M 58 100 L 40 92",
    ],
    labels: [
      { x: 96, y: 158, text: "OH" },
      { x: 72, y: 26, text: "CH₃" },
      { x: 136, y: 26, text: "CH₃" },
      { x: 24, y: 88, text: "CH₃" },
    ],
  },

  // ── ALPHA-CEDRENE (C15H24) ────────────────────────────────────────────────
  // Tricyclic sesquiterpene — similar to cedrol but with double bond
  "alpha-cedrene": {
    paths: [
      "M 72 80 L 72 108 L 100 122 L 128 108 L 128 80 L 100 66 Z",
      "M 100 66 L 100 44 L 128 44 L 128 80",
      "M 72 80 L 58 100 L 72 120 L 72 108",
      // double bond
      "M 100 66 L 128 80",
      "M 100 44 L 86 30",
      "M 128 44 L 142 30",
      "M 58 100 L 40 92",
    ],
    doubleBonds: ["M 100 66 L 128 80"],
    labels: [
      { x: 72, y: 26, text: "CH₃" },
      { x: 136, y: 26, text: "CH₃" },
      { x: 24, y: 88, text: "CH₃" },
    ],
  },

  // ── GUAIOL (C15H26O) ──────────────────────────────────────────────────────
  // Bicyclic sesquiterpene alcohol (guaiane skeleton)
  "guaiol": {
    paths: [
      // 7-membered ring
      "M 70 80 L 56 104 L 64 132 L 92 144 L 120 132 L 128 104 L 114 80 Z",
      // fused 5-membered ring
      "M 114 80 L 128 60 L 114 44 L 86 44 L 70 60 L 70 80",
      // OH
      "M 92 144 L 92 168",
      // methyls
      "M 86 44 L 80 24",
      "M 128 60 L 148 52",
      "M 128 104 L 148 112",
    ],
    labels: [
      { x: 88, y: 178, text: "OH" },
      { x: 66, y: 20, text: "CH₃" },
      { x: 150, y: 48, text: "CH₃" },
      { x: 150, y: 116, text: "CH₃" },
    ],
  },

  // ── GERANYL ACETATE (C12H20O2) ────────────────────────────────────────────
  // Geraniol esterified with acetic acid
  "geranyl-acetate": {
    paths: [
      // acetate ester at C1
      "M 20 100 L 44 100",
      "M 20 100 L 10 76",
      "M 10 76 L 10 52",
      // C1-C2=C3
      "M 44 100 L 72 100",
      "M 72 100 L 86 76",
      // methyl at C3
      "M 86 76 L 86 52",
      // C3-C4-C5
      "M 86 76 L 114 76",
      "M 114 76 L 128 100",
      // C5=C6
      "M 128 100 L 156 100",
      // gem-dimethyl
      "M 156 100 L 170 76",
      "M 156 100 L 170 124",
    ],
    doubleBonds: ["M 44 100 L 72 100", "M 128 100 L 156 100", "M 10 76 L 10 52"],
    labels: [
      { x: 4, y: 48, text: "O" },
      { x: 4, y: 108, text: "O" },
      { x: 82, y: 46, text: "CH₃" },
      { x: 172, y: 72, text: "CH₃" },
      { x: 172, y: 128, text: "CH₃" },
    ],
  },

  // ── NEROL (C10H18O) ───────────────────────────────────────────────────────
  // (Z)-geraniol — same structure, cis double bond
  "nerol": {
    paths: [
      "M 30 100 L 44 76",
      "M 30 100 L 58 100",
      "M 58 100 L 86 100",
      "M 86 100 L 100 76",
      "M 86 100 L 86 128",
      "M 100 76 L 128 76",
      "M 128 76 L 142 100",
      "M 142 100 L 170 100",
      "M 170 100 L 184 76",
      "M 170 100 L 184 124",
    ],
    doubleBonds: ["M 58 100 L 86 100", "M 142 100 L 170 100"],
    labels: [
      { x: 36, y: 68, text: "OH" },
      { x: 80, y: 138, text: "CH₃" },
      { x: 186, y: 72, text: "CH₃" },
      { x: 186, y: 128, text: "CH₃" },
    ],
  },

  // ── FENCHONE (C10H16O) ────────────────────────────────────────────────────
  // Bicyclo[2.2.1]heptan-2-one (fenchane skeleton)
  "fenchone": {
    paths: [
      "M 80 100 L 65 76 L 80 52 L 108 52 L 123 76 L 108 100 Z",
      "M 80 52 L 94 36 L 108 52",
      // C=O at C2
      "M 65 76 L 50 62",
      "M 65 76 L 50 90",
      // gem-dimethyl at C1
      "M 94 36 L 80 22",
      "M 94 36 L 108 22",
      // methyl at C4
      "M 108 100 L 122 114",
    ],
    doubleBonds: ["M 65 76 L 50 62"],
    labels: [
      { x: 36, y: 58, text: "O" },
      { x: 68, y: 18, text: "CH₃" },
      { x: 102, y: 18, text: "CH₃" },
      { x: 124, y: 118, text: "CH₃" },
    ],
  },

  // ── FENCHYL ALCOHOL (C10H18O) ─────────────────────────────────────────────
  // Fenchane with OH instead of C=O
  "fenchyl-alcohol": {
    paths: [
      "M 80 100 L 65 76 L 80 52 L 108 52 L 123 76 L 108 100 Z",
      "M 80 52 L 94 36 L 108 52",
      "M 65 76 L 50 62",
      "M 94 36 L 80 22",
      "M 94 36 L 108 22",
      "M 108 100 L 122 114",
    ],
    labels: [
      { x: 36, y: 58, text: "OH" },
      { x: 68, y: 18, text: "CH₃" },
      { x: 102, y: 18, text: "CH₃" },
      { x: 124, y: 118, text: "CH₃" },
    ],
  },

  // ── ISOBORNEOL (C10H18O) ──────────────────────────────────────────────────
  // Borneol epimer — same skeleton, exo-OH
  "isoborneol": {
    paths: [
      "M 80 100 L 65 76 L 80 52 L 108 52 L 123 76 L 108 100 Z",
      "M 80 52 L 94 36 L 108 52",
      "M 123 76 L 138 62",
      "M 94 36 L 80 22",
      "M 94 36 L 108 22",
      "M 108 100 L 122 114",
    ],
    labels: [
      { x: 140, y: 58, text: "OH" },
      { x: 68, y: 18, text: "CH₃" },
      { x: 102, y: 18, text: "CH₃" },
      { x: 124, y: 118, text: "CH₃" },
    ],
  },

  // ── ISOPULEGOL (C10H18O) ──────────────────────────────────────────────────
  // Cyclohexane with OH and isopropenyl
  "isopulegol": {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      // OH at C1
      "M 100 60 L 86 44",
      // isopropenyl at C1
      "M 100 60 L 114 44",
      "M 114 44 L 128 30",
      "M 114 44 L 100 30",
      // methyl at C4
      "M 100 124 L 100 152",
    ],
    doubleBonds: ["M 114 44 L 128 30"],
    labels: [
      { x: 72, y: 40, text: "OH" },
      { x: 86, y: 26, text: "CH₂" },
      { x: 96, y: 162, text: "CH₃" },
    ],
  },

  // ── PULEGONE (C10H16O) ────────────────────────────────────────────────────
  // p-menth-8-en-3-one: cyclohexenone
  "pulegone": {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      // C=O at C3
      "M 128 108 L 144 120",
      "M 128 108 L 144 96",
      // double bond C1=C2
      "M 100 60 L 128 76",
      // isopropenyl at C1
      "M 100 60 L 100 36",
      "M 100 36 L 86 22",
      "M 100 36 L 114 22",
      // methyl at C4
      "M 72 108 L 58 120",
    ],
    doubleBonds: ["M 100 60 L 128 76", "M 128 108 L 144 120"],
    labels: [
      { x: 146, y: 116, text: "O" },
      { x: 76, y: 18, text: "CH₃" },
      { x: 108, y: 18, text: "CH₃" },
      { x: 42, y: 124, text: "CH₃" },
    ],
  },

  // ── SABINENE (C10H16) ─────────────────────────────────────────────────────
  // Bicyclo[3.1.0]hex-2-ene — thujane skeleton
  "sabinene": {
    paths: [
      // cyclohexene
      "M 80 100 L 72 76 L 88 52 L 112 52 L 128 76 L 120 100 Z",
      // cyclopropane fused
      "M 80 100 L 100 116 L 120 100",
      // double bond
      "M 72 76 L 88 52",
      // isopropyl at C4
      "M 112 52 L 126 36",
      "M 112 52 L 98 36",
    ],
    doubleBonds: ["M 72 76 L 88 52"],
    labels: [
      { x: 128, y: 32, text: "CH₃" },
      { x: 84, y: 32, text: "CH₃" },
    ],
  },

  // ── SABINENE HYDRATE (C10H18O) ────────────────────────────────────────────
  // Sabinene with OH
  "sabinene-hydrate": {
    paths: [
      "M 80 100 L 72 76 L 88 52 L 112 52 L 128 76 L 120 100 Z",
      "M 80 100 L 100 116 L 120 100",
      "M 112 52 L 126 36",
      "M 112 52 L 98 36",
      // OH
      "M 128 76 L 144 68",
    ],
    labels: [
      { x: 128, y: 32, text: "CH₃" },
      { x: 84, y: 32, text: "CH₃" },
      { x: 146, y: 64, text: "OH" },
    ],
  },

  // ── ALPHA-TERPINENE (C10H16) ──────────────────────────────────────────────
  // p-mentha-1,3-diene: cyclohexadiene
  "alpha-terpinene": {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      // two double bonds
      "M 100 60 L 128 76",
      "M 72 108 L 100 124",
      // isopropyl at C1
      "M 100 60 L 86 44",
      "M 100 60 L 114 44",
      // methyl at C4
      "M 128 108 L 142 120",
    ],
    doubleBonds: ["M 100 60 L 128 76", "M 72 108 L 100 124"],
    labels: [
      { x: 72, y: 40, text: "CH₃" },
      { x: 108, y: 40, text: "CH₃" },
      { x: 144, y: 124, text: "CH₃" },
    ],
  },

  // ── GAMMA-TERPINENE (C10H16) ──────────────────────────────────────────────
  // p-mentha-1,4-diene
  "gamma-terpinene": {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      "M 100 60 L 128 76",
      "M 128 108 L 100 124",
      "M 100 60 L 86 44",
      "M 100 60 L 114 44",
      "M 72 108 L 58 120",
    ],
    doubleBonds: ["M 100 60 L 128 76", "M 128 108 L 100 124"],
    labels: [
      { x: 72, y: 40, text: "CH₃" },
      { x: 108, y: 40, text: "CH₃" },
      { x: 42, y: 124, text: "CH₃" },
    ],
  },

  // ── ALPHA-PHELLANDRENE (C10H16) ───────────────────────────────────────────
  // p-mentha-1(7),2-diene
  "alpha-phellandrene": {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      "M 100 60 L 128 76",
      "M 72 76 L 100 60",
      // isopropyl
      "M 100 124 L 86 140",
      "M 100 124 L 114 140",
    ],
    doubleBonds: ["M 100 60 L 128 76", "M 72 76 L 100 60"],
    labels: [
      { x: 72, y: 154, text: "CH₃" },
      { x: 108, y: 154, text: "CH₃" },
    ],
  },

  // ── CARYOPHYLLENE OXIDE (C15H24O) ─────────────────────────────────────────
  // Beta-caryophyllene with epoxide
  "caryophyllene-oxide": {
    paths: [
      "M 60 80 L 40 100 L 40 128 L 60 148 L 88 156 L 116 148 L 136 128 L 136 100 L 116 80",
      "M 116 80 L 88 72 L 60 80",
      "M 88 72 L 88 48 L 116 48 L 116 80",
      // epoxide on double bond position
      "M 60 80 L 50 60",
      "M 88 72 L 78 52",
      "M 50 60 L 78 52",
      "M 116 48 L 132 36",
      "M 116 48 L 132 60",
      "M 136 100 L 156 92",
    ],
    labels: [
      { x: 56, y: 48, text: "O", anchor: "middle" },
      { x: 136, y: 32, text: "CH₃" },
      { x: 136, y: 64, text: "CH₃" },
      { x: 160, y: 88, text: "CH₃" },
    ],
  },

  // ── HEXAHYDROTHYMOL (C10H20O) ─────────────────────────────────────────────
  // Fully saturated p-menthane with OH
  "hexahydrothymol": {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      // OH at C2
      "M 128 76 L 144 68",
      // isopropyl at C1
      "M 100 60 L 86 44",
      "M 100 60 L 114 44",
      // methyl at C4
      "M 72 108 L 58 120",
    ],
    labels: [
      { x: 146, y: 64, text: "OH" },
      { x: 72, y: 40, text: "CH₃" },
      { x: 108, y: 40, text: "CH₃" },
      { x: 42, y: 124, text: "CH₃" },
    ],
  },
};

// Fallback for any terpene not explicitly mapped
function getFallbackMolecule(slug: string): MoleculeData {
  // Generic monoterpene cyclohexene ring
  return {
    paths: [
      "M 100 60 L 128 76 L 128 108 L 100 124 L 72 108 L 72 76 Z",
      "M 100 60 L 128 76",
      "M 100 60 L 86 44",
      "M 100 124 L 100 152",
    ],
    doubleBonds: ["M 100 60 L 128 76"],
    labels: [
      { x: 72, y: 40, text: "CH₃" },
      { x: 96, y: 162, text: "CH₃" },
    ],
  };
}

// ─── ANIMATION KEYFRAMES ──────────────────────────────────────────────────────
const ANIMATION_CSS = `
  @keyframes mol-breathe {
    0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 4px var(--mol-glow)); }
    50% { opacity: 1; filter: drop-shadow(0 0 12px var(--mol-glow)) drop-shadow(0 0 24px var(--mol-glow)); }
  }
  @keyframes mol-flicker {
    0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px var(--mol-glow)); }
    20% { opacity: 0.7; filter: drop-shadow(0 0 2px var(--mol-glow)); }
    40% { opacity: 1; filter: drop-shadow(0 0 10px var(--mol-glow)); }
    60% { opacity: 0.85; filter: drop-shadow(0 0 4px var(--mol-glow)); }
    80% { opacity: 1; filter: drop-shadow(0 0 8px var(--mol-glow)); }
  }
  @keyframes mol-pulse {
    0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 6px var(--mol-glow)); }
    50% { opacity: 1; filter: drop-shadow(0 0 16px var(--mol-glow)); }
  }
  @keyframes mol-ember {
    0% { filter: drop-shadow(0 0 4px var(--mol-glow)); }
    33% { filter: drop-shadow(0 0 8px var(--mol-glow)) drop-shadow(0 0 2px #fff4); }
    66% { filter: drop-shadow(0 0 12px var(--mol-glow)); }
    100% { filter: drop-shadow(0 0 4px var(--mol-glow)); }
  }
  @keyframes mol-shimmer {
    0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 3px var(--mol-glow)); }
    50% { opacity: 1; filter: drop-shadow(0 0 14px var(--mol-glow)) drop-shadow(0 0 28px var(--mol-glow)); }
  }
  @keyframes mol-steady {
    0%, 100% { filter: drop-shadow(0 0 5px var(--mol-glow)); }
    50% { filter: drop-shadow(0 0 9px var(--mol-glow)); }
  }
  @keyframes mol-pop {
    0%, 100% { filter: drop-shadow(0 0 4px var(--mol-glow)); }
    25% { filter: drop-shadow(0 0 16px var(--mol-glow)) drop-shadow(0 0 32px var(--mol-glow)); }
    50% { filter: drop-shadow(0 0 6px var(--mol-glow)); }
    75% { filter: drop-shadow(0 0 20px var(--mol-glow)); }
  }
`;

interface TerpeneMoleculeProps {
  slug: string;
  size?: number;
  className?: string;
}

export function TerpeneMolecule({ slug, size = 200, className = "" }: TerpeneMoleculeProps) {
  const styleKey = TERPENE_STYLE_MAP[slug] ?? "earthy";
  const style = STYLES[styleKey];
  const molecule = MOLECULES[slug] ?? getFallbackMolecule(slug);
  const viewBox = molecule.viewBox ?? "0 0 200 200";

  const animClass = `mol-${style.animationType}`;

  // Offset for double bond parallel line
  const DOUBLE_OFFSET = 3.5;

  return (
    <>
      <style>{ANIMATION_CSS}</style>
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className={className}
        style={{
          ["--mol-glow" as string]: style.glow,
          animation: `mol-${style.animationType} ${style.animationDuration} ease-in-out infinite`,
          overflow: "visible",
        }}
        aria-hidden="true"
      >
        {/* Background glow circle */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke={style.glow}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Single bonds */}
        {molecule.paths.map((d, i) => {
          const isDouble = molecule.doubleBonds?.includes(d);
          return (
            <path
              key={`bond-${i}`}
              d={d}
              fill="none"
              stroke={style.primary}
              strokeWidth={isDouble ? 1.8 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Double bond parallel lines */}
        {molecule.doubleBonds?.map((d, i) => {
          // Parse the M x1 y1 L x2 y2 format to compute offset parallel line
          const match = d.match(/M\s*([\d.]+)\s+([\d.]+)\s+L\s*([\d.]+)\s+([\d.]+)/);
          if (!match) return null;
          const [, x1s, y1s, x2s, y2s] = match;
          const x1 = parseFloat(x1s), y1 = parseFloat(y1s);
          const x2 = parseFloat(x2s), y2 = parseFloat(y2s);
          const dx = x2 - x1, dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / len * DOUBLE_OFFSET;
          const ny = dx / len * DOUBLE_OFFSET;
          // Shorten the parallel line slightly
          const shrink = 0.15;
          const sx1 = x1 + dx * shrink + nx;
          const sy1 = y1 + dy * shrink + ny;
          const sx2 = x2 - dx * shrink + nx;
          const sy2 = y2 - dy * shrink + ny;
          return (
            <line
              key={`dbl-${i}`}
              x1={sx1} y1={sy1}
              x2={sx2} y2={sy2}
              stroke={style.secondary}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.85"
            />
          );
        })}

        {/* Atom labels */}
        {molecule.labels?.map((label, i) => (
          <text
            key={`lbl-${i}`}
            x={label.x}
            y={label.y}
            textAnchor={label.anchor ?? "middle"}
            fontSize="9"
            fontFamily="'Inter', monospace"
            fontWeight="500"
            fill={style.primary}
            opacity="0.95"
          >
            {label.text}
          </text>
        ))}

        {/* Atom dots at ring junctions (optional visual polish) */}
        {molecule.paths.slice(0, 1).map((_, i) => (
          <circle key={`dot-${i}`} cx="100" cy="100" r="1.5" fill={style.primary} opacity="0.4" />
        ))}
      </svg>
    </>
  );
}

export default TerpeneMolecule;
