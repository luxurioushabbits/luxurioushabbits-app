import { describe, it, expect } from "vitest";

describe("PayPal credentials", () => {
  it("should authenticate with PayPal Live API and get an access token", async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    const env = process.env.PAYPAL_ENVIRONMENT ?? "live";
    
    expect(clientId, "PAYPAL_CLIENT_ID must be set").toBeTruthy();
    expect(secret, "PAYPAL_CLIENT_SECRET must be set").toBeTruthy();

    const base = env === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");
    
    const res = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    expect(res.ok, `PayPal auth failed with status ${res.status}`).toBe(true);
    const data = await res.json() as { access_token?: string };
    expect(data.access_token, "access_token should be present").toBeTruthy();
  });
});
