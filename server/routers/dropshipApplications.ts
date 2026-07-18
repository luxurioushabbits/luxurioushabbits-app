/**
 * Dropship Applications Router
 * Public: submit application
 * Admin: list, approve, reject
 */
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { dropshipApplications } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";
import { sendEmail } from "../email";

export const dropshipApplicationsRouter = router({
  // Public: submit a dropship application
  submit: publicProcedure
    .input(z.object({
      contactName: z.string().min(1).max(200),
      email: z.string().email().max(320),
      phone: z.string().max(30).optional(),
      businessName: z.string().min(1).max(255),
      website: z.string().max(500).optional(),
      instagram: z.string().max(200).optional(),
      currentPlatforms: z.string().max(500).optional(),
      monthlyVolume: z.string().max(100).optional(),
      whyPartner: z.string().max(3000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(dropshipApplications).values({
        contactName: input.contactName,
        email: input.email,
        phone: input.phone ?? null,
        businessName: input.businessName,
        website: input.website ?? null,
        instagram: input.instagram ?? null,
        currentPlatforms: input.currentPlatforms ?? null,
        monthlyVolume: input.monthlyVolume ?? null,
        whyPartner: input.whyPartner ?? null,
        status: "pending",
      });

      // Notify owner
      await notifyOwner({
        title: `New Dropship Application — ${input.businessName}`,
        content: [
          `Contact: ${input.contactName} <${input.email}>`,
          `Business: ${input.businessName}`,
          input.website ? `Website: ${input.website}` : "",
          input.instagram ? `Instagram: ${input.instagram}` : "",
          input.monthlyVolume ? `Monthly Volume: ${input.monthlyVolume}` : "",
          input.currentPlatforms ? `Platforms: ${input.currentPlatforms}` : "",
          "",
          input.whyPartner ? `Why Partner:\n${input.whyPartner}` : "",
        ].filter(Boolean).join("\n"),
      });

      // Send confirmation email to applicant
      try {
        await sendEmail({
          to: input.email,
          subject: "Luxurious Habbits — Dropship Application Received",
          html: `
            <div style="background:#0a0a0a;padding:40px 20px;font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#bf5fff;font-family:'Bebas Neue',sans-serif;letter-spacing:0.05em;font-size:2rem;margin:0 0 16px;">APPLICATION RECEIVED</h2>
              <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">
                Hi ${input.contactName}, thank you for applying to become a Luxurious Habbits dropship partner.
                We review all applications carefully and will be in touch within 3–5 business days.
              </p>
              <p style="color:#555;font-size:12px;margin:0;">— The Luxurious Habbits Team</p>
            </div>
          `,
        });
      } catch {
        // Non-fatal
      }

      return { success: true };
    }),

  // Admin: list all applications
  adminList: adminProcedure
    .input(z.object({ status: z.enum(["all", "pending", "approved", "rejected"]).default("all") }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const query = db.select().from(dropshipApplications).orderBy(desc(dropshipApplications.createdAt)).limit(200);
      if (input.status !== "all") {
        return db.select().from(dropshipApplications)
          .where(eq(dropshipApplications.status, input.status))
          .orderBy(desc(dropshipApplications.createdAt))
          .limit(200);
      }
      return query;
    }),

  // Admin: update status
  adminUpdateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected"]),
      adminNotes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const rows = await db.select().from(dropshipApplications).where(eq(dropshipApplications.id, input.id)).limit(1);
      if (!rows.length) throw new Error("Application not found");
      const app = rows[0];

      await db.update(dropshipApplications).set({
        status: input.status,
        adminNotes: input.adminNotes ?? null,
        reviewedAt: new Date(),
      }).where(eq(dropshipApplications.id, input.id));

      // Email applicant
      try {
        const isApproved = input.status === "approved";
        await sendEmail({
          to: app.email,
          subject: `Luxurious Habbits — Dropship Application ${isApproved ? "Approved" : "Update"}`,
          html: `
            <div style="background:#0a0a0a;padding:40px 20px;font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:${isApproved ? "#22c55e" : "#ef4444"};font-family:'Bebas Neue',sans-serif;letter-spacing:0.05em;font-size:2rem;margin:0 0 16px;">
                APPLICATION ${isApproved ? "APPROVED" : "NOT APPROVED"}
              </h2>
              <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">
                Hi ${app.contactName},
                ${isApproved
                  ? "Congratulations! Your dropship partner application has been approved. Our team will reach out shortly with onboarding details."
                  : "Thank you for your interest. At this time, we are unable to move forward with your application. We appreciate your time and wish you the best."}
              </p>
              ${input.adminNotes ? `<p style="color:#888;font-size:13px;border-left:3px solid #333;padding-left:12px;margin:0 0 20px;">${input.adminNotes}</p>` : ""}
              <p style="color:#555;font-size:12px;margin:0;">— The Luxurious Habbits Team</p>
            </div>
          `,
        });
      } catch {
        // Non-fatal
      }

      return { success: true };
    }),
});
