export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/**
 * States where THCA hemp flower CANNOT be shipped.
 * Includes states with explicit THCA/smokable hemp bans and zero-tolerance cannabis states.
 * High-risk states (AK, AZ, CO, CT, NY, WA, DE, NH, NE) are open per owner decision June 2026.
 *
 * Sources: The Haze Connect (March 2026), Fresh Bros (May 2026)
 * ⚠️  Review quarterly — state laws change frequently.
 */
export const RESTRICTED_STATES: string[] = [
  "ID", // Idaho — zero-THC threshold, no cannabis program
  "AR", // Arkansas — Act 629 bans intoxicating hemp products
  "HI", // Hawaii — total-THC standard, hemp flower restricted
  "MN", // Minnesota — hemp flower banned under cannabis framework
  "RI", // Rhode Island — bans intoxicating hemp products
  "IA", // Iowa — restricts smokable hemp and intoxicating hemp
  "MS", // Mississippi — hemp flower under medical cannabis program only
  "MT", // Montana — restrictions on hemp-derived cannabinoid products
  "ND", // North Dakota — restricts intoxicating hemp products
  "SD", // South Dakota — restrictive hemp laws, THCA effectively prohibited
  "UT", // Utah — bans smokable hemp including THCA flower
  "VT", // Vermont — total-THC testing, THCA flower regulated as cannabis
  "TN", // Tennessee — HB 1376 banned THCA flower effective Jan 1, 2026
  "IN", // Indiana — prohibits smokable hemp including THCA flower
  "AL", // Alabama — prohibits smokable hemp including THCA flower
  "KS", // Kansas — no cannabis program, effectively bans all THCA flower
  "WA", // Washington — cannabis regulated under state program, hemp-derived THCA restricted
];

export const RESTRICTED_STATE_NAMES: Record<string, string> = {
  ID: "Idaho",
  AR: "Arkansas",
  HI: "Hawaii",
  MN: "Minnesota",
  RI: "Rhode Island",
  IA: "Iowa",
  MS: "Mississippi",
  MT: "Montana",
  ND: "North Dakota",
  SD: "South Dakota",
  UT: "Utah",
  VT: "Vermont",
  TN: "Tennessee",
  IN: "Indiana",
  AL: "Alabama",
  KS: "Kansas",
  WA: "Washington",
};
