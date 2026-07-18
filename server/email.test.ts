/**
 * Validates the Resend API key is set and the Resend client initializes correctly.
 */
import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend email service", () => {
  it("RESEND_API_KEY is set in environment", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY?.length).toBeGreaterThan(10);
  });

  it("Resend client initializes without throwing", () => {
    expect(() => new Resend(process.env.RESEND_API_KEY!)).not.toThrow();
  });
});
