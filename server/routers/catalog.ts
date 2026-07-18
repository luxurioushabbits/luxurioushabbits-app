/**
 * Catalog Router — Public product browsing
 */
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNotNull, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { productImages, productTerpenes, products, vendors } from "../../drizzle/schema";

export const catalogRouter = router({
  // List all active products with optional filters
  list: publicProcedure
    .input(
      z
        .object({
          category: z.enum(["flower", "extract", "edible", "tincture", "topical", "accessory", "other"]).optional(),
          strainType: z.enum(["indica", "sativa", "hybrid"]).optional(),
          vendorSlug: z.string().optional(),
          featured: z.boolean().optional(),
          search: z.string().optional(),
          limit: z.number().default(24),
          offset: z.number().default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { products: [], total: 0 };

      const conditions = [eq(products.isActive, true), isNotNull(products.imageUrl)];

      if (input?.category) conditions.push(eq(products.category, input.category));
      if (input?.strainType) conditions.push(eq(products.strainType, input.strainType));
      if (input?.featured) conditions.push(eq(products.isFeatured, true));
      if (input?.search) {
        const searchCondition = or(
          like(products.name, `%${input.search}%`),
          like(products.description, `%${input.search}%`),
          like(products.tagline, `%${input.search}%`)
        );
        if (searchCondition) conditions.push(searchCondition);
      }

      let query = db
        .select({ product: products, vendor: vendors })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(...conditions))
        .orderBy(desc(products.isFeatured), desc(products.createdAt))
        .limit(input?.limit ?? 24)
        .offset(input?.offset ?? 0);

      if (input?.vendorSlug) {
        query = db
          .select({ product: products, vendor: vendors })
          .from(products)
          .leftJoin(vendors, eq(products.vendorId, vendors.id))
          .where(and(...conditions, eq(vendors.slug, input.vendorSlug)))
          .orderBy(desc(products.isFeatured), desc(products.createdAt))
          .limit(input?.limit ?? 24)
          .offset(input?.offset ?? 0);
      }

      const result = await query;

      // Batch-fetch top 5 terpenes per product
      let terpenesByProduct: Record<number, { terpeneName: string; terpeneSlug: string; percentage: string | null }[]> = {};
      if (result.length > 0) {
        const productIds = result.map(r => r.product.id);
        const terpeneRows = await db
          .select({
            productId: productTerpenes.productId,
            terpeneName: productTerpenes.terpeneName,
            terpeneSlug: productTerpenes.terpeneSlug,
            percentage: productTerpenes.percentage,
          })
          .from(productTerpenes)
          .where(inArray(productTerpenes.productId, productIds))
          .orderBy(desc(productTerpenes.percentage));

        for (const t of terpeneRows) {
          if (!terpenesByProduct[t.productId]) terpenesByProduct[t.productId] = [];
          if (terpenesByProduct[t.productId].length < 5) {
            terpenesByProduct[t.productId].push({
              terpeneName: t.terpeneName,
              terpeneSlug: t.terpeneSlug,
              percentage: t.percentage,
            });
          }
        }
      }

      return {
        products: result.map(r => ({
          ...r,
          terpenes: terpenesByProduct[r.product.id] ?? [],
        })),
        total: result.length,
      };
    }),

  // Get all active products that have a COA uploaded, with their terpene data
  getCOAs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        imageUrl: products.imageUrl,
        category: products.category,
        strainType: products.strainType,
        thcaPercent: products.thcaPercent,
        coaUrl: products.coaUrl,
        variationLabel: products.variationLabel,
      })
      .from(products)
      .where(and(eq(products.isActive, true), isNotNull(products.coaUrl)))
      .orderBy(products.category, products.name);

    // Fetch terpenes for all returned products in one query
    if (!result.length) return [];
    const productIds = result.map(p => p.id);
    const terpeneRows = await db
      .select()
      .from(productTerpenes)
      .where(inArray(productTerpenes.productId, productIds))
      .orderBy(desc(productTerpenes.percentage));

    // Group terpenes by productId
    const terpeneMap = new Map<number, typeof terpeneRows>();
    for (const t of terpeneRows) {
      if (!terpeneMap.has(t.productId)) terpeneMap.set(t.productId, []);
      terpeneMap.get(t.productId)!.push(t);
    }

    return result.map(p => ({
      ...p,
      terpenes: (terpeneMap.get(p.id) ?? []).slice(0, 5), // top 5 by percentage
    }));
  }),

  // Get a single product by slug
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const result = await db
        .select({ product: products, vendor: vendors })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(eq(products.slug, input.slug), eq(products.isActive, true)))
        .limit(1);

      if (!result.length) throw new TRPCError({ code: "NOT_FOUND" });

      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, result[0].product.id));

      // Fetch sibling variations — products that share the same parentProductId
      // The parent itself is the product with no parentProductId but whose id is referenced by others
      const currentProduct = result[0].product;
      let variations: typeof products.$inferSelect[] = [];

      if (currentProduct.parentProductId) {
        // This is a child variation — fetch all siblings (same parent) + the parent itself
        const siblings = await db
          .select()
          .from(products)
          .where(and(
            eq(products.parentProductId, currentProduct.parentProductId),
            eq(products.isActive, true)
          ))
          .orderBy(products.sortOrder, products.id);
        const parent = await db
          .select()
          .from(products)
          .where(and(eq(products.id, currentProduct.parentProductId), eq(products.isActive, true)))
          .limit(1);
        variations = [...parent, ...siblings];
      } else {
        // This is a parent (or standalone) — fetch all children
        const children = await db
          .select()
          .from(products)
          .where(and(
            eq(products.parentProductId, currentProduct.id),
            eq(products.isActive, true)
          ))
          .orderBy(products.sortOrder, products.id);
        if (children.length > 0) {
          // Include the parent itself as the first variation
          variations = [currentProduct, ...children];
        }
      }

      return { ...result[0], images, variations };
    }),

  // Get all active vendors for brand pages
  vendors: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(vendors).where(eq(vendors.isActive, true)).orderBy(vendors.name);
  }),

  // Get related products by strain type (for upsell at checkout)
  getRelated: publicProcedure
    .input(z.object({
      strainType: z.enum(["indica", "sativa", "hybrid"]).optional(),
      excludeProductIds: z.array(z.number()).default([]),
      limit: z.number().default(3),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(products.isActive, true)];
      if (input.strainType) conditions.push(eq(products.strainType, input.strainType));

      const result = await db
        .select({ product: products, vendor: vendors })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(...conditions))
        .orderBy(desc(products.isFeatured), desc(products.createdAt))
        .limit(input.limit + input.excludeProductIds.length + 5);

      // Filter out excluded product IDs client-side
      const filtered = result.filter(r => !input.excludeProductIds.includes(r.product.id));
      return filtered.slice(0, input.limit);
    }),

  // Get related products by shared terpene slugs (for strain review blog posts)
  // Only returns isActive=true products — toggling a product off removes it from recommendations
  getRelatedByTerpenes: publicProcedure
    .input(z.object({
      terpeneslugs: z.array(z.string()).min(1).max(10),
      excludeProductIds: z.array(z.number()).default([]),
      limit: z.number().default(4),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // Find all active products that have at least one matching terpene slug
      const matches = await db
        .select({
          productId: productTerpenes.productId,
          matchCount: sql<number>`COUNT(DISTINCT ${productTerpenes.terpeneSlug})`,
        })
        .from(productTerpenes)
        .innerJoin(products, and(
          eq(productTerpenes.productId, products.id),
          eq(products.isActive, true)
        ))
        // Never recommend accessories in strain review blocks — only flower/extract/edible/tincture/topical
        .where(and(
          inArray(productTerpenes.terpeneSlug, input.terpeneslugs),
          sql`${products.category} != 'accessory'`
        ))
        .groupBy(productTerpenes.productId)
        .orderBy(sql`COUNT(DISTINCT ${productTerpenes.terpeneSlug}) DESC`)
        .limit(input.limit + input.excludeProductIds.length + 5);

      if (!matches.length) return [];

      // Filter out excluded IDs
      const eligibleIds = matches
        .map(m => m.productId)
        .filter(id => !input.excludeProductIds.includes(id))
        .slice(0, input.limit);

      if (!eligibleIds.length) return [];

      // Fetch full product + vendor data for the matched IDs
      const result = await db
        .select({ product: products, vendor: vendors })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(and(eq(products.isActive, true), inArray(products.id, eligibleIds)));

      // Re-sort by original match order (most matching terpenes first)
      const order = eligibleIds;
      result.sort((a, b) => order.indexOf(a.product.id) - order.indexOf(b.product.id));

      // Attach matchCount to each result
      const matchMap = new Map(matches.map(m => [m.productId, m.matchCount]));
      return result.map(r => ({
        ...r,
        matchCount: matchMap.get(r.product.id) ?? 0,
      }));
    }),

  // Get featured products for homepage
  featured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const result = await db
      .select({ product: products, vendor: vendors })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .orderBy(desc(products.createdAt))
      .limit(8);
    return result;
  }),
});
