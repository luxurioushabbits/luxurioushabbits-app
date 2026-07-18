/**
 * GA4 Measurement ID validation test
 * Verifies the VITE_GA4_MEASUREMENT_ID env var is set and has the correct format
 */
import { describe, it, expect } from "vitest";

describe("GA4 Measurement ID", () => {
  it("should be set and match G-XXXXXXXXXX format", () => {
    const mid = process.env.VITE_GA4_MEASUREMENT_ID;
    expect(mid, "VITE_GA4_MEASUREMENT_ID must be set").toBeTruthy();
    expect(mid).toMatch(/^G-[A-Z0-9]{8,12}$/);
  });

  it("should be the correct ID G-XEENQRNR1E", () => {
    expect(process.env.VITE_GA4_MEASUREMENT_ID).toBe("G-XEENQRNR1E");
  });
});
