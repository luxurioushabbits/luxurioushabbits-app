/**
 * Scheduled Handlers — Luxurious Habbits
 * Express handlers for heartbeat cron jobs.
 * All handlers are mounted at /api/scheduled/* in server/_core/index.ts
 */
import { Request, Response } from "express";
import { getDb } from "./db";
import { customerSubscriptions, subscriptionPlans, abandonedCarts } from "../drizzle/schema";
import { eq, and, between, isNull, lt } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { sendSubscriptionRenewalReminder, sendAbandonedCartRecovery, sendEmail } from "./email";

/**
 * Build a cart items HTML table for emails
 */
function buildCartItemsHtml(cartData: string, totalCents: number): string {
  const items: Array<{ name: string; quantity: number; price: number }> = JSON.parse(cartData ?? "[]");
  const itemRows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;color:#ccc;font-size:13px;">${i.name} ×${i.quantity}</td><td style="padding:8px 0;color:#ccc;font-size:13px;text-align:right;">$${(i.price / 100).toFixed(2)}</td></tr>`
    )
    .join("");
  const total = (totalCents / 100).toFixed(2);
  return `<table style="width:100%;border-collapse:collapse;">${itemRows}</table>
    <div style="border-top:1px solid #1a1a1a;margin-top:12px;padding-top:12px;">
      <span style="font-size:14px;font-weight:600;color:#fff;">Total: </span>
      <span style="font-size:14px;font-weight:600;color:#bf5fff;">$${total}</span>
    </div>`;
}

/**
 * Hourly job: 3-email abandoned cart sequence.
 * Email 1 (1hr):  "Your cart is waiting" — no discount
 * Email 2 (24hr): "Still thinking it over?" — 5% off code
 * Email 3 (72hr): "Last chance — 10% off" — 10% off code
 * Cron: "0 0 * * * *" (top of every hour)
 */
