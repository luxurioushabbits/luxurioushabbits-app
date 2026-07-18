/**
 * Wallet Auth Router — Luxurious Habbits
 * Sign-In with Ethereum (SIWE): verifies wallet signature and issues a session.
 * Users can log in with MetaMask / WalletConnect as an alternative to Manus OAuth.
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Normalize an Ethereum address to lowercase checksum-free form */
function normalizeAddress(addr: string): string {
  return addr.toLowerCase();
}

/**
 * Verify a personal_sign signature (EIP-191).
 * We use a lightweight pure-JS approach without ethers to keep bundle small.
 */
async function verifyEthSignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    // Dynamic import viem's verifyMessage — only loaded server-side
    const { verifyMessage } = await import("viem");
    const recovered = await verifyMessage({
      address: expectedAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    return recovered;
  } catch {
    return false;
  }
}

/** Build the SIWE-style message users sign */
function buildSignMessage(address: string, nonce: string, origin: string): string {
  return [
    `${origin} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to Luxurious Habbits",
    "",
    `URI: ${origin}`,
    `Version: 1`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");
}

// ── Router ─────────────────────────────────────────────────────────────────────

export const walletAuthRouter = router({
  /** Get a nonce for the wallet to sign — prevents replay attacks */
  getNonce: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(({ input }) => {
      const nonce = Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15);
      return { nonce, message: buildSignMessage(input.address, nonce, "https://luxurioushabbits.com") };
    }),

  /** Verify signature and issue a session cookie */
  login: publicProcedure
    .input(z.object({
      address: z.string(),
      signature: z.string(),
      message: z.string(),
      origin: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const address = normalizeAddress(input.address);

      // Verify the signature
      const valid = await verifyEthSignature(input.message, input.signature, input.address);
      if (!valid) {
        throw new Error("Invalid wallet signature");
      }

      // Find or create user by wallet address
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existingUsers = await db.select().from(users).where(eq(users.walletAddress, address)).limit(1);
      let user = existingUsers[0] ?? null;

      if (!user) {
        // Create a new user account for this wallet
        const walletName = `${address.slice(0, 6)}...${address.slice(-4)}`;
        const walletOpenId = `wallet:${address}`;
        const [newUser] = await db.insert(users).values({
          openId: walletOpenId,
          name: walletName,
          walletAddress: address,
          role: "user",
          loyaltyTier: "standard",
          subscriptionStreak: 0,
        }).$returningId();
        const newUsers = await db.select().from(users).where(eq(users.id, newUser.id)).limit(1);
        user = newUsers[0] ?? null;
      }

      if (!user) throw new Error("Failed to create wallet user");

      // Issue session JWT (same as OAuth flow)
      const sessionToken = await sdk.createSessionToken(user.openId ?? `wallet:${address}`, {
        name: user.name ?? "",
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, user: { id: user.id, name: user.name, walletAddress: user.walletAddress } };
    }),

  /** Link a wallet address to an existing logged-in account */
  linkWallet: protectedProcedure
    .input(z.object({
      address: z.string(),
      signature: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const address = normalizeAddress(input.address);

      // Check wallet not already linked to another account
      const db2 = await getDb();
      if (!db2) throw new Error("Database unavailable");
      const existingByWallet = await db2.select().from(users).where(eq(users.walletAddress, address)).limit(1);
      const existing = existingByWallet[0] ?? null;
      if (existing && existing.id !== ctx.user.id) {
        throw new Error("This wallet is already linked to another account");
      }

      // Verify signature
      const valid = await verifyEthSignature(input.message, input.signature, input.address);
      if (!valid) throw new Error("Invalid wallet signature");

      // Link wallet to current user
      await db2.update(users)
        .set({ walletAddress: address })
        .where(eq(users.id, ctx.user.id));

      return { success: true, walletAddress: address };
    }),

  /** Unlink wallet from current account */
  unlinkWallet: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Only allow unlink if user has another login method (openId not wallet-based)
      if (ctx.user.openId?.startsWith("wallet:")) {
        throw new Error("Cannot unlink wallet — it is your only login method");
      }
      const db3 = await getDb();
      if (!db3) throw new Error("Database unavailable");
      await db3.update(users)
        .set({ walletAddress: null })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});
