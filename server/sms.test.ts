/**
 * SMS / Twilio credential validation test.
 * Verifies that the Twilio credentials are configured and valid
 * by making a lightweight API call to the Twilio Accounts endpoint.
 */
import { describe, it, expect } from "vitest";

describe("Twilio SMS credentials", () => {
  it("should have TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER set", () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    expect(sid, "TWILIO_ACCOUNT_SID must be set").toBeTruthy();
    expect(token, "TWILIO_AUTH_TOKEN must be set").toBeTruthy();
    expect(from, "TWILIO_FROM_NUMBER must be set").toBeTruthy();

    // Validate format: SID should start with AC
    expect(sid).toMatch(/^AC[a-f0-9]{32}$/i);
    // From number should be in E.164 format
    expect(from).toMatch(/^\+1\d{10}$/);
  });

  it("should be able to authenticate with Twilio API", async () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
      console.warn("Skipping Twilio API test — credentials not set");
      return;
    }

    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    // 200 = valid credentials, 401 = invalid
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.sid).toBe(sid);
  }, 15_000);
});
