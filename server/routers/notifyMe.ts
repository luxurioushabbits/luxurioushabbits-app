/**
 * Notify Me Router — Luxurious Habbits
 * Captures email leads for Coming Soon product categories (Flower, Extracts).
 * Admin can view all captured leads grouped by category.
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notifyMeLeads } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type { NotifyMeLead } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

export const notifyMeRouter = router({
  // Public: subscribe to be notified when a category drops
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
        category: z.enum(["flower", "extracts", "accessories", "general"]),
      })
    )
    .mutation(async ({ input }) => {
      // Check for duplicate email + category
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existing = await db
        .select()
        .from(notifyMeLeads)
        .where(eq(notifyMeLeads.email, input.email))
        .limit(20);

      const alreadySubscribed = existing.some(
        (r: NotifyMeLead) => r.category === input.category
      );

      if (alreadySubscribed) {
        return { success: true, alreadySubscribed: true };
      }

      await db.insert(notifyMeLeads).values({
        email: input.email,
        category: input.category,
      });

      // Notify owner of new lead
      const categoryLabel =
        input.category === "flower"
          ? "Hemp Flower"
          : input.category === "extracts"
          ? "Extracts"
          : input.category === "accessories"
          ? "Accessories"
          : "General";

      await notifyOwner({
        title: `New Notify Me Lead — ${categoryLabel}`,
        content: `A customer signed up to be notified when ${categoryLabel} products drop.\n\nEmail: ${input.email}\nCategory: ${categoryLabel}`,
      }).catch(() => {}); // non-blocking

      return { success: true, alreadySubscribed: false };
    }),

  // Admin: list all notify-me leads, optionally filtered by category
  list: protectedProcedure
    .input(
      z.object({
        category: z.enum(["flower", "extracts", "accessories", "general", "all"]).default("all"),
      })
    )
    .query(async ({ input, ctx }) => {
      if ((ctx.user as any).role !== "admin") {
        throw new Error("Forbidden");
      }

      const db = await getDb();
      if (!db) return [];

      const rows =
        input.category === "all"
          ? await db
              .select()
              .from(notifyMeLeads)
              .orderBy(desc(notifyMeLeads.createdAt))
          : await db
              .select()
              .from(notifyMeLeads)
              .where(eq(notifyMeLeads.category, input.category))
              .orderBy(desc(notifyMeLeads.createdAt));

      return rows;
    }),
});
