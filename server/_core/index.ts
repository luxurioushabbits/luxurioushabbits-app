import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerUploadRoutes } from "../uploadRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleSubscriptionRenewalReminders, handleAbandonedCartEmails, handleTopShelfCatalogSync, handleTopShelfPriceSync } from "../scheduledHandlers";
import { handleBlogRss } from "../blogRss";
import { handleSitemap } from "../sitemap";
import { handleAgeVerify, handleAgeCheck } from "../ageVerification";
import { handleReviewerAccess } from "../reviewerAccess";
import { handleTrack, handleHeartbeat } from "../analytics";
import { handleCryptoIPN } from "../routers/cryptoPayments";
import { crowdshipStockSyncHandler } from "../scheduledHandlers/crowdshipStockSync";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // 301 redirect: non-www → www (production only, skip in dev)
  app.use((req, res, next) => {
    const host = req.headers.host ?? "";
    const isProduction = process.env.NODE_ENV === "production";
    const isNonWww = isProduction && host && !host.startsWith("www.") && host.includes("luxurioushabbits.com");
    if (isNonWww) {
      const wwwUrl = `https://www.${host}${req.originalUrl}`;
      return res.redirect(301, wwwUrl);
    }
    next();
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerUploadRoutes(app);
  // Blog RSS feed
  app.get("/blog/rss.xml", handleBlogRss);
  // Dynamic sitemap
  app.get("/sitemap.xml", handleSitemap);
  // Age verification cookie endpoints
  app.post("/api/age-verify", handleAgeVerify);
  app.get("/api/age-verified", handleAgeCheck);
  // Reviewer access — sets session + age cookie for Authorize.net reviewers
  app.get("/reviewer-access", handleReviewerAccess);
  // Crypto IPN webhook (NOWPayments payment confirmation)
  app.post("/api/crypto/ipn", express.json(), handleCryptoIPN);
  // Analytics tracking
  app.post("/api/track", handleTrack);
  app.post("/api/heartbeat", handleHeartbeat);
  // Scheduled heartbeat handlers
  app.post("/api/scheduled/subscription-renewal-reminders", handleSubscriptionRenewalReminders);
  app.post("/api/scheduled/abandoned-cart-emails", handleAbandonedCartEmails);
  app.post("/api/scheduled/topshelf-catalog-sync", handleTopShelfCatalogSync);
  app.post("/api/scheduled/topshelf-price-sync", handleTopShelfPriceSync);
  app.post("/api/scheduled/crowdship-stock-sync", crowdshipStockSyncHandler);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
