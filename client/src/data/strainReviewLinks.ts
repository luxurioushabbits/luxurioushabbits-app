/**
 * Strain Review Links — Luxurious Habbits
 * Maps strain names to their blog review slugs.
 * Used by TerpenePage to link strain mentions to full review pages.
 */

export const STRAIN_REVIEW_SLUGS: Record<string, string> = {
  "Blue Dream": "blue-dream-thca-strain-review",
  "OG Kush": "og-kush-thca-strain-review",
  "Gelato": "gelato-thca-strain-review",
  "Wedding Cake": "wedding-cake-thca-strain-review",
  "Runtz": "runtz-thca-strain-review",
  "Girl Scout Cookies": "gsc-thca-strain-review",
  "GSC": "gsc-thca-strain-review",
  "GMO": "gmo-thca-strain-review",
  "Garlic Cookies": "gmo-thca-strain-review",
  "Oreoz": "oreoz-thca-strain-review",
  "MAC": "mac-thca-strain-review",
  "Miracle Alien Cookies": "mac-thca-strain-review",
  "Zoap": "zoap-thca-strain-review",
  "White Truffle": "white-truffle-thca-strain-review",
  "SFV OG": "sfv-og-thca-strain-review",
  "RS11": "rs11-thca-strain-review",
  "Rainbow Sherbet 11": "rs11-thca-strain-review",
  "Zkittlez": "zkittlez-thca-strain-review",
  "Grape Gas": "grape-gas-thca-strain-review",
  "Gary Payton": "gary-payton-thca-strain-review",
  "Tangie": "tangie-thca-strain-review",
  "Jack Herer": "jack-herer-thca-strain-review",
};

/**
 * Returns the blog URL for a strain if a review exists, otherwise null.
 */
export function getStrainReviewUrl(strainName: string): string | null {
  const slug = STRAIN_REVIEW_SLUGS[strainName];
  return slug ? `/blog/${slug}` : null;
}
