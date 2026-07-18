/**
 * Product Q&A Router — Luxurious Habbits
 * Customers ask questions on product pages; admin answers publicly.
 */
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import { productQuestions, products, users } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, adminProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

export const productQARouter = router({
  // Public: list answered questions for a product
  listForProduct: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id: productQuestions.id,
          question: productQuestions.question,
          answer: productQuestions.answer,
          answeredAt: productQuestions.answeredAt,
          createdAt: productQuestions.createdAt,
          askerName: users.name,
        })
        .from(productQuestions)
        .innerJoin(users, eq(productQuestions.userId, users.id))
        .where(eq(productQuestions.productId, input.productId))
        .orderBy(desc(productQuestions.createdAt));
    }),

  // Customer: submit a question
  ask: protectedProcedure
    .input(z.object({
      productId: z.number(),
      question: z.string().min(5).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(productQuestions).values({
        productId: input.productId,
        userId: ctx.user.id,
        question: input.question,
        isPublished: false,
      });

      // Get product name for notification
      const [product] = await db
        .select({ name: products.name })
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      notifyOwner({
        title: "New Product Question",
        content: `**${ctx.user.name ?? ctx.user.email}** asked a question on **${product?.name ?? "a product"}**:\n\n> ${input.question}\n\nGo to Admin → Product Q&A tab to answer.`,
      }).catch((e) => console.error("[Notification] Product Q&A notify failed:", e));

      return { success: true, message: "Your question has been submitted. We'll answer it shortly!" };
    }),

  // Admin: list all questions (with optional filter)
  adminList: adminProcedure
    .input(z.object({ answered: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select({
          id: productQuestions.id,
          productId: productQuestions.productId,
          question: productQuestions.question,
          answer: productQuestions.answer,
          isPublished: productQuestions.isPublished,
          answeredAt: productQuestions.answeredAt,
          createdAt: productQuestions.createdAt,
          askerName: users.name,
          askerEmail: users.email,
          productName: products.name,
        })
        .from(productQuestions)
        .innerJoin(users, eq(productQuestions.userId, users.id))
        .innerJoin(products, eq(productQuestions.productId, products.id))
        .orderBy(desc(productQuestions.createdAt));

      if (input?.answered === true) return rows.filter((r) => r.answer !== null);
      if (input?.answered === false) return rows.filter((r) => r.answer === null);
      return rows;
    }),

  // Admin: answer a question and publish it
  answer: adminProcedure
    .input(z.object({
      id: z.number(),
      answer: z.string().min(1).max(2000),
      publish: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(productQuestions)
        .set({
          answer: input.answer,
          answeredAt: new Date(),
          isPublished: input.publish,
        })
        .where(eq(productQuestions.id, input.id));

      return { success: true };
    }),

  // Admin: toggle publish status
  togglePublish: adminProcedure
    .input(z.object({ id: z.number(), isPublished: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(productQuestions)
        .set({ isPublished: input.isPublished })
        .where(eq(productQuestions.id, input.id));

      return { success: true };
    }),

  // Admin: delete a question
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(productQuestions).where(eq(productQuestions.id, input.id));
      return { success: true };
    }),
});
