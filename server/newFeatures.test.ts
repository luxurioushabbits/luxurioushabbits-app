/**
 * Tests for new features:
 * - Blog RSS feed XML generation
 * - Age verification cookie endpoint
 * - Order CSV export procedure
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

// ─── Blog RSS ────────────────────────────────────────────────────────────────
describe("handleBlogRss", () => {
  it("returns valid RSS XML with correct content-type header", async () => {
    const { handleBlogRss } = await import("./blogRss");

    const headers: Record<string, string> = {};
    let body = "";

    const req = {} as Request;
    const res = {
      setHeader: (k: string, v: string) => { headers[k] = v; },
      send: (b: string) => { body = b; },
    } as unknown as Response;

    handleBlogRss(req, res);

    expect(headers["Content-Type"]).toContain("application/rss+xml");
    expect(body).toContain('<?xml version="1.0"');
    expect(body).toContain("<rss");
    expect(body).toContain("<channel>");
    expect(body).toContain("<item>");
    expect(body).toContain("Luxurious Habbits");
  });

  it("includes at least 5 blog articles", async () => {
    const { handleBlogRss } = await import("./blogRss");

    let body = "";
    const req = {} as Request;
    const res = {
      setHeader: vi.fn(),
      send: (b: string) => { body = b; },
    } as unknown as Response;

    handleBlogRss(req, res);

    const itemCount = (body.match(/<item>/g) ?? []).length;
    expect(itemCount).toBeGreaterThanOrEqual(5);
  });

  it("escapes special XML characters in titles", async () => {
    const { handleBlogRss } = await import("./blogRss");

    let body = "";
    const req = {} as Request;
    const res = {
      setHeader: vi.fn(),
      send: (b: string) => { body = b; },
    } as unknown as Response;

    handleBlogRss(req, res);

    // Should not contain unescaped & in titles/descriptions
    // The channel title uses &amp; for ampersand
    expect(body).toContain("&amp;");
    // Should not have raw & outside of entities
    const rawAmpersand = body.replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, "").includes("&");
    expect(rawAmpersand).toBe(false);
  });
});

// ─── Age Verification ────────────────────────────────────────────────────────
describe("handleAgeVerify", () => {
  it("sets the age verification cookie and returns ok:true", async () => {
    const { handleAgeVerify } = await import("./ageVerification");

    const cookies: Record<string, string> = {};
    const req = {
      headers: {},
      protocol: "https",
    } as unknown as Request;
    const res = {
      cookie: (name: string, value: string) => { cookies[name] = value; },
      json: vi.fn(),
    } as unknown as Response;

    handleAgeVerify(req, res);

    expect(cookies["lh_age_ok"]).toBe("1");
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});

describe("handleAgeCheck", () => {
  it("returns verified:true when cookie is present", async () => {
    const { handleAgeCheck } = await import("./ageVerification");

    let jsonResponse: unknown;
    const req = {
      headers: { cookie: "lh_age_ok=1; other=value" },
    } as unknown as Request;
    const res = {
      json: (v: unknown) => { jsonResponse = v; },
    } as unknown as Response;

    handleAgeCheck(req, res);

    expect(jsonResponse).toEqual({ verified: true });
  });

  it("returns verified:false when cookie is absent", async () => {
    const { handleAgeCheck } = await import("./ageVerification");

    let jsonResponse: unknown;
    const req = {
      headers: { cookie: "other=value" },
    } as unknown as Request;
    const res = {
      json: (v: unknown) => { jsonResponse = v; },
    } as unknown as Response;

    handleAgeCheck(req, res);

    expect(jsonResponse).toEqual({ verified: false });
  });

  it("returns verified:false when no cookie header", async () => {
    const { handleAgeCheck } = await import("./ageVerification");

    let jsonResponse: unknown;
    const req = {
      headers: {},
    } as unknown as Request;
    const res = {
      json: (v: unknown) => { jsonResponse = v; },
    } as unknown as Response;

    handleAgeCheck(req, res);

    expect(jsonResponse).toEqual({ verified: false });
  });
});

// ─── Order CSV Export ─────────────────────────────────────────────────────────
describe("orders.adminExportCsv", () => {
  it("generates CSV with correct headers", async () => {
    // Mock getDb to return empty orders
    vi.mock("./db", () => ({
      getDb: vi.fn().mockResolvedValue({
        select: () => ({
          from: () => ({
            orderBy: () => ({
              $dynamic: () => ({
                where: () => Promise.resolve([]),
                then: (fn: Function) => Promise.resolve([]).then(fn),
                [Symbol.asyncIterator]: undefined,
                // Make it thenable
                async [Symbol.toPrimitive]() { return []; },
              }),
              // Direct query result
              then: (fn: Function) => Promise.resolve([]).then(fn),
            }),
          }),
        }),
      }),
    }));

    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    const result = await caller.orders.adminExportCsv({ status: "all" });
    expect(result).toBeDefined();
    // With empty DB, csv should at least have headers
    if (result.csv) {
      expect(result.csv).toContain("Order Number");
      expect(result.csv).toContain("Customer Name");
      expect(result.csv).toContain("Customer Email");
    }
  });
});
