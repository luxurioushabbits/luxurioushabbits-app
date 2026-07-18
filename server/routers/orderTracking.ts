import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { orders, orderStatusHistory } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const orderTrackingRouter = router({
  // Get order status + history for a customer
  getOrderStatus: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);
      if (!order.length) throw new Error("Order not found");
      // Only allow the order owner or admin
      if (order[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Forbidden");
      }
      const history = await db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, input.orderId))
        .orderBy(desc(orderStatusHistory.createdAt));
      return { order: order[0], history };
    }),

  // Admin: update order tracking info and add status event
  adminUpdateTracking: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.string(),
        trackingNumber: z.string().optional(),
        trackingCarrier: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Update order tracking fields
      await db
        .update(orders)
        .set({
          status: input.status as any,
          ...(input.trackingNumber !== undefined && { trackingNumber: input.trackingNumber }),
          ...(input.trackingCarrier !== undefined && { trackingCarrier: input.trackingCarrier }),
        })
        .where(eq(orders.id, input.orderId));
      // Add status history event
      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        status: input.status,
        note: input.note,
      });
      return { success: true };
    }),

  // Admin: get all status history for an order
  adminGetHistory: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, input.orderId))
        .orderBy(desc(orderStatusHistory.createdAt));
    }),
});
