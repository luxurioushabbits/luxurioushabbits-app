/**
 * NOWPayments Crypto Checkout Router
 *
 * Supports BTC and ETH payments via NOWPayments API.
 * Hidden behind VITE_CRYPTO_PAYMENTS_ENABLED feature flag.
 *
 * Flow:
 *  1. Customer places order â gets order ID
 *  2. Customer visits /pay/crypto?order=LH-XXXXX
 *  3. They pick a coin â createPayment is called â NOWPayments returns a unique deposit address + exact amount
 *  4. Customer sends exact amount to that address (read-only, cannot edit)
 *  5. NOWPayments POSTs IPN webhook to /api/crypto/ipn when payment confirms
 *  6. We verify HMAC signature, mark order as paid
 */

import crypto from "crypto";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { orders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";
const API_KEY = process.env.NOWPAYMENTS_API_KEY ?? "";
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET ?? "";
const ETH_WALLET = process.env.NOWPAYMENTS_ETH_WALLET ?? "";
const BTC_WALLET = process.env.NOWPAYMENTS_BTC_WALLET ?? "";

/** Supported coins and their payout wallet addresses */
const COIN_CONFIG: Record<string, { payCurrency: string; payoutAddress: string }> = {
  btc: { payCurrency: "btc", payoutAddress: BTC_WALLET },
  eth: { payCurrency: "eth", payoutAddress: ETH_WALLET },
};

async function nowpaymentsRequest(path: string, method = "GET", body?: object) {
  const res = await fetch(`${NOWPAYMENTS_API_URL}${path}`, {
    method,
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `NOWPayments error: ${res.status} ${text}`,
    });
  }
  return res.json();
}

export const cryptoPaymentsRouter = router({
  /**
   * Get the estimated crypto amount for an order total.
   * Called when user selects a coin so they can see the amount before confirming.
   */
  getEstimate: publicProcedure
    .input(
      z.object({
        orderIdNum: z.number().int().positive(),
        coin: z.enum(["btc", "eth"]),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [order] = await db
        .select({ id: orders.id, total: orders.total, status: orders.status, orderNumber: orders.orderNumber })
        .from(orders)
        .where(eq(orders.id, input.orderIdNum))
        .limit(1);

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const amountUsd = parseFloat(order.total);
      const coin = COIN_CONFIG[input.coin];

      // Get estimated amount from NOWPayments
      const estimate = await nowpaymentsRequest(
        `/estimate?amount=${amountUsd}&currency_from=usd&currency_to=${coin.payCurrency}`
      );

      return {
        orderNumber: order.orderNumber,
        amountUsd,
        coin: input.coin,
        estimatedAmount: estimate.estimated_amount as string,
        currency: coin.payCurrency.toUpperCase(),
      };
    }),

  /**
   * Create a NOWPayments payment for an order.
   * Returns a unique deposit address and exact amount â both read-only for the customer.
   */
  createPayment: publicProcedure
    .input(
      z.object({
        orderIdNum: z.number().int().positive(),
        coin: z.enum(["btc", "eth"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [order] = await db
        .select({
          id: orders.id,
          total: orders.total,
          status: orders.status,
          orderNumber: orders.orderNumber,
          nowpaymentsPaymentId: orders.nowpaymentsPaymentId,
        })
        .from(orders)
        .where(eq(orders.id, input.orderIdNum))
        .limit(1);

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      if (order.status === "processing" || order.status === "shipped" || order.status === "delivered") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Order is already paid or fulfilled" });
      }

      const amountUsd = parseFloat(order.total);
      const coin = COIN_CONFIG[input.coin];

      // Build the IPN callback URL from the deployed domain or a fallback
      // In production this will be the actual deployed URL
      const appUrl = process.env.APP_URL ?? "https://luxhabbits-kfsrtbtl.manus.space";
      const ipnCallbackUrl = `${appUrl}/api/crypto/ipn`;

      const payment = await nowpaymentsRequest("/payment", "POST", {
        price_amount: amountUsd,
        price_currency: "usd",
        pay_currency: coin.payCurrency,
        payout_address: coin.payoutAddress,
        order_id: order.orderNumber,
        order_description: `Luxurious Habbits Order ${order.orderNumber}`,
        ipn_callback_url: ipnCallbackUrl,
      });

      // Save the NOWPayments payment ID on the order for webhook matching
      await db
        .update(orders)
        .set({ nowpaymentsPaymentId: String(payment.payment_id) })
        .where(eq(orders.id, order.id));

      return {
        paymentId: String(payment.payment_id),
        payAddress: payment.pay_address as string,
        payAmount: String(payment.pay_amount),
        payCurrency: (payment.pay_currency as string).toUpperCase(),
        orderNumber: order.orderNumber,
        amountUsd,
        expiresAt: payment.expiration_estimate_date as string | null,
        status: payment.payment_status as string,
      };
    }),

  /**
   * Poll payment status by NOWPayments payment ID.
   * Called every 15s from the frontend while the customer is on the payment screen.
   */
  getPaymentStatus: publicProcedure
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ input }) => {
      const data = await nowpaymentsRequest(`/payment/${input.paymentId}`);
      return {
        status: data.payment_status as string,
        payAmount: String(data.pay_amount),
        actuallyPaid: data.actually_paid ? String(data.actually_paid) : null,
        payCurrency: (data.pay_currency as string).toUpperCase(),
      };
    }),

  /**
   * Look up an order by order number (e.g. "LH-00042") for the crypto pay page.
   * Returns only the fields needed to display the payment screen.
   */
  lookupOrder: publicProcedure
    .input(z.object({ orderNumber: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [order] = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          total: orders.total,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          nowpaymentsPaymentId: orders.nowpaymentsPaymentId,
        })
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber.toUpperCase()))
        .limit(1);

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found. Check your order number and try again." });
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        amountUsd: parseFloat(order.total),
        status: order.status,
        paymentStatus: order.paymentStatus,
        hasExistingPayment: !!order.nowpaymentsPaymentId,
        existingPaymentId: order.nowpaymentsPaymentId ?? null,
      };
    }),
});