export async function handleAbandonedCartEmails(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "db unavailable" });

    const now = new Date();
    const oneHourAgo   = new Date(now.getTime() -  1 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const ninetyNineHoursAgo = new Date(now.getTime() - 99 * 60 * 60 * 1000);

    const allCarts = await db
      .select()
      .from(abandonedCarts)
      .where(and(isNull(abandonedCarts.recoveredAt), lt(abandonedCarts.updatedAt, oneHourAgo)))
      .limit(200);

    let sent = 0;

    for (const cart of allCarts) {
      const updatedAt = cart.updatedAt ? new Date(cart.updatedAt) : null;
      if (!updatedAt) continue;

      try {
        const cartHtml = buildCartItemsHtml(cart.cartData ?? "[]", cart.totalCents ?? 0);

        // ── EMAIL 1: 1-24 hours old, no email sent yet ──
        if (
          !cart.recoveryEmailSentAt &&
          updatedAt < oneHourAgo &&
          updatedAt > twentyFourHoursAgo
        ) {
          await sendEmail({
            to: cart.email,
            subject: "You left something behind 👀",
            html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
  <div style="background:#0a0a0a;padding:32px 40px;border-bottom:1px solid #1a1a1a;text-align:center;">
    <div style="font-size:11px;letter-spacing:0.25em;color:#666;text-transform:uppercase;margin-bottom:8px;">Premium Hemp</div>
    <div style="font-size:26px;letter-spacing:0.12em;font-weight:700;color:#fff;text-transform:uppercase;">Luxurious Habbits</div>
  </div>
  <div style="padding:32px 40px;">
    <h2 style="font-size:18px;font-weight:600;color:#fff;margin:0 0 8px;">Your cart is waiting</h2>
    <p style="font-size:13px;color:#888;margin:0 0 24px;">You left some premium hemp behind. Come back and complete your order — we're holding your selections.</p>
    <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:20px;margin-bottom:24px;">${cartHtml}</div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://www.luxurioushabbits.com/products" style="display:inline-block;background:linear-gradient(135deg,#bf5fff,#8b00ff);color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:13px;font-weight:600;">Complete Your Order</a>
    </div>
    <p style="font-size:11px;color:#444;text-align:center;">Stock is limited. Don't miss out on what you had in mind.</p>
  </div>
  <div style="padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;"><p style="font-size:11px;color:#444;margin:0;">© ${new Date().getFullYear()} Luxurious Habbits</p></div>
</div></body></html>`,
          });
          await db.update(abandonedCarts).set({ recoveryEmailSentAt: new Date() }).where(eq(abandonedCarts.id, cart.id));
          sent++;

        // ── EMAIL 2: 24-48 hours old, email 1 sent, no email 2 yet ──
        } else if (
          cart.recoveryEmailSentAt &&
          !(cart as any).email2SentAt &&
          updatedAt < twentyFourHoursAgo &&
          updatedAt > fortyEightHoursAgo
        ) {
          const coupon = "COMEBACK5";
          await sendEmail({
            to: cart.email,
            subject: "Still thinking it over? Here's 5% off 🌿",
            html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
  <div style="background:#0a0a0a;padding:32px 40px;border-bottom:1px solid #1a1a1a;text-align:center;">
    <div style="font-size:11px;letter-spacing:0.25em;color:#666;text-transform:uppercase;margin-bottom:8px;">Premium Hemp</div>
    <div style="font-size:26px;letter-spacing:0.12em;font-weight:700;color:#fff;text-transform:uppercase;">Luxurious Habbits</div>
  </div>
  <div style="padding:32px 40px;">
    <h2 style="font-size:18px;font-weight:600;color:#fff;margin:0 0 8px;">Still thinking it over?</h2>
    <p style="font-size:13px;color:#888;margin:0 0 16px;">We noticed you haven't completed your order. As a thank you for your interest, here's <strong style="color:#d4af37;">5% off</strong> your cart.</p>
    <div style="background:#1a1200;border:1px solid #d4af3744;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:0.2em;color:#888;text-transform:uppercase;margin-bottom:6px;">Your Discount Code</div>
      <div style="font-size:24px;font-weight:700;color:#d4af37;letter-spacing:0.15em;">${coupon}</div>
      <div style="font-size:11px;color:#666;margin-top:4px;">5% off your order · Expires in 48 hours</div>
    </div>
    <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:20px;margin-bottom:24px;">${cartHtml}</div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://www.luxurioushabbits.com/products" style="display:inline-block;background:linear-gradient(135deg,#bf5fff,#8b00ff);color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:13px;font-weight:600;">Claim My 5% Off</a>
    </div>
  </div>
  <div style="padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;"><p style="font-size:11px;color:#444;margin:0;">© ${new Date().getFullYear()} Luxurious Habbits</p></div>
</div></body></html>`,
          });
          await db.update(abandonedCarts).set({ email2SentAt: new Date() } as any).where(eq(abandonedCarts.id, cart.id));
          sent++;

        // ── EMAIL 3: 72-99 hours old, email 2 sent, no email 3 yet ──
        } else if (
          (cart as any).email2SentAt &&
          !(cart as any).email3SentAt &&
          updatedAt < seventyTwoHoursAgo &&
          updatedAt > ninetyNineHoursAgo
        ) {
          const coupon = "LASTCHANCE10";
          await sendEmail({
            to: cart.email,
            subject: "Last chance — 10% off your cart ⚡",
            html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
  <div style="background:#0a0a0a;padding:32px 40px;border-bottom:1px solid #1a1a1a;text-align:center;">
    <div style="font-size:11px;letter-spacing:0.25em;color:#666;text-transform:uppercase;margin-bottom:8px;">Premium Hemp</div>
    <div style="font-size:26px;letter-spacing:0.12em;font-weight:700;color:#fff;text-transform:uppercase;">Luxurious Habbits</div>
  </div>
  <div style="padding:32px 40px;">
    <h2 style="font-size:18px;font-weight:600;color:#fff;margin:0 0 8px;">This is your last chance.</h2>
    <p style="font-size:13px;color:#888;margin:0 0 16px;">Your cart expires soon. We're offering you <strong style="color:#ff6b6b;">10% off</strong> — our best offer. After this, we can't hold your items any longer.</p>
    <div style="background:#1a0000;border:1px solid #ff6b6b44;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:0.2em;color:#888;text-transform:uppercase;margin-bottom:6px;">Final Offer Code</div>
      <div style="font-size:24px;font-weight:700;color:#ff6b6b;letter-spacing:0.15em;">${coupon}</div>
      <div style="font-size:11px;color:#666;margin-top:4px;">10% off your entire order · Expires in 24 hours</div>
    </div>
    <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:20px;margin-bottom:24px;">${cartHtml}</div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://www.luxurioushabbits.com/products" style="display:inline-block;background:linear-gradient(135deg,#ff6b6b,#cc0000);color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:13px;font-weight:600;">Claim My 10% Off Now</a>
    </div>
  </div>
  <div style="padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;"><p style="font-size:11px;color:#444;margin:0;">© ${new Date().getFullYear()} Luxurious Habbits</p></div>
</div></body></html>`,
          });
          await db.update(abandonedCarts).set({ email3SentAt: new Date() } as any).where(eq(abandonedCarts.id, cart.id));
          sent++;
        }
      } catch (e) {
        console.error(`[AbandonedCart] Failed to send to ${cart.email}:`, e);
      }
    }

    return res.json({ ok: true, sent, total: allCarts.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg, timestamp: new Date().toISOString() });
  }
}

/**
 * Daily job: send renewal reminder 3 days before subscription renews.
 * Cron: "0 0 10 * * *" (10:00 UTC daily)
 */
export async function handleSubscriptionRenewalReminders(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "db unavailable" });

    // Find subscriptions renewing in exactly 3 days
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const windowStart = new Date(threeDaysFromNow);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(threeDaysFromNow);
    windowEnd.setHours(23, 59, 59, 999);

    const subs = await db
      .select({
        id: customerSubscriptions.id,
        planId: customerSubscriptions.planId,
        contactName: customerSubscriptions.contactName,
        contactEmail: customerSubscriptions.contactEmail,
        shippingName: customerSubscriptions.shippingName,
        shippingAddress1: customerSubscriptions.shippingAddress1,
        shippingCity: customerSubscriptions.shippingCity,
        shippingState: customerSubscriptions.shippingState,
        shippingZip: customerSubscriptions.shippingZip,
        nextBillingDate: customerSubscriptions.nextBillingDate,
        planName: subscriptionPlans.name,
        planPrice: subscriptionPlans.monthlyPrice,
      })
      .from(customerSubscriptions)
      .innerJoin(subscriptionPlans, eq(customerSubscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(customerSubscriptions.status, "active"),
          between(customerSubscriptions.nextBillingDate, windowStart, windowEnd)
        )
      );

    let sent = 0;
    for (const sub of subs) {
      if (!sub.contactEmail) continue;

      const renewalDate = sub.nextBillingDate
        ? new Date(sub.nextBillingDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "soon";

      await sendSubscriptionRenewalReminder({
        to: sub.contactEmail,
        customerName: sub.shippingName ?? sub.contactName ?? "Valued Member",
        planName: sub.planName ?? "Habbits Box",
        renewalDate,
        amount: sub.planPrice ? Number(sub.planPrice).toFixed(2) : "—",
        shippingAddress: {
          address1: sub.shippingAddress1,
          city: sub.shippingCity,
          state: sub.shippingState,
          zip: sub.shippingZip,
        },
      }).catch((e) => console.error("[Email] Renewal reminder failed:", e));

      sent++;
    }

    return res.json({ ok: true, sent, total: subs.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg, timestamp: new Date().toISOString() });
  }
}

/**
 * Daily job: sync TopShelf WooCommerce retail prices into all mapped products.
 * This ensures invoices are always 100% accurate even if TopShelf changes pricing.
 * Cron: "0 0 6 * * *" (6:00 UTC daily)
 */
export async function handleTopShelfPriceSync(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "db unavailable" });

    const CK = process.env.TOPSHELF_WC_CONSUMER_KEY;
    const CS = process.env.TOPSHELF_WC_CONSUMER_SECRET;
    const TOPSHELF_API_URL = process.env.TOPSHELF_API_URL ?? "";
    const SITE_BASE = TOPSHELF_API_URL.replace(/\/wp-json.*$/, "");
    const WC_BASE = `${SITE_BASE}/wp-json/wc/v3`;
    const WC_AUTH = Buffer.from(`${CK}:${CS}`).toString("base64");

    if (!CK || !CS) {
      return res.status(500).json({ error: "TopShelf WC credentials not configured" });
    }

    // Build variation → { product_id, regular_price } map from WooCommerce
    const wcMap = new Map<number, { product_id: number; regular_price: number }>();
    const wcRes = await fetch(`${WC_BASE}/products?type=variable&per_page=100&status=publish`, {
      headers: { Authorization: `Basic ${WC_AUTH}` },
      signal: AbortSignal.timeout(30_000),
    });

    if (!wcRes.ok) {
      return res.status(502).json({ error: `WooCommerce fetch failed: ${wcRes.status}` });
    }

    const wcProducts = await wcRes.json() as Array<{ id: number; name: string }>;

    for (const wcp of wcProducts) {
      const varRes = await fetch(`${WC_BASE}/products/${wcp.id}/variations?per_page=100`, {
        headers: { Authorization: `Basic ${WC_AUTH}` },
        signal: AbortSignal.timeout(15_000),
      });
      if (!varRes.ok) continue;
      const variations = await varRes.json() as Array<{ id: number; regular_price?: string; price?: string }>;
      for (const v of variations) {
        const price = parseFloat(v.regular_price ?? v.price ?? "0");
        if (v.id && price > 0) {
          wcMap.set(v.id, { product_id: wcp.id, regular_price: price });
        }
      }
    }

    console.log(`[TopShelfPriceSync] Loaded ${wcMap.size} WooCommerce variations`);

    // Get all products with a TopShelf variation ID
    const { products } = await import("../drizzle/schema");
    const { isNotNull } = await import("drizzle-orm");

    const mappedProducts = await db
      .select({
        id: products.id,
        name: products.name,
        topshelfVariationId: products.topshelfVariationId,
        topshelfProductId: products.topshelfProductId,
        topshelfRetailPrice: products.topshelfRetailPrice,
      })
      .from(products)
      .where(isNotNull(products.topshelfVariationId));

    let updated = 0;
    let unchanged = 0;
    let notFound = 0;
    const changes: Array<{ id: number; name: string; oldPrice: string | null; newPrice: number; oldProductId: number | null; newProductId: number }> = [];

    for (const p of mappedProducts) {
      const varId = p.topshelfVariationId;
      if (!varId) continue;

      const wc = wcMap.get(varId);
      if (!wc) {
        notFound++;
        console.warn(`[TopShelfPriceSync] Variation ${varId} (${p.name}) not found in WooCommerce`);
        continue;
      }

      const currentPrice = p.topshelfRetailPrice ? parseFloat(p.topshelfRetailPrice) : null;
      const priceChanged = currentPrice === null || Math.abs(currentPrice - wc.regular_price) >= 0.01;
      const productIdChanged = p.topshelfProductId !== wc.product_id;

      if (priceChanged || productIdChanged) {
        await db
          .update(products)
          .set({
            topshelfRetailPrice: String(wc.regular_price.toFixed(2)),
            topshelfProductId: wc.product_id,
          })
          .where((await import("drizzle-orm")).eq(products.id, p.id));

        changes.push({
          id: p.id,
          name: p.name,
          oldPrice: p.topshelfRetailPrice,
          newPrice: wc.regular_price,
          oldProductId: p.topshelfProductId,
          newProductId: wc.product_id,
        });
        updated++;
      } else {
        unchanged++;
      }
    }

    if (changes.length > 0) {
      console.log(`[TopShelfPriceSync] Updated ${updated} products:`, JSON.stringify(changes, null, 2));
    }

    return res.json({
      ok: true,
      updated,
      unchanged,
      notFound,
      changes,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[TopShelfPriceSync] Error:", msg);
    return res.status(500).json({ error: msg, stack: err instanceof Error ? err.stack : undefined, timestamp: new Date().toISOString() });
  }
}

/**
 * Every-6-hours job: sync the TopShelf catalog to keep product availability fresh.
 * Updates existing mapped products' stock status and adds any new catalog items.
 * Cron: every 6 hours at top of hour
 */
export async function handleTopShelfCatalogSync(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "db unavailable" });

    // Import here to avoid circular deps at module level
    const { getTopShelfCatalog } = await import("../server/topshelf");
    const catalog = await getTopShelfCatalog();

    if (!catalog || catalog.length === 0) {
      return res.json({ ok: true, synced: 0, message: "Empty catalog returned" });
    }

    // Update stock status for any products that have a topshelfVariationId
    const { products } = await import("../drizzle/schema");
    const { eq, inArray } = await import("drizzle-orm");

    const mappedProducts = await db
      .select({ id: products.id, topshelfVariationId: (products as any).topshelfVariationId })
      .from(products)
      .where(eq((products as any).topshelfVariationId, ""));

    // Build a lookup map from the catalog
    const catalogMap = new Map<string, { inStock: boolean }>();
    for (const item of catalog) {
      catalogMap.set(String(item.variation_id), {
        inStock: item.stock_status !== "out_of_stock",
      });
    }

    let updated = 0;
    for (const p of mappedProducts) {
      const variationId = String((p as any).topshelfVariationId ?? "");
      if (!variationId) continue;
      const catalogItem = catalogMap.get(variationId);
      if (!catalogItem) continue;
      // If out of stock, deactivate; if back in stock, keep as-is (admin decides to re-activate)
      if (!catalogItem.inStock) {
        await db.update(products).set({ isActive: false }).where(eq(products.id, p.id));
        updated++;
      }
    }

    return res.json({ ok: true, catalogItems: catalog.length, updated, timestamp: new Date().toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[TopShelfSync] Error:", msg);
    return res.status(500).json({ error: msg, timestamp: new Date().toISOString() });
  }
}
