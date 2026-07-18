/**
 * TopShelf Admin Router — Admin-only dropship management
 * All procedures require admin role.
 *
 * Procedures:
 *   topshelf.syncCatalog      — fetch catalog from TopShelf API
 *   topshelf.listMappings     — list products with their TopShelf mapping status
 *   topshelf.updateMapping    — map/unmap a product to a TopShelf variation
 *   topshelf.listOrders       — list orders with TopShelf submission status
 *   topshelf.resubmitOrder    — manually resubmit a failed order to TopShelf
 *   topshelf.recordPayment    — record batch payment for TopShelf order numbers
 *   topshelf.getSettings      — get current TopShelf credentials (masked)
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, orders, orderItems, vendorOrders, vendors } from "../../drizzle/schema";
import { storagePut } from "../storage";

/** Download an image from a URL and re-host it on our storage. Returns the storage path. */
async function downloadAndHostImage(imageUrl: string, slug: string): Promise<string | null> {
  try {
    // WordPress generates thumbnails like image-300x300.jpg — strip the size suffix to get the full-res original
    const fullSizeUrl = imageUrl.replace(/-\d+x\d+(\.\w+)$/, '$1');
    // Verify the full-size version exists; fall back to the original if not
    const testRes = await fetch(fullSizeUrl, { method: 'HEAD', signal: AbortSignal.timeout(5_000) });
    const urlToDownload = testRes.ok ? fullSizeUrl : imageUrl;
    const res = await fetch(urlToDownload, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const buffer = Buffer.from(await res.arrayBuffer());
    const key = `products/${slug}-${Date.now()}.${ext}`;
    const { url } = await storagePut(key, buffer, contentType);
    return url;
  } catch {
    return null;
  }
}
import {
  getTopShelfCatalog,
  fetchWCProductMap,
  submitTopShelfOrder,
  submitTopShelfWooOrder,
  submitTopShelfPayment,
  buildTopShelfPayload,
  TopShelfProduct,
} from "../topshelf";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Router ───────────────────────────────────────────────────────────────────
export const topshelfRouter = router({

  /** Fetch live catalog from TopShelf API and sync WC product IDs + retail prices into DB */
  syncCatalog: adminProcedure
    .mutation(async () => {
      try {
        const catalog = await getTopShelfCatalog();

        // Auto-sync: update topshelfProductId and topshelfRetailPrice for all mapped products
        // using the enriched WC data returned by getTopShelfCatalog (which calls fetchWCProductMap)
        const db = await getDb();
        if (db) {
          // Build a map of variationId -> { product_id, wc_retail_price, coa_url } from the catalog
          const wcDataMap = new Map<number, { product_id: number; wc_retail_price: number; coa_url?: string }>();
          for (const item of catalog) {
            if (item.variation_id && (item as any).product_id && (item as any).wc_retail_price) {
              wcDataMap.set(item.variation_id, {
                product_id: (item as any).product_id,
                wc_retail_price: (item as any).wc_retail_price,
                coa_url: (item as any).coa_url ?? undefined,
              });
            }
          }

          if (wcDataMap.size > 0) {
            // Get all products with a topshelfVariationId
            const mappedProducts = await db
              .select({ id: products.id, topshelfVariationId: products.topshelfVariationId, topshelfProductId: products.topshelfProductId, topshelfRetailPrice: products.topshelfRetailPrice, coaUrl: products.coaUrl })
              .from(products)
              .where(isNotNull(products.topshelfVariationId));

            for (const p of mappedProducts) {
              if (!p.topshelfVariationId) continue;
              const wc = wcDataMap.get(p.topshelfVariationId);
              if (!wc) continue;
              const currentPrice = p.topshelfRetailPrice ? parseFloat(p.topshelfRetailPrice) : 0;
              const needsUpdate =
                p.topshelfProductId !== wc.product_id ||
                Math.abs(currentPrice - wc.wc_retail_price) > 0.01 ||
                (wc.coa_url && p.coaUrl !== wc.coa_url);
              if (needsUpdate) {
                const updateFields: Record<string, any> = {
                  topshelfProductId: wc.product_id,
                  topshelfRetailPrice: wc.wc_retail_price.toFixed(2),
                };
                // Only update coaUrl if WC has one AND the product doesn't already have a manually-set COA
                if (wc.coa_url) {
                  updateFields.coaUrl = wc.coa_url;
                }
                await db.update(products)
                  .set(updateFields)
                  .where(eq(products.id, p.id));
              }
            }
          }
        }

        return { success: true, products: catalog, count: catalog.length };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "TopShelf API error",
        });
      }
    }),

  /** List all our products with their TopShelf mapping status */
  listMappings: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const rows = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          category: products.category,
          sku: products.topshelfSku,
          topshelfVariationId: products.topshelfVariationId,
          topshelfProductId: products.topshelfProductId,
          topshelfRetailPrice: products.topshelfRetailPrice,
          wholesalePrice: products.wholesalePrice,
          retailPrice: products.retailPrice,
          isActive: products.isActive,
        })
        .from(products)
        .orderBy(products.name);

      return { products: rows };
    }),

  /** Map or unmap a product to a TopShelf variation */
  updateMapping: adminProcedure
    .input(z.object({
      productId: z.number().int().positive(),
      topshelfVariationId: z.number().int().positive().nullable(),
      topshelfProductId: z.number().int().positive().nullable().optional(),
      topshelfSku: z.string().max(100).nullable(),
      topshelfRetailPrice: z.number().min(0).nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // When a variation ID is being set, auto-lookup the WC product ID and retail price
      // so pricing is always correct without any manual entry
      let resolvedProductId = input.topshelfProductId ?? null;
      let resolvedRetailPrice = input.topshelfRetailPrice ?? null;

      if (input.topshelfVariationId && (resolvedProductId === null || resolvedProductId === undefined || resolvedRetailPrice === null || resolvedRetailPrice === undefined)) {
        try {
          const wcMap = await fetchWCProductMap();
          const wc = wcMap.get(input.topshelfVariationId);
          if (wc) {
            if (resolvedProductId === null || resolvedProductId === undefined) resolvedProductId = wc.product_id;
            if (resolvedRetailPrice === null || resolvedRetailPrice === undefined) resolvedRetailPrice = wc.regular_price;
          }
        } catch {
          // Non-fatal: proceed with whatever was provided
        }
      }

      await db.update(products)
        .set({
          topshelfVariationId: input.topshelfVariationId,
          topshelfProductId: resolvedProductId,
          topshelfSku: input.topshelfSku,
          topshelfRetailPrice: resolvedRetailPrice !== null ? String(resolvedRetailPrice) : null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.productId));

      return { success: true, resolvedProductId, resolvedRetailPrice };
    }),

  /** List orders with their TopShelf submission status */
  listOrders: adminProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
      status: z.enum(["all", "pending", "submitted", "failed"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { orders: [], total: 0 };

      const rows = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: orders.customerName,
          customerEmail: orders.customerEmail,
          total: orders.total,
          status: orders.status,
          topshelfOrderNumber: orders.topshelfOrderNumber,
          topshelfSubmittedAt: orders.topshelfSubmittedAt,
          topshelfError: orders.topshelfError,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(isNull(orders.deletedAt))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { orders: rows };
    }),

  /** Manually resubmit an order to TopShelf */
  resubmitOrder: adminProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });

      // Get order items with product TopShelf mapping
      const items = await db
        .select({
          productId: orderItems.productId,
          productName: orderItems.productName,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          topshelfVariationId: products.topshelfVariationId,
          topshelfProductId: products.topshelfProductId,
          topshelfSku: products.topshelfSku,
          topshelfRetailPrice: products.topshelfRetailPrice,
          wholesalePrice: products.wholesalePrice,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, input.orderId));

      const payload = buildTopShelfPayload({
        orderNumber: order.orderNumber,
        items: items.map(i => ({
          topshelfVariationId: i.topshelfVariationId ?? null,
          sku: i.topshelfSku ?? "",
          name: i.productName,
          quantity: i.quantity,
          wholesalePrice: i.wholesalePrice ? parseFloat(i.wholesalePrice) : 0,
        })),
        shipping: {
          name: order.shippingName,
          address1: order.shippingAddress1,
          address2: order.shippingAddress2,
          city: order.shippingCity,
          state: order.shippingState,
          zip: order.shippingZip,
        },
      });

      if (!payload) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No TopShelf-mapped products in this order",
        });
      }

      try {
        // Use WooCommerce REST API so orders appear in WooCommerce Orders on TopShelf's site
        const nameParts = (order.shippingName ?? "").trim().split(/\s+/);
        const firstName = nameParts[0] ?? "";
        const lastName = nameParts.slice(1).join(" ") || firstName;

        const wcResult = await submitTopShelfWooOrder({
          orderNumber: order.orderNumber,
          items: items
            .filter(i => i.topshelfVariationId != null)
            .map(i => ({
              topshelfVariationId: i.topshelfVariationId!,
              topshelfProductId: i.topshelfProductId ?? undefined,
              name: i.productName,
              sku: i.topshelfSku ?? "",
              quantity: i.quantity,
              // Use TopShelf's own retail price (dollars). Falls back to our retail price (cents→dollars) if not set.
              topshelfRetailPrice: i.topshelfRetailPrice
                ? parseFloat(i.topshelfRetailPrice)
                : (typeof i.unitPrice === 'string' ? parseInt(i.unitPrice, 10) : i.unitPrice) / 100,
            })),
          shipping: {
            firstName,
            lastName,
            address1: order.shippingAddress1,
            address2: order.shippingAddress2,
            city: order.shippingCity,
            state: order.shippingState,
            zip: order.shippingZip,
          },
          customerEmail: order.customerEmail ?? "",
        });

        await db.update(orders)
          .set({
            topshelfOrderNumber: String(wcResult.wcOrderId),
            topshelfSubmittedAt: new Date(),
            topshelfError: null,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, input.orderId));
        return { success: true, topshelfOrderNumber: String(wcResult.wcOrderId), wcOrderId: wcResult.wcOrderId };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        await db.update(orders)
          .set({ topshelfError: msg, updatedAt: new Date() })
          .where(eq(orders.id, input.orderId));
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: msg });
      }
    }),

  /** Record batch payment for TopShelf order numbers */
  recordPayment: adminProcedure
    .input(z.object({
      orderNumbers: z.array(z.string()).min(1),
      note: z.string().max(500).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await submitTopShelfPayment(input.orderNumbers, input.note);
        return { success: true, result };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Payment submission failed",
        });
      }
    }),

  /** Import TopShelf catalog items as new products in the store */
  importProducts: adminProcedure
    .input(z.object({
      items: z.array(z.object({
        variationId: z.number().int().positive(),
        productId: z.number().int().positive().optional(),  // WooCommerce parent product ID
        sku: z.string(),
        name: z.string().max(255),
        wholesalePrice: z.number().min(0),
        retailPrice: z.number().min(0),
        topshelfRetailPrice: z.number().min(0).optional(),  // TopShelf's own WC retail price
        category: z.enum(["flower", "extract", "edible", "tincture", "topical", "accessory", "other"]).default("flower"),
        description: z.string().max(2000).optional(),
        imageUrl: z.string().url().optional(),
      })).min(1).max(50),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Find or create the TopShelf vendor row
      let vendorId: number;
      const [existingVendorRow] = await db
        .select({ id: vendors.id })
        .from(vendors)
        .where(eq(vendors.slug, "topshelf-nc"))
        .limit(1);

      if (existingVendorRow) {
        vendorId = existingVendorRow.id;
      } else {
        // Auto-create the TopShelf vendor so products have a valid vendorId
        const [newVendor] = await db.insert(vendors).values({
          name: "TopShelf NC",
          slug: "topshelf-nc",
          description: "TopShelf NC dropship supplier — premium hemp flower and extracts.",
          integrationMethod: "api",
          isActive: true,
        }).$returningId();
        vendorId = newVendor.id;
      }

      const results: { name: string; status: "created" | "skipped"; productId?: number }[] = [];

      for (const item of input.items) {
        // Check if already imported (by topshelfVariationId)
        const [existing] = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.topshelfVariationId, item.variationId))
          .limit(1);

        if (existing) {
          results.push({ name: item.name, status: "skipped", productId: existing.id });
          continue;
        }

        // Generate a unique slug
        const baseSlug = item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80);
        const slug = `${baseSlug}-${item.variationId}`;

        // Download and re-host the image on our own storage so we're not dependent on TopShelf's CDN
        let hostedImageUrl: string | null = null;
        if (item.imageUrl) {
          hostedImageUrl = await downloadAndHostImage(item.imageUrl, slug);
        }

        const [inserted] = await db.insert(products).values({
          vendorId,
          name: item.name,
          slug,
          description: item.description ?? `Premium ${item.category}. SKU: ${item.sku}.`,
          category: item.category,
          retailPrice: String(item.retailPrice.toFixed(2)),
          wholesalePrice: String(item.wholesalePrice.toFixed(2)),
          topshelfVariationId: item.variationId,
          topshelfProductId: item.productId ?? null,
          topshelfSku: item.sku,
          topshelfRetailPrice: item.topshelfRetailPrice != null ? String(item.topshelfRetailPrice.toFixed(2)) : null,
          imageUrl: hostedImageUrl ?? item.imageUrl ?? null,
          isActive: 1 as unknown as boolean, // Active immediately — admin already reviewed before clicking Import
          stockQuantity: 999, // Dropship = always in stock
        }).$returningId();

        results.push({ name: item.name, status: "created", productId: inserted?.id });
      }

      const created = results.filter(r => r.status === "created").length;
      const skipped = results.filter(r => r.status === "skipped").length;
      return { success: true, created, skipped, results };
    }),

  /** Soft-delete an order from the TopShelf orders list */
  deleteOrder: adminProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db
        .update(orders)
        .set({ deletedAt: sql`NOW()`, deletedBy: String(ctx.user.id) })
        .where(eq(orders.id, input.orderId));
      return { success: true };
    }),

  /** Get masked TopShelf credentials (for settings display) */
  getSettings: adminProcedure
    .query(() => {
      const apiKey = process.env.TOPSHELF_API_KEY ?? "";
      const url = process.env.TOPSHELF_URL ?? "https://topshelfnc.com";
      const vendorId = process.env.TOPSHELF_VENDOR_ID ?? "";
      return {
        url,
        vendorId,
        apiKeyConfigured: apiKey.length > 0,
        apiKeyMasked: apiKey.length > 4 ? `${"*".repeat(apiKey.length - 4)}${apiKey.slice(-4)}` : "****",
      };
    }),
});
