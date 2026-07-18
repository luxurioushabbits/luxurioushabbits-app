/**
 * Orders Router — Luxurious Habbits
 * Cart, checkout, order management, and dropship email forwarding to vendors
 */
import { z } from "zod";
import { eq, inArray, desc } from "drizzle-orm";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { orders, orderItems, vendorOrders, products, vendors, orderStatusHistory, users, loyaltyPoints } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";
import { RESTRICTED_STATES, RESTRICTED_STATE_NAMES } from "../../shared/const";
import { sendOrderConfirmation, sendShippingNotification } from "../email";
import { sendOrderConfirmationSMS, sendShippingNotificationSMS } from "../sms";
import { buildTopShelfPayload, submitTopShelfOrder, submitTopShelfWooOrder } from "../topshelf";
// Crowdship orders are submitted manually via Admin → Orders → "Confirm & Send to Crowdship"
import { chargeCard, isAuthNetConfigured } from "../authorizenet";
import { isTestModeActive } from "./siteSettings";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function sendVendorOrderEmail(
  vendorName: string,
  vendorEmail: string,
  orderNumber: string,
  items: Array<{ productName: string; quantity: number; weightGrams: number | null; price: string }>,
  shipping: {
    name: string;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    zip: string;
  }
) {
  const itemLines = items
    .map(i => `  - ${i.productName} x${i.quantity}${i.weightGrams ? ` (${i.weightGrams}g)` : ""} @ $${i.price}`)
    .join("\n");

  const body = [
    `NEW DROPSHIP ORDER — Luxurious Habbits`,
    `Order #: ${orderNumber}`,
    ``,
    `ITEMS TO FULFILL:`,
    itemLines,
    ``,
    `SHIP TO:`,
    `  ${shipping.name}`,
    `  ${shipping.address1}${shipping.address2 ? `, ${shipping.address2}` : ""}`,
    `  ${shipping.city}, ${shipping.state} ${shipping.zip}`,
    ``,
    `Please ship in plain, unmarked packaging (no invoice or pricing inside).`,
    `Adult signature required per UPS compliance.`,
    ``,
    `Reply to this email with tracking number when shipped.`,
    `Questions? Reply to this email.`,
    ``,
    `— Luxurious Habbits`,
  ].join("\n");

  // Use owner notification as the channel (notifies owner who then forwards to vendor)
  // When email integration is added, this will send directly to vendorEmail
  await notifyOwner({
    title: `DROPSHIP ORDER #${orderNumber} → ${vendorName}`,
    content: body,
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const ordersRouter = router({
  // Create a new order (checkout)
  create: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number().int().positive(),
            quantity: z.number().int().min(1).max(99),
          })
        ).min(1),
        customerEmail: z.string().email().max(320),
        customerName: z.string().min(1).max(200),
        shippingAddress: z.object({
          address1: z.string().min(1).max(300),
          address2: z.string().max(300).optional(),
          city: z.string().min(1).max(100),
          state: z.string().min(2).max(50),
          zip: z.string().min(5).max(10),
        }),
        notes: z.string().max(1000).optional(),
        userId: z.number().int().positive().optional(), // linked if logged in
        customerPhone: z.string().max(30).optional(),
        smsOptIn: z.boolean().optional(),
        couponCode: z.string().max(50).optional(),
        discountAmount: z.number().optional(), // in dollars
        referralCode: z.string().max(20).optional(),
        affiliateCode: z.string().max(20).optional(), // from ?ref= localStorage attribution
        // Payment — required once Authorize.net is live
        paymentTransactionId: z.string().optional(), // Authorize.net transaction ID after charge
        paymentNonce: z.string().optional(),         // Accept.js nonce (used server-side to charge)
        paymentDataDescriptor: z.string().optional(), // Accept.js data descriptor (e.g. COMMON.ACCEPT.INAPP.PAYMENT)
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // ── Payment guard ─────────────────────────────────────────────────────────
      // When AUTHORIZE_NET_API_LOGIN_ID is set, payment is required.
      // Orders without a valid paymentTransactionId or paymentNonce are rejected.
      // Exception: Test Mode bypasses payment for end-to-end testing.
      const authNetLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
      const isTestMode = await isTestModeActive();
      if (!isTestMode && authNetLoginId && authNetLoginId.trim() !== "") {
        if (!input.paymentTransactionId && !input.paymentNonce) {
          throw new Error("Payment is required to place an order. Please complete the payment form.");
        }
      }
      // ─────────────────────────────────────────────────────────────────────────

      // Block restricted states — but only for hemp/Farm Bill products (not accessories)
      const stateUpper = input.shippingAddress.state.toUpperCase();

      // Fetch all products in the order first so we can check categories
      const productIds = input.items.map(i => i.productId);
      const productRows = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds));

      // Reviewer account bypasses state restrictions (Authorize.net compliance review)
      const isReviewerAccount = input.customerEmail === "guest@luxurioushabbits.com";

      if (!isReviewerAccount && RESTRICTED_STATES.includes(stateUpper)) {
        // Check if any item is a hemp/Farm Bill product (non-accessory)
        const hasHempProducts = productRows.some(p => p.category !== "accessory");
        if (hasHempProducts) {
          const stateName = RESTRICTED_STATE_NAMES[stateUpper] ?? stateUpper;
          throw new Error(`We are unable to ship hemp products to ${stateName} due to state regulations. Accessories can still be ordered — remove hemp items from your cart to proceed.`);
        }
      }

      if (productRows.length === 0) throw new Error("No valid products found");

      // Calculate totals
      let subtotal = 0;
      const lineItems = input.items.map(item => {
        const product = productRows.find(p => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (!product.isActive) throw new Error(`Product "${product.name}" is no longer available`);
        const lineTotal = parseFloat(product.retailPrice) * item.quantity;
        subtotal += lineTotal;
        return { product, quantity: item.quantity, lineTotal };
      });

      const shippingCost = 0; // Free shipping for now; Authorize.net will handle this
      const totalAmount = subtotal + shippingCost;

      // Generate order number
      const orderNumber = `LH-${Date.now().toString(36).toUpperCase()}`;

      // ── Authorize.net charge ───────────────────────────────────────────────────
      // If Authorize.net is configured and a payment nonce was provided, charge
      // the card BEFORE creating the order. If the charge fails, throw an error
      // so no order record is created.
      let chargedTransactionId: string | null = null;
      let chargedAuthCode: string | null = null;
      let finalPaymentStatus: "pending" | "paid" | "failed" | "refunded" = "pending";

      if (isAuthNetConfigured() && input.paymentNonce) {
        const amountCents = Math.round(totalAmount * 100);
        const chargeResult = await chargeCard({
          paymentNonce: input.paymentNonce,
          dataDescriptor: input.paymentDataDescriptor ?? "COMMON.ACCEPT.INAPP.PAYMENT",
          amountCents,
          orderNumber,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
        });
        if (!chargeResult.success) {
          throw new Error(chargeResult.errorMessage ?? "Payment failed. Please try again.");
        }
        chargedTransactionId = chargeResult.transactionId ?? null;
        chargedAuthCode = chargeResult.authCode ?? null;
        finalPaymentStatus = "paid";
      } else if (input.paymentTransactionId) {
        // Pre-charged transaction ID passed in (e.g. from crypto flow)
        chargedTransactionId = input.paymentTransactionId;
        finalPaymentStatus = "paid";
      }
      // ─────────────────────────────────────────────────────────────────────────

      // Insert order
      const [newOrder] = await db.insert(orders).values({
        orderNumber,
        userId: input.userId ?? null,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        shippingName: input.customerName,
        shippingAddress1: input.shippingAddress.address1,
        shippingAddress2: input.shippingAddress.address2 ?? null,
        shippingCity: input.shippingAddress.city,
        shippingState: input.shippingAddress.state,
        shippingZip: input.shippingAddress.zip,
        subtotal: subtotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        total: totalAmount.toFixed(2),
        status: "pending",
        paymentStatus: finalPaymentStatus,
        notes: input.notes ?? null,
        customerPhone: input.customerPhone ?? null,
        smsOptIn: input.smsOptIn ?? false,
        couponCode: input.couponCode ?? null,
        discountAmount: input.discountAmount ? input.discountAmount.toFixed(2) : null,
        referralCode: input.referralCode ?? null,
        affiliateCode: input.affiliateCode ?? null,
        paymentTransactionId: chargedTransactionId,
        paymentAuthCode: chargedAuthCode,
      }).$returningId();

      const orderId = newOrder.id;

      // Insert order items
      await db.insert(orderItems).values(
        lineItems.map(({ product, quantity, lineTotal }) => ({
          orderId,
          productId: product.id,
          vendorId: product.vendorId,
          productName: product.name,
          quantity,
          unitPrice: product.retailPrice,
          lineTotal: lineTotal.toFixed(2),
        }))
      );

      // Group items by vendor and create vendor orders
      const byVendor: Record<number, typeof lineItems> = {};
      for (const item of lineItems) {
        const vid = item.product.vendorId;
        if (!byVendor[vid]) byVendor[vid] = [];
        byVendor[vid].push(item);
      }

      for (const [vendorIdStr, vendorItems] of Object.entries(byVendor)) {
        const vendorId = Number(vendorIdStr);
        const vendorRow = await db.select().from(vendors).where(eq(vendors.id, vendorId)).limit(1);
        if (!vendorRow[0]) continue;

        const vendorSubtotal = vendorItems.reduce((sum: number, i: typeof lineItems[0]) => sum + i.lineTotal, 0);

        await db.insert(vendorOrders).values({
          orderId,
          vendorId,
          status: "pending",
          notes: `Vendor subtotal: $${vendorSubtotal.toFixed(2)}`,
        });

        // Send dropship notification
        await sendVendorOrderEmail(
          vendorRow[0].name,
          vendorRow[0].contactEmail ?? "orders@luxurioushabbits.com",
          orderNumber,
          vendorItems.map((i: typeof lineItems[0]) => ({
            productName: i.product.name,
            quantity: i.quantity,
            weightGrams: i.product.weightGrams ? parseFloat(i.product.weightGrams) : null,
            price: i.product.retailPrice,
          })),
          {
            name: input.customerName,
            address1: input.shippingAddress.address1,
            address2: input.shippingAddress.address2,
            city: input.shippingAddress.city,
            state: input.shippingAddress.state,
            zip: input.shippingAddress.zip,
          }
        );
      }

      // Notify owner of new order
      await notifyOwner({
        title: `New Order #${orderNumber} — $${totalAmount.toFixed(2)}`,
        content: [
          `Customer: ${input.customerName} <${input.customerEmail}>`,
          `Order #: ${orderNumber}`,
          `Total: $${totalAmount.toFixed(2)}`,
          `Items: ${lineItems.map(i => `${i.product.name} x${i.quantity}`).join(", ")}`,
          `Ship to: ${input.shippingAddress.city}, ${input.shippingAddress.state}`,
        ].join("\n"),
      });

      // Send order confirmation email to customer
      try {
        await sendOrderConfirmation({
          to: input.customerEmail,
          customerName: input.customerName,
          orderNumber,
          items: lineItems.map(i => ({
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.retailPrice,
            coaUrl: i.product.coaUrl ?? null,
          })),
          total: totalAmount.toFixed(2),
          shippingAddress: input.shippingAddress,
        });
      } catch (emailErr) {
        console.error("[Email] Order confirmation failed:", emailErr);
      }

      // Subscription streak + tier upgrade logic
      // If the order contains a Habbits Box or Stoner Box product and the user is logged in,
      // increment their subscriptionStreak. At streak >= 3, upgrade tier to Luxurious.
      if (input.userId) {
        const isBoxOrder = productRows.some(p =>
          p.name?.toLowerCase().includes("habbits box") ||
          p.name?.toLowerCase().includes("stoner box")
        );
        if (isBoxOrder) {
          try {
            const [userRow] = await db.select({ subscriptionStreak: users.subscriptionStreak, loyaltyTier: users.loyaltyTier })
              .from(users)
              .where(eq(users.id, input.userId))
              .limit(1);
            if (userRow) {
              const newStreak = (userRow.subscriptionStreak ?? 0) + 1;
              const newTier = newStreak >= 3 ? "luxurious" : userRow.loyaltyTier;
              await db.update(users)
                .set({ subscriptionStreak: newStreak, loyaltyTier: newTier as "standard" | "elevated" | "luxurious" })
                .where(eq(users.id, input.userId));
            }
          } catch (tierErr) {
            console.error("[Tier] Streak update failed:", tierErr);
          }
        } else {
          // Non-box order: reset streak to 0 (must be consecutive)
          try {
            await db.update(users)
              .set({ subscriptionStreak: 0 })
              .where(eq(users.id, input.userId));
          } catch (streakErr) {
            console.error("[Tier] Streak reset failed:", streakErr);
          }
        }
      }

      // Award loyalty points for logged-in users (1 pt per $1 spent, tier multiplier applied)
      if (input.userId) {
        try {
          const [userRow] = await db.select({ loyaltyTier: users.loyaltyTier })
            .from(users)
            .where(eq(users.id, input.userId))
            .limit(1);
          const tier = userRow?.loyaltyTier ?? "standard";
          const multiplier = tier === "luxurious" ? 2 : tier === "elevated" ? 1.5 : 1;
          // Points = floor(subtotal * multiplier), 1 pt per $1 spent
          const basePoints = Math.floor(subtotal * multiplier);
          if (basePoints > 0) {
            await db.insert(loyaltyPoints).values({
              userId: input.userId,
              points: basePoints,
              reason: "purchase",
              orderId,
              note: `Order #${orderNumber} — ${basePoints} pts (${multiplier}x, $${subtotal.toFixed(2)} subtotal)`,
            });
          }
        } catch (loyaltyErr) {
          console.error("[Loyalty] Points award failed:", loyaltyErr);
        }
      }

      // Record affiliate conversion if order was attributed to an affiliate
      if (input.affiliateCode) {
        try {
          const { affiliates, affiliateConversions } = await import("../../drizzle/schema");
          const [affiliate] = await db
            .select({ id: affiliates.id, commissionPercent: affiliates.commissionPercent, totalEarnedCents: affiliates.totalEarnedCents })
            .from(affiliates)
            .where(eq(affiliates.affiliateCode, input.affiliateCode))
            .limit(1);
          if (affiliate) {
            const commissionRate = parseFloat(affiliate.commissionPercent) / 100;
            const commissionCents = Math.round(subtotal * commissionRate * 100);
            await db.insert(affiliateConversions).values({
              affiliateId: affiliate.id,
              orderId,
              orderTotalCents: Math.round(subtotal * 100),
              commissionCents,
              status: "pending",
            });
            // Update affiliate rolling total earned
            await db
              .update(affiliates)
              .set({ totalEarnedCents: affiliate.totalEarnedCents + commissionCents })
              .where(eq(affiliates.id, affiliate.id));
            console.log(`[Affiliate] Conversion recorded for ${input.affiliateCode} — $${(commissionCents / 100).toFixed(2)} commission`);
          }
        } catch (affErr) {
          console.error("[Affiliate] Conversion recording failed:", affErr);
        }
      }

      // Send SMS order confirmation if customer opted in
      if (input.smsOptIn && input.customerPhone) {
        const firstName = input.customerName.split(" ")[0] ?? input.customerName;
        sendOrderConfirmationSMS({
          phone: input.customerPhone,
          orderNumber,
          total: Math.round(totalAmount * 100),
          firstName,
        }).catch(err => console.error("[SMS] Order confirmation failed:", err));
      }

      // Submit order to TopShelf WooCommerce (non-blocking — runs after response is sent)
      // This fires for all orders including test mode orders so we can verify the integration
      setImmediate(async () => {
        try {
          const topshelfItems = lineItems
            .filter(({ product }) => product.topshelfVariationId != null)
            .map(({ product, quantity }) => ({
              topshelfVariationId: product.topshelfVariationId!,
              topshelfProductId: product.topshelfProductId ?? undefined,
              name: product.name,
              sku: product.topshelfSku ?? "",
              quantity,
              // Use TopShelf's own retail price (dollars). Falls back to our retail price (cents→dollars) if not set.
              topshelfRetailPrice: product.topshelfRetailPrice
                ? parseFloat(product.topshelfRetailPrice)
                : parseFloat(product.retailPrice) / 100,
            }));

          if (topshelfItems.length === 0) {
            console.log(`[TopShelf] Order ${orderNumber} has no TopShelf-mapped items — skipping submission`);
            await db.update(orders)
              .set({ topshelfError: "[TopShelf] No valid items found." })
              .where(eq(orders.id, orderId));
            return;
          }

          const nameParts = input.customerName.trim().split(/\s+/);
          const firstName = nameParts[0] ?? "";
          const lastName = nameParts.slice(1).join(" ") || firstName;

          console.log(`[TopShelf] Submitting order ${orderNumber} with ${topshelfItems.length} items via WooCommerce...`);
          const wcResult = await submitTopShelfWooOrder({
            orderNumber,
            items: topshelfItems,
            shipping: {
              firstName,
              lastName,
              address1: input.shippingAddress.address1,
              address2: input.shippingAddress.address2,
              city: input.shippingAddress.city,
              state: input.shippingAddress.state,
              zip: input.shippingAddress.zip,
            },
            customerEmail: input.customerEmail,
          });

          await db.update(orders)
            .set({
              topshelfOrderNumber: String(wcResult.wcOrderId),
              topshelfSubmittedAt: new Date(),
              topshelfError: null,
            })
            .where(eq(orders.id, orderId));

          console.log(`[TopShelf] Order ${orderNumber} submitted successfully — WooCommerce #${wcResult.wcOrderId}`);
        } catch (tsErr: any) {
          console.error(`[TopShelf] Submission failed for order ${orderNumber}:`, tsErr?.message ?? tsErr);
          try {
            const db2 = await getDb();
            if (db2) {
              await db2.update(orders)
                .set({ topshelfError: tsErr?.message ?? String(tsErr) })
                .where(eq(orders.id, orderId));
            }
          } catch (_) {}
        }
      });

      // NOTE: Crowdship orders are NOT auto-submitted.
      // Admin must manually review and confirm Crowdship orders in the Orders panel.
      // Use the "Confirm & Send to Crowdship" button in Admin → Orders.

      // Notify owner if any items in this order are Crowdship products (need manual review)
      const crowdshipItems = lineItems.filter(({ product }) => product.crowdshipVariantId != null);
      if (crowdshipItems.length > 0) {
        await notifyOwner({
          title: `⚠️ Crowdship Order #${orderNumber} Needs Review`,
          content: [
            `Order #${orderNumber} contains ${crowdshipItems.length} Crowdship item(s) that require manual submission.`,
            ``,
            `Items:`,
            ...crowdshipItems.map(i => `  • ${i.product.name} x${i.quantity}`),
            ``,
            `Customer: ${input.customerName} <${input.customerEmail}>`,
            `Total: $${totalAmount.toFixed(2)}`,
            ``,
            `Action required: Go to Admin → Orders → find #${orderNumber} → click "Confirm & Send to Crowdship".`,
          ].join("\n"),
        }).catch(err => console.error("[Crowdship Notify] Failed:", err));
      }

      return { success: true, orderNumber, orderId };
    }),

  // Get order status by order number (for customer tracking)
  getByNumber: publicProcedure
    .input(z.object({ orderNumber: z.string(), email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (!order || order.customerEmail.toLowerCase() !== input.email.toLowerCase()) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return { order, items };
    }),

  // Customer: get my orders (requires login)
  myOrders: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { orders: [] };

      // Match by userId if set, otherwise fall back to email match
      const rows = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, ctx.user.id))
        .orderBy(desc(orders.createdAt))
        .limit(50);

      return { orders: rows };
    }),

  // Admin: list all orders
  adminList: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50), offset: z.number().int().min(0).default(0) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { orders: [], total: 0 };

      const rows = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { orders: rows };
    }),

  // Admin: update order status (with tracking + customer notification)
  adminUpdateStatus: adminProcedure
    .input(z.object({
      orderId: z.number().int().positive(),
      status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
      trackingNumber: z.string().max(200).optional(),
      trackingCarrier: z.string().max(50).optional(),
      note: z.string().max(500).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Fetch current order for notification
      const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (!order) throw new Error("Order not found");

      // Update order
      await db.update(orders)
        .set({
          status: input.status,
          trackingNumber: input.trackingNumber ?? order.trackingNumber,
          trackingCarrier: input.trackingCarrier ?? order.trackingCarrier,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId));

      // Log status history
      await db.insert(orderStatusHistory).values({
        orderId: input.orderId,
        status: input.status,
        note: input.note ?? null,
      });

      // Send SMS shipping notification if customer opted in
      if (input.status === "shipped" && order.smsOptIn && order.customerPhone && input.trackingNumber) {
        const firstName = (order.customerName ?? "Customer").split(" ")[0];
        sendShippingNotificationSMS({
          phone: order.customerPhone,
          orderNumber: order.orderNumber,
          trackingNumber: input.trackingNumber,
          carrier: input.trackingCarrier ?? "UPS",
          firstName,
        }).catch(err => console.error("[SMS] Shipping notification failed:", err));
      }

      // Auto-email customer when shipped
      if (input.status === "shipped") {
        sendShippingNotification({
          to: order.customerEmail,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          trackingNumber: input.trackingNumber ?? order.trackingNumber ?? undefined,
          trackingCarrier: input.trackingCarrier ?? order.trackingCarrier ?? undefined,
        }).catch(err => console.error("[Email] Shipping notification failed:", err));
        // Also notify owner
        notifyOwner({
          title: `📦 Order #${order.orderNumber} Marked Shipped`,
          content: `Customer ${order.customerName} (${order.customerEmail}) has been auto-emailed their tracking info.${input.trackingNumber ? ` Tracking: ${input.trackingNumber}` : ""}`,
        }).catch(() => {});
      }

      return { success: true };
    }),

  // Admin: get order status history
  adminGetStatusHistory: adminProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { history: [] };
      const history = await db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, input.orderId))
        .orderBy(orderStatusHistory.createdAt);
      return { history };
    }),

  // Admin: export orders as CSV
  adminExportCsv: adminProcedure
    .input(z.object({
      status: z.enum(["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("all"),
      dateFrom: z.string().optional(), // ISO date string
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { csv: "" };

      let query = db.select().from(orders).orderBy(desc(orders.createdAt)).$dynamic();

      if (input?.status && input.status !== "all") {
        const { eq: eqFn } = await import("drizzle-orm");
        query = query.where(eqFn(orders.status, input.status)) as typeof query;
      }

      const rows = await query;

      // Filter by date range if provided
      const filtered = rows.filter(r => {
        if (input?.dateFrom) {
          const from = new Date(input.dateFrom);
          if (new Date(r.createdAt) < from) return false;
        }
        if (input?.dateTo) {
          const to = new Date(input.dateTo);
          to.setHours(23, 59, 59, 999);
          if (new Date(r.createdAt) > to) return false;
        }
        return true;
      });

      const escape = (v: string | null | undefined) => {
        if (v == null) return "";
        const s = String(v);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const headers = [
        "Order Number", "Status", "Customer Name", "Customer Email", "Customer Phone",
        "Address 1", "Address 2", "City", "State", "ZIP",
        "Subtotal", "Shipping", "Discount", "Total",
        "Coupon Code", "Tracking Number", "Tracking Carrier",
        "SMS Opt-In", "Referral Code", "Created At",
      ];

      const csvRows = filtered.map(r => [
        escape(r.orderNumber),
        escape(r.status),
        escape(r.customerName),
        escape(r.customerEmail),
        escape(r.customerPhone),
        escape(r.shippingAddress1),
        escape(r.shippingAddress2),
        escape(r.shippingCity),
        escape(r.shippingState),
        escape(r.shippingZip),
        escape(r.subtotal),
        escape(r.shippingCost),
        escape(r.discountAmount),
        escape(r.total),
        escape(r.couponCode),
        escape(r.trackingNumber),
        escape(r.trackingCarrier),
        r.smsOptIn ? "Yes" : "No",
        escape(r.referralCode),
        escape(new Date(r.createdAt).toISOString()),
      ].join(","));

      const csv = [headers.join(","), ...csvRows].join("\n");
      return { csv, count: filtered.length };
    }),

  // Customer: get order detail with tracking (requires login)
  myOrderDetail: protectedProcedure
    .input(z.object({ orderId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [order] = await db.select().from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);
      if (!order || order.userId !== ctx.user.id) return null;
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      const history = await db.select().from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, order.id))
        .orderBy(orderStatusHistory.createdAt);
      return { order, items, history };
    }),
});
