/**
 * Crowdship Admin Router — Live API Integration
 * Uses the Crowdship REST API (api.crowdship.io/api/v1) with X-CROWDSHIP-KEY + X-CROWDSHIP-SECRET.
 * Provides:
 *   - Live catalog browse from Crowdship (GET /inventory/products)
 *   - One-click product import into our DB
 *   - Auto order submission to Crowdship (POST /orders)
 *   - Order status monitoring
 *   - Settings / connection status
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { desc, eq, inArray, isNotNull } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, orders, orderItems, vendorOrders, vendors } from "../../drizzle/schema";
import {
  fetchCrowdshipProducts,
  fetchCrowdshipProduct,
  submitCrowdshipOrders,
  fetchCrowdshipPurchaseOrders,
  isCrowdshipConfigured,
} from "../crowdshipApi";
import { storagePut } from "../storage";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Router ───────────────────────────────────────────────────────────────────
export const crowdshipRouter = router({

  /**
   * Browse live Crowdship catalog (calls GET /inventory/products).
   * Returns products with their variants so admin can pick what to import.
   */
  browseCatalog: adminProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(250).default(50),
      offset: z.number().int().min(0).default(0),
      supplierId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      if (!isCrowdshipConfigured()) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Crowdship API credentials not configured." });
      }
      const data = await fetchCrowdshipProducts({
        limit: input.limit,
        offset: input.offset,
        supplier_id: input.supplierId,
      });
      return data;
    }),

  /**
   * Get a single Crowdship product with all variants.
   */
  getProduct: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      if (!isCrowdshipConfigured()) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Crowdship API credentials not configured." });
      }
      const product = await fetchCrowdshipProduct(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found in Crowdship catalog." });
      return product;
    }),

  /**
   * Import selected Crowdship variants into our product catalog.
   * Admin picks variants from the live catalog and clicks Import.
   * ⚠️ Blocks import of variants with 0 stock.
   */
  importProducts: adminProcedure
    .input(z.object({
      items: z.array(z.object({
        variantId: z.string().min(1).max(100),
        sku: z.string().min(1).max(100),
        supplierId: z.string().min(1).max(100),
        name: z.string().min(1).max(255),
        wholesalePrice: z.number().min(0),
        retailPrice: z.number().min(0),
        stock: z.number().int().min(0).default(0),
        category: z.enum(["flower", "extract", "edible", "tincture", "topical", "accessory", "other"]).default("other"),
        description: z.string().max(5000).optional(),
        imageUrl: z.string().url().optional(),
        variationLabel: z.string().max(50).optional(),
      })).min(1).max(50),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Find or create the Crowdship vendor row
      let vendorId: number;
      const [existingVendor] = await db
        .select({ id: vendors.id })
        .from(vendors)
        .where(eq(vendors.slug, "crowdship"))
        .limit(1);

      if (existingVendor) {
        vendorId = existingVendor.id;
      } else {
        const [newVendor] = await db.insert(vendors).values({
          name: "Crowdship",
          slug: "crowdship",
          description: "Crowdship dropship marketplace — multiple hemp suppliers.",
          websiteUrl: "https://app.crowdship.io",
          integrationMethod: "api",
          isActive: true,
        }).$returningId();
        vendorId = newVendor.id;
      }

      const results: { name: string; status: "created" | "skipped" | "blocked_no_stock"; productId?: number; reason?: string }[] = [];

      for (const item of input.items) {
        // ── Stock guard: refuse to import out-of-stock variants ──────────────
        if (item.stock <= 0) {
          results.push({
            name: item.name,
            status: "blocked_no_stock",
            reason: `Variant ${item.sku} has 0 stock on Crowdship and cannot be imported.`,
          });
          continue;
        }

        // Check if already imported (by crowdshipVariantId)
        const [existing] = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.crowdshipVariantId, item.variantId))
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
        const slug = `${baseSlug}-cs-${item.variantId.slice(0, 8)}`;

        // ── Download and host the product image ─────────────────────────────
        let hostedImageUrl: string | null = null;
        if (item.imageUrl) {
          try {
            const imgRes = await fetch(item.imageUrl, { signal: AbortSignal.timeout(15_000) });
            if (imgRes.ok) {
              const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
              const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
              const buffer = Buffer.from(await imgRes.arrayBuffer());
              const { url } = await storagePut(`products/${slug}.${ext}`, buffer, contentType);
              hostedImageUrl = url;
            }
          } catch {
            // Image hosting failed — product still imports, just without image
          }
        }

        const [inserted] = await db.insert(products).values({
          vendorId,
          name: item.name,
          slug,
          description: item.description ?? `Premium product via Crowdship. SKU: ${item.sku}.`,
          category: item.category,
          retailPrice: String(item.retailPrice.toFixed(2)),
          wholesalePrice: String(item.wholesalePrice.toFixed(2)),
          crowdshipVariantId: item.variantId,
          crowdshipSku: item.sku,
          crowdshipSupplierId: item.supplierId,
          imageUrl: hostedImageUrl ?? item.imageUrl ?? null,
          variationLabel: item.variationLabel ?? null,
          isActive: 1 as unknown as boolean,
          stockQuantity: item.stock > 0 ? item.stock : 999,
        }).$returningId();

        results.push({ name: item.name, status: "created", productId: inserted?.id });
      }

      const created = results.filter(r => r.status === "created").length;
      const skipped = results.filter(r => r.status === "skipped").length;
      const blocked = results.filter(r => r.status === "blocked_no_stock").length;
      if (blocked > 0 && created === 0 && skipped === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: results.map(r => r.reason).filter(Boolean).join(" ") ||
            "All selected variants are out of stock on Crowdship and cannot be imported.",
        });
      }
      return { success: true, created, skipped, blocked, results };
    }),

  /**
   * List orders that contain Crowdship products and haven't been submitted yet.
   */
  listPendingOrders: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const crowdshipProducts = await db
        .select({ id: products.id, name: products.name, crowdshipSku: products.crowdshipSku, crowdshipVariantId: products.crowdshipVariantId, crowdshipSupplierId: products.crowdshipSupplierId })
        .from(products)
        .where(isNotNull(products.crowdshipVariantId));

      if (crowdshipProducts.length === 0) return [];

      const crowdshipProductIds = crowdshipProducts.map(p => p.id);

      const csOrderItems = await db
        .select({ orderId: orderItems.orderId, productId: orderItems.productId, productName: orderItems.productName, quantity: orderItems.quantity, unitPrice: orderItems.unitPrice })
        .from(orderItems)
        .where(inArray(orderItems.productId, crowdshipProductIds));

      if (csOrderItems.length === 0) return [];

      const orderIds = Array.from(new Set(csOrderItems.map(i => i.orderId)));

      const orderRows = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: orders.customerName,
          customerEmail: orders.customerEmail,
          shippingName: orders.shippingName,
          shippingAddress1: orders.shippingAddress1,
          shippingAddress2: orders.shippingAddress2,
          shippingCity: orders.shippingCity,
          shippingState: orders.shippingState,
          shippingZip: orders.shippingZip,
          status: orders.status,
          total: orders.total,
          crowdshipOrderId: orders.crowdshipOrderId,
          crowdshipSubmittedAt: orders.crowdshipSubmittedAt,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(inArray(orders.id, orderIds))
        .orderBy(desc(orders.createdAt));

      return orderRows.map(order => ({
        ...order,
        items: csOrderItems
          .filter(i => i.orderId === order.id)
          .map(i => {
            const product = crowdshipProducts.find(p => p.id === i.productId);
            return {
              ...i,
              crowdshipSku: product?.crowdshipSku ?? null,
              crowdshipVariantId: product?.crowdshipVariantId ?? null,
              crowdshipSupplierId: product?.crowdshipSupplierId ?? null,
            };
          }),
      }));
    }),

  /**
   * Auto-submit an order to Crowdship via the live API (POST /orders).
   */
  submitOrder: adminProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      if (!isCrowdshipConfigured()) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Crowdship API credentials not configured." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Fetch the order
      const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      if (order.crowdshipSubmittedAt) {
        throw new TRPCError({ code: "CONFLICT", message: "Order already submitted to Crowdship." });
      }

      // Fetch order items that are Crowdship products
      const csProducts = await db
        .select({ id: products.id, crowdshipSku: products.crowdshipSku })
        .from(products)
        .where(isNotNull(products.crowdshipSku));

      const csProductIds = new Set(csProducts.map(p => p.id));
      const skuMap = new Map(csProducts.map(p => [p.id, p.crowdshipSku!]));

      const items = await db
        .select({ productId: orderItems.productId, quantity: orderItems.quantity, unitPrice: orderItems.unitPrice })
        .from(orderItems)
        .where(eq(orderItems.orderId, input.orderId));

      const csLineItems = items
        .filter(i => i.productId && csProductIds.has(i.productId))
        .map(i => ({
          sku: skuMap.get(i.productId!)!,
          quantity: String(i.quantity),
          price: String(parseFloat(i.unitPrice ?? "0").toFixed(2)),
        }));

      if (csLineItems.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No Crowdship products found in this order." });
      }

      // Build the Crowdship order payload
      const nameParts = (order.shippingName ?? order.customerName ?? "").trim().split(" ");
      const firstName = nameParts[0] ?? "Customer";
      const lastName = nameParts.slice(1).join(" ") || "N/A";

      const crowdshipPayload = {
        order_name: order.orderNumber,
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: order.customerEmail,
        },
        shipping: {
          address1: order.shippingAddress1 ?? "",
          address2: order.shippingAddress2 ?? undefined,
          city: order.shippingCity ?? "",
          state: order.shippingState ?? "",
          zip: order.shippingZip ?? "",
          country: "US",
          phone: order.customerPhone ?? undefined,
        },
        line_items: csLineItems,
        note: `Luxurious Habbits Dropship Order: #${order.orderNumber}`,
      };

      const result = await submitCrowdshipOrders([crowdshipPayload]);

      // Store the monitoring URL and mark as submitted
      const monitoringUrl = result.monitoringUrl ?? null;
      await db.update(orders)
        .set({
          crowdshipOrderId: monitoringUrl ?? "submitted",
          crowdshipSubmittedAt: new Date(),
          status: "processing",
        })
        .where(eq(orders.id, input.orderId));

      return { success: true, message: result.message, monitoringUrl, details: result.details };
    }),

  /**
   * Mark an order as manually submitted (fallback if auto-submit fails).
   */
  markSubmitted: adminProcedure
    .input(z.object({
      orderId: z.number().int().positive(),
      crowdshipOrderId: z.string().max(200).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      await db.update(orders)
        .set({
          crowdshipOrderId: input.crowdshipOrderId ?? "manual",
          crowdshipSubmittedAt: new Date(),
          status: "processing",
        })
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  /**
   * List all Crowdship products in our catalog.
   */
  listProducts: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      return db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          category: products.category,
          retailPrice: products.retailPrice,
          wholesalePrice: products.wholesalePrice,
          imageUrl: products.imageUrl,
          isActive: products.isActive,
          crowdshipVariantId: products.crowdshipVariantId,
          crowdshipSku: products.crowdshipSku,
          crowdshipSupplierId: products.crowdshipSupplierId,
          createdAt: products.createdAt,
        })
        .from(products)
        .where(isNotNull(products.crowdshipVariantId))
        .orderBy(desc(products.createdAt));
    }),

  /**
   * Fetch purchase orders from Crowdship (for tracking submitted orders).
   */
  listPurchaseOrders: adminProcedure
    .query(async () => {
      if (!isCrowdshipConfigured()) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Crowdship API credentials not configured." });
      }
      return fetchCrowdshipPurchaseOrders();
    }),

  /**
   * Get Crowdship settings / connection status.
   */
  getSettings: adminProcedure
    .query(() => {
      const apiKey = process.env.CROWDSHIP_API_KEY ?? "";
      const secretKey = process.env.CROWDSHIP_SECRET_KEY ?? "";
      return {
        apiKeyConfigured: apiKey.length > 0,
        secretKeyConfigured: secretKey.length > 0,
        apiKeyMasked: apiKey.length > 4 ? `${"*".repeat(apiKey.length - 4)}${apiKey.slice(-4)}` : "****",
        isFullyConfigured: apiKey.length > 0 && secretKey.length > 0,
        dashboardUrl: "https://app.crowdship.io",
        note: "Crowdship API is connected. You can browse the live catalog and auto-submit orders.",
      };
    }),
});
