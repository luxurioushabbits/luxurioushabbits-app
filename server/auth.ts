/**
 * Email/Password Authentication Module
 * Replaces Manus OAuth for standalone Railway deployment.
 * Uses Node.js built-in crypto for password hashing (scrypt) — no external deps needed.
 */
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "../drizzle/schema";
import { getDb } from "./db";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";

const scryptAsync = promisify(scrypt);

// ─── Password Hashing ───────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  return timingSafeEqual(derivedKey, keyBuffer);
}

// ─── Email Sending ──────────────────────────────────────────────────
async function sendResetEmail(email: string, token: string, origin: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("[Auth] RESEND_API_KEY not configured, cannot send reset email");
    return;
  }
  const resend = new Resend(resendKey);
  const resetUrl = `${origin}/reset-password?token=${token}`;
  await resend.emails.send({
    from: "Luxurious Habbits <noreply@luxurioushabbits.com>",
    to: email,
    subject: "Reset Your Password — Luxurious Habbits",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
        <h2 style="color: #1a1a1a;">Reset Your Password</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 1rem 0;">Reset Password</a>
        <p style="color: #666; font-size: 0.85rem;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

// ─── Auth Router ────────────────────────────────────────────────────
export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user ?? null),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  register: publicProcedure
    .input(z.object({
      email: z.string().email().max(320),
      password: z.string().min(8, "Password must be at least 8 characters"),
      name: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if email already exists
      const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(input.password);
      const openId = `email_${randomBytes(16).toString("hex")}`; // Generate a unique openId for email users

      await db.insert(users).values({
        openId,
        email: input.email,
        name: input.name,
        passwordHash,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      // Create session
      const sessionToken = await sdk.createSessionToken(openId, {
        name: input.name,
        expiresInMs: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      return { success: true };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      const user = result[0];

      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email || "",
        expiresInMs: 30 * 24 * 60 * 60 * 1000,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

      return { success: true };
    }),

  forgotPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
      origin: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      const user = result[0];

      // Always return success to prevent email enumeration
      if (!user) return { success: true };

      const token = randomBytes(48).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.update(users).set({
        resetToken: token,
        resetTokenExpiry: expiry,
      }).where(eq(users.id, user.id));

      await sendResetEmail(input.email, token, input.origin);
      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db.select().from(users).where(eq(users.resetToken, input.token)).limit(1);
      const user = result[0];

      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset link" });
      }

      const passwordHash = await hashPassword(input.password);
      await db.update(users).set({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      }).where(eq(users.id, user.id));

      return { success: true };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      phone: z.string().max(30).optional(),
      smsOptIn: z.boolean().optional(),
      name: z.string().min(1).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const updateData: Record<string, unknown> = {};
      if (input.phone !== undefined) updateData.phone = input.phone || null;
      if (input.smsOptIn !== undefined) updateData.smsOptIn = input.smsOptIn;
      if (input.name !== undefined) updateData.name = input.name;
      if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));
      }
      return { success: true };
    }),
});
