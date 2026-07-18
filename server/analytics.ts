/**
 * Analytics — Lightweight page view tracking + real-time heartbeat
 *
 * POST /api/track  — record a page view (called from client on route change)
 * POST /api/heartbeat — update active session presence (called every 30s)
 * GET  /api/active-visitors — returns count of sessions active in last 2 min (admin only via tRPC)
 */
import type { Request, Response } from "express";
import { getDb } from "./db";
import { pageViews, activeSessions, users } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "@shared/const";

/** Geo-lookup cache: ip → { city, region, country } — TTL 1 hour */
const geoCache = new Map<string, { city: string; region: string; country: string; ts: number }>();
const GEO_TTL_MS = 60 * 60 * 1000;

async function getGeo(ip: string): Promise<{ city: string; region: string; country: string } | null> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) return null;
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < GEO_TTL_MS) {
    return { city: cached.city, region: cached.region, country: cached.country };
  }
  // Primary: ip-api.com — free, no key required, returns city + regionName + country
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,query`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json() as any;
      if (data.status === "success" && (data.city || data.regionName)) {
        const geo = { city: data.city ?? "", region: data.regionName ?? "", country: data.country ?? "" };
        geoCache.set(ip, { ...geo, ts: Date.now() });
        return geo;
      }
    }
  } catch { /* fall through to backup */ }
  // Fallback: ipapi.co
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json() as any;
      if (!data.error && (data.city || data.region)) {
        const geo = { city: data.city ?? "", region: data.region ?? "", country: data.country_name ?? "" };
        geoCache.set(ip, { ...geo, ts: Date.now() });
        return geo;
      }
    }
  } catch { /* give up */ }
  return null;
}

/** Extract real client IP, accounting for proxies */
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = String(forwarded).split(",")[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress ?? "";
}

/** Record a page view */
export async function handleTrack(req: Request, res: Response) {
  try {
    const { sessionId, path, referrer } = req.body ?? {};
    if (!sessionId || !path) {
      res.status(400).json({ ok: false });
      return;
    }
    const db = await getDb();
    if (!db) { res.json({ ok: true }); return; }

    // Truncate long values to fit DB columns
    const safePath = String(path).slice(0, 499);
    const safeReferrer = referrer ? String(referrer).slice(0, 499) : null;
    const safeUA = req.headers["user-agent"]?.slice(0, 499) ?? null;

    await db.insert(pageViews).values({
      sessionId: String(sessionId).slice(0, 63),
      path: safePath,
      referrer: safeReferrer,
      userAgent: safeUA,
    });

    res.json({ ok: true });
  } catch (err) {
    // Never fail silently — analytics should never break the site
    res.json({ ok: true });
  }
}

/** Update heartbeat — keeps session "active" for 2 minutes, captures user identity + geo */
export async function handleHeartbeat(req: Request, res: Response) {
  try {
    const { sessionId, path, isAdmin: isAdminFlag, timezone, browserLanguage, referrer } = req.body ?? {};
    if (!sessionId) { res.json({ ok: true }); return; }
    const db = await getDb();
    if (!db) { res.json({ ok: true }); return; }

    const safePath = path ? String(path).slice(0, 499) : "/";
    const safeSessionId = String(sessionId).slice(0, 63);
    const ip = getClientIp(req);

    // Try to identify logged-in user from session cookie
    let userId: number | null = null;
    let userName: string | null = null;
    let walletAddress: string | null = null;

    try {
      const cookieHeader = req.headers.cookie ?? "";
      const cookieMap = new Map(cookieHeader.split(";").map(c => {
        const [k, ...v] = c.trim().split("=");
        return [k.trim(), decodeURIComponent(v.join("="))];
      }));
      const sessionCookie = cookieMap.get(COOKIE_NAME);
      if (sessionCookie) {
        const session = await sdk.verifySession(sessionCookie);
        if (session?.openId) {
          // Look up user by openId
          const [userRow] = await db
            .select({ id: users.id, name: users.name, nickname: users.nickname, walletAddress: users.walletAddress })
            .from(users)
            .where(eq(users.openId, session.openId))
            .limit(1);
          if (userRow) {
            userId = userRow.id;
            userName = userRow.nickname || userRow.name || null;
            walletAddress = userRow.walletAddress || null;
          }
        }
      }
    } catch {
      // Non-fatal — session may be expired or absent
    }

    // Geo-lookup for anonymous visitors (or to enrich logged-in ones)
    let city: string | null = null;
    let region: string | null = null;
    let country: string | null = null;

    const geo = await getGeo(ip);
    if (geo) {
      city = geo.city;
      region = geo.region;
      country = geo.country;
    }

    // Device type detection from User-Agent
    const ua = (req.headers["user-agent"] ?? "").toLowerCase();
    let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
    if (/tablet|ipad|playbook|silk|(android(?!.*mobile))/.test(ua)) {
      deviceType = "tablet";
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/.test(ua)) {
      deviceType = "mobile";
    }

    const now = new Date();

    // Upsert: insert or update all fields. firstSeen is set only on insert.
    await db
      .insert(activeSessions)
      .values({
        sessionId: safeSessionId,
        path: safePath,
        lastSeen: now,
        firstSeen: now,
        userId: userId ?? undefined,
        userName: userName ?? undefined,
        walletAddress: walletAddress ?? undefined,
        ipAddress: ip ? ip.slice(0, 63) : undefined,
        city: city ?? undefined,
        region: region ?? undefined,
        country: country ?? undefined,
        deviceType,
        isAdmin: isAdminFlag === true,
        timezone: timezone ? String(timezone).slice(0, 99) : undefined,
        browserLanguage: browserLanguage ? String(browserLanguage).slice(0, 19) : undefined,
        referrer: referrer ? String(referrer).slice(0, 499) : undefined,
        pageCount: 1,
      })
      .onDuplicateKeyUpdate({
        set: {
          path: safePath,
          lastSeen: now,
          // firstSeen intentionally NOT updated — preserve original arrival time
          userId: userId ?? sql`userId`,
          userName: userName ?? sql`userName`,
          walletAddress: walletAddress ?? sql`walletAddress`,
          ipAddress: ip ? ip.slice(0, 63) : sql`ipAddress`,
          city: city ?? sql`city`,
          region: region ?? sql`region`,
          country: country ?? sql`country`,
          deviceType,
          isAdmin: isAdminFlag === true,
          timezone: timezone ? String(timezone).slice(0, 99) : sql`timezone`,
          browserLanguage: browserLanguage ? String(browserLanguage).slice(0, 19) : sql`browserLanguage`,
          referrer: referrer ? String(referrer).slice(0, 499) : sql`referrer`,
          pageCount: sql`pageCount + 1`,
        },
      });

    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
}
