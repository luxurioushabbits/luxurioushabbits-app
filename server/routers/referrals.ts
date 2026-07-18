/**
 * Referrals Router — Luxurious Habbits
 * $5 credit (500 loyalty points) to referrer when referred friend places first order.
 */
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../db";
import { referrals, loyaltyPoints, users } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, adminProcedure, router } from "../_core/trpc";
import { sendEmail } from "../email";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const referralsRouter = router({
  // Get or create the logged-in user's referral code
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { code: "", totalReferrals: 0, converted: 0, totalEarnedCents: 0, referrals: [] };

    const existing = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, ctx.user.id))
      .limit(1);

    if (existing.length > 0) {
      const total = await db.select().from(referrals).where(eq(referrals.referrerId, ctx.user.id));
      const converted = total.filter((r: typeof total[0]) => r.status === "converted" || r.status === "rewarded");
      const rewarded = total.filter((r: typeof total[0]) => r.status === "rewarded");
      return {
        code: existing[0].referralCode,
        totalReferrals: total.length,
        converted: converted.length,
        totalEarnedCents: rewarded.reduce((sum: number, r: typeof total[0]) => sum + r.rewardCents, 0),
        referrals: total,
      };
    }

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const conflict = await db.select().from(referrals).where(eq(referrals.referralCode, code)).limit(1);
      if (conflict.length === 0) break;
      code = generateCode();
      attempts++;
    }

    await db.insert(referrals).values({
      referrerId: ctx.user.id,
      referralCode: code,
      status: "pending",
      rewardCents: 500,
    });

    return {
      code,
      totalReferrals: 0,
      converted: 0,
      totalEarnedCents: 0,
      referrals: [],
    };
  }),

  // Apply a referral code at checkout (called when order is placed)
  applyReferral: protectedProcedure
    .input(z.object({ code: z.string(), orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, message: "Database unavailable" };

      const referral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, input.code.toUpperCase()))
        .limit(1);

      if (referral.length === 0) return { success: false, message: "Invalid referral code" };

      const ref = referral[0];

      // Can't refer yourself
      if (ref.referrerId === ctx.user.id) return { success: false, message: "You cannot use your own referral code" };

      // Check if this user already used a referral
      const alreadyUsed = await db
        .select()
        .from(referrals)
        .where(and(eq(referrals.referredUserId, ctx.user.id)));

      if (alreadyUsed.length > 0) return { success: false, message: "You have already used a referral code" };

      // Mark referral as rewarded
      await db
        .update(referrals)
        .set({
          referredUserId: ctx.user.id,
          orderId: input.orderId,
          status: "rewarded",
          rewardIssuedAt: new Date(),
        })
        .where(eq(referrals.id, ref.id));

      // Issue $5 as 500 loyalty points to referrer (admin_adjustment reason)
      await db.insert(loyaltyPoints).values({
        userId: ref.referrerId,
        points: 500,
        reason: "admin_adjustment",
        orderId: input.orderId,
        note: "Referral reward — friend placed their first order",
      });

      // Notify referrer via email
      try {
        const referrerRows = await db
          .select()
          .from(users)
          .where(eq(users.id, ref.referrerId))
          .limit(1);
        const referrerUser = referrerRows[0] ?? null;
        if (referrerUser?.email) {
          await sendEmail({
            to: referrerUser.email,
            subject: "You earned a $5 referral reward! 🎉",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e0e0e0; padding: 40px; border-radius: 12px;">
                <h2 style="color: #d4af37; font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.1em;">YOUR REFERRAL PAID OFF</h2>
                <p>Great news — someone you referred just placed their first order at Luxurious Habbits.</p>
                <p style="font-size: 1.5rem; color: #d4af37; font-weight: bold;">500 points ($5.00) have been added to your account.</p>
                <p>Your points are ready to redeem at checkout. Keep sharing your referral link to earn more.</p>
                <a href="https://www.luxurioushabbits.com/account" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">View My Account</a>
                <p style="margin-top: 32px; font-size: 0.75rem; color: #555;">Luxurious Habbits · Premium Hemp</p>
              </div>
            `,
          });
        }
      } catch (_) {
        // Non-fatal — referral still applied
      }

      return { success: true, message: "Referral applied — your friend earned 500 points ($5)!" };
    }),

  // Admin: get all referrals with referrer info and commission tracking
  adminGetAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select({
        id: referrals.id,
        referralCode: referrals.referralCode,
        status: referrals.status,
        rewardCents: referrals.rewardCents,
        rewardIssuedAt: referrals.rewardIssuedAt,
        createdAt: referrals.createdAt,
        referrerId: referrals.referrerId,
        referredUserId: referrals.referredUserId,
        orderId: referrals.orderId,
        referrerName: users.name,
        referrerEmail: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .orderBy(desc(referrals.createdAt))
      .limit(500);
    return rows;
  }),

  // Admin: get referral summary stats
  adminStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, converted: 0, rewarded: 0, totalRewardCents: 0 };
    const rows = await db.select().from(referrals);
    const converted = rows.filter(r => r.status === "converted" || r.status === "rewarded");
    const rewarded = rows.filter(r => r.status === "rewarded");
    return {
      total: rows.length,
      converted: converted.length,
      rewarded: rewarded.length,
      totalRewardCents: rewarded.reduce((sum, r) => sum + r.rewardCents, 0),
    };
  }),

  // Look up referral code validity (public — for checkout page)
  validateCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false };

      const referral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, input.code.toUpperCase()))
        .limit(1);

      if (referral.length === 0) return { valid: false };
      return { valid: true, rewardCents: referral[0].rewardCents };
    }),
});
