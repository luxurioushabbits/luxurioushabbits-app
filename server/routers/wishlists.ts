/**
 * Wishlists Router — Luxurious Habbits
 * Add/remove products from wishlist, list wishlist items.
 */
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { wishlists, products } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";

export const wishlistsRouter = router({
  // Get current user's wishlist with product details
  getMyWishlist: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({
        id: wishlists.id,
        productId: wishlists.productId,
        addedAt: wishlists.addedAt,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          retailPrice: products.retailPrice,
          imageUrl: products.imageUrl,
          category: products.category,
          isActive: products.isActive,
          thcaPercent: products.thcaPercent,
        },
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, ctx.user.id))
      .orderBy(wishlists.addedAt);

    return rows;
  }),

  // Check if a specific product is wishlisted
  isWishlisted: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { wishlisted: false };

      const rows = await db
        .select()
        .from(wishlists)
        .where(and(eq(wishlists.userId, ctx.user.id), eq(wishlists.productId, input.productId)))
        .limit(1);

      return { wishlisted: rows.length > 0 };
    }),

  // Toggle wishlist (add if not present, remove if present)
  toggle: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { wishlisted: false };

      const existing = await db
        .select()
        .from(wishlists)
        .where(and(eq(wishlists.userId, ctx.user.id), eq(wishlists.productId, input.productId)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .delete(wishlists)
          .where(and(eq(wishlists.userId, ctx.user.id), eq(wishlists.productId, input.productId)));
        return { wishlisted: false };
      } else {
        await db.insert(wishlists).values({
          userId: ctx.user.id,
          productId: input.productId,
        });
        return { wishlisted: true };
      }
    }),

  // Remove from wishlist
  remove: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .delete(wishlists)
        .where(and(eq(wishlists.userId, ctx.user.id), eq(wishlists.productId, input.productId)));

      return { success: true };
    }),
});
