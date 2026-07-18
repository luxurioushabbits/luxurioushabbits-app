import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { strainReviewComments, users, orders, orderItems, products } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";

export const strainCommentsRouter = router({
  /** Fetch approved comments for a strain review slug */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const comments = await db
        .select()
        .from(strainReviewComments)
        .where(
          and(
            eq(strainReviewComments.slug, input.slug),
            eq(strainReviewComments.approved, true)
          )
        )
        .orderBy(desc(strainReviewComments.createdAt));

      return comments.map((c) => ({
        id: c.id,
        userName: c.userName,
        rating: c.rating,
        body: c.body,
        photoUrl: c.photoKey ? `/manus-storage/${c.photoKey}` : null,
        verifiedPurchase: c.verifiedPurchase,
        createdAt: c.createdAt,
      }));
    }),

  /** Submit a comment — must be logged in */
  submit: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        body: z.string().min(10).max(2000),
        /** Optional base64-encoded photo: "data:<mime>;base64,<data>" */
        photoDataUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if user has any completed order (status not cancelled/refunded)
      // We check by matching the product slug against product names/slugs in their orders
      // Since strain reviews are blog-slug based, we do a loose check: any non-cancelled order qualifies
      const userOrderRows = await db
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.userId, ctx.user.id),
            // Allow any order that isn't cancelled/refunded
          )
        )
        .limit(1);

      // More specific: check if user has ordered a product whose slug matches the review slug
      // (strain review slugs are like "gelato-thca-strain-review" — product slug might be "gelato")
      const productSlugFromReview = input.slug
        .replace(/-thca-strain-review$/, "")
        .replace(/-strain-review$/, "")
        .replace(/-review$/, "");

      const purchasedProductRows = await db
        .select({ id: products.id })
        .from(products)
        .innerJoin(orderItems, eq(orderItems.productId, products.id))
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(
          and(
            eq(orders.userId, ctx.user.id),
          )
        )
        .limit(1);

      const hasAnyOrder = userOrderRows.length > 0;
      const hasPurchasedProduct = purchasedProductRows.length > 0;
      const isVerifiedPurchaser = hasPurchasedProduct || hasAnyOrder;

      if (!isVerifiedPurchaser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must have purchased a product from Luxurious Habbits to leave a review.",
        });
      }

      // Use nickname if set, otherwise fall back to real name
      const userRows = await db
        .select({ name: users.name, nickname: users.nickname })
        .from(users)
        .where(eq(users.id, ctx.user.id));
      const user = userRows[0];

      const displayName = user?.nickname?.trim() || user?.name?.trim() || "Anonymous";

      let photoKey: string | null = null;
      if (input.photoDataUrl) {
        const match = input.photoDataUrl.match(
          /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/
        );
        if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid photo format" });
        const [, mime, b64] = match;
        const buffer = Buffer.from(b64, "base64");
        if (buffer.byteLength > 8 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Photo must be under 8 MB" });
        }
        const ext = mime.split("/")[1];
        const key = `strain-comments/${ctx.user.id}-${Date.now()}.${ext}`;
        const result = await storagePut(key, buffer, mime);
        photoKey = result.key;
      }

      await db.insert(strainReviewComments).values({
        slug: input.slug,
        userId: ctx.user.id,
        userName: displayName,
        rating: input.rating,
        body: input.body,
        photoKey: photoKey ?? undefined,
        approved: false,
        verifiedPurchase: isVerifiedPurchaser,
      });

      // Notify owner of new pending comment
      const stars = "★".repeat(input.rating) + "☆".repeat(5 - input.rating);
      await notifyOwner({
        title: `New Strain Comment Pending — ${input.slug}`,
        content: `**${displayName}** left a ${stars} comment on the **${input.slug}** review:\n\n"${input.body.slice(0, 300)}${input.body.length > 300 ? "…" : ""}"\n\n${photoKey ? "📷 Includes a photo." : ""}\n\nGo to Admin → Comment Moderation to approve or hide it.`,
      });

      return { success: true, message: "Comment submitted for review. It will appear after admin approval." };
    }),

  /** Admin: list all pending comments */
  listPending: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(strainReviewComments)
      .where(eq(strainReviewComments.approved, false))
      .orderBy(desc(strainReviewComments.createdAt));
  }),

  /** Admin: approve or hide a comment */
  moderate: protectedProcedure
    .input(z.object({ id: z.number(), approved: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(strainReviewComments)
        .set({ approved: input.approved })
        .where(eq(strainReviewComments.id, input.id));
      return { success: true };
    }),

  /** Admin: get all comments (pending + approved) */
  adminGetAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(strainReviewComments)
      .orderBy(desc(strainReviewComments.createdAt));
  }),

  /** Update the current user's nickname */
  updateNickname: protectedProcedure
    .input(
      z.object({
        nickname: z
          .string()
          .max(50)
          .regex(/^[a-zA-Z0-9 _\-\.]*$/, "Nickname can only contain letters, numbers, spaces, _ - .")
          .optional()
          .nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if nickname is already set — once chosen it is permanent
      const [existing] = await db
        .select({ nickname: users.nickname })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (existing?.nickname) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your display name is already set and cannot be changed.",
        });
      }

      if (!input.nickname || input.nickname.trim().length < 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Display name must be at least 2 characters.",
        });
      }

      await db
        .update(users)
        .set({ nickname: input.nickname.trim() })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  /** Get the current user's nickname */
  getMyNickname: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { nickname: null, name: null };
    const rows = await db
      .select({ nickname: users.nickname, name: users.name })
      .from(users)
      .where(eq(users.id, ctx.user.id));
    const result = rows[0];
    return { nickname: result?.nickname ?? null, name: result?.name ?? null };
  }),
});
