/**
 * Crowdship API credentials validation test
 * Verifies that the API key and secret are valid by calling GET /inventory/products
 */
import { describe, it, expect } from "vitest";

const CROWDSHIP_BASE = "https://api.crowdship.io/api/v1";

describe("Crowdship API credentials", () => {
  it("should authenticate successfully with the provided API key and secret", { timeout: 15000 }, async () => {
    const apiKey = process.env.CROWDSHIP_API_KEY;
    const secretKey = process.env.CROWDSHIP_SECRET_KEY;

    expect(apiKey, "CROWDSHIP_API_KEY must be set").toBeTruthy();
    expect(secretKey, "CROWDSHIP_SECRET_KEY must be set").toBeTruthy();

    const res = await fetch(`${CROWDSHIP_BASE}/inventory/products?limit=1`, {
      headers: {
        "X-CROWDSHIP-KEY": apiKey!,
        "X-CROWDSHIP-SECRET": secretKey!,
        "Content-Type": "application/json",
      },
    });

    expect(res.status, `Expected 200 but got ${res.status} — check credentials`).toBe(200);

    const data = await res.json() as { products?: unknown[]; pagination?: { total: number } };
    expect(data).toHaveProperty("products");
    expect(Array.isArray(data.products)).toBe(true);
  });
});
