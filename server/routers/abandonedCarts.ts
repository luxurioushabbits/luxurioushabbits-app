/**
 * Abandoned Carts Router — Luxurious Habbits
 * Saves cart state, sends recovery email after 1 hour of inactivity.
 * Admin can trigger recovery emails manually.
 */
import { z } from "zod";
import { eq, isNull, lt, and } from "drizzle-orm";
import { getDb } from "../db";
import { abandonedCarts } from "../../drizzle/schema";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { sendEmail } from "../email";

const cartItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  quantity: z.number(),
  price: z.number(), // cents
  imageUrl: z.string().optional(),
  slug: z.string().optional(),
});

export const abandonedCartsRouter = router({
  // Save/update cart state (called on cart change, debounced on frontend)
  saveCart: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        userId: z.number().optional(),
        items: z.array(cartItemSchema),
        totalCents: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Check for existing cart by email
      const existing = await db
        .select()
        .from(abandonedCarts)
        .where(and(eq(abandonedCarts.email, input.email), isNull(abandonedCarts.recoveredAt)))
        .limit(1);

      const cartData = JSON.stringify(input.items);

      if (existing.length > 0) {
        await db
          .update(abandonedCarts)
          .set({
            cartData,
            totalCents: input.totalCents,
            userId: input.userId ?? null,
          })
          .where(eq(abandonedCarts.id, existing[0].id));
      } else {
        await db.insert(abandonedCarts).values({
          email: input.email,
          userId: input.userId ?? null,
          cartData,
          totalCents: input.totalCents,
        });
      }

      return { success: true };
    }),

  // Mark cart as recovered (called when order is placed)
  markRecovered: publicProcedure
    .input(z.object({ email: z.string().email(), orderId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(abandonedCarts)
        .set({ recoveredAt: new Date(), orderId: input.orderId })
        .where(and(eq(abandonedCarts.email, input.email), isNull(abandonedCarts.recoveredAt)));

      return { success: true };
    }),

  // Admin: send recovery email to a specific cart
  sendRecoveryEmail: adminProcedure
    .input(z.object({ cartId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const rows = await db
        .select()
        .from(abandonedCarts)
        .where(eq(abandonedCarts.id, input.cartId))
        .limit(1);

      if (rows.length === 0) throw new Error("Cart not found");
      const cart = rows[0];
      if (cart.recoveredAt) throw new Error("Cart already recovered");

      const items: Array<{ name: string; quantity: number; price: number; slug?: string }> = JSON.parse(cart.cartData);
      const itemRows = items
        .map(
          (i) =>
            `<tr><td style="padding:8px 0;color:#ccc;font-size:13px;">${i.name} ×${i.quantity}</td><td style="padding:8px 0;color:#ccc;font-size:13px;text-align:right;">$${(i.price / 100).toFixed(2)}</td></tr>`
        )
        .join("");

      await sendEmail({
        to: cart.email,
        subject: "You left something behind 👀",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:40px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
    <div style="background:#0a0a0a;padding:32px 40px;border-bottom:1px solid #1a1a1a;text-align:center;">
      <div style="font-size:11px;letter-spacing:0.25em;color:#666;text-transform:uppercase;margin-bottom:8px;">Premium Hemp</div>
      <div style="font-size:26px;letter-spacing:0.12em;font-weight:700;color:#fff;text-transform:uppercase;">Luxurious Habbits</div>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="font-size:18px;font-weight:600;color:#fff;margin:0 0 8px;">Your cart is waiting</h2>
      <p style="font-size:13px;color:#888;margin:0 0 24px;">You left some premium hemp behind. Come back and complete your order — we're holding your selections.</p>
      <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:20px;margin-bottom:24px;">
        <div style="font-size:11px;letter-spacing:0.15em;color:#555;text-transform:uppercase;margin-bottom:12px;">Your Cart</div>
        <table style="width:100%;border-collapse:collapse;">${itemRows}</table>
        <div style="border-top:1px solid #1a1a1a;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;">
          <span style="font-size:14px;font-weight:600;color:#fff;">Total</span>
          <span style="font-size:14px;font-weight:600;color:#bf5fff;">$${(cart.totalCents / 100).toFixed(2)}</span>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://www.luxurioushabbits.com/products" style="display:inline-block;background:linear-gradient(135deg,#bf5fff,#8b00ff);color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:0.05em;">Complete Your Order</a>
      </div>
      <p style="font-size:11px;color:#444;line-height:1.6;margin:0;text-align:center;">Stock is limited. Don't miss out on what you had in mind.</p>
    </div>
    <div style="padding:20px 40px;border-top:1px solid #1a1a1a;text-align:center;">
      <p style="font-size:11px;color:#444;margin:0;">© ${new Date().getFullYear()} Luxurious Habbits · <a href="https://www.luxurioushabbits.com" style="color:#555;text-decoration:none;">luxurioushabbits.com</a></p>
    </div>
  </div>
</body>
</html>`,
      });

      await db
        .update(abandonedCarts)
        .set({ recoveryEmailSentAt: new Date() })
        .where(eq(abandonedCarts.id, input.cartId));

      return { success: true };
    }),

  // Admin: list abandoned carts (not recovered, older than 1 hour)
  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return db
      .select()
      .from(abandonedCarts)
      .where(and(isNull(abandonedCarts.recoveredAt), lt(abandonedCarts.updatedAt, oneHourAgo)))
      .orderBy(abandonedCarts.updatedAt);
  }),
});
