/**
 * Reviewer Access — Luxurious Habbits
 *
 * GET /reviewer-access?token=<SECURE_TOKEN>
 *
 * Private endpoint for Authorize.net merchant account reviewers ONLY.
 * - Strong token (not guessable)
 * - Rate limited: max 10 attempts per IP per hour, then locked out
 * - Wrong token returns generic 404 (not 401) to avoid confirming endpoint exists
 * - Sets a 10-year session cookie + age verification cookie, then redirects to homepage
 * - All access attempts are logged with IP and timestamp
 * - Reviewer email guest@luxurioushabbits.com bypasses state restrictions at checkout
 */
import type { Request, Response } from "express";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

// Strong private token — only share with Authorize.net reviewer
const REVIEWER_TOKEN = "aNet-LxH-R3v!ew-2024-k9mZpQ7w";

const REVIEWER_OPEN_ID = "reviewer_authorize_net";
const REVIEWER_NAME = "Authorize.net Reviewer";
const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;
const AGE_COOKIE = "lh_age_ok";

// Simple in-memory rate limiter: max 10 attempts per IP per hour
const attemptMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attemptMap.get(ip);
  if (!entry || now > entry.resetAt) {
    attemptMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true; // allowed
  }
  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    return false; // blocked
  }
  return true;
}

export async function handleReviewerAccess(req: Request, res: Response) {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown";

  // Rate limit check
  if (!checkRateLimit(ip)) {
    res.status(404).send("Not found");
    return;
  }

  const token = (req.query.token as string) ?? "";

  // Wrong token → generic 404, no hint that this endpoint exists
  if (token !== REVIEWER_TOKEN) {
    console.warn(`[ReviewerAccess] FAILED attempt from IP ${ip} at ${new Date().toISOString()}`);
    res.status(404).send("Not found");
    return;
  }

  console.log(`[ReviewerAccess] Authorized access granted to IP ${ip} at ${new Date().toISOString()}`);

  // Generate a 10-year JWT session for the reviewer account
  const secretKey = new TextEncoder().encode(ENV.cookieSecret);
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + TEN_YEARS_MS) / 1000);

  const sessionToken = await new SignJWT({
    openId: REVIEWER_OPEN_ID,
    appId: ENV.appId,
    name: REVIEWER_NAME,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);

  const cookieOpts = getSessionCookieOptions(req);
  const maxAge = TEN_YEARS_MS / 1000;

  // Set session cookie (10-year, non-expiring for practical purposes)
  res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOpts,
    maxAge,
  });

  // Set age verification cookie (10-year)
  res.cookie(AGE_COOKIE, "1", {
    ...cookieOpts,
    httpOnly: true,
    maxAge,
  });

  // Small HTML page that sets localStorage then redirects to homepage
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Luxurious Habbits</title>
    <meta charset="utf-8" />
    <style>
      body { background: #0a0a0a; color: #fff; font-family: sans-serif;
             display: flex; align-items: center; justify-content: center;
             min-height: 100vh; margin: 0; }
      .box { text-align: center; }
      h2 { color: #bf5fff; font-size: 1.5rem; margin-bottom: 0.5rem; }
      p { color: #888; }
    </style>
  </head>
  <body>
    <div class="box">
      <h2>Access Granted</h2>
      <p>Redirecting...</p>
    </div>
    <script>
      try { localStorage.setItem('lh_age_verified', 'true'); } catch(e) {}
      try { sessionStorage.setItem('lh_age_verified', 'true'); } catch(e) {}
      window.location.replace('/');
    </script>
  </body>
</html>`);
}
