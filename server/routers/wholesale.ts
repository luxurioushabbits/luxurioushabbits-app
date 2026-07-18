/**
 * Wholesale Router — Lead qualification questionnaire + admin management
 */
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import { sendHotLeadAlert } from "../email";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { wholesaleLeads } from "../../drizzle/schema";

// ─── Lead Scoring ──────────────────────────────────────────────────────────────
function scoreLead(input: {
  businessType: string;
  monthlyVolume: string;
  numberOfLocations: string;
  yearsInBusiness: string;
  hasRetailLicense: boolean;
  farmBillAware: boolean;
  stateCompliant: boolean;
  timeline: string;
  website: string;
  instagram: string;
  averageMonthlyRevenue: string;
}): { score: number; grade: "hot" | "warm" | "cold"; notes: string[] } {
  let score = 0;
  const notes: string[] = [];

  // Monthly volume (0–30 pts)
  const volumeScores: Record<string, number> = {
    over_10000: 30, "5000_10000": 24, "2000_5000": 18, "500_2000": 10, under_500: 4,
  };
  score += volumeScores[input.monthlyVolume] ?? 0;
  if (input.monthlyVolume === "over_10000" || input.monthlyVolume === "5000_10000") {
    notes.push("High-volume buyer");
  }

  // Business type (0–20 pts)
  const typeScores: Record<string, number> = {
    smoke_shop: 20, dispensary: 20, vape_shop: 18, distributor: 18,
    online_retailer: 15, convenience_store: 12, gym_wellness: 10,
    bar_restaurant: 8, other: 5,
  };
  score += typeScores[input.businessType] ?? 5;
  if (["smoke_shop", "dispensary", "vape_shop"].includes(input.businessType)) {
    notes.push("Ideal business type");
  }

  // Compliance (0–20 pts)
  if (input.hasRetailLicense) { score += 8; notes.push("Licensed business"); }
  if (input.farmBillAware) { score += 6; notes.push("Farm Bill aware"); }
  if (input.stateCompliant) { score += 6; notes.push("State compliant"); }

  // Timeline (0–15 pts)
  const timelineScores: Record<string, number> = {
    immediately: 15, within_30_days: 12, "1_3_months": 7, just_exploring: 2,
  };
  score += timelineScores[input.timeline] ?? 2;
  if (input.timeline === "immediately") notes.push("Ready to buy now");

  // Revenue (0–10 pts)
  const revenueScores: Record<string, number> = {
    over_500k: 10, "100k_500k": 8, "50k_100k": 6, "10k_50k": 4, under_10k: 1,
  };
  score += revenueScores[input.averageMonthlyRevenue] ?? 0;

  // Online presence (0–5 pts)
  if (input.website) score += 3;
  if (input.instagram) score += 2;

  // Grade classification
  let grade: "hot" | "warm" | "cold";
  if (score >= 65) grade = "hot";
  else if (score >= 38) grade = "warm";
  else grade = "cold";

  return { score, grade, notes };
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const wholesaleRouter = router({
  // ─── PUBLIC: Submit lead questionnaire ───────────────────────────────────────
  submit: publicProcedure
    .input(
      z.object({
        // Contact
        contactName: z.string().min(1).max(200),
        title: z.string().max(100).optional(),
        email: z.string().email(),
        phone: z.string().max(30).optional(),
        preferredContact: z.enum(["email", "phone", "text", "whatsapp"]).default("email"),
        preferredPayment: z.enum(["bank_transfer", "check", "credit_card", "crypto", "net_terms", "other"]).optional(),

        // Business identity
        businessName: z.string().min(1).max(255),
        businessType: z.enum([
          "smoke_shop", "dispensary", "online_retailer", "gym_wellness",
          "bar_restaurant", "distributor", "convenience_store", "vape_shop", "other",
        ]),
        businessTypeOther: z.string().max(200).optional(),
        state: z.string().min(1).max(50),
        city: z.string().max(100).optional(),

        // Business metrics
        yearsInBusiness: z.enum(["less_than_1", "1_2", "3_5", "6_10", "over_10"]),
        numberOfLocations: z.enum(["1", "2_5", "6_10", "over_10"]),
        averageMonthlyRevenue: z.enum(["under_10k", "10k_50k", "50k_100k", "100k_500k", "over_500k"]).optional(),

        // Customer demographics
        targetDemographic: z.string().max(1000).optional(),
        avgCustomerAge: z.enum(["21_25", "26_35", "36_45", "46_plus", "mixed"]).optional(),

        // Purchase intent — free text description instead of checkbox array
        monthlyVolume: z.enum(["under_500", "500_2000", "2000_5000", "5000_10000", "over_10000"]),
        productsInterested: z.string().min(1).max(2000),
        timeline: z.enum(["immediately", "within_30_days", "1_3_months", "just_exploring"]),

        // Current supplier
        currentSupplier: z.string().max(255).optional(),
        currentSpendMonthly: z.enum(["none", "under_500", "500_2000", "2000_5000", "over_5000"]).optional(),
        whySwitch: z.string().max(2000).optional(),

        // Online presence
        website: z.string().max(500).optional(),
        instagram: z.string().max(200).optional(),
        facebook: z.string().max(200).optional(),
        tiktok: z.string().max(200).optional(),
        twitter: z.string().max(200).optional(),
        youtube: z.string().max(200).optional(),
        otherSocials: z.string().max(500).optional(),

        // Compliance
        farmBillAware: z.boolean(),
        hasRetailLicense: z.boolean(),
        stateCompliant: z.boolean(),

        // Additional
        howHeard: z.enum(["google", "instagram", "tiktok", "referral", "trade_show", "other"]).optional(),
        additionalNotes: z.string().max(3000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      // Score the lead
      const { score, grade, notes: scoringNotes } = scoreLead({
        businessType: input.businessType,
        monthlyVolume: input.monthlyVolume,
        numberOfLocations: input.numberOfLocations,
        yearsInBusiness: input.yearsInBusiness,
        hasRetailLicense: input.hasRetailLicense,
        farmBillAware: input.farmBillAware,
        stateCompliant: input.stateCompliant,
        timeline: input.timeline,
        website: input.website ?? "",
        instagram: input.instagram ?? "",
        averageMonthlyRevenue: input.averageMonthlyRevenue ?? "under_10k",
      });

      if (db) {
        try {
          await db.insert(wholesaleLeads).values({
            contactName: input.contactName,
            title: input.title ?? null,
            businessName: input.businessName,
            email: input.email,
            phone: input.phone ?? null,
            preferredContact: input.preferredContact,
            preferredPayment: input.preferredPayment ?? null,
            website: input.website ?? null,
            instagram: input.instagram ?? null,
            facebook: input.facebook ?? null,
            tiktok: input.tiktok ?? null,
            twitter: input.twitter ?? null,
            youtube: input.youtube ?? null,
            otherSocials: input.otherSocials ?? null,
            state: input.state,
            city: input.city ?? null,
            businessType: input.businessType,
            businessTypeOther: input.businessTypeOther ?? null,
            yearsInBusiness: input.yearsInBusiness,
            numberOfLocations: input.numberOfLocations,
            averageMonthlyRevenue: input.averageMonthlyRevenue ?? null,
            targetDemographic: input.targetDemographic ?? null,
            avgCustomerAge: input.avgCustomerAge ?? null,
            monthlyVolume: input.monthlyVolume,
            productsInterested: input.productsInterested,
            timeline: input.timeline,
            currentSupplier: input.currentSupplier ?? null,
            currentSpendMonthly: input.currentSpendMonthly ?? null,
            whySwitch: input.whySwitch ?? null,
            farmBillAware: input.farmBillAware,
            hasRetailLicense: input.hasRetailLicense,
            stateCompliant: input.stateCompliant,
            howHeard: input.howHeard ?? null,
            additionalNotes: input.additionalNotes ?? null,
            leadScore: score,
            leadGrade: grade,
            status: "new",
          });
        } catch (err) {
          console.error("Failed to save wholesale lead:", err);
        }
      }

      // Notify owner
      const gradeEmoji = grade === "hot" ? "🔥" : grade === "warm" ? "♨️" : "❄️";
      const volumeLabels: Record<string, string> = {
        under_500: "<$500/mo", "500_2000": "$500–$2k/mo", "2000_5000": "$2k–$5k/mo",
        "5000_10000": "$5k–$10k/mo", over_10000: "$10k+/mo",
      };
      const contactLabels: Record<string, string> = {
        email: "Email", phone: "Phone Call", text: "Text Message", whatsapp: "WhatsApp",
      };
      await notifyOwner({
        title: `${gradeEmoji} New Wholesale Lead — ${input.businessName} (Score: ${score}/100)`,
        content: [
          `WHOLESALE LEAD QUALIFICATION`,
          ``,
          `Lead Grade: ${grade.toUpperCase()} | Score: ${score}/100`,
          `Signals: ${scoringNotes.join(" · ")}`,
          ``,
          `── CONTACT ──`,
          `Name: ${input.contactName}${input.title ? ` (${input.title})` : ""}`,
          `Email: ${input.email}`,
          `Phone: ${input.phone ?? "N/A"}`,
          `Best way to reach: ${contactLabels[input.preferredContact] ?? input.preferredContact}`,
          `Preferred payment: ${input.preferredPayment?.replace(/_/g, " ") ?? "N/A"}`,
          ``,
          `── BUSINESS ──`,
          `Business: ${input.businessName}`,
          `Type: ${input.businessType}${input.businessTypeOther ? ` — ${input.businessTypeOther}` : ""}`,
          `Location: ${[input.city, input.state].filter(Boolean).join(", ")}`,
          `Years in Business: ${input.yearsInBusiness.replace(/_/g, " ")}`,
          `Locations: ${input.numberOfLocations.replace(/_/g, " ")}`,
          `Avg Monthly Revenue: ${input.averageMonthlyRevenue?.replace(/_/g, " ") ?? "N/A"}`,
          ``,
          `── ONLINE PRESENCE ──`,
          `Website: ${input.website ?? "N/A"}`,
          `Instagram: ${input.instagram ? `@${input.instagram}` : "N/A"}`,
          `TikTok: ${input.tiktok ? `@${input.tiktok}` : "N/A"}`,
          `Facebook: ${input.facebook ?? "N/A"}`,
          `Twitter/X: ${input.twitter ? `@${input.twitter}` : "N/A"}`,
          `YouTube: ${input.youtube ?? "N/A"}`,
          `Other: ${input.otherSocials ?? "N/A"}`,
          ``,
          `── PURCHASE INTENT ──`,
          `Monthly Volume: ${volumeLabels[input.monthlyVolume] ?? input.monthlyVolume}`,
          `Products / What They're After: ${input.productsInterested}`,
          `Timeline: ${input.timeline.replace(/_/g, " ")}`,
          `Current Supplier: ${input.currentSupplier ?? "None"}`,
          `Current Spend: ${input.currentSpendMonthly?.replace(/_/g, " ") ?? "N/A"}`,
          ``,
          `── CUSTOMER DEMOGRAPHICS ──`,
          `Target Demo: ${input.targetDemographic ?? "N/A"}`,
          `Avg Customer Age: ${input.avgCustomerAge?.replace(/_/g, "–") ?? "N/A"}`,
          ``,
          `── COMPLIANCE ──`,
          `Farm Bill Aware: ${input.farmBillAware ? "Yes" : "No"}`,
          `Has Retail License: ${input.hasRetailLicense ? "Yes" : "No"}`,
          `State Compliant: ${input.stateCompliant ? "Yes" : "No"}`,
          ``,
          `── WHY SWITCH / ADDITIONAL ──`,
          input.whySwitch ?? "N/A",
          ``,
          input.additionalNotes ?? "",
          ``,
          `Heard About Us: ${input.howHeard?.replace(/_/g, " ") ?? "N/A"}`,
        ].join("\n"),
      });

      // Send hot lead email alert to austin@luxurioushabbits.com
      if (grade === "hot") {
        try {
          await sendHotLeadAlert({
            to: "austin@luxurioushabbits.com",
            contactName: input.contactName,
            businessName: input.businessName,
            email: input.email,
            phone: input.phone ?? null,
            preferredContact: input.preferredContact,
            preferredPayment: input.preferredPayment ?? null,
            state: input.state,
            city: input.city ?? null,
            productsInterested: input.productsInterested,
            monthlyVolume: input.monthlyVolume,
            timeline: input.timeline,
            score,
            grade,
            notes: scoringNotes,
          });
        } catch (err) {
          console.error("Failed to send hot lead email:", err);
        }
      }

      return { success: true, leadGrade: grade, leadScore: score };
    }),

  // ─── ADMIN: List all leads ────────────────────────────────────────────────────
  list: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        grade: z.enum(["hot", "warm", "cold"]).optional(),
      }).optional()
    )
    .query(async ({ input: _input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(wholesaleLeads).orderBy(desc(wholesaleLeads.createdAt));
    }),

  // ─── ADMIN: Update lead status ────────────────────────────────────────────────
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "qualified", "disqualified", "closed_won", "closed_lost"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...data } = input;
      await db.update(wholesaleLeads).set(data).where(eq(wholesaleLeads.id, id));
      return { success: true };
    }),
});
