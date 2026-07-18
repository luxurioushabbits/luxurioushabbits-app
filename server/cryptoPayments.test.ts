/**
 * NOWPayments Integration Tests
 *
 * Validates that the NOWPayments API key is configured and working,
 * and tests the cryptoPaymentsRouter procedures.
 */

import { describe, expect, it } from "vitest";

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

describe("NOWPayments API", () => {
  it("should have NOWPAYMENTS_API_KEY env var set", () => {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    expect(apiKey, "NOWPAYMENTS_API_KEY must be set in environment").toBeTruthy();
    expect(apiKey?.length, "API key should be non-empty").toBeGreaterThan(0);
  });

  it("should have NOWPAYMENTS_IPN_SECRET env var set", () => {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    expect(ipnSecret, "NOWPAYMENTS_IPN_SECRET must be set in environment").toBeTruthy();
  });

  it("should have BTC wallet address configured", () => {
    const btcWallet = process.env.NOWPAYMENTS_BTC_WALLET;
    expect(btcWallet, "NOWPAYMENTS_BTC_WALLET must be set").toBeTruthy();
    // BTC bech32 address starts with bc1
    expect(btcWallet?.startsWith("bc1"), "BTC wallet should be a bech32 address").toBe(true);
  });

  it("should have ETH wallet address configured", () => {
    const ethWallet = process.env.NOWPAYMENTS_ETH_WALLET;
    expect(ethWallet, "NOWPAYMENTS_ETH_WALLET must be set").toBeTruthy();
    // ETH address starts with 0x and is 42 chars
    expect(ethWallet?.startsWith("0x"), "ETH wallet should start with 0x").toBe(true);
    expect(ethWallet?.length, "ETH wallet should be 42 characters").toBe(42);
  });

  it("should successfully call NOWPayments /status endpoint with valid API key", async () => {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) {
      console.warn("Skipping live API test: NOWPAYMENTS_API_KEY not set");
      return;
    }

    const res = await fetch(`${NOWPAYMENTS_API_URL}/status`, {
      headers: { "x-api-key": apiKey },
    });

    expect(res.status, "NOWPayments /status should return 200").toBe(200);
    const data = await res.json();
    expect(data.message, "NOWPayments status should be OK").toBe("OK");
  }, 15000); // 15s timeout for network call
});

describe("cryptoPayments router — lookupOrder", () => {
  it("should throw NOT_FOUND for a non-existent order number", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    await expect(
      caller.cryptoPayments.lookupOrder({ orderNumber: "LH-NONEXISTENT-99999" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
