/**
 * Reviews Router — Luxurious Habbits
 * Handles product review submission, moderation, and loyalty reward issuance.
 */
import { z } from "zod";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { productReviews, loyaltyPoints, products, users, orderItems, orders, reviewCredits } from "../../drizzle/schema";

export const reviewsRouter = router({
  // ── Customer: submit a review ──────────────────────────────────────
  submit: protectedProcedure
    .input(z.object({
      productId: z.number().int().positive(),
      rating: z.number().int().min(1).max(5),
      reviewText: z.string().min(10, "Review must be at least 10 characters").max(2000),
      reviewerName: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Check product exists
      const product = await db.select({ id: products.id, name: products.name })
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);
      if (!product.length) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

      // Count how many times user purchased this product (distinct orders)
      const purchaseRows = await db
        .select({ orderId: orderItems.orderId })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(
          eq(orders.userId, ctx.user.id),
          eq(orderItems.productId, input.productId),
        ));
      const purchaseCount = purchaseRows.length;
      if (purchaseCount === 0) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You must purchase this product before leaving a review" });
      }

      // Count how many reviews user has already submitted for this product
      const existingReviews = await db.select({ id: productReviews.id })
        .from(productReviews)
        .where(and(
          eq(productReviews.userId, ctx.user.id),
          eq(productReviews.productId, input.productId),
        ));
      if (existingReviews.length >= purchaseCount) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `You have already reviewed this product ${existingReviews.length} time(s). Purchase it again to leave another review.`,
        });
      }

      await db.insert(productReviews).values({
        userId: ctx.user.id,
        productId: input.productId,
        rating: input.rating,
        reviewText: input.reviewText,
        reviewerName: input.reviewerName ?? ctx.user.name ?? "Anonymous",
        status: "pending",
        rewardIssued: false,
      });

      return { success: true, message: "Review submitted! It will appear after approval." };
    }),

  // ── Public: get approved reviews for a product ─────────────────────
  getForProduct: publicProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { reviews: [], avgRating: 0, count: 0 };
      const reviews = await db.select({
        id: productReviews.id,
        rating: productReviews.rating,
        reviewText: productReviews.reviewText,
        reviewerName: productReviews.reviewerName,
        createdAt: productReviews.createdAt,
      })
        .from(productReviews)
        .where(and(
          eq(productReviews.productId, input.productId),
          eq(productReviews.status, "approved"),
        ))
        .orderBy(desc(productReviews.createdAt));

      const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return { reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length };
    }),

  // ── Admin: list all reviews with optional status filter ────────────
  adminList: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const conditions = input.status !== "all"
        ? [eq(productReviews.status, input.status as "pending" | "approved" | "rejected")]
        : [];

      const rows = await db
        .select({
          id: productReviews.id,
          rating: productReviews.rating,
          reviewText: productReviews.reviewText,
          reviewerName: productReviews.reviewerName,
          status: productReviews.status,
          rejectReason: productReviews.rejectReason,
          rewardIssued: productReviews.rewardIssued,
          createdAt: productReviews.createdAt,
          userId: productReviews.userId,
          productId: productReviews.productId,
          productName: products.name,
          userEmail: users.email,
          userName: users.name,
        })
        .from(productReviews)
        .leftJoin(products, eq(productReviews.productId, products.id))
        .leftJoin(users, eq(productReviews.userId, users.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(productReviews.createdAt));

      return rows;
    }),

  // ── Admin: approve a review + issue $1 loyalty credit ──────────────
  adminApprove: protectedProcedure
    .input(z.object({ reviewId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const review = await db.select()
        .from(productReviews)
        .where(eq(productReviews.id, input.reviewId))
        .limit(1);
      if (!review.length) throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });

      const r = review[0];
      if (r.status === "approved") throw new TRPCError({ code: "CONFLICT", message: "Review already approved" });

      // Mark approved
      await db.update(productReviews)
        .set({ status: "approved", rejectReason: null })
        .where(eq(productReviews.id, input.reviewId));

      // Issue $1 loyalty credit (100 points = $1) if not already issued
      if (!r.rewardIssued) {
        await db.insert(loyaltyPoints).values({
          userId: r.userId,
          points: 100, // 100 pts = $1
          reason: "review_approved",
          reviewId: r.id,
          note: "Review approved — $1 loyalty credit",
        });
        await db.update(productReviews)
          .set({ rewardIssued: true })
          .where(eq(productReviews.id, input.reviewId));
      }

      return { success: true };
    }),

  // ── Admin: reject a review ─────────────────────────────────────────
  adminReject: protectedProcedure
    .input(z.object({
      reviewId: z.number().int().positive(),
      reason: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      await db.update(productReviews)
        .set({ status: "rejected", rejectReason: input.reason ?? null })
        .where(eq(productReviews.id, input.reviewId));

      return { success: true };
    }),

  // ── Customer: get their own submitted reviews ──────────────────────
  myReviews: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select({
      id: productReviews.id,
      rating: productReviews.rating,
      reviewText: productReviews.reviewText,
      status: productReviews.status,
      rewardIssued: productReviews.rewardIssued,
      createdAt: productReviews.createdAt,
      productName: products.name,
      productId: productReviews.productId,
    })
      .from(productReviews)
      .leftJoin(products, eq(productReviews.productId, products.id))
      .where(eq(productReviews.userId, ctx.user.id))
      .orderBy(desc(productReviews.createdAt));
  }),
});
