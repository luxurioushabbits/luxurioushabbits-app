/**
 * Generates a permanent (10-year) JWT session token for the Authorize.net reviewer account.
 * Run: node gen_reviewer_token.mjs
 */
import { SignJWT } from "jose";
import dotenv from "dotenv";
import { readFileSync } from "fs";

// Load env
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const VITE_APP_ID = process.env.VITE_APP_ID;

if (!JWT_SECRET || !VITE_APP_ID) {
  console.error("Missing JWT_SECRET or VITE_APP_ID env vars");
  process.exit(1);
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// 10-year expiry
const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;
const issuedAt = Date.now();
const expirationSeconds = Math.floor((issuedAt + TEN_YEARS_MS) / 1000);

const token = await new SignJWT({
  openId: "reviewer_authorize_net",
  appId: VITE_APP_ID,
  name: "Authorize.net Reviewer",
})
  .setProtectedHeader({ alg: "HS256", typ: "JWT" })
  .setExpirationTime(expirationSeconds)
  .sign(secretKey);

console.log("\n=== REVIEWER SESSION TOKEN ===");
console.log(token);
console.log("\nExpires: " + new Date(expirationSeconds * 1000).toISOString());
console.log("\nTo use: set cookie  app_session_id=" + token);
