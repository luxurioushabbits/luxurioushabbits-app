/**
 * Re-parse COA terpenes for all products that have a coaUrl.
 * Uses the same LLM extraction as the upload route, then saves all 37 terpenes to DB.
 * Run: npx tsx scripts/reparse-coa-terpenes.ts
 */
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { productTerpenes, products } from "../drizzle/schema";
import { eq, isNotNull } from "drizzle-orm";
import { invokeLLM } from "../server/_core/llm";

// Canonical slug map — maps every possible LLM-generated slug variant to the correct slug
const SLUG_MAP: Record<string, string> = {
  "alpha-bisabolol": "alpha-bisabolol",
  "bisabolol": "alpha-bisabolol",
  "alpha-cedrene": "alpha-cedrene",
  "alpha-humulene": "alpha-humulene",
  "humulene": "alpha-humulene",
  "alpha-phellandrene": "alpha-phellandrene",
  "alpha-pinene": "alpha-pinene",
  "alpha-terpinene": "alpha-terpinene",
  "beta-caryophyllene": "beta-caryophyllene",
  "caryophyllene": "beta-caryophyllene",
  "b-caryophyllene": "beta-caryophyllene",
  "β-caryophyllene": "beta-caryophyllene",
  "beta-myrcene": "beta-myrcene",
  "myrcene": "beta-myrcene",
  "b-myrcene": "beta-myrcene",
  "β-myrcene": "beta-myrcene",
  "beta-pinene": "beta-pinene",
  "b-pinene": "beta-pinene",
  "β-pinene": "beta-pinene",
  "borneol": "borneol",
  "camphene": "camphene",
  "camphor": "camphor",
  "3-carene": "3-carene",
  "delta-3-carene": "3-carene",
  "caryophyllene-oxide": "caryophyllene-oxide",
  "caryophyllene oxide": "caryophyllene-oxide",
  "cedrol": "cedrol",
  "eucalyptol": "eucalyptol",
  "1,8-cineole": "eucalyptol",
  "cineole": "eucalyptol",
  "farnesene": "farnesene",
  "beta-farnesene": "farnesene",
  "fenchone": "fenchone",
  "fenchyl-alcohol": "fenchyl-alcohol",
  "fenchyl alcohol": "fenchyl-alcohol",
  "gamma-terpinene": "gamma-terpinene",
  "γ-terpinene": "gamma-terpinene",
  "geraniol": "geraniol",
  "geranyl-acetate": "geranyl-acetate",
  "geranyl acetate": "geranyl-acetate",
  "guaiol": "guaiol",
  "hexahydrothymol": "hexahydrothymol",
  "isoborneol": "isoborneol",
  "isopulegol": "isopulegol",
  "limonene": "limonene",
  "d-limonene": "limonene",
  "linalool": "linalool",
  "nerol": "nerol",
  "nerolidol": "nerolidol",
  "trans-nerolidol": "nerolidol",
  "cis-nerolidol": "nerolidol",
  "ocimene": "ocimene",
  "beta-ocimene": "ocimene",
  "pulegone": "pulegone",
  "sabinene": "sabinene",
  "sabinene-hydrate": "sabinene-hydrate",
  "sabinene hydrate": "sabinene-hydrate",
  "terpineol": "terpineol",
  "alpha-terpineol": "terpineol",
  "terpinolene": "terpinolene",
  "valencene": "valencene",
};

function normalizeSlug(raw: string): string {
  const lower = raw.toLowerCase().trim().replace(/\s+/g, "-");
  return SLUG_MAP[lower] ?? lower;
}

async function main() {
  const pool = await mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool);

  // Get all products with a COA URL
  const allProducts = await db
    .select({ id: products.id, name: products.name, coaUrl: products.coaUrl, isActive: products.isActive })
    .from(products)
    .where(isNotNull(products.coaUrl));

  console.log(`Found ${allProducts.length} products with COA URLs`);

  const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL ?? "").replace(/\/+$/, "");
  const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

  for (const product of allProducts) {
    if (!product.coaUrl) continue;
    console.log(`\nProcessing: ${product.name} (id=${product.id}, active=${product.isActive})`);

    try {
      // Resolve the COA URL — if it's a /manus-storage/ path, get a presigned URL
      let pdfUrl = product.coaUrl;
      if (pdfUrl.startsWith("/manus-storage/")) {
        const key = pdfUrl.replace("/manus-storage/", "");
        const presignRes = await fetch(`${forgeBaseUrl}/v1/storage/presign/get?path=${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${forgeKey}` },
        });
        if (!presignRes.ok) {
          console.log(`  ✗ Could not presign URL for ${product.name}`);
          continue;
        }
        const { url } = await presignRes.json() as { url: string };
        pdfUrl = url;
      }

      // Extract terpenes via LLM
      const llmRes = await invokeLLM({
        messages: [
          {
            role: "user",
            content: [
              { type: "file_url", file_url: { url: pdfUrl, mime_type: "application/pdf" } },
              {
                type: "text",
                text: `Extract the complete terpene panel from this Certificate of Analysis (COA) PDF. Return ONLY a JSON array of terpene objects. Each object must have: "name" (exact terpene name as shown on the COA), "slug" (lowercase, hyphens instead of spaces/special chars, e.g. "beta-myrcene", "limonene", "alpha-pinene"), and "percentage" (the numeric percentage as a string, e.g. "0.3500", or null if not detected/below LOQ). Include ALL terpenes listed in the terpene panel, even those with ND (non-detected) results — set percentage to null for those. Return only the JSON array, no other text.`,
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "terpene_panel",
            strict: true,
            schema: {
              type: "object",
              properties: {
                terpenes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      slug: { type: "string" },
                      percentage: { type: ["string", "null"] },
                    },
                    required: ["name", "slug", "percentage"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["terpenes"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = llmRes?.choices?.[0]?.message?.content;
      if (!content) {
        console.log(`  ✗ No LLM response for ${product.name}`);
        continue;
      }

      const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
      const terpenes: Array<{ name: string; slug: string; percentage: string | null }> = parsed.terpenes ?? [];

      // Normalize slugs
      const normalized = terpenes.map(t => ({
        ...t,
        slug: normalizeSlug(t.slug),
      }));

      // Only save terpenes with a detected percentage > 0
      const detected = normalized.filter(t => t.percentage !== null && t.percentage !== "0" && parseFloat(t.percentage ?? "0") > 0);

      console.log(`  Found ${terpenes.length} terpenes total, ${detected.length} detected (>0)`);
      detected.forEach(t => console.log(`    ${t.slug}: ${t.percentage}%`));

      // Delete existing terpene tags for this product
      await db.delete(productTerpenes).where(eq(productTerpenes.productId, product.id));

      // Insert new terpene tags
      if (detected.length > 0) {
        await db.insert(productTerpenes).values(
          detected.map(t => ({
            productId: product.id,
            terpeneSlug: t.slug,
            terpeneName: t.name,
            percentage: t.percentage ?? null,
          }))
        );
        console.log(`  ✓ Saved ${detected.length} terpene tags for ${product.name}`);
      } else {
        console.log(`  ⚠ No detected terpenes for ${product.name}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      console.error(`  ✗ Error processing ${product.name}:`, err);
    }
  }

  console.log("\n✓ Done! All COA terpenes re-parsed and saved.");
  await pool.end();
}

main().catch(console.error);
