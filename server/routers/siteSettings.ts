/**
 * Site Settings Router — Luxurious Habbits
 * Admin-controlled global configuration (test mode, cron jobs, etc.)
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";
import { createHeartbeatJob, updateHeartbeatJob } from "../_core/heartbeat";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const TEST_MODE_KEY = "test_mode";
const TEST_MODE_EXPIRES_KEY = "test_mode_expires_at";
const TEST_MODE_CUSTOMER_ATTEMPTS_KEY = "test_mode_customer_attempts";
const TEST_MODE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/** Upsert a setting key-value pair */
async function upsertSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, key))
    .limit(1);
  if (existing.length > 0) {
    await db.update(siteSettings).set({ settingValue: value }).where(eq(siteSettings.settingKey, key));
  } else {
    await db.insert(siteSettings).values({ settingKey: key, settingValue: value });
  }
}

/** Get a setting value by key */
async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, key)).limit(1);
  return row?.settingValue ?? null;
}

/** Check if test mode is currently active (also auto-expires if past deadline) */
export async function isTestModeActive(): Promise<boolean> {
  const enabled = await getSetting(TEST_MODE_KEY);
  if (enabled !== "true") return false;

  const expiresAt = await getSetting(TEST_MODE_EXPIRES_KEY);
  if (!expiresAt) return true; // no expiry set — treat as active

  const expiresMs = parseInt(expiresAt, 10);
  if (Date.now() > expiresMs) {
    // Auto-shutoff: expired — disable test mode
    await upsertSetting(TEST_MODE_KEY, "false");
    return false;
  }
  return true;
}

export const siteSettingsRouter = router({
  /** Public: check if test mode is enabled + expiry info (used by checkout) */
  getTestMode: publicProcedure.query(async () => {
    const enabled = await isTestModeActive();
    const expiresAtStr = await getSetting(TEST_MODE_EXPIRES_KEY);
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
    const attemptsStr = await getSetting(TEST_MODE_CUSTOMER_ATTEMPTS_KEY);
    const customerAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    return { enabled, expiresAt, customerAttempts };
  }),

  /** Admin: toggle test mode on or off, with 30-min auto-shutoff */
  setTestMode: adminProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input }: { input: { enabled: boolean } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      await upsertSetting(TEST_MODE_KEY, input.enabled ? "true" : "false");

      if (input.enabled) {
        const expiresAt = Date.now() + TEST_MODE_DURATION_MS;
        await upsertSetting(TEST_MODE_EXPIRES_KEY, expiresAt.toString());
        await upsertSetting(TEST_MODE_CUSTOMER_ATTEMPTS_KEY, "0");
      } else {
        await upsertSetting(TEST_MODE_EXPIRES_KEY, "0");
        await upsertSetting(TEST_MODE_CUSTOMER_ATTEMPTS_KEY, "0");
      }

      const expiresAt = input.enabled ? Date.now() + TEST_MODE_DURATION_MS : null;
      return { success: true, enabled: input.enabled, expiresAt };
    }),

  /** Public: record that a non-admin customer tried to checkout while test mode was on */
  recordCustomerAttempt: publicProcedure.mutation(async () => {
    const active = await isTestModeActive();
    if (!active) return { recorded: false };

    const attemptsStr = await getSetting(TEST_MODE_CUSTOMER_ATTEMPTS_KEY);
    const current = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    await upsertSetting(TEST_MODE_CUSTOMER_ATTEMPTS_KEY, (current + 1).toString());
    return { recorded: true, attempts: current + 1 };
  }),

  /** Admin: clear the customer attempt alarm counter */
  clearCustomerAttempts: adminProcedure.mutation(async () => {
    await upsertSetting(TEST_MODE_CUSTOMER_ATTEMPTS_KEY, "0");
    return { success: true };
  }),

  // ─── Abandoned Cart Cron ────────────────────────────────────────────────────

  /** Admin: get status of the abandoned cart hourly cron */
  getAbandonedCartCronStatus: adminProcedure.query(async () => {
    const taskUid = await getSetting("abandoned_cart_cron_task_uid");
    const nextRun = await getSetting("abandoned_cart_cron_next_run");
    const paused = await getSetting("abandoned_cart_cron_paused");
    return {
      active: !!taskUid,
      paused: paused === "true",
      taskUid: taskUid ?? null,
      nextRun: nextRun ?? null,
    };
  }),

  /** Admin: register the hourly abandoned cart email cron (run once after deploy) */
  setupAbandonedCartCron: adminProcedure.mutation(async ({ ctx }) => {
    const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
    if (!sessionToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session required" });

    const existingUid = await getSetting("abandoned_cart_cron_task_uid");
    if (existingUid) {
      return { success: true, taskUid: existingUid, alreadyExisted: true };
    }

    const job = await createHeartbeatJob(
      {
        name: "abandoned-cart-emails-hourly",
        cron: "0 0 * * * *", // every hour at :00
        path: "/api/scheduled/abandoned-cart-emails",
        description: "Hourly abandoned cart recovery email sequence (3-email drip)",
      },
      sessionToken
    );

    await upsertSetting("abandoned_cart_cron_task_uid", job.taskUid);
    if (job.nextExecutionAt) {
      await upsertSetting("abandoned_cart_cron_next_run", job.nextExecutionAt);
    }

    return { success: true, taskUid: job.taskUid, alreadyExisted: false };
  }),

  /** Admin: pause the abandoned cart cron */
  pauseAbandonedCartCron: adminProcedure.mutation(async ({ ctx }) => {
    const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
    const taskUid = await getSetting("abandoned_cart_cron_task_uid");
    if (!taskUid) throw new TRPCError({ code: "NOT_FOUND", message: "Cron not yet registered — click Activate first" });
    await updateHeartbeatJob(taskUid, { enable: false }, sessionToken);
    await upsertSetting("abandoned_cart_cron_paused", "true");
    return { success: true };
  }),

  /** Admin: resume the abandoned cart cron */
  resumeAbandonedCartCron: adminProcedure.mutation(async ({ ctx }) => {
    const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
    const taskUid = await getSetting("abandoned_cart_cron_task_uid");
    if (!taskUid) throw new TRPCError({ code: "NOT_FOUND", message: "Cron not yet registered — click Activate first" });
    await updateHeartbeatJob(taskUid, { enable: true }, sessionToken);
    await upsertSetting("abandoned_cart_cron_paused", "false");
    return { success: true };
  }),
});
