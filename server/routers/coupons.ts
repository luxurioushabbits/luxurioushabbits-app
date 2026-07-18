/**
 * Coupons Router — Newsletter signup discount codes
 * Newsletter signup generates a unique 15% off coupon code.
 * Checkout can validate and apply coupon codes.
 */
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { couponCodes, newsletterSubscribers } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "LH-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const couponsRouter = router({
  // Newsletter subscribe — generates a unique 15% coupon code
  newsletterSubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if already subscribed
      const [existing] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, input.email))
        .limit(1);

      // Check if they already have a coupon
      const [existingCoupon] = await db
        .select()
        .from(couponCodes)
        .where(eq(couponCodes.email, input.email))
        .limit(1);

      if (existingCoupon) {
        // Return their existing code
        return {
          success: true,
          code: existingCoupon.code,
          discountPct: existingCoupon.discountPct,
          alreadySubscribed: true,
        };
      }

      // Add to newsletter if not already subscribed
      if (!existing) {
        await db.insert(newsletterSubscribers).values({ email: input.email });
      }

      // Generate unique coupon code
      let code = generateCouponCode();
      let attempts = 0;
      while (attempts < 10) {
        const [clash] = await db
          .select({ id: couponCodes.id })
          .from(couponCodes)
          .where(eq(couponCodes.code, code))
          .limit(1);
        if (!clash) break;
        code = generateCouponCode();
        attempts++;
      }

      // Set expiry 1 year from now
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await db.insert(couponCodes).values({
        code,
        email: input.email,
        discountPct: 15,
        used: false,
        expiresAt,
      });

      // Notify owner
      await notifyOwner({
        title: `New Newsletter Subscriber — ${input.email}`,
        content: `${input.email} subscribed and received coupon code: ${code} (15% off)`,
      });

      return {
        success: true,
        code,
        discountPct: 15,
        alreadySubscribed: false,
      };
    }),

  // Validate a coupon code at checkout
  validate: publicProcedure
    .input(z.object({ code: z.string().min(1).max(32) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false, message: "Service unavailable" };

      const [coupon] = await db
        .select()
        .from(couponCodes)
        .where(eq(couponCodes.code, input.code.toUpperCase().trim()))
        .limit(1);

      if (!coupon) return { valid: false, message: "Invalid coupon code." };
      if (coupon.used) return { valid: false, message: "This coupon has already been used." };
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { valid: false, message: "This coupon has expired." };
      }

      return {
        valid: true,
        discountPct: coupon.discountPct,
        message: `${coupon.discountPct}% off applied!`,
        couponId: coupon.id,
      };
    }),

  // Mark coupon as used (called after successful order placement)
  markUsed: publicProcedure
    .input(z.object({ code: z.string(), orderId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(couponCodes)
        .set({ used: true, usedAt: new Date(), orderId: input.orderId })
        .where(eq(couponCodes.code, input.code.toUpperCase().trim()));

      return { success: true };
    }),

  // Admin: manually create a coupon code
  adminCreate: adminProcedure
    .input(
      z.object({
        code: z.string().min(3).max(32).optional(), // auto-generate if omitted
        email: z.string().email().optional(),
        discountPct: z.number().int().min(1).max(100).default(15),
        expiresAt: z.string().optional(), // ISO date string
        note: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const code = input.code?.toUpperCase().trim() || generateCouponCode();

      // Check uniqueness
      const [existing] = await db.select().from(couponCodes).where(eq(couponCodes.code, code)).limit(1);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: `Code "${code}" already exists` });

      await db.insert(couponCodes).values({
        code,
        email: input.email ?? "admin-created",
        discountPct: input.discountPct,
        used: false,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      });

      return { success: true, code };
    }),

  // Admin: delete/revoke a coupon
  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(couponCodes).where(eq(couponCodes.id, input.id));
      return { success: true };
    }),

  // Admin: list all coupon codes
  adminList: adminProcedure
    .input(
      z.object({
        filter: z.enum(["all", "used", "unused"]).default("all"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select()
        .from(couponCodes)
        .orderBy(desc(couponCodes.createdAt));

      if (input.filter === "used") return rows.filter(r => r.used);
      if (input.filter === "unused") return rows.filter(r => !r.used);
      return rows;
    }),
});
