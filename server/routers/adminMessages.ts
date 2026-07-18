import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { adminMessages, adminMessageSeen, adminMessageReplies, users } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const adminMessagesRouter = router({
  // Admin: send a message to a specific user or broadcast to all
  send: adminProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        type: z.enum(["info", "promo", "alert"]).default("info"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(adminMessages).values({
        userId: input.userId ?? null,
        title: input.title,
        message: input.message,
        type: input.type,
        createdAt: new Date(),
      });
      return { success: true };
    }),

  // Admin: list all sent messages with replies
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const msgs = await db
      .select()
      .from(adminMessages)
      .orderBy(desc(adminMessages.createdAt))
      .limit(100);
    // Fetch replies for each message
    const replies = await db.select().from(adminMessageReplies).orderBy(adminMessageReplies.createdAt);
    return msgs.map(m => ({
      ...m,
      replies: replies.filter(r => r.messageId === m.id),
    }));
  }),

  // User: reply to a message
  reply: protectedProcedure
    .input(z.object({ messageId: z.number(), reply: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(adminMessageReplies).values({
        messageId: input.messageId,
        userId: ctx.user.id,
        reply: input.reply,
        createdAt: new Date(),
      });
      return { success: true };
    }),

  // Admin: get replies for a specific message
  getReplies: adminProcedure
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(adminMessageReplies)
        .where(eq(adminMessageReplies.messageId, input.messageId))
        .orderBy(adminMessageReplies.createdAt);
    }),

  // User: poll for the oldest unseen message
  checkPending: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const userId = ctx.user.id;

    // All messages for this user (broadcast or targeted)
    const allMessages = await db
      .select()
      .from(adminMessages)
      .orderBy(adminMessages.createdAt);

    const relevant = allMessages.filter(
      (m: typeof adminMessages.$inferSelect) =>
        m.userId === null || m.userId === userId
    );
    if (relevant.length === 0) return null;

    // Messages this user has already seen
    const seenRows = await db
      .select({ messageId: adminMessageSeen.messageId })
      .from(adminMessageSeen)
      .where(eq(adminMessageSeen.userId, userId));

    const seenIds = new Set(seenRows.map((r: { messageId: number }) => r.messageId));

    // Return the first unseen message
    const unseen = relevant.find(
      (m: typeof adminMessages.$inferSelect) => !seenIds.has(m.id)
    );
    return unseen ?? null;
  }),

  // User: dismiss a message (mark as seen)
  dismiss: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      try {
        await db.insert(adminMessageSeen).values({
          messageId: input.messageId,
          userId: ctx.user.id,
          seenAt: new Date(),
        });
      } catch {
        // Duplicate — already seen
      }
      return { success: true };
    }),

  // Admin: edit a sent message (update title, message, type)
  editMessage: adminProcedure
    .input(
      z.object({
        messageId: z.number(),
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        type: z.enum(["info", "promo", "alert"]).default("info"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(adminMessages)
        .set({ title: input.title, message: input.message, type: input.type })
        .where(eq(adminMessages.id, input.messageId));
      return { success: true };
    }),

  // Admin: delete a sent message
  deleteMessage: adminProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Delete replies first (FK), then the message
      await db.delete(adminMessageReplies).where(eq(adminMessageReplies.messageId, input.messageId));
      await db.delete(adminMessageSeen).where(eq(adminMessageSeen.messageId, input.messageId));
      await db.delete(adminMessages).where(eq(adminMessages.id, input.messageId));
      return { success: true };
    }),

  // Admin: list users for the user selector
  listUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .orderBy(users.name)
      .limit(500);
  }),
});
