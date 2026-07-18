/**
 * crowdshipStockSync.ts — Nightly Crowdship Stock Sync Handler
 *
 * Triggered by a Heartbeat cron (POST /api/scheduled/crowdship-stock-sync).
 * For each product in our DB that has a crowdshipVariantId:
 *   1. Fetch the latest stock from Crowdship
 *   2. Update stockQuantity in our DB
 *   3. If stock drops to 0, deactivate the product (isActive = 0)
 *   4. If stock comes back > 0 and product was deactivated due to 0-stock, reactivate it
 *   5. Notify owner of any changes
 */

import type { Request, Response } from "express";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq, isNotNull } from "drizzle-orm";
import { fetchCrowdshipProducts, isCrowdshipConfigured } from "../crowdshipApi";
import { notifyOwner } from "../_core/notification";
import { sdk } from "../_core/sdk";

export async function crowdshipStockSyncHandler(req: Request, res: Response) {
  try {
    // Authenticate — must be a cron trigger
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    if (!isCrowdshipConfigured()) {
      return res.status(200).json({ ok: true, skipped: "Crowdship not configured" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "DB unavailable" });
    }

    // Get all products with a Crowdship variant ID
    const crowdshipProducts = await db
      .select({
        id: products.id,
        name: products.name,
        crowdshipVariantId: products.crowdshipVariantId,
        stockQuantity: products.stockQuantity,
        isActive: products.isActive,
      })
      .from(products)
      .where(isNotNull(products.crowdshipVariantId));

    if (crowdshipProducts.length === 0) {
      return res.json({ ok: true, message: "No Crowdship products to sync" });
    }

    // Fetch all Crowdship catalog products (paginate up to 200)
    let allVariants: Record<string, number> = {}; // variantId -> stock
    try {
      let offset = 0;
      const limit = 50;
      while (true) {
        const page = await fetchCrowdshipProducts({ limit, offset });
        for (const product of page.products) {
          for (const variant of (product.variants ?? [])) {
            allVariants[variant.id] = variant.stock;
          }
        }
        if (page.products.length < limit) break;
        offset += limit;
      }
    } catch (fetchErr: any) {
      console.error("[CrowdshipStockSync] Failed to fetch catalog:", fetchErr?.message);
      return res.status(500).json({
        error: "Crowdship API fetch failed",
        message: fetchErr?.message,
        timestamp: new Date().toISOString(),
      });
    }

    const deactivated: string[] = [];
    const reactivated: string[] = [];
    const updated: string[] = [];

    for (const product of crowdshipProducts) {
      const variantId = product.crowdshipVariantId!;
      const liveStock = allVariants[variantId];

      // If variant not found in catalog, skip (might be a new product not yet in catalog)
      if (liveStock === undefined) {
        console.warn(`[CrowdshipStockSync] Variant ${variantId} not found in catalog — skipping`);
        continue;
      }

      const stockChanged = liveStock !== product.stockQuantity;
      const wasActive = !!product.isActive;
      const shouldBeActive = liveStock > 0;

      if (stockChanged || (wasActive !== shouldBeActive)) {
        await db
          .update(products)
          .set({
            stockQuantity: liveStock,
            isActive: shouldBeActive,
          })
          .where(eq(products.id, product.id));

        if (wasActive && !shouldBeActive) {
          deactivated.push(`${product.name} (was ${product.stockQuantity} → 0)`);
        } else if (!wasActive && shouldBeActive) {
          reactivated.push(`${product.name} (${liveStock} in stock)`);
        } else if (stockChanged) {
          updated.push(`${product.name}: ${product.stockQuantity} → ${liveStock}`);
        }
      }
    }

    const hasChanges = deactivated.length > 0 || reactivated.length > 0 || updated.length > 0;

    if (hasChanges) {
      const lines: string[] = [
        `Crowdship stock sync completed. ${crowdshipProducts.length} products checked.`,
        "",
      ];
      if (deactivated.length > 0) {
        lines.push(`❌ Deactivated (out of stock):`);
        deactivated.forEach(p => lines.push(`  • ${p}`));
        lines.push("");
      }
      if (reactivated.length > 0) {
        lines.push(`✅ Reactivated (back in stock):`);
        reactivated.forEach(p => lines.push(`  • ${p}`));
        lines.push("");
      }
      if (updated.length > 0) {
        lines.push(`📦 Stock updated:`);
        updated.forEach(p => lines.push(`  • ${p}`));
      }

      await notifyOwner({
        title: `Crowdship Stock Sync — ${deactivated.length} deactivated, ${reactivated.length} reactivated`,
        content: lines.join("\n"),
      }).catch(err => console.error("[CrowdshipStockSync] Notify failed:", err));
    }

    console.log(`[CrowdshipStockSync] Done — ${crowdshipProducts.length} checked, ${deactivated.length} deactivated, ${reactivated.length} reactivated, ${updated.length} stock updates`);

    return res.json({
      ok: true,
      checked: crowdshipProducts.length,
      deactivated: deactivated.length,
      reactivated: reactivated.length,
      stockUpdated: updated.length,
      changes: hasChanges ? { deactivated, reactivated, updated } : null,
    });
  } catch (err: any) {
    console.error("[CrowdshipStockSync] Unhandled error:", err);
    return res.status(500).json({
      error: err?.message ?? "Unknown error",
      stack: err?.stack,
      context: { url: req.url, taskUid: "cron" },
      timestamp: new Date().toISOString(),
    });
  }
}
