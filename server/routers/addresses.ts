/**
 * Address Book Router — Luxurious Habbits
 * Customers can save, edit, delete, and select shipping addresses.
 */
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import { userAddresses } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";

const addressInput = z.object({
  label: z.string().min(1).max(64).default("Home"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  address1: z.string().min(1).max(255),
  address2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zip: z.string().min(1).max(20),
  phone: z.string().max(30).optional(),
  isDefault: z.boolean().default(false),
});

export const addressesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, ctx.user.id))
      .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));
  }),

  add: protectedProcedure.input(addressInput).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // If setting as default, clear existing default first
    if (input.isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, ctx.user.id));
    }

    await db.insert(userAddresses).values({
      userId: ctx.user.id,
      label: input.label,
      firstName: input.firstName,
      lastName: input.lastName,
      address1: input.address1,
      address2: input.address2 ?? null,
      city: input.city,
      state: input.state,
      zip: input.zip,
      phone: input.phone ?? null,
      isDefault: input.isDefault,
    });

    return { success: true };
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number() }).merge(addressInput))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify ownership
      const [existing] = await db
        .select()
        .from(userAddresses)
        .where(and(eq(userAddresses.id, input.id), eq(userAddresses.userId, ctx.user.id)))
        .limit(1);
      if (!existing) throw new Error("Address not found");

      if (input.isDefault) {
        await db
          .update(userAddresses)
          .set({ isDefault: false })
          .where(eq(userAddresses.userId, ctx.user.id));
      }

      await db
        .update(userAddresses)
        .set({
          label: input.label,
          firstName: input.firstName,
          lastName: input.lastName,
          address1: input.address1,
          address2: input.address2 ?? null,
          city: input.city,
          state: input.state,
          zip: input.zip,
          phone: input.phone ?? null,
          isDefault: input.isDefault,
        })
        .where(eq(userAddresses.id, input.id));

      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .delete(userAddresses)
        .where(and(eq(userAddresses.id, input.id), eq(userAddresses.userId, ctx.user.id)));

      return { success: true };
    }),

  setDefault: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, ctx.user.id));

      await db
        .update(userAddresses)
        .set({ isDefault: true })
        .where(and(eq(userAddresses.id, input.id), eq(userAddresses.userId, ctx.user.id)));

      return { success: true };
    }),
});
