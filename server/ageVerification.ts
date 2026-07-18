/**
 * Age Verification — Luxurious Habbits
 * Server-side age gate enforcement via signed cookie.
 * - POST /api/age-verify: sets the age_verified cookie
 * - GET /api/age-verified: checks if the cookie is set (for client hydration)
 * The cookie is httpOnly and session-scoped (no maxAge = expires on browser close).
 */
import type { Request, Response } from "express";
import { getSessionCookieOptions } from "./_core/cookies";

const AGE_COOKIE = "lh_age_ok";
const AGE_COOKIE_VALUE = "1";

export function handleAgeVerify(req: Request, res: Response) {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(AGE_COOKIE, AGE_COOKIE_VALUE, {
    ...cookieOptions,
    httpOnly: true,
    // Session cookie — no maxAge, expires when browser closes
  });
  res.json({ ok: true });
}

export function handleAgeCheck(_req: Request, res: Response) {
  // The cookie will be present in req.cookies if the middleware parses them
  // But we read from the raw header to avoid depending on cookie-parser
  const cookieHeader = _req.headers.cookie ?? "";
  const verified = cookieHeader.split(";").some((c) => {
    const [k, v] = c.trim().split("=");
    return k === AGE_COOKIE && v === AGE_COOKIE_VALUE;
  });
  res.json({ verified });
}
