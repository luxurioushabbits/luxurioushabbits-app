import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailCaptures } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "../email";

function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "WELCOME";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const emailCapturesRouter = router({
  // Public: capture email from popup, generate coupon
  capture: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Check if already captured
      const existing = await db
        .select()
        .from(emailCaptures)
        .where(eq(emailCaptures.email, input.email))
        .limit(1);
      if (existing.length > 0) {
        return { couponCode: existing[0].couponCode, alreadyExists: true };
      }
      const couponCode = generateCouponCode();
      await db.insert(emailCaptures).values({
        email: input.email,
        couponCode,
        discountPct: 15,
        source: "popup",
        used: false,
      });
      // Send welcome email with coupon code (non-blocking — don't fail capture if email fails)
      sendWelcomeEmail({ to: input.email, couponCode }).catch(err =>
        console.error("[EmailCapture] Failed to send welcome email:", err)
      );
      return { couponCode, alreadyExists: false };
    }),

  // Admin: list all email captures
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return [];
      return db
      .select()
      .from(emailCaptures)
      .orderBy(emailCaptures.capturedAt);
  }),
});
