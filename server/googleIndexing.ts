/**
 * Google Indexing API — Auto-ping Google when products are published.
 *
 * Setup:
 * 1. Create a Google Cloud service account with "Owner" role on your Search Console property.
 * 2. Download the JSON key file.
 * 3. Paste the full JSON content into the GOOGLE_SERVICE_ACCOUNT_JSON environment variable.
 *
 * Docs: https://developers.google.com/search/apis/indexing-api/v3/quickstart
 *
 * This module silently skips if the env var is not set — it never breaks the main flow.
 */

const SITE_HOST = "luxurioushabbits.manus.space";
const INDEXING_API_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const GOOGLE_AUTH_URL = "https://oauth2.googleapis.com/token";

/**
 * Get a short-lived OAuth2 access token using the service account JWT.
 * Returns null if credentials are not configured.
 */
async function getAccessToken(): Promise<string | null> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  let sa: any;
  try {
    sa = JSON.parse(raw);
  } catch {
    console.warn("[GoogleIndexing] Invalid GOOGLE_SERVICE_ACCOUNT_JSON — not valid JSON");
    return null;
  }

  const { client_email, private_key } = sa;
  if (!client_email || !private_key) {
    console.warn("[GoogleIndexing] Service account JSON missing client_email or private_key");
    return null;
  }

  // Build JWT claim set
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: GOOGLE_AUTH_URL,
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const signingInput = `${encode(header)}.${encode(claim)}`;

  // Sign with RS256 using Node.js crypto
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(private_key, "base64url");

  const jwt = `${signingInput}.${signature}`;

  // Exchange JWT for access token
  const resp = await fetch(GOOGLE_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    console.warn(`[GoogleIndexing] Token exchange failed (${resp.status}): ${body}`);
    return null;
  }

  const { access_token } = await resp.json() as { access_token: string };
  return access_token ?? null;
}

/**
 * Notify Google Indexing API about a URL update.
 * type: "URL_UPDATED" for new/updated pages, "URL_DELETED" for removals.
 * Silently swallows errors — never blocks the main request flow.
 */
export async function notifyGoogleIndexing(
  url: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<{ success: boolean; message: string }> {
  const fullUrl = url.startsWith("http")
    ? url
    : `https://${SITE_HOST}${url.startsWith("/") ? url : `/${url}`}`;

  const token = await getAccessToken();
  if (!token) {
    return { success: false, message: "Google Indexing API not configured (no service account)" };
  }

  try {
    const resp = await fetch(INDEXING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: fullUrl, type }),
    });

    if (resp.ok || resp.status === 200) {
      console.log(`[GoogleIndexing] Submitted ${type} for ${fullUrl}`);
      return { success: true, message: `Google notified: ${fullUrl}` };
    } else {
      const body = await resp.text();
      console.warn(`[GoogleIndexing] Unexpected status ${resp.status}: ${body}`);
      return { success: false, message: `Google API returned ${resp.status}` };
    }
  } catch (err: any) {
    console.warn("[GoogleIndexing] Ping failed (non-fatal):", err?.message);
    return { success: false, message: err?.message ?? "Unknown error" };
  }
}

/**
 * Bulk notify Google about multiple URLs.
 * Batches in groups of 10 with a small delay to avoid rate limits.
 */
export async function notifyGoogleIndexingBulk(
  urls: string[]
): Promise<{ submitted: number; failed: number; message: string }> {
  if (!urls.length) return { submitted: 0, failed: 0, message: "No URLs provided" };

  const token = await getAccessToken();
  if (!token) {
    return { submitted: 0, failed: urls.length, message: "Google Indexing API not configured" };
  }

  let submitted = 0;
  let failed = 0;

  for (const url of urls) {
    const fullUrl = url.startsWith("http")
      ? url
      : `https://${SITE_HOST}${url.startsWith("/") ? url : `/${url}`}`;

    try {
      const resp = await fetch(INDEXING_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: fullUrl, type: "URL_UPDATED" }),
      });
      if (resp.ok || resp.status === 200) {
        submitted++;
      } else {
        failed++;
        console.warn(`[GoogleIndexing] Failed ${resp.status} for ${fullUrl}`);
      }
    } catch {
      failed++;
    }

    // Small delay between requests to avoid hitting rate limits
    await new Promise(r => setTimeout(r, 100));
  }

  return {
    submitted,
    failed,
    message: `Google Indexing: ${submitted} submitted, ${failed} failed`,
  };
}

/**
 * Convenience: notify Google about a single product by slug.
 */
export function notifyGoogleProduct(slug: string): Promise<{ success: boolean; message: string }> {
  return notifyGoogleIndexing(`/products/${slug}`);
}
