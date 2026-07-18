/**
 * Profile Router — user profile management
 * - getProfile: fetch current user's profile (name, nickname, profilePhotoKey, walletAddress)
 * - updateProfile: update nickname/display name
 * - uploadPhoto: upload a profile photo to S3 and save the key
 */
import { z } from "zod";
import { eq, count, sum } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users, orders, loyaltyPoints } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const profileRouter = router({
  /** Get current user's full profile */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        nickname: users.nickname,
        profilePhotoKey: users.profilePhotoKey,
        walletAddress: users.walletAddress,
        role: users.role,
        loyaltyTier: users.loyaltyTier,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);
    return rows[0] ?? null;
  }),

  /** Update display name (nickname) */
  updateNickname: protectedProcedure
    .input(z.object({
      nickname: z.string().max(40).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .update(users)
        .set({ nickname: input.nickname || null })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  /** Upload profile photo — receives raw bytes as base64, stores in S3 */
  uploadPhoto: protectedProcedure
    .input(z.object({
      base64: z.string().max(10 * 1024 * 1024), // ~7.5MB raw → ~10MB base64
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const ext = input.mimeType === "image/png" ? "png" : input.mimeType === "image/webp" ? "webp" : "jpg";
      const relKey = `profile-photos/user_${ctx.user.id}_${Date.now()}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");

      // storagePut appends a hash suffix to the key — save the RETURNED key, not the input key
      const { url, key: savedKey } = await storagePut(relKey, buffer, input.mimeType);

      await db
        .update(users)
        .set({ profilePhotoKey: savedKey })
        .where(eq(users.id, ctx.user.id));

      return { success: true, url, key: savedKey };
    }),

  /** Admin: get any user's full profile by userId (for live visitor click-through) */
  adminGetUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!userRow) throw new TRPCError({ code: "NOT_FOUND" });

      // Order count and total spend
      const [orderStats] = await db
        .select({
          orderCount: count(orders.id),
          totalSpend: sum(orders.total),
        })
        .from(orders)
        .where(eq(orders.userId, input.userId));

      // Loyalty points balance
      const [pointsRow] = await db
        .select({ total: sum(loyaltyPoints.points) })
        .from(loyaltyPoints)
        .where(eq(loyaltyPoints.userId, input.userId));

      return {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        phone: userRow.phone,
        nickname: userRow.nickname,
        profilePhotoKey: userRow.profilePhotoKey,
        walletAddress: userRow.walletAddress,
        role: userRow.role,
        loyaltyTier: userRow.loyaltyTier,
        loginMethod: userRow.loginMethod,
        createdAt: userRow.createdAt,
        lastSignedIn: userRow.lastSignedIn,
        orderCount: Number(orderStats?.orderCount ?? 0),
        totalSpend: Number(orderStats?.totalSpend ?? 0),
        loyaltyPoints: Number(pointsRow?.total ?? 0),
        isWholesale: userRow.isWholesale ?? false,
        wholesaleApprovedAt: userRow.wholesaleApprovedAt ?? null,
      };
    }),

  /** Admin: set any user's nickname/display name */
  adminSetNickname: adminProcedure
    .input(z.object({
      userId: z.number(),
      nickname: z.string().max(40),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(users)
        .set({ nickname: input.nickname.trim() || null })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** Remove profile photo */
  removePhoto: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db
      .update(users)
      .set({ profilePhotoKey: null })
      .where(eq(users.id, ctx.user.id));
    return { success: true };
  }),
});
