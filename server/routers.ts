import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { newsletterSubscribers, users } from "../drizzle/schema";
import { adminRouter } from "./routers/admin";
import { catalogRouter } from "./routers/catalog";
import { ordersRouter } from "./routers/orders";
import { subscriptionsRouter } from "./routers/subscriptions";
import { wholesaleRouter } from "./routers/wholesale";
import { terpenesRouter } from "./routers/terpenes";
import { notifyMeRouter } from "./routers/notifyMe";
import { loyaltyRouter } from "./routers/loyalty";
import { reviewsRouter } from "./routers/reviews";
import { couponsRouter } from "./routers/coupons";
import { referralsRouter } from "./routers/referrals";
import { wishlistsRouter } from "./routers/wishlists";
import { gbpReviewsRouter } from "./routers/gbpReviews";
import { abandonedCartsRouter } from "./routers/abandonedCarts";
import { affiliatesRouter } from "./routers/affiliates";
import { emailCapturesRouter } from "./routers/emailCaptures";
import { orderTrackingRouter } from "./routers/orderTracking";
import { restockNotificationsRouter } from "./routers/restockNotifications";
import { addressesRouter } from "./routers/addresses";
import { productQARouter } from "./routers/productQA";
import { siteAnalyticsRouter } from "./routers/siteAnalytics";
import { walletAuthRouter } from "./routers/walletAuth";
import { cryptoPaymentsRouter } from "./routers/cryptoPayments";
import { topshelfRouter } from "./routers/topshelf";
import { campaignsRouter } from "./routers/campaigns";
import { dropshipApplicationsRouter } from "./routers/dropshipApplications";
import { crowdshipRouter } from "./routers/crowdship";
import { paypalRouter } from "./routers/paypal";
import { siteSettingsRouter } from "./routers/siteSettings";
import { blogRouter } from "./routers/blog";
import { strainCommentsRouter } from "./routers/strainComments";
import { profileRouter } from "./routers/profile";
import { chatRouter } from "./routers/chat";
import { adminMessagesRouter } from "./routers/adminMessages";
import { authRouter } from "./auth";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  catalog: catalogRouter,
  orders: ordersRouter,
  subscriptions: subscriptionsRouter,
  wholesale: wholesaleRouter,
  terpenes: terpenesRouter,
  notifyMe: notifyMeRouter,
  loyalty: loyaltyRouter,
  reviews: reviewsRouter,
  coupons: couponsRouter,
  referrals: referralsRouter,
  wishlists: wishlistsRouter,
  gbpReviews: gbpReviewsRouter,
  abandonedCarts: abandonedCartsRouter,
  affiliates: affiliatesRouter,
  emailCaptures: emailCapturesRouter,
  orderTracking: orderTrackingRouter,
  restockNotifications: restockNotificationsRouter,
  addresses: addressesRouter,
  productQA: productQARouter,
  siteAnalytics: siteAnalyticsRouter,
  walletAuth: walletAuthRouter,
  cryptoPayments: cryptoPaymentsRouter,
  topshelf: topshelfRouter,
  campaigns: campaignsRouter,
  dropshipApplications: dropshipApplicationsRouter,
  crowdship: crowdshipRouter,
  paypal: paypalRouter,
  siteSettings: siteSettingsRouter,
  blog: blogRouter,
  strainComments: strainCommentsRouter,
  profile: profileRouter,
  chat: chatRouter,
  adminMessages: adminMessagesRouter,

  auth: authRouter,

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email().max(320) }))
      .mutation(async ({ input }) => {
        // Delegate to coupons router which handles newsletter + coupon generation
        // This stub kept for backward compatibility
        const { email } = input;
        const db = await getDb();
        if (db) {
          try {
            await db.insert(newsletterSubscribers).values({ email }).onDuplicateKeyUpdate({ set: { email } });
          } catch (err) {
            // duplicate entry is fine
          }
        }
        return { success: true };
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(200),
          email: z.string().email().max(320),
          subject: z.string().min(1).max(300),
          message: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ input }) => {
        const { name, email, subject, message } = input;

        const notifTitle = `New Contact Form Submission — ${subject}`;
        const notifContent = [
          `From: ${name} <${email}>`,
          `Subject: ${subject}`,
          ``,
          `Message:`,
          message,
          ``,
          `---`,
          `Reply to: ${email}`,
          `Submitted via LuxuriousHabbits.com contact form`,
        ].join("\n");

        const sent = await notifyOwner({ title: notifTitle, content: notifContent });

        return { success: true, notified: sent };
      }),
  }),
});

export type AppRouter = typeof appRouter;
