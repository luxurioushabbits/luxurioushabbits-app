/**
 * twilio.test.ts — Validate Twilio credentials are set and valid
 */
import { describe, it, expect } from "vitest";
import twilio from "twilio";

describe("Twilio credentials", () => {
  it("should have all required env vars set", () => {
    expect(process.env.TWILIO_ACCOUNT_SID).toBeTruthy();
    expect(process.env.TWILIO_AUTH_TOKEN).toBeTruthy();
    expect(process.env.TWILIO_FROM_NUMBER).toBeTruthy();
    expect(process.env.TWILIO_ACCOUNT_SID).toMatch(/^AC/);
    expect(process.env.TWILIO_FROM_NUMBER).toMatch(/^\+1/);
  });

  it("should be able to create a Twilio client without throwing", () => {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    expect(client).toBeDefined();
    expect(client.messages).toBeDefined();
  });
});
