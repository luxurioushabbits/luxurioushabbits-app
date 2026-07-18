/**
 * Loyalty Points Router — Luxurious Habbits
 * Earn 1 point per $1 spent, 1 point per approved review.
 * 100 points = $1 discount at checkout.
 * Habbit Box subscribers earn double points on subscription orders.
 */
import { z } from "zod";
import { eq, sql, desc } from "drizzle-orm";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { loyaltyPoints, loyaltyRedemptions, users } from "../../drizzle/schema";
import { sendLoyaltyMilestone } from "../email";

const MILESTONES = [100, 500, 1000] as const;
type Milestone = 100 | 500 | 1000;

async function checkAndSendMilestones(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  userId: number,
  prevBalance: number,
  newBalance: number,
  userEmail: string,
  userName: string
) {
  for (const milestone of MILESTONES) {
    if (prevBalance < milestone && newBalance >= milestone) {
      const dollarValue = Math.floor(newBalance / 100);
      sendLoyaltyMilestone({
        to: userEmail,
        customerName: userName || "Valued Customer",
        milestone,
        totalPoints: newBalance,
        dollarValue,
      }).catch(err => console.error(`[Loyalty Milestone ${milestone}] Email failed:`, err));
    }
  }
}

export const loyaltyRouter = router({
  // Get current user's point balance
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { points: 0, dollarValue: 0 };

    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(${loyaltyPoints.points}), 0)` })
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.userId, ctx.user.id));

    const points = Number(result[0]?.total ?? 0);
    return {
      points,
      dollarValue: Math.floor(points / 100), // 100 pts = $1
    };
  }),

  // Get current user's point history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.userId, ctx.user.id))
      .orderBy(desc(loyaltyPoints.createdAt))
      .limit(50);
  }),

  // Award points for a purchase (called after order is confirmed)
  awardPurchasePoints: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      totalCents: z.number(), // order total in cents
      isSubscription: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { awarded: 0 };

      // 1 point per $1 spent (100 cents = 1 point), double for subscription
      const basePoints = Math.floor(input.totalCents / 100);
      const points = input.isSubscription ? basePoints * 2 : basePoints;

      if (points <= 0) return { awarded: 0 };

      // Get balance before awarding
      const prevResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${loyaltyPoints.points}), 0)` })
        .from(loyaltyPoints)
        .where(eq(loyaltyPoints.userId, ctx.user.id));
      const prevBalance = Number(prevResult[0]?.total ?? 0);

      await db.insert(loyaltyPoints).values({
        userId: ctx.user.id,
        points,
        reason: input.isSubscription ? "subscription_bonus" : "purchase",
        orderId: input.orderId,
        note: input.isSubscription
          ? `Double points on Habbit Box order #${input.orderId}`
          : `Purchase order #${input.orderId}`,
      });

      const newBalance = prevBalance + points;

      // Check and send milestone emails (non-blocking)
      const userResult = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      if (userResult[0]?.email) {
        checkAndSendMilestones(
          db,
          ctx.user.id,
          prevBalance,
          newBalance,
          userResult[0].email,
          userResult[0].name ?? ""
        );
      }

      return { awarded: points };
    }),

  // Award points for an approved review
  awardReviewPoints: protectedProcedure
    .input(z.object({ reviewId: z.number(), userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { awarded: 0 };

      // Only admin can call this
      if (ctx.user.role !== "admin") throw new Error("Forbidden");

      await db.insert(loyaltyPoints).values({
        userId: input.userId,
        points: 100, // 100 pts = $1
        reason: "review_approved",
        reviewId: input.reviewId,
        note: "Review approved — $1 reward",
      });

      return { awarded: 100 };
    }),

  // Redeem loyalty points at checkout (tier-based cap, product subtotal only — not shipping)
  redeemPoints: protectedProcedure
    .input(z.object({
      pointsToRedeem: z.number().min(100).multipleOf(100), // min $1, must be in $1 increments
      orderId: z.number().optional(),
      isSubscriptionOrder: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Subscription box orders must be paid with money — no credits allowed
      if (input.isSubscriptionOrder) {
        throw new Error("Site credits cannot be applied to subscription box orders. Subscription boxes must be paid in full.");
      }

      // Tier-based loyalty cap: Standard $100, Elevated $150, Luxurious Connoisseur $200
      const tier = ctx.user.loyaltyTier ?? "standard";
      const MAX_LOYALTY_CENTS = tier === "luxurious" ? 20_000 : tier === "elevated" ? 15_000 : 10_000;
      const capLabel = tier === "luxurious" ? "$200" : tier === "elevated" ? "$150" : "$100";
      if (input.pointsToRedeem > MAX_LOYALTY_CENTS) {
        throw new Error(`Loyalty points redemption is capped at ${capLabel} per order for your tier. You requested $${(input.pointsToRedeem / 100).toFixed(2)}.`);
      }

      // Check balance
      const result = await db
        .select({ total: sql<number>`COALESCE(SUM(${loyaltyPoints.points}), 0)` })
        .from(loyaltyPoints)
        .where(eq(loyaltyPoints.userId, ctx.user.id));

      const balance = Number(result[0]?.total ?? 0);
      if (balance < input.pointsToRedeem) {
        throw new Error(`Insufficient points. You have ${balance} points ($${(balance / 100).toFixed(2)}).`);
      }

      const discountCents = input.pointsToRedeem; // 100 pts = $1 = 100 cents

      // Deduct points
      await db.insert(loyaltyPoints).values({
        userId: ctx.user.id,
        points: -input.pointsToRedeem,
        reason: "redemption",
        orderId: input.orderId,
        note: `Redeemed ${input.pointsToRedeem} points for $${(discountCents / 100).toFixed(2)} off (loyalty)`,
      });

      // Record redemption
      await db.insert(loyaltyRedemptions).values({
        userId: ctx.user.id,
        pointsUsed: input.pointsToRedeem,
        discountCents,
        orderId: input.orderId,
      });

      return {
        discountCents,
        discountDollars: discountCents / 100,
        pointsUsed: input.pointsToRedeem,
        newBalance: balance - input.pointsToRedeem,
      };
    }),

  // Redeem review credits at checkout (tier-based cap, product subtotal only — not shipping)
  // Review credits are stored as loyalty points with reason="review_approved"
  redeemReviewCredits: protectedProcedure
    .input(z.object({
      creditCents: z.number().min(100).multipleOf(100), // min $1
      orderId: z.number().optional(),
      isSubscriptionOrder: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Subscription box orders must be paid with money — no credits allowed
      if (input.isSubscriptionOrder) {
        throw new Error("Site credits cannot be applied to subscription box orders. Subscription boxes must be paid in full.");
      }

      // Tier-based review credit cap: Standard $100, Elevated $150, Luxurious Connoisseur $200
      const tier = ctx.user.loyaltyTier ?? "standard";
      const MAX_REVIEW_CENTS = tier === "luxurious" ? 20_000 : tier === "elevated" ? 15_000 : 10_000;
      const capLabel = tier === "luxurious" ? "$200" : tier === "elevated" ? "$150" : "$100";
      if (input.creditCents > MAX_REVIEW_CENTS) {
        throw new Error(`Review credit redemption is capped at ${capLabel} per order for your tier.`);
      }

      // Review credits are stored as loyalty points with reason="review_approved"
      // Count available review credit points (positive review_approved entries minus used ones)
      const earnedResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${loyaltyPoints.points}), 0)` })
        .from(loyaltyPoints)
        .where(eq(loyaltyPoints.userId, ctx.user.id));
      const totalBalance = Number(earnedResult[0]?.total ?? 0);

      if (totalBalance < input.creditCents) {
        throw new Error(`Insufficient credits. Your total balance is ${totalBalance} points.`);
      }

      // Deduct as a redemption (labelled as review credit)
      await db.insert(loyaltyPoints).values({
        userId: ctx.user.id,
        points: -input.creditCents,
        reason: "redemption",
        orderId: input.orderId,
        note: `Redeemed $${(input.creditCents / 100).toFixed(2)} review credits`,
      });

      await db.insert(loyaltyRedemptions).values({
        userId: ctx.user.id,
        pointsUsed: input.creditCents,
        discountCents: input.creditCents,
        orderId: input.orderId,
      });

      return {
        discountCents: input.creditCents,
        discountDollars: input.creditCents / 100,
        newBalance: totalBalance - input.creditCents,
      };
    }),

  // Get breakdown of loyalty points vs review credits available (tier-aware caps)
  getBalanceBreakdown: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { loyaltyPoints: 0, reviewCredits: 0, totalPoints: 0, maxOrderDiscount: 200, maxLoyaltyDiscount: 100, maxReviewDiscount: 100 };

    const rows = await db
      .select({ points: loyaltyPoints.points, reason: loyaltyPoints.reason })
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.userId, ctx.user.id));

    const totalPoints = rows.reduce((sum, r) => sum + r.points, 0);
    const reviewCreditPoints = rows
      .filter(r => r.reason === "review_approved" && r.points > 0)
      .reduce((sum, r) => sum + r.points, 0);
    const purchasePoints = rows
      .filter(r => r.reason === "purchase" || r.reason === "subscription_bonus")
      .reduce((sum, r) => sum + r.points, 0);

    // Tier-based caps: Standard $100/$100/$200, Elevated $150/$150/$300, Luxurious Connoisseur $200/$200/$400
    const tier = ctx.user.loyaltyTier ?? "standard";
    const maxLoyaltyDiscount = tier === "luxurious" ? 200 : tier === "elevated" ? 150 : 100;
    const maxReviewDiscount  = tier === "luxurious" ? 200 : tier === "elevated" ? 150 : 100;

    return {
      totalPoints: Math.max(0, totalPoints),
      loyaltyPoints: Math.max(0, purchasePoints),
      reviewCredits: Math.max(0, reviewCreditPoints),
      dollarValue: Math.floor(Math.max(0, totalPoints) / 100),
      maxLoyaltyDiscount,
      maxReviewDiscount,
      maxOrderDiscount: maxLoyaltyDiscount + maxReviewDiscount,
    };
  }),

  // Admin: get all users with loyalty balances
  adminGetLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    if (ctx.user.role !== "admin") throw new Error("Forbidden");

    const result = await db
      .select({
        userId: loyaltyPoints.userId,
        totalPoints: sql<number>`COALESCE(SUM(${loyaltyPoints.points}), 0)`,
        userName: users.name,
        userEmail: users.email,
      })
      .from(loyaltyPoints)
      .leftJoin(users, eq(loyaltyPoints.userId, users.id))
      .groupBy(loyaltyPoints.userId, users.name, users.email)
      .orderBy(desc(sql`SUM(${loyaltyPoints.points})`))
      .limit(100);

    return result.map(r => ({
      ...r,
      totalPoints: Number(r.totalPoints),
      dollarValue: Math.floor(Number(r.totalPoints) / 100),
    }));
  }),

  // Admin: manually adjust points
  adminAdjustPoints: protectedProcedure
    .input(z.object({
      userId: z.number(),
      points: z.number(), // positive or negative
      note: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      if (ctx.user.role !== "admin") throw new Error("Forbidden");

      await db.insert(loyaltyPoints).values({
        userId: input.userId,
        points: input.points,
        reason: "admin_adjustment",
        note: input.note,
      });

      return { success: true };
    }),

  // Admin: gift credits to a live user (triggers congratulations popup)
  adminGiftCredits: protectedProcedure
    .input(z.object({
      userId: z.number(),
      points: z.number().min(1).max(10000),
      message: z.string().default("You've been selected for a special reward!"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      if (ctx.user.role !== "admin") throw new Error("Forbidden");

      // Add the loyalty points
      await db.insert(loyaltyPoints).values({
        userId: input.userId,
        points: input.points,
        reason: "admin_gift",
        note: input.message,
      });

      // Insert a pending gift notification so the user sees the popup
      const { pendingGifts } = await import("../../drizzle/schema");
      await db.insert(pendingGifts).values({
        userId: input.userId,
        points: input.points,
        message: input.message,
      });

      return { success: true };
    }),

  // User: poll for pending gift notifications (used by congratulations popup)
  checkPendingGift: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const { pendingGifts } = await import("../../drizzle/schema");
    const [gift] = await db
      .select()
      .from(pendingGifts)
      .where(eq(pendingGifts.userId, ctx.user.id))
      .limit(1);
    return gift ?? null;
  }),

  // User: dismiss the pending gift popup after it's been shown
  dismissGift: protectedProcedure
    .input(z.object({ giftId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return;
      const { pendingGifts } = await import("../../drizzle/schema");
      await db
        .delete(pendingGifts)
        .where(eq(pendingGifts.id, input.giftId));
      return { success: true };
    }),

  // Admin: toggle wholesale status on a user
  setWholesale: protectedProcedure
    .input(z.object({
      userId: z.number(),
      isWholesale: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      if (ctx.user.role !== "admin") throw new Error("Forbidden");

      await db
        .update(users)
        .set({
          isWholesale: input.isWholesale,
          wholesaleApprovedAt: input.isWholesale ? new Date() : null,
        })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),
});
