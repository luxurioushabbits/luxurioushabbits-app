/**
 * Terpenes Router — Luxurious Habbits
 * Public: fetch products by terpene slug
 * Admin: save terpene tags for a product (called after COA parse)
 */
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { productTerpenes, products, vendors } from "../../drizzle/schema";

export const terpenesRouter = router({
  // Public: get all active products that contain a given terpene slug
  getProductsByTerpene: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select({
          product: products,
          vendor: vendors,
          terpeneSlug: productTerpenes.terpeneSlug,
          percentage: productTerpenes.percentage,
        })
        .from(productTerpenes)
        .innerJoin(products, eq(productTerpenes.productId, products.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(
          and(
            eq(productTerpenes.terpeneSlug, input.slug),
            eq(products.isActive, true)
          )
        )
        .orderBy(products.name);

      return rows;
    }),

  // Admin: save terpene tags for a product (replaces existing tags for that product)
  saveTerpenes: protectedProcedure
    .input(
      z.object({
        productId: z.number().int().positive(),
        terpenes: z.array(
          z.object({
            slug: z.string(),
            name: z.string(),
            percentage: z.string().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Delete existing terpene tags for this product
      await db
        .delete(productTerpenes)
        .where(eq(productTerpenes.productId, input.productId));

      // Insert new terpene tags (only those with a detected percentage)
      const detected = input.terpenes.filter(t => t.percentage !== null && t.percentage !== "0" && parseFloat(t.percentage ?? "0") > 0);

      if (detected.length > 0) {
        await db.insert(productTerpenes).values(
          detected.map(t => ({
            productId: input.productId,
            terpeneSlug: t.slug,
            terpeneName: t.name,
            percentage: t.percentage ?? null,
          }))
        );
      }

      return { success: true, tagged: detected.length };
    }),

  // Admin: get terpene tags for a product
  getProductTerpenes: publicProcedure
    .input(z.object({ productId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(productTerpenes)
        .where(eq(productTerpenes.productId, input.productId))
        .orderBy(desc(productTerpenes.percentage));
    }),
});
