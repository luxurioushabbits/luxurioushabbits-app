/**
 * Admin Router — Product, Vendor, Order, and Subscription management
 * All procedures require admin role
 */
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import { sendShippingNotification, sendReviewRequest, sendRestockAlert } from "../email";
import { notifyProductIndexed, notifyIndexNow } from "../indexNow";
import { notifyGoogleProduct, notifyGoogleIndexingBulk } from "../googleIndexing";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  customerSubscriptions,
  emailCaptures,
  habbitsBoxContents,
  loyaltyPoints,
  notifyMeLeads,
  orderItems,
  orders,
  productImages,
  productReviews,
  productTags,
  productTerpenes,
  productQuestions,
  products,
  referrals,
  restockNotifications,
  reviewCredits,
  subscriptionPlans,
  vendorOrders,
  vendors,
  wishlists,
} from "../../drizzle/schema";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ─── VENDORS ───────────────────────────────────────────────────────────────
  vendors: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(vendors).orderBy(vendors.name);
    }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const result = await db.select().from(vendors).where(eq(vendors.id, input.id)).limit(1);
        if (!result.length) throw new TRPCError({ code: "NOT_FOUND" });
        return result[0];
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          slug: z.string().min(1).max(255),
          description: z.string().optional(),
          logoUrl: z.string().optional(),
          websiteUrl: z.string().optional(),
          contactEmail: z.string().email().optional(),
          contactName: z.string().optional(),
          integrationMethod: z.enum(["email", "api", "manual"]).default("email"),
          apiEndpoint: z.string().optional(),
          apiKey: z.string().optional(),
          orderEmail: z.string().email().optional(),
          commissionRate: z.string().optional(),
          isActive: z.boolean().default(true),
          hideVendor: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(vendors).values(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          slug: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          logoUrl: z.string().optional(),
          websiteUrl: z.string().optional(),
          contactEmail: z.string().email().optional(),
          contactName: z.string().optional(),
          integrationMethod: z.enum(["email", "api", "manual"]).optional(),
          apiEndpoint: z.string().optional(),
          apiKey: z.string().optional(),
          orderEmail: z.string().email().optional(),
          commissionRate: z.string().optional(),
          isActive: z.boolean().optional(),
          hideVendor: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...data } = input;
        await db.update(vendors).set(data).where(eq(vendors.id, id));
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(vendors).set({ isActive: false }).where(eq(vendors.id, input.id));
        return { success: true };
      }),
  }),

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────
  products: router({
    list: adminProcedure
      .input(z.object({ search: z.string().optional(), vendorId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const conditions = [];
        if (input?.vendorId) conditions.push(eq(products.vendorId, input.vendorId));
        if (input?.search) {
          conditions.push(
            or(
              like(products.name, `%${input.search}%`),
              like(products.description, `%${input.search}%`)
            )
          );
        }
        const query = db
          .select({ product: products, vendor: vendors })
          .from(products)
          .leftJoin(vendors, eq(products.vendorId, vendors.id))
          .orderBy(desc(products.createdAt));
        if (conditions.length) {
          return query.where(and(...conditions));
        }
        return query;
      }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const result = await db
          .select({ product: products, vendor: vendors })
          .from(products)
          .leftJoin(vendors, eq(products.vendorId, vendors.id))
          .where(eq(products.id, input.id))
          .limit(1);
        if (!result.length) throw new TRPCError({ code: "NOT_FOUND" });
        const images = await db.select().from(productImages).where(eq(productImages.productId, input.id));
        const currentProduct = result[0].product;
        // Fetch sibling variations for the inline price manager
        let siblingVariations: typeof products.$inferSelect[] = [];
        const parentId = currentProduct.parentProductId ?? (currentProduct.id);
        // If this product is a parent or child, fetch all variations in the group
        const children = await db.select().from(products)
          .where(eq(products.parentProductId, parentId));
        if (children.length > 0) {
          // This is a parent — fetch parent + all children
          const parent = await db.select().from(products).where(eq(products.id, parentId)).limit(1);
          siblingVariations = [...parent, ...children];
        } else if (currentProduct.parentProductId) {
          // This is a child — fetch parent + all siblings
          const parent = await db.select().from(products).where(eq(products.id, currentProduct.parentProductId)).limit(1);
          const siblings = await db.select().from(products).where(eq(products.parentProductId, currentProduct.parentProductId));
          siblingVariations = [...parent, ...siblings];
        }
        return { ...result[0], images, siblingVariations };
      }),

    create: adminProcedure
      .input(
        z.object({
          vendorId: z.number(),
          name: z.string().min(1).max(255),
          slug: z.string().min(1).max(255),
          description: z.string().optional(),
          tagline: z.string().max(255).optional(),
          category: z.enum(["flower", "extract", "edible", "tincture", "topical", "accessory", "other"]).default("flower"),
          strainType: z.enum(["indica", "sativa", "hybrid"]).optional(),
          thcaPercent: z.string().optional(),
          cbdPercent: z.string().optional(),
          terpenes: z.string().optional(),
          effectTags: z.string().optional(),
          genetics: z.string().max(255).optional(),
          cultivation: z.string().max(255).optional(),
          weightGrams: z.string().optional(),
          retailPrice: z.string(),
          wholesalePrice: z.string().optional(),
          imageUrl: z.string().optional(),
          coaUrl: z.string().optional(),
          coaLab: z.string().optional(),
          coaBatch: z.string().optional(),
          isFeatured: z.boolean().default(false),
          isActive: z.boolean().default(true),
          metaDescription: z.string().optional(),
          variationLabel: z.string().max(100).optional(),
          parentProductId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(products).values(input);
        // Ping search engines immediately after product creation
        notifyProductIndexed(input.slug).catch(() => {});
        notifyGoogleProduct(input.slug).catch(() => {});
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          vendorId: z.number().optional(),
          name: z.string().min(1).max(255).optional(),
          slug: z.string().min(1).max(255).optional(),
          description: z.string().optional(),
          tagline: z.string().max(255).optional(),
          category: z.enum(["flower", "extract", "edible", "tincture", "topical", "accessory", "other"]).optional(),
          strainType: z.enum(["indica", "sativa", "hybrid"]).optional(),
          thcaPercent: z.string().optional(),
          cbdPercent: z.string().optional(),
          terpenes: z.string().optional(),
          effectTags: z.string().optional(),
          genetics: z.string().max(255).optional(),
          cultivation: z.string().max(255).optional(),
          weightGrams: z.string().optional(),
          retailPrice: z.string().optional(),
          wholesalePrice: z.string().optional(),
          imageUrl: z.string().optional(),
          coaUrl: z.string().optional(),
          coaLab: z.string().optional(),
          coaBatch: z.string().optional(),
          isFeatured: z.boolean().optional(),
          isActive: z.boolean().optional(),
          metaDescription: z.string().optional(),
          variationLabel: z.string().max(100).optional(),
          parentProductId: z.number().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...data } = input;
        // Check if product is being re-activated (restock alert)
        if (input.isActive === true) {
          const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
          if (existing && !existing.isActive) {
            // Product was inactive, now being activated — send restock alerts
            const category = input.category ?? existing.category;
            const slug = input.slug ?? existing.slug;
            const name = input.name ?? existing.name;
            const leads = await db.select().from(notifyMeLeads)
              .where(eq(notifyMeLeads.category, category as any));
            for (const lead of leads) {
              try {
                await sendRestockAlert({ to: lead.email, productName: name, productSlug: slug });
              } catch (e) {
                console.error("[Email] Restock alert failed for", lead.email, e);
              }
            }
          }
        }
        await db.update(products).set(data).where(eq(products.id, id));
        // Ping search engines after product update
        const slug = input.slug ?? (await db.select({ slug: products.slug }).from(products).where(eq(products.id, id)).limit(1))[0]?.slug;
        if (slug) {
          notifyProductIndexed(slug).catch(() => {});
          notifyGoogleProduct(slug).catch(() => {});
        }
        return { success: true };
      }),

    updateVariationPrice: adminProcedure
      .input(z.object({
        id: z.number(),
        retailPrice: z.string(),
        wholesalePrice: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const updateData: Record<string, string> = { retailPrice: input.retailPrice };
        if (input.wholesalePrice !== undefined) updateData.wholesalePrice = input.wholesalePrice;
        await db.update(products).set(updateData).where(eq(products.id, input.id));
        return { success: true };
      }),

    toggleActive: adminProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // If re-activating, send restock alerts
        if (input.isActive) {
          const [existing] = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
          if (existing && !existing.isActive) {
            const leads = await db.select().from(notifyMeLeads)
              .where(eq(notifyMeLeads.category, existing.category as any));
            for (const lead of leads) {
              try {
                await sendRestockAlert({ to: lead.email, productName: existing.name, productSlug: existing.slug });
              } catch (e) {
                console.error("[Email] Restock alert failed for", lead.email, e);
              }
            }
          }
        }
        await db.update(products).set({ isActive: input.isActive }).where(eq(products.id, input.id));
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Verify product exists
        const [existing] = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        // Hard delete: cascade through all related tables first
        await db.delete(productImages).where(eq(productImages.productId, input.id));
        await db.delete(productTerpenes).where(eq(productTerpenes.productId, input.id));
        await db.delete(productTags).where(eq(productTags.productId, input.id));
        await db.delete(habbitsBoxContents).where(eq(habbitsBoxContents.productId, input.id));
        await db.delete(wishlists).where(eq(wishlists.productId, input.id));
        await db.delete(restockNotifications).where(eq(restockNotifications.productId, input.id));
        await db.delete(productReviews).where(eq(productReviews.productId, input.id));
        await db.delete(reviewCredits).where(eq(reviewCredits.productId, input.id));
        await db.delete(productQuestions).where(eq(productQuestions.productId, input.id));
        // Finally delete the product itself
        await db.delete(products).where(eq(products.id, input.id));
        return { success: true };
      }),

    // ─── Gallery ─────────────────────────────────────────────────────────────
    addImage: adminProcedure
      .input(z.object({
        productId: z.number(),
        imageUrl: z.string().url(),
        altText: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const result = await db.insert(productImages).values({
          productId: input.productId,
          imageUrl: input.imageUrl,
          altText: input.altText,
          sortOrder: input.sortOrder,
        });
        return { success: true, id: Number((result as any).insertId ?? 0) };
      }),

    removeImage: adminProcedure
      .input(z.object({ imageId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(productImages).where(eq(productImages.id, input.imageId));
        return { success: true };
      }),

    reorderImages: adminProcedure
      .input(z.object({
        images: z.array(z.object({ id: z.number(), sortOrder: z.number() })),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        for (const img of input.images) {
          await db.update(productImages)
            .set({ sortOrder: img.sortOrder })
            .where(eq(productImages.id, img.id));
        }
        return { success: true };
      }),

    setPrimaryImage: adminProcedure
      .input(z.object({ productId: z.number(), imageUrl: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(products)
          .set({ imageUrl: input.imageUrl })
          .where(eq(products.id, input.productId));
        return { success: true };
      }),
  }),

  // ─── ORDERS ────────────────────────────────────────────────────────────────
  orders: router({
    list: adminProcedure
      .input(
        z.object({
          status: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        }).optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const conditions: any[] = [];
        if (input?.status && input.status !== "all") {
          conditions.push(eq(orders.status, input.status as any));
        }
        if (input?.search && input.search.trim()) {
          const q = `%${input.search.trim()}%`;
          conditions.push(
            or(
              like(orders.orderNumber, q),
              like(orders.customerName, q),
              like(orders.customerEmail, q)
            )
          );
        }
        // Always exclude soft-deleted orders from the main list
        conditions.push(sql`${orders.deletedAt} IS NULL`);
        const rows = await db
          .select()
          .from(orders)
          .where(and(...conditions))
          .orderBy(desc(orders.createdAt))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0);

        // For each order, check if it has Crowdship items (for the Confirm & Send button)
        const orderIds = rows.map(r => r.id);
        let crowdshipOrderIds = new Set<number>();
        if (orderIds.length > 0) {
          const csItems = await db
            .select({ orderId: orderItems.orderId })
            .from(orderItems)
            .innerJoin(products, eq(orderItems.productId, products.id))
            .where(and(
              inArray(orderItems.orderId, orderIds),
              isNotNull(products.crowdshipSku)
            ));
          crowdshipOrderIds = new Set(csItems.map(i => i.orderId));
        }

        return rows.map(r => ({
          ...r,
          hasCrowdshipItems: crowdshipOrderIds.has(r.id),
        }));
      }),

    // List trashed (soft-deleted) orders
    listTrashed: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db
        .select()
        .from(orders)
        .where(sql`${orders.deletedAt} IS NOT NULL`)
        .orderBy(desc(orders.deletedAt));
    }),

    // Soft-delete (move to trash)
    trash: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const [existing] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        if (existing.deletedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Order already in trash" });
        await db.update(orders).set({
          deletedAt: new Date(),
          deletedBy: ctx.user.name ?? ctx.user.openId,
        }).where(eq(orders.id, input.id));
        return { success: true };
      }),

    // Restore from trash
    restore: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(orders).set({ deletedAt: null, deletedBy: null }).where(eq(orders.id, input.id));
        return { success: true };
      }),

    // Permanently delete from trash (irreversible)
    hardDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const [existing] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        if (!existing.deletedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Order must be in trash before permanent deletion" });
        // Delete order items and vendor orders first
        await db.delete(orderItems).where(eq(orderItems.orderId, input.id));
        await db.delete(vendorOrders).where(eq(vendorOrders.orderId, input.id));
        await db.delete(orders).where(eq(orders.id, input.id));
        return { success: true };
      }),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const order = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
        if (!order.length) throw new TRPCError({ code: "NOT_FOUND" });
        const items = await db
          .select({ item: orderItems, product: products })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, input.id));
        const vendorOrdersList = await db
          .select({ vendorOrder: vendorOrders, vendor: vendors })
          .from(vendorOrders)
          .leftJoin(vendors, eq(vendorOrders.vendorId, vendors.id))
          .where(eq(vendorOrders.orderId, input.id));
        return { order: order[0], items, vendorOrders: vendorOrdersList };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
          trackingNumber: z.string().optional(),
          trackingCarrier: z.string().optional(),
          notes: z.string().optional(),
          adminNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...data } = input;
        // Fetch order before update to get customer details
        const [existingOrder] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
        await db.update(orders).set(data).where(eq(orders.id, id));
        // Send shipping notification when status changes to shipped
        if (input.status === "shipped" && existingOrder) {
          try {
            await sendShippingNotification({
              to: existingOrder.customerEmail,
              customerName: existingOrder.customerName,
              orderNumber: existingOrder.orderNumber,
              trackingNumber: input.trackingNumber,
              trackingCarrier: input.trackingCarrier,
            });
          } catch (e) {
            console.error("[Email] Shipping notification failed:", e);
          }
        }
        // Send review request when status changes to delivered
        if (input.status === "delivered" && existingOrder) {
          try {
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
            await sendReviewRequest({
              to: existingOrder.customerEmail,
              customerName: existingOrder.customerName,
              orderNumber: existingOrder.orderNumber,
              productNames: items.map(i => i.productName),
            });
          } catch (e) {
            console.error("[Email] Review request failed:", e);
          }
        }
        return { success: true };
      }),

    updateAdminNotes: adminProcedure
      .input(z.object({ id: z.number(), adminNotes: z.string().max(2000) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(orders).set({ adminNotes: input.adminNotes }).where(eq(orders.id, input.id));
        return { success: true };
      }),

    bulkUpdateStatus: adminProcedure
      .input(z.object({
        ids: z.array(z.number().int().positive()).min(1).max(100),
        status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(orders)
          .set({ status: input.status, updatedAt: new Date() })
          .where(inArray(orders.id, input.ids));
        return { success: true, updated: input.ids.length };
      }),

    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const allOrders = await db.select().from(orders).where(isNull(orders.deletedAt));
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total ?? "0"), 0);
      const pendingOrders = allOrders.filter(o => o.status === "pending").length;
      const processingOrders = allOrders.filter(o => o.status === "processing" || o.status === "confirmed").length;
      return { totalOrders, totalRevenue, pendingOrders, processingOrders };
    }),
    analytics: adminProcedure
      .input(z.object({ days: z.number().int().min(7).max(90).default(30) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const since = new Date();
        since.setDate(since.getDate() - input.days);
        const rangeOrders = await db.select().from(orders).where(and(gte(orders.createdAt, since), isNull(orders.deletedAt)));
        // Build day buckets
        const revenueByDay: Record<string, number> = {};
        const ordersByDay: Record<string, number> = {};
        for (let i = input.days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          revenueByDay[key] = 0;
          ordersByDay[key] = 0;
        }
        for (const o of rangeOrders) {
          const key = new Date(o.createdAt).toISOString().slice(0, 10);
          if (key in revenueByDay) {
            revenueByDay[key] += parseFloat(o.total ?? "0");
            ordersByDay[key] = (ordersByDay[key] ?? 0) + 1;
          }
        }
        // Orders by status
        const statusCounts: Record<string, number> = {};
        for (const o of rangeOrders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
        // Top products by revenue
        const allItems = await db.select().from(orderItems).where(gte(orderItems.createdAt, since));
        const productRevenue: Record<string, { name: string; revenue: number; units: number }> = {};
        for (const item of allItems) {
          const key = item.productName;
          if (!productRevenue[key]) productRevenue[key] = { name: key, revenue: 0, units: 0 };
          productRevenue[key].revenue += parseFloat(item.lineTotal ?? "0");
          productRevenue[key].units += item.quantity;
        }
        const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        // Engagement metrics
        const [emailCaptureRows, wishlistRows, reviewRows, loyaltyRows, referralRows] = await Promise.all([
          db.select().from(emailCaptures).where(gte(emailCaptures.capturedAt, since)),
          db.select().from(wishlists).where(gte(wishlists.addedAt, since)),
          db.select().from(productReviews).where(gte(productReviews.createdAt, since)),
          db.select().from(loyaltyPoints).where(gte(loyaltyPoints.createdAt, since)),
          db.select().from(referrals).where(gte(referrals.createdAt, since)),
        ]);

        // Conversion rate: orders / email captures (rough proxy)
        const totalEmailCaptures = emailCaptureRows.length;
        const conversionRate = totalEmailCaptures > 0
          ? ((rangeOrders.length / totalEmailCaptures) * 100)
          : 0;

        // Loyalty points earned in period (positive points = earned)
        const loyaltyPointsEarned = loyaltyRows
          .filter(r => r.points > 0)
          .reduce((s, r) => s + r.points, 0);

        return {
          revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
          ordersByDay: Object.entries(ordersByDay).map(([date, count]) => ({ date, count })),
          statusCounts,
          topProducts,
          totalRevenue: rangeOrders.reduce((s, o) => s + parseFloat(o.total ?? "0"), 0),
          totalOrders: rangeOrders.length,
          avgOrderValue: rangeOrders.length ? rangeOrders.reduce((s, o) => s + parseFloat(o.total ?? "0"), 0) / rangeOrders.length : 0,
          // Engagement
          emailCaptures: totalEmailCaptures,
          wishlistAdds: wishlistRows.length,
          reviewsSubmitted: reviewRows.length,
          loyaltyPointsEarned,
          referralsCreated: referralRows.length,
          conversionRate: parseFloat(conversionRate.toFixed(1)),
        };
      }),
  }),

  // ─── SUBSCRIPTIONS ─────────────────────────────────────────────────────────
  subscriptions: router({
    plans: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
      }),

      upsert: adminProcedure
        .input(
          z.object({
            id: z.number().optional(),
            name: z.string().min(1).max(255),
            slug: z.string().min(1).max(255),
            tier: z.enum(["baby_lungs", "stoner", "connoisseur", "smoke_shop"]),
            description: z.string().optional(),
            monthlyPrice: z.string().optional(),
            minimumBudget: z.string().optional(),
            discountPercent: z.string().default("10.00"),
            freeShipping: z.boolean().default(true),
            isActive: z.boolean().default(true),
            sortOrder: z.number().default(0),
          })
        )
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          // Strip fields not in schema (tier, minimumBudget) and ensure monthlyPrice has a value
          const { id, tier: _tier, minimumBudget: _min, ...rest } = input as any;
          const data = { ...rest, monthlyPrice: rest.monthlyPrice ?? "0.00" };
          if (id) {
            await db.update(subscriptionPlans).set(data).where(eq(subscriptionPlans.id, id));
          } else {
            await db.insert(subscriptionPlans).values(data);
          }
          return { success: true };
        }),
    }),

    list: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return db
          .select({ subscription: customerSubscriptions, plan: subscriptionPlans })
          .from(customerSubscriptions)
          .leftJoin(subscriptionPlans, eq(customerSubscriptions.planId, subscriptionPlans.id))
          .orderBy(desc(customerSubscriptions.createdAt));
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending_approval", "active", "paused", "cancelled"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...data } = input;
        await db.update(customerSubscriptions).set(data).where(eq(customerSubscriptions.id, id));
        return { success: true };
      }),

    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const subs = await db.select().from(customerSubscriptions);
      const active = subs.filter(s => s.status === "active").length;
      const pending = subs.filter(s => s.status === "pending_approval").length;
      const paused = subs.filter(s => s.status === "paused").length;
      return { total: subs.length, active, pending, paused };
    }),
  }),

  // ─── BOX CURATION ──────────────────────────────────────────────────────────
  boxContents: router({
    list: adminProcedure
      .input(z.object({ planId: z.number(), periodLabel: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return db
          .select({ content: habbitsBoxContents, product: products })
          .from(habbitsBoxContents)
          .leftJoin(products, eq(habbitsBoxContents.productId, products.id))
          .where(
            and(
              eq(habbitsBoxContents.planId, input.planId),
              eq(habbitsBoxContents.periodLabel, input.periodLabel)
            )
          );
      }),

    add: adminProcedure
      .input(
        z.object({
          planId: z.number(),
          periodLabel: z.string(),
          productId: z.number(),
          quantity: z.number().default(1),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(habbitsBoxContents).values(input);
        return { success: true };
      }),

    remove: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { habbitsBoxContents: hbc } = await import("../../drizzle/schema");
        await db.delete(hbc).where(eq(hbc.id, input.id));
        return { success: true };
      }),
  }),

  // ─── SEO: Ping all pages to IndexNow + Google Indexing API ─────────────────
  pingSearchEngines: adminProcedure.mutation(async () => {
    const pages = [
      "/",
      "/products",
      "/products/flower",
      "/products/extracts",
      "/habbits-box",
      "/our-story",
      "/blog",
      "/faq",
      "/strain-guide",
      "/terpene-guide",
      "/strain-comparison",
      "/wholesale",
      "/affiliate",
      "/contact",
      "/lab-results",
      "/compliance",
      "/privacy-policy",
      "/terms-of-service",
      "/shipping-policy",
      "/return-policy",
    ];
    try {
      // Ping IndexNow (Bing, Yandex)
      await notifyIndexNow(pages);
      // Also ping Google Indexing API if service account is configured
      const googleResult = await notifyGoogleIndexingBulk(pages);
      return {
        success: true,
        pagesSubmitted: pages.length,
        indexNow: { submitted: pages.length },
        google: googleResult,
      };
    } catch {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Search engine ping failed" });
    }
  }),

  // ─── SEO: Check Google Indexing API configuration status ─────────────────
  googleIndexingStatus: adminProcedure.query(async () => {
    const configured = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    return {
      configured,
      message: configured
        ? "Google Indexing API is configured and active."
        : "Google Indexing API is not configured. Add GOOGLE_SERVICE_ACCOUNT_JSON to enable auto-pinging Google.",
    };
  }),
});
