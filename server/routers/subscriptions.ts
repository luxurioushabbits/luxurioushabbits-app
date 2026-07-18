/**
 * Subscriptions Router — The Habbits Box
 * Plan listing, smoke shop inquiries, subscription management
 */
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { subscriptionPlans, customerSubscriptions, smokeShopInquiries } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

export const subscriptionsRouter = router({
  // Get all active subscription plans
  plans: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);

    return plans;
  }),

  // Submit Smoke Shop inquiry (custom budget $1000+)
  smokeShopInquiry: publicProcedure
    .input(
      z.object({
        businessName: z.string().min(1).max(255),
        contactName: z.string().min(1).max(255),
        email: z.string().email().max(320),
        phone: z.string().max(32).optional(),
        monthlyBudget: z.number().min(1000).max(100000),
        shippingAddress: z.object({
          address1: z.string().min(1).max(300),
          address2: z.string().max(300).optional(),
          city: z.string().min(1).max(100),
          state: z.string().min(2).max(50),
          zip: z.string().min(5).max(10),
        }),
        notes: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      if (db) {
        try {
          await db.insert(smokeShopInquiries).values({
            businessName: input.businessName,
            contactName: input.contactName,
            contactEmail: input.email,
            contactPhone: input.phone ?? null,
            monthlyBudget: input.monthlyBudget.toFixed(2),
            shippingAddress1: input.shippingAddress.address1,
            shippingAddress2: input.shippingAddress.address2 ?? null,
            shippingCity: input.shippingAddress.city,
            shippingState: input.shippingAddress.state,
            shippingZip: input.shippingAddress.zip,
            notes: input.notes ?? null,
            status: "pending",
          });
        } catch (err) {
          console.error("Failed to save smoke shop inquiry:", err);
        }
      }

      // Notify owner
      await notifyOwner({
        title: `🏪 New Smoke Shop Inquiry — ${input.businessName} ($${input.monthlyBudget.toLocaleString()}/mo)`,
        content: [
          `SMOKE SHOP SUBSCRIPTION INQUIRY`,
          ``,
          `Business: ${input.businessName}`,
          `Contact: ${input.contactName}`,
          `Email: ${input.email}`,
          `Phone: ${input.phone ?? "Not provided"}`,
          `Monthly Budget: $${input.monthlyBudget.toLocaleString()}`,
          ``,
          `SHIP TO:`,
          `  ${input.shippingAddress.address1}${input.shippingAddress.address2 ? `, ${input.shippingAddress.address2}` : ""}`,
          `  ${input.shippingAddress.city}, ${input.shippingAddress.state} ${input.shippingAddress.zip}`,
          ``,
          input.notes ? `Notes: ${input.notes}` : "",
          ``,
          `--- Reply to ${input.email} to confirm and set up their account.`,
        ].filter(Boolean).join("\n"),
      });

      return { success: true };
    }),

  // Get current user's subscription (if logged in)
  mySubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const [sub] = await db
      .select()
      .from(customerSubscriptions)
      .where(eq(customerSubscriptions.userId, ctx.user.id))
      .orderBy(desc(customerSubscriptions.createdAt))
      .limit(1);

    if (!sub) return null;

    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, sub.planId))
      .limit(1);

    return { subscription: sub, plan };
  }),

  // Pause subscription
  pause: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db
      .update(customerSubscriptions)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(customerSubscriptions.userId, ctx.user.id));
    return { success: true };
  }),

  // Resume subscription
  resume: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db
      .update(customerSubscriptions)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(customerSubscriptions.userId, ctx.user.id));
    return { success: true };
  }),

  // Cancel subscription
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db
      .update(customerSubscriptions)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(customerSubscriptions.userId, ctx.user.id));
    return { success: true };
  }),

  // Admin: list all smoke shop inquiries
  adminInquiries: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(smokeShopInquiries)
      .orderBy(desc(smokeShopInquiries.createdAt));
  }),

  // Admin: update inquiry status
  adminUpdateInquiry: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["pending", "contacted", "approved", "rejected"]),
      adminNotes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(smokeShopInquiries)
        .set({ status: input.status, adminNotes: input.adminNotes ?? null, updatedAt: new Date() })
        .where(eq(smokeShopInquiries.id, input.id));

      return { success: true };
    }),
});
