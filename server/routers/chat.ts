/**
 * chat.ts — Two-way live chat between admin and users (including anonymous)
 *
 * Anonymous users are identified by a UUID sessionId stored in their browser localStorage.
 * Logged-in users are identified by their userId.
 * Admin can initiate or reply to any conversation.
 */
import { z } from "zod";
import { eq, desc, or, and, sql } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { chatConversations, chatMessages, users } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export const chatRouter = router({
  // ── PUBLIC (works for both anon and logged-in users) ──────────────────────

  /**
   * Get or create a conversation for this visitor.
   * - Logged-in: match by userId
   * - Anonymous: match by sessionId
   */
  getOrCreateConversation: publicProcedure
    .input(z.object({
      sessionId: z.string().uuid(),          // always required (generated client-side)
      displayName: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userId = (ctx as any).user?.id ?? null;

      // Try to find existing conversation
      let existing = null;
      if (userId) {
        const rows = await db.select().from(chatConversations)
          .where(eq(chatConversations.userId, userId)).limit(1);
        existing = rows[0] ?? null;
      }
      if (!existing) {
        const rows = await db.select().from(chatConversations)
          .where(eq(chatConversations.sessionId, input.sessionId)).limit(1);
        existing = rows[0] ?? null;
      }

      if (existing) {
        // If user just logged in, link the conversation to their account
        if (userId && !existing.userId) {
          await db.update(chatConversations)
            .set({ userId })
            .where(eq(chatConversations.id, existing.id));
          existing = { ...existing, userId };
        }
        return existing;
      }

      // Create new conversation
      const displayName = input.displayName
        || (ctx as any).user?.name
        || "Anonymous Visitor";

      const [result] = await db.insert(chatConversations).values({
        userId,
        sessionId: input.sessionId,
        displayName,
        lastMessageAt: new Date(),
        adminUnread: 0,
        userUnread: 0,
      });

      const [created] = await db.select().from(chatConversations)
        .where(eq(chatConversations.id, (result as any).insertId)).limit(1);
      return created;
    }),

  /**
   * Send a message as the user (logged-in or anonymous).
   */
  sendMessage: publicProcedure
    .input(z.object({
      conversationId: z.number(),
      sessionId: z.string().uuid(),
      body: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verify ownership — must be the userId or sessionId owner
      const [conv] = await db.select().from(chatConversations)
        .where(eq(chatConversations.id, input.conversationId)).limit(1);
      if (!conv) throw new TRPCError({ code: "NOT_FOUND" });

      const userId = (ctx as any).user?.id ?? null;
      const isOwner = (userId && conv.userId === userId) || conv.sessionId === input.sessionId;
      if (!isOwner) throw new TRPCError({ code: "FORBIDDEN" });

      await db.insert(chatMessages).values({
        conversationId: input.conversationId,
        senderRole: "user",
        body: input.body,
      });

      // Increment admin unread count and update lastMessageAt
      await db.update(chatConversations)
        .set({
          adminUnread: sql`${chatConversations.adminUnread} + 1`,
          lastMessageAt: new Date(),
        })
        .where(eq(chatConversations.id, input.conversationId));

      return { success: true };
    }),

  /**
   * Poll for messages in a conversation (user side).
   * Returns all messages and resets userUnread to 0.
   */
  getMessages: publicProcedure
    .input(z.object({
      conversationId: z.number(),
      sessionId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { messages: [], userUnread: 0 };

      // Verify ownership
      const [conv] = await db.select().from(chatConversations)
        .where(eq(chatConversations.id, input.conversationId)).limit(1);
      if (!conv) return { messages: [], userUnread: 0 };

      const userId = (ctx as any).user?.id ?? null;
      const isOwner = (userId && conv.userId === userId) || conv.sessionId === input.sessionId;
      if (!isOwner) return { messages: [], userUnread: 0 };

      const messages = await db.select().from(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId))
        .orderBy(chatMessages.createdAt);

      // Reset user unread
      if (conv.userUnread > 0) {
        await db.update(chatConversations)
          .set({ userUnread: 0 })
          .where(eq(chatConversations.id, input.conversationId));
      }

      return { messages, userUnread: conv.userUnread };
    }),

  // ── ADMIN ONLY ─────────────────────────────────────────────────────────────

  /**
   * Admin: list all conversations with latest message preview and unread counts.
   */
  adminListConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      const convs = await db.select().from(chatConversations)
        .orderBy(desc(chatConversations.lastMessageAt));

      // Fetch latest message for each
      const result = await Promise.all(convs.map(async (c) => {
        const [latest] = await db.select().from(chatMessages)
          .where(eq(chatMessages.conversationId, c.id))
          .orderBy(desc(chatMessages.createdAt)).limit(1);

        // Get user name if linked
        let userName = c.displayName || "Anonymous";
        if (c.userId) {
          const [u] = await db.select({ name: users.name, email: users.email })
            .from(users).where(eq(users.id, c.userId)).limit(1);
          if (u) userName = u.name || u.email || userName;
        }

        return {
          ...c,
          userName,
          latestMessage: latest?.body ?? null,
          latestMessageAt: latest?.createdAt ?? c.createdAt,
          latestSenderRole: latest?.senderRole ?? null,
        };
      }));

      return result;
    }),

  /**
   * Admin: get all messages in a conversation and reset adminUnread to 0.
   */
  adminGetMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { messages: [], conversation: null };
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      const [conv] = await db.select().from(chatConversations)
        .where(eq(chatConversations.id, input.conversationId)).limit(1);
      if (!conv) return { messages: [], conversation: null };

      const messages = await db.select().from(chatMessages)
        .where(eq(chatMessages.conversationId, input.conversationId))
        .orderBy(chatMessages.createdAt);

      // Reset admin unread
      if (conv.adminUnread > 0) {
        await db.update(chatConversations)
          .set({ adminUnread: 0 })
          .where(eq(chatConversations.id, input.conversationId));
      }

      // Get user info
      let userName = conv.displayName || "Anonymous";
      if (conv.userId) {
        const [u] = await db.select({ name: users.name, email: users.email })
          .from(users).where(eq(users.id, conv.userId)).limit(1);
        if (u) userName = u.name || u.email || userName;
      }

      return { messages, conversation: { ...conv, userName } };
    }),

  /**
   * Admin: send a message to a user (or initiate a new conversation).
   * If conversationId is not provided, creates a new conversation for the userId.
   */
  adminSendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number().optional(),
      userId: z.number().optional(),       // for initiating new conversation with logged-in user
      body: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      let convId = input.conversationId;

      if (!convId && input.userId) {
        // Find or create conversation for this user
        const existing = await db.select().from(chatConversations)
          .where(eq(chatConversations.userId, input.userId)).limit(1);

        if (existing[0]) {
          convId = existing[0].id;
        } else {
          // Get user info for display name
          const [u] = await db.select({ name: users.name, email: users.email })
            .from(users).where(eq(users.id, input.userId)).limit(1);
          const displayName = u?.name || u?.email || `User #${input.userId}`;

          const [result] = await db.insert(chatConversations).values({
            userId: input.userId,
            sessionId: `admin-init-${input.userId}-${Date.now()}`,
            displayName,
            lastMessageAt: new Date(),
            adminUnread: 0,
            userUnread: 0,
          });
          convId = (result as any).insertId;
        }
      }

      if (!convId) throw new TRPCError({ code: "BAD_REQUEST", message: "conversationId or userId required" });

      await db.insert(chatMessages).values({
        conversationId: convId,
        senderRole: "admin",
        body: input.body,
      });

      // Increment user unread and update lastMessageAt
      await db.update(chatConversations)
        .set({
          userUnread: sql`${chatConversations.userUnread} + 1`,
          lastMessageAt: new Date(),
        })
        .where(eq(chatConversations.id, convId));

      return { success: true, conversationId: convId };
    }),

  /**
   * Admin: open a stealth chat session with a specific logged-in user.
   * Creates or reopens a conversation and marks it adminInitiated + open.
   */
  adminOpenChat: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      // Find existing conversation for this user
      const existing = await db.select().from(chatConversations)
        .where(eq(chatConversations.userId, input.userId)).limit(1);

      if (existing[0]) {
        // Reopen if closed
        await db.update(chatConversations)
          .set({ status: "open", adminInitiated: true, closedAt: null, lastMessageAt: new Date() })
          .where(eq(chatConversations.id, existing[0].id));
        return { conversationId: existing[0].id };
      }

      // Create new admin-initiated conversation
      const [u] = await db.select({ name: users.name, email: users.email })
        .from(users).where(eq(users.id, input.userId)).limit(1);
      const displayName = u?.name || u?.email || `User #${input.userId}`;

      const [result] = await db.insert(chatConversations).values({
        userId: input.userId,
        sessionId: `admin-init-${input.userId}-${Date.now()}`,
        displayName,
        lastMessageAt: new Date(),
        adminUnread: 0,
        userUnread: 0,
        status: "open",
        adminInitiated: true,
      });
      return { conversationId: (result as any).insertId };
    }),

  /**
   * Admin: close a stealth chat session. User side will auto-dismiss.
   */
  adminCloseChat: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      await db.update(chatConversations)
        .set({ status: "closed", closedAt: new Date() })
        .where(eq(chatConversations.id, input.conversationId));
      return { success: true };
    }),

  /**
   * User: check if admin has opened a stealth chat session for them.
   * Returns the active conversation + messages, or null if none.
   * This is the polling endpoint — called every 3s by logged-in users.
   */
  userCheckActiveChat: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const rows = await db.select().from(chatConversations)
      .where(
        and(
          eq(chatConversations.userId, ctx.user.id),
          eq(chatConversations.adminInitiated, true)
        )
      )
      .orderBy(desc(chatConversations.lastMessageAt))
      .limit(1);

    const conv = rows[0] ?? null;
    if (!conv) return null;

    // Return conversation status so user side knows if it's open or closed
    const messages = await db.select().from(chatMessages)
      .where(eq(chatMessages.conversationId, conv.id))
      .orderBy(chatMessages.createdAt);

    // Reset user unread
    if (conv.userUnread > 0) {
      await db.update(chatConversations)
        .set({ userUnread: 0 })
        .where(eq(chatConversations.id, conv.id));
    }

    return { conversation: conv, messages };
  }),

  /**
   * User: delete their own message by ID (only allowed if senderRole = 'user').
   */
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Only allow deleting messages sent by this user
      const rows = await db.select().from(chatMessages)
        .where(eq(chatMessages.id, input.messageId)).limit(1);
      const msg = rows[0];
      if (!msg) throw new TRPCError({ code: "NOT_FOUND" });
      if (msg.senderRole !== "user") throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete admin messages" });
      // Verify the message belongs to a conversation owned by this user
      const convRows = await db.select().from(chatConversations)
        .where(eq(chatConversations.id, msg.conversationId)).limit(1);
      const conv = convRows[0];
      if (!conv || conv.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      // Soft-delete: set deletedAt timestamp instead of removing the row
      await db.update(chatMessages)
        .set({ deletedAt: new Date() })
        .where(eq(chatMessages.id, input.messageId));
      return { success: true };
    }),

  /**
   * Admin: soft-delete a single chat message by ID.
   */
  adminDeleteMessage: adminProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Soft-delete: set deletedAt timestamp instead of removing the row
      await db.update(chatMessages)
        .set({ deletedAt: new Date() })
        .where(eq(chatMessages.id, input.messageId));
      return { success: true };
    }),

  /**
   * Admin: delete an entire conversation and all its messages.
   */
  adminDeleteConversation: adminProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(chatMessages).where(eq(chatMessages.conversationId, input.conversationId));
      await db.delete(chatConversations).where(eq(chatConversations.id, input.conversationId));
      return { success: true };
    }),

  /**
   * User: check if there are any unread messages (for notification badge/popup).
   */
  checkUnread: publicProcedure
    .input(z.object({
      conversationId: z.number().optional(),
      sessionId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { unread: 0, conversationId: null };

      const userId = (ctx as any).user?.id ?? null;

      let conv = null;
      if (input.conversationId) {
        const rows = await db.select().from(chatConversations)
          .where(eq(chatConversations.id, input.conversationId)).limit(1);
        conv = rows[0] ?? null;
      } else if (userId) {
        const rows = await db.select().from(chatConversations)
          .where(eq(chatConversations.userId, userId)).limit(1);
        conv = rows[0] ?? null;
      } else {
        const rows = await db.select().from(chatConversations)
          .where(eq(chatConversations.sessionId, input.sessionId)).limit(1);
        conv = rows[0] ?? null;
      }

      if (!conv) return { unread: 0, conversationId: null };
      return { unread: conv.userUnread, conversationId: conv.id };
    }),
});
