/**
 * GBP Review Submissions Router — Luxurious Habbits
 * Customers upload a screenshot of their Google Business Profile review.
 * Admin verifies it's a real new review → approve = 100 loyalty points ($1 credit).
 */
import { z } from "zod";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { getDb } from "../db";
import { gbpReviewSubmissions, loyaltyPoints, users } from "../../drizzle/schema";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { sendReviewReward } from "../email";
import { notifyOwner } from "../_core/notification";

export const gbpReviewsRouter = router({
  // Submit a GBP review screenshot (customer)
  submit: protectedProcedure
    .input(
      z.object({
        reviewerName: z.string().min(1).max(100),
        screenshotBase64: z.string(), // base64-encoded image
        mimeType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if user already has a pending submission
      const pending = await db
        .select({ id: gbpReviewSubmissions.id })
        .from(gbpReviewSubmissions)
        .where(and(
          eq(gbpReviewSubmissions.userId, ctx.user.id),
          eq(gbpReviewSubmissions.status, "pending"),
        ))
        .limit(1);
      if (pending.length) {
        throw new Error("You already have a pending submission. Please wait for it to be reviewed.");
      }

      // Weekly cap: max 3 approved GBP review credits per week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyApproved = await db
        .select({ cnt: sql<number>`COUNT(*)` })
        .from(gbpReviewSubmissions)
        .where(and(
          eq(gbpReviewSubmissions.userId, ctx.user.id),
          eq(gbpReviewSubmissions.status, "approved"),
          gte(gbpReviewSubmissions.reviewedAt, oneWeekAgo),
        ));
      const weeklyCount = Number(weeklyApproved[0]?.cnt ?? 0);
      if (weeklyCount >= 3) {
        throw new Error("You have reached the limit of 3 Google review credits per week. Come back next week!");
      }

      // Upload screenshot to S3
      const buffer = Buffer.from(input.screenshotBase64, "base64");
      const ext = input.mimeType.split("/")[1] || "jpg";
      const key = `gbp-reviews/${ctx.user.id}-${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);

      await db.insert(gbpReviewSubmissions).values({
        userId: ctx.user.id,
        screenshotUrl: url,
        screenshotKey: key,
        reviewerName: input.reviewerName,
        status: "pending",
        creditIssued: false,
      });

      // Notify admin a new GBP review screenshot is waiting for review
      notifyOwner({
        title: "New Google Review Screenshot Submitted",
        content: `Customer **${ctx.user.name ?? ctx.user.email}** (${ctx.user.email}) has submitted a Google Business Profile review screenshot for $1 credit.\n\nReviewer name on screenshot: **${input.reviewerName}**\n\nGo to the Admin panel → GBP Reviews tab to approve or reject.`,
      }).catch((e) => console.error("[Notification] GBP review admin notify failed:", e));

      return { success: true, message: "Screenshot submitted! We'll review it within 24 hours." };
    }),

  // Get current user's submissions
  getMySubmissions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(gbpReviewSubmissions)
      .where(eq(gbpReviewSubmissions.userId, ctx.user.id))
      .orderBy(desc(gbpReviewSubmissions.submittedAt));
  }),

  // Admin: list all submissions
  adminList: adminProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "rejected", "duplicate", "all"]).default("all") }).optional())
    .query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({
        id: gbpReviewSubmissions.id,
        userId: gbpReviewSubmissions.userId,
        reviewerName: gbpReviewSubmissions.reviewerName,
        screenshotUrl: gbpReviewSubmissions.screenshotUrl,
        status: gbpReviewSubmissions.status,
        adminNotes: gbpReviewSubmissions.adminNotes,
        creditIssued: gbpReviewSubmissions.creditIssued,
        submittedAt: gbpReviewSubmissions.submittedAt,
        reviewedAt: gbpReviewSubmissions.reviewedAt,
        userEmail: users.email,
        userName: users.name,
      })
      .from(gbpReviewSubmissions)
      .innerJoin(users, eq(gbpReviewSubmissions.userId, users.id))
      .orderBy(desc(gbpReviewSubmissions.submittedAt));

    if (input?.status && input.status !== "all") {
      return rows.filter(r => r.status === input.status);
    }
    return rows;
  }),

  // Admin: approve submission → issue 100 loyalty points ($1)
  approve: adminProcedure
    .input(z.object({ id: z.number(), adminNotes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const rows = await db
        .select()
        .from(gbpReviewSubmissions)
        .where(eq(gbpReviewSubmissions.id, input.id))
        .limit(1);

      if (rows.length === 0) throw new Error("Submission not found");
      const sub = rows[0];

      if (sub.status !== "pending") throw new Error("Submission is not pending");

      // Issue 100 loyalty points
      await db.insert(loyaltyPoints).values({
        userId: sub.userId,
        points: 100,
        reason: "admin_adjustment",
        note: "Google Business Profile review verified — $1 credit",
      });

      await db
        .update(gbpReviewSubmissions)
        .set({
          status: "approved",
          creditIssued: true,
          adminNotes: input.adminNotes ?? null,
          reviewedAt: new Date(),
        })
        .where(eq(gbpReviewSubmissions.id, input.id));

      // Notify customer their $1 credit is ready
      const [userRow] = await db.select().from(users).where(eq(users.id, sub.userId)).limit(1);
      if (userRow?.email) {
        sendReviewReward({
          to: userRow.email,
          customerName: userRow.name ?? "Valued Customer",
          productName: "Google Business Profile Review",
          creditAmount: 1,
        }).catch((e) => console.error("[Email] Review reward failed:", e));
      }

      return { success: true };
    }),

  // Admin: reject submission
  reject: adminProcedure
    .input(z.object({ id: z.number(), adminNotes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(gbpReviewSubmissions)
        .set({
          status: "rejected",
          adminNotes: input.adminNotes ?? null,
          reviewedAt: new Date(),
        })
        .where(eq(gbpReviewSubmissions.id, input.id));

      return { success: true };
    }),

  // Admin: mark as duplicate
  markDuplicate: adminProcedure
    .input(z.object({ id: z.number(), adminNotes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(gbpReviewSubmissions)
        .set({
          status: "duplicate",
          adminNotes: input.adminNotes ?? null,
          reviewedAt: new Date(),
        })
        .where(eq(gbpReviewSubmissions.id, input.id));

      return { success: true };
    }),
});
