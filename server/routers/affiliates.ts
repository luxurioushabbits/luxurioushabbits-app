/**
 * Affiliates Router — Luxurious Habbits
 * Unique affiliate links, click tracking, commission on conversions, site credit history.
 */
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "../db";
import { affiliates, affiliateClicks, affiliateConversions, users, orders } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, adminProcedure, router } from "../_core/trpc";

function generateAffiliateCode(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
  const suffix = Math.floor(Math.random() * 900 + 100).toString();
  return base + suffix;
}

export const affiliatesRouter = router({
  // Get current user's affiliate profile (or null if not an affiliate)
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, ctx.user.id))
      .limit(1);

    return rows[0] ?? null;
  }),

  // Get affiliate dashboard stats
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const affiliateRows = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, ctx.user.id))
      .limit(1);

    if (affiliateRows.length === 0) return null;
    const affiliate = affiliateRows[0];

    // Get click count
    const clickCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(affiliateClicks)
      .where(eq(affiliateClicks.affiliateId, affiliate.id));

    // Get conversions
    const conversions = await db
      .select()
      .from(affiliateConversions)
      .where(eq(affiliateConversions.affiliateId, affiliate.id))
      .orderBy(desc(affiliateConversions.createdAt))
      .limit(50);

    const pendingCents = conversions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.commissionCents, 0);

    const approvedCents = conversions
      .filter((c) => c.status === "approved")
      .reduce((sum, c) => sum + c.commissionCents, 0);

    return {
      affiliate,
      totalClicks: Number(clickCount[0]?.count ?? 0),
      totalConversions: conversions.length,
      pendingCents,
      approvedCents,
      totalEarnedCents: affiliate.totalEarnedCents,
      totalPaidCents: affiliate.totalPaidCents,
      unpaidCents: affiliate.totalEarnedCents - affiliate.totalPaidCents,
      conversions,
    };
  }),

  // Apply to become an affiliate (creates pending affiliate record)
  applyForAffiliate: protectedProcedure
    .input(z.object({ paypalEmail: z.string().email().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if already an affiliate
      const existing = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, message: "You are already an affiliate" };
      }

      // Generate unique code
      const userName = ctx.user.name ?? "USER";
      let code = generateAffiliateCode(userName);
      let attempts = 0;
      while (attempts < 10) {
        const conflict = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.affiliateCode, code))
          .limit(1);
        if (conflict.length === 0) break;
        code = generateAffiliateCode(userName);
        attempts++;
      }

      await db.insert(affiliates).values({
        userId: ctx.user.id,
        affiliateCode: code,
        commissionPercent: "10.00",
        status: "active",
        paypalEmail: input.paypalEmail ?? null,
        totalEarnedCents: 0,
        totalPaidCents: 0,
      });

      return { success: true, code };
    }),

  // Update PayPal email
  updatePaypalEmail: protectedProcedure
    .input(z.object({ paypalEmail: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(affiliates)
        .set({ paypalEmail: input.paypalEmail })
        .where(eq(affiliates.userId, ctx.user.id));

      return { success: true };
    }),

  // Track a click (public — called when someone visits via affiliate link)
  trackClick: publicProcedure
    .input(z.object({ code: z.string(), referrerUrl: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const affiliateRows = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.affiliateCode, input.code.toUpperCase()))
        .limit(1);

      if (affiliateRows.length === 0) return { success: false };

      await db.insert(affiliateClicks).values({
        affiliateId: affiliateRows[0].id,
        ipAddress: (ctx.req as any)?.ip ?? null,
        userAgent: (ctx.req as any)?.headers?.["user-agent"] ?? null,
        referrerUrl: input.referrerUrl ?? null,
      });

      return { success: true };
    }),

  // Admin: list all affiliates
  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select({
        id: affiliates.id,
        userId: affiliates.userId,
        affiliateCode: affiliates.affiliateCode,
        commissionPercent: affiliates.commissionPercent,
        status: affiliates.status,
        paypalEmail: affiliates.paypalEmail,
        totalEarnedCents: affiliates.totalEarnedCents,
        totalPaidCents: affiliates.totalPaidCents,
        createdAt: affiliates.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(affiliates)
      .innerJoin(users, eq(affiliates.userId, users.id))
      .orderBy(desc(affiliates.createdAt));
  }),

  // Admin: approve a conversion
  adminApproveConversion: adminProcedure
    .input(z.object({ conversionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const rows = await db
        .select()
        .from(affiliateConversions)
        .where(eq(affiliateConversions.id, input.conversionId))
        .limit(1);

      if (rows.length === 0) throw new Error("Conversion not found");
      const conv = rows[0];

      await db
        .update(affiliateConversions)
        .set({ status: "approved" })
        .where(eq(affiliateConversions.id, input.conversionId));

      // Update affiliate total earned
      await db
        .update(affiliates)
        .set({
          totalEarnedCents: sql`${affiliates.totalEarnedCents} + ${conv.commissionCents}`,
        })
        .where(eq(affiliates.id, conv.affiliateId));

      return { success: true };
    }),

  // Admin: mark conversion as credited (site credit issued to affiliate)
  adminMarkPaid: adminProcedure
    .input(z.object({ conversionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const rows = await db
        .select()
        .from(affiliateConversions)
        .where(eq(affiliateConversions.id, input.conversionId))
        .limit(1);

      if (rows.length === 0) throw new Error("Conversion not found");
      const conv = rows[0];

      await db
        .update(affiliateConversions)
        .set({ status: "paid", paidAt: new Date() }) // "paid" = site credit issued
        .where(eq(affiliateConversions.id, input.conversionId));

      await db
        .update(affiliates)
        .set({
          totalPaidCents: sql`${affiliates.totalPaidCents} + ${conv.commissionCents}`,
        })
        .where(eq(affiliates.id, conv.affiliateId));

      return { success: true };
    }),

  // Admin: update commission rate
  adminUpdateCommission: adminProcedure
    .input(z.object({ affiliateId: z.number(), commissionPercent: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(affiliates)
        .set({ commissionPercent: input.commissionPercent })
        .where(eq(affiliates.id, input.affiliateId));

      return { success: true };
    }),

  // Admin: pause/activate affiliate
  adminSetStatus: adminProcedure
    .input(z.object({ affiliateId: z.number(), status: z.enum(["active", "paused", "terminated"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .update(affiliates)
        .set({ status: input.status })
        .where(eq(affiliates.id, input.affiliateId));
      return { success: true };
    }),

  // Admin: export unpaid (approved) conversions as CSV for payout processing
  adminExportPayoutCsv: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const rows = await db
      .select({
        conversionId: affiliateConversions.id,
        affiliateId: affiliates.id,
        affiliateName: users.name,
        affiliateEmail: users.email,
        paypalEmail: affiliates.paypalEmail,
        commissionCents: affiliateConversions.commissionCents,
        commissionPercent: affiliates.commissionPercent,
        orderId: affiliateConversions.orderId,
        orderTotalCents: affiliateConversions.orderTotalCents,
        convertedAt: affiliateConversions.createdAt,
      })
      .from(affiliateConversions)
      .innerJoin(affiliates, eq(affiliateConversions.affiliateId, affiliates.id))
      .innerJoin(users, eq(affiliates.userId, users.id))
      .where(eq(affiliateConversions.status, "approved"))
      .orderBy(users.name);
    const headers = ["Conversion ID","Affiliate ID","Affiliate Name","Email","PayPal Email","Commission ($)","Commission %","Order ID","Order Total ($)","Converted At"];
    const csvRows = rows.map(r => [
      r.conversionId,
      r.affiliateId,
      `"${(r.affiliateName ?? "").replace(/"/g, '""')}"`,
      `"${(r.affiliateEmail ?? "").replace(/"/g, '""')}"`,
      `"${(r.paypalEmail ?? "").replace(/"/g, '""')}"`,
      ((r.commissionCents ?? 0) / 100).toFixed(2),
      r.commissionPercent ?? "0",
      r.orderId ?? "",
      r.orderTotalCents ? (r.orderTotalCents / 100).toFixed(2) : "",
      r.convertedAt ? new Date(r.convertedAt).toISOString().split("T")[0] : "",
    ].join(","));
    const totalCents = rows.reduce((sum, r) => sum + (r.commissionCents ?? 0), 0);
    return { csv: [headers.join(","), ...csvRows].join("\n"), count: rows.length, totalCents };
  }),

  // Admin: mark all approved conversions as paid in bulk
  adminMarkAllPaid: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const approved = await db
      .select()
      .from(affiliateConversions)
      .where(eq(affiliateConversions.status, "approved"));
    for (const conv of approved) {
      await db.update(affiliateConversions).set({ status: "paid", paidAt: new Date() }).where(eq(affiliateConversions.id, conv.id));
      await db.update(affiliates).set({ totalPaidCents: sql`${affiliates.totalPaidCents} + ${conv.commissionCents}` }).where(eq(affiliates.id, conv.affiliateId));
    }
    return { success: true, count: approved.length };
  }),
});
