import { describe, it, expect } from "vitest";
import { getTopShelfCatalog } from "./topshelf";

describe("TopShelf API", () => {
  it("should have TOPSHELF_API_KEY env set", () => {
    expect(process.env.TOPSHELF_API_KEY).toBeTruthy();
    expect(process.env.TOPSHELF_API_KEY).toMatch(/^tsdm_/);
  });

  it("should have TOPSHELF_API_URL env set", () => {
    expect(process.env.TOPSHELF_API_URL).toBeTruthy();
    expect(process.env.TOPSHELF_API_URL).toContain("topshelfnc.com");
  });

  it("should have GA4 measurement ID set", () => {
    expect(process.env.VITE_GA4_MEASUREMENT_ID).toBeTruthy();
    expect(process.env.VITE_GA4_MEASUREMENT_ID).toMatch(/^G-/);
  });
});
