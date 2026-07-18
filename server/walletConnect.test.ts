import { describe, it, expect } from "vitest";
import { config } from "dotenv";

config();

describe("WalletConnect Project ID", () => {
  it("should have VITE_WALLETCONNECT_PROJECT_ID set and non-empty", () => {
    const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID;
    expect(projectId).toBeDefined();
    expect(projectId).not.toBe("");
    expect(projectId).not.toBe("demo");
    // Should be a 32-char hex string
    expect(projectId?.length).toBeGreaterThanOrEqual(32);
  });
});
