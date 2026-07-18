/**
 * Validates that GOOGLE_SERVICE_ACCOUNT_JSON is set and can produce a valid access token.
 * This test calls the real Google token endpoint to confirm credentials are correct.
 */

import { describe, it, expect } from "vitest";
import * as dotenv from "dotenv";
import { createSign } from "crypto";

dotenv.config();

describe("Google Indexing API credentials", () => {
  it("GOOGLE_SERVICE_ACCOUNT_JSON env var is set and is valid JSON", () => {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    expect(raw, "GOOGLE_SERVICE_ACCOUNT_JSON must be set").toBeTruthy();

    let sa: any;
    expect(() => {
      sa = JSON.parse(raw!);
    }, "GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON").not.toThrow();

    expect(sa.client_email, "service account must have client_email").toBeTruthy();
    expect(sa.private_key, "service account must have private_key").toBeTruthy();
    expect(sa.token_uri, "service account must have token_uri").toBeTruthy();
  });

  it("can obtain a Google OAuth2 access token using the service account", async () => {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
      console.warn("Skipping — GOOGLE_SERVICE_ACCOUNT_JSON not set");
      return;
    }

    const sa = JSON.parse(raw);
    const { client_email, private_key, token_uri } = sa;

    // Build JWT
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const claim = Buffer.from(
      JSON.stringify({
        iss: client_email,
        scope: "https://www.googleapis.com/auth/indexing",
        aud: token_uri,
        exp: now + 3600,
        iat: now,
      })
    ).toString("base64url");

    const signingInput = `${header}.${claim}`;
    const sign = createSign("RSA-SHA256");
    sign.update(signingInput);
    const signature = sign.sign(private_key, "base64url");
    const jwt = `${signingInput}.${signature}`;

    const resp = await fetch(token_uri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const body = await resp.text();
    expect(resp.ok, `Token exchange failed with status ${resp.status}: ${body}`).toBe(true);

    const data = JSON.parse(body) as { access_token?: string };
    expect(data.access_token, "Response must contain access_token").toBeTruthy();
    expect(typeof data.access_token).toBe("string");
    expect((data.access_token as string).length).toBeGreaterThan(10);

    console.log("[Test] Successfully obtained Google access token ✓");
  }, 15000); // 15s timeout for network call
});
