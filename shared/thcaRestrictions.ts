/**
 * THCA Hemp Flower — State Shipping Restrictions
 *
 * Based on state law as of June 2026. States are categorized as:
 *   BANNED        — THCA flower is explicitly illegal or effectively prohibited
 *   RESTRICTED    — Significant restrictions; smokable hemp banned or total-THC standard applies
 *   LEGAL_DISPUTE — Active legal disputes or pending legislation; ship at risk
 *
 * Sources: The Haze Connect (March 2026), Fresh Bros (May 2026), Chronic Guru (2025)
 *
 * ⚠️  IMPORTANT: State laws change frequently. Review this list quarterly and
 *     consult legal counsel before shipping to any restricted state.
 *     Last reviewed: June 2026
 */

export type RestrictionLevel = "banned" | "restricted" | "legal_dispute";

export interface StateRestriction {
  state: string;
  abbr: string;
  level: RestrictionLevel;
  reason: string;
}

/**
 * States where we DO NOT ship THCA hemp flower products.
 * Includes both hard bans and states with restrictions that make
 * shipping legally risky for the seller.
 */
export const THCA_RESTRICTED_STATES: StateRestriction[] = [
  // ── HARD BANS ──────────────────────────────────────────────────────────────
  { state: "Idaho", abbr: "ID", level: "banned", reason: "Zero-THC threshold — any detectable THC including THCA is illegal." },
  { state: "Arkansas", abbr: "AR", level: "banned", reason: "Act 629 bans intoxicating hemp-derived products including THCA flower." },
  { state: "Hawaii", abbr: "HI", level: "banned", reason: "Restricts hemp flower and applies total-THC standard." },
  { state: "Minnesota", abbr: "MN", level: "banned", reason: "Restricts hemp flower; THCA flower banned under cannabis framework." },
  { state: "Oregon", abbr: "OR", level: "banned", reason: "Total-THC testing — high-THCA flower is treated as marijuana." },
  { state: "Rhode Island", abbr: "RI", level: "banned", reason: "Bans intoxicating hemp products including THCA flower." },
  { state: "Iowa", abbr: "IA", level: "banned", reason: "Restricts smokable hemp and most intoxicating hemp-derived products." },
  { state: "Mississippi", abbr: "MS", level: "banned", reason: "Hemp flower restricted under state law; classified under medical cannabis program." },
  { state: "Montana", abbr: "MT", level: "banned", reason: "Enacted restrictions on hemp-derived cannabinoid products." },
  { state: "North Dakota", abbr: "ND", level: "banned", reason: "Restricts intoxicating hemp products under state regulations." },
  { state: "South Dakota", abbr: "SD", level: "banned", reason: "Restrictive hemp laws effectively prohibit THCA flower." },
  { state: "Utah", abbr: "UT", level: "banned", reason: "Bans smokable hemp products including THCA flower." },
  { state: "Vermont", abbr: "VT", level: "banned", reason: "Applies total-THC testing; THCA flower above threshold is regulated as cannabis." },
  { state: "Tennessee", abbr: "TN", level: "banned", reason: "HB 1376 banned THCA flower sales statewide effective January 1, 2026." },
  { state: "Indiana", abbr: "IN", level: "banned", reason: "Prohibits smokable hemp including THCA flower." },
  { state: "Alabama", abbr: "AL", level: "banned", reason: "Prohibits smokable hemp including THCA flower." },
  { state: "Kansas", abbr: "KS", level: "banned", reason: "Effectively bans all THCA flower under state hemp regulations." },
  { state: "Nebraska", abbr: "NE", level: "banned", reason: "No active hemp program; THCA flower effectively prohibited." },

  // ── RESTRICTED / HIGH RISK ─────────────────────────────────────────────────
  { state: "Alaska", abbr: "AK", level: "restricted", reason: "Regulates hemp flower similarly to marijuana in some jurisdictions." },
  { state: "Arizona", abbr: "AZ", level: "restricted", reason: "Total-THC testing for certain product categories; THCA flower may be restricted." },
  { state: "Colorado", abbr: "CO", level: "restricted", reason: "Total-THC testing — THCA flower above 0.3% total THC is treated as marijuana." },
  { state: "Connecticut", abbr: "CT", level: "restricted", reason: "Restrictions on intoxicating hemp products including THCA flower." },
  { state: "New York", abbr: "NY", level: "restricted", reason: "Cannabinoid Hemp Regulation law restricts certain hemp flower products." },
  { state: "Washington", abbr: "WA", level: "restricted", reason: "Restricts smokable hemp products in some contexts." },
  { state: "Delaware", abbr: "DE", level: "restricted", reason: "Restrictions on intoxicating hemp-derived products." },
  { state: "New Hampshire", abbr: "NH", level: "restricted", reason: "Restrictions on certain intoxicating hemp products." },
];

/** Set of state abbreviations we block at checkout (banned + restricted) */
export const BLOCKED_STATE_ABBRS = new Set(
  THCA_RESTRICTED_STATES.map(s => s.abbr)
);

/** Human-readable list for display */
export const BLOCKED_STATE_NAMES = THCA_RESTRICTED_STATES.map(s => s.state).sort();

/**
 * Check if a state abbreviation is blocked for THCA shipping.
 * Case-insensitive.
 */
export function isStateBlocked(stateAbbr: string): boolean {
  return BLOCKED_STATE_ABBRS.has(stateAbbr.toUpperCase());
}

/**
 * Get restriction info for a state, or null if not restricted.
 */
export function getStateRestriction(stateAbbr: string): StateRestriction | null {
  return THCA_RESTRICTED_STATES.find(s => s.abbr === stateAbbr.toUpperCase()) ?? null;
}
