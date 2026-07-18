/**
 * Email Campaign Router — Newsletter broadcast campaigns
 * Admin-only: compose, send, and track broadcast emails to subscriber list.
 */
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { emailCampaigns, emailCaptures } from "../../drizzle/schema";
import { sendEmail } from "../email";

export const campaignsRouter = router({
  // Admin: list all campaigns
  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(emailCampaigns)
      .orderBy(desc(emailCampaigns.createdAt))
      .limit(100);
  }),

  // Admin: create a draft campaign
  adminCreate: adminProcedure
    .input(
      z.object({
        subject: z.string().min(1).max(255),
        previewText: z.string().max(255).optional(),
        htmlBody: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [result] = await db.insert(emailCampaigns).values({
        subject: input.subject,
        previewText: input.previewText ?? null,
        htmlBody: input.htmlBody,
        status: "draft",
        recipientCount: 0,
        sentCount: 0,
        createdBy: ctx.user.id,
      });
      return { id: (result as any).insertId };
    }),

  // Admin: update a draft campaign
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.number(),
        subject: z.string().min(1).max(255),
        previewText: z.string().max(255).optional(),
        htmlBody: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .update(emailCampaigns)
        .set({
          subject: input.subject,
          previewText: input.previewText ?? null,
          htmlBody: input.htmlBody,
        })
        .where(eq(emailCampaigns.id, input.id));
      return { success: true };
    }),

  // Admin: send a campaign to all subscribers
  adminSend: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const rows = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, input.id))
        .limit(1);
      if (rows.length === 0) throw new Error("Campaign not found");
      const campaign = rows[0];
      if (campaign.status === "sent") throw new Error("Campaign already sent");

      // Get all subscriber emails
      const subscribers = await db
        .select({ email: emailCaptures.email })
        .from(emailCaptures);

      const recipientCount = subscribers.length;

      // Mark as sending
      await db
        .update(emailCampaigns)
        .set({ status: "sending", recipientCount })
        .where(eq(emailCampaigns.id, input.id));

      let sentCount = 0;
      const errors: string[] = [];

      // Send in batches of 10 to avoid rate limits
      const BATCH_SIZE = 10;
      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map(async (sub) => {
            try {
              await sendEmail({
                to: sub.email,
                subject: campaign.subject,
                html: campaign.htmlBody,
              });
              sentCount++;
            } catch (err) {
              errors.push(sub.email);
            }
          })
        );
        // Small delay between batches
        if (i + BATCH_SIZE < subscribers.length) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      const finalStatus = errors.length > 0 && sentCount === 0 ? "failed" : "sent";

      await db
        .update(emailCampaigns)
        .set({
          status: finalStatus,
          sentCount,
          sentAt: new Date(),
        })
        .where(eq(emailCampaigns.id, input.id));

      return {
        success: finalStatus === "sent",
        sentCount,
        failedCount: errors.length,
        recipientCount,
      };
    }),

  // Admin: delete a draft campaign
  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .delete(emailCampaigns)
        .where(eq(emailCampaigns.id, input.id));
      return { success: true };
    }),

  // Admin: send a test email to a specific address
  adminSendTest: adminProcedure
    .input(z.object({
      id: z.number(),
      toEmail: z.string().email().max(320),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const rows = await db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, input.id))
        .limit(1);
      if (rows.length === 0) throw new Error("Campaign not found");
      const campaign = rows[0];
      await sendEmail({
        to: input.toEmail,
        subject: `[TEST] ${campaign.subject}`,
        html: campaign.htmlBody,
      });
      return { success: true };
    }),

  // Admin: get subscriber count
  adminSubscriberCount: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { count: 0 };
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailCaptures);
    return { count: Number(result[0]?.count ?? 0) };
  }),
});