/**
 * IPN Webhook handler â called by NOWPayments when a payment status changes.
 * Mounted at POST /api/crypto/ipn in server/_core/index.ts
 */
export async function handleCryptoIPN(req: any, res: any) {
  try {
    const signature = req.headers["x-nowpayments-sig"] as string;

    if (!signature || !IPN_SECRET) {
      res.status(400).json({ error: "Missing signature or IPN secret not configured" });
      return;
    }

    // Verify HMAC-SHA512 signature using sorted body keys
    const sortedBody = JSON.stringify(
      Object.keys(req.body)
        .sort()
        .reduce((acc: Record<string, unknown>, key) => {
          acc[key] = req.body[key];
          return acc;
        }, {})
    );

    const expectedSig = crypto
      .createHmac("sha512", IPN_SECRET)
      .update(sortedBody)
      .digest("hex");

    if (expectedSig !== signature) {
      console.error("[CryptoIPN] Invalid signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const { payment_id, payment_status, order_id } = req.body;

    console.log(`[CryptoIPN] Payment ${payment_id} for order ${order_id} â ${payment_status}`);

    // Mark order as paid on confirmed/finished status
    if (payment_status === "finished" || payment_status === "confirmed") {
      const db = await getDb();
      if (!db) { res.status(500).json({ error: "Database unavailable" }); return; }
      const [order] = await db
        .select({ id: orders.id, status: orders.status })
        .from(orders)
        .where(eq(orders.orderNumber, String(order_id).toUpperCase()))
        .limit(1);

      if (order && order.status !== "shipped" && order.status !== "delivered") {
        await db
          .update(orders)
          .set({
            status: "processing",
            paymentStatus: "paid",
            paidAt: new Date(),
          })
          .where(eq(orders.id, order.id));
        console.log(`[CryptoIPN] Order ${order_id} marked as processing (crypto confirmed)`);
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[CryptoIPN] Error:", err);
    res.status(500).json({ error: "Internal error" });
  }
}
