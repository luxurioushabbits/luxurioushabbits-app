/**
 * Restock Notifications Router — Luxurious Habbits
 * Customers can sign up to be notified when an out-of-stock product is back.
 * Admin can trigger notifications and view all pending requests.
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { restockNotifications, products } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendRestockNotification } from "../email";

export const restockNotificationsRouter = router({
  // Public: subscribe to restock alert for a specific product
  subscribe: publicProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        email: z.string().email("Please enter a valid email address"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check for duplicate
      const existing = await db
        .select()
        .from(restockNotifications)
        .where(
          and(
            eq(restockNotifications.productId, input.productId),
            eq(restockNotifications.email, input.email)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, alreadySubscribed: true };
      }

      await db.insert(restockNotifications).values({
        productId: input.productId,
        email: input.email,
      });

      return { success: true, alreadySubscribed: false };
    }),

  // Admin: send restock notification to all subscribers for a product
  notifySubscribers: protectedProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      if ((ctx.user as any).role !== "admin") throw new Error("Forbidden");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get product info
      const [product] = await db
        .select({ name: products.name, slug: products.slug })
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product) throw new Error("Product not found");

      // Get all pending subscribers
      const subs = await db
        .select()
        .from(restockNotifications)
        .where(
          and(
            eq(restockNotifications.productId, input.productId),
            eq(restockNotifications.notified, false)
          )
        );

      let sent = 0;
      for (const sub of subs) {
        await sendRestockNotification({
          to: sub.email,
          productName: product.name,
          productUrl: `/products/${product.slug}`,
        }).catch((e: unknown) => console.error("[Email] Restock notification failed:", e));

        // Mark as notified
        await db
          .update(restockNotifications)
          .set({ notified: true })
          .where(eq(restockNotifications.id, sub.id));

        sent++;
      }

      // Mark product as back in stock
      await db
        .update(products)
        .set({ isOutOfStock: false })
        .where(eq(products.id, input.productId));

      return { success: true, sent, total: subs.length };
    }),

  // Admin: list all pending restock notification requests
  listPending: protectedProcedure
    .input(z.object({ productId: z.number().int().positive().optional() }))
    .query(async ({ input, ctx }) => {
      if ((ctx.user as any).role !== "admin") throw new Error("Forbidden");

      const db = await getDb();
      if (!db) return [];

      const query = db
        .select({
          id: restockNotifications.id,
          productId: restockNotifications.productId,
          email: restockNotifications.email,
          notified: restockNotifications.notified,
          createdAt: restockNotifications.createdAt,
          productName: products.name,
        })
        .from(restockNotifications)
        .innerJoin(products, eq(restockNotifications.productId, products.id))
        .where(eq(restockNotifications.notified, false));

      return query;
    }),
});
