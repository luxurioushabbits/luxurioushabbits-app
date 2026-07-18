/**
 * refresh-product-images.mjs
 * Fetches high-resolution product images from TopShelf WooCommerce API
 * and re-uploads them to Manus storage, then updates the DB imageUrl.
 *
 * Run from project root: node scripts/refresh-product-images.mjs
 */
import "dotenv/config";
import { createConnection } from "mysql2/promise";

const TOPSHELF_WC_BASE_URL = (process.env.TOPSHELF_URL ?? "https://topshelfnc.com").replace(/\/$/, "") + "/wp-json/wc/v3";
const TOPSHELF_WC_CK = process.env.TOPSHELF_WC_CONSUMER_KEY ?? "";
const TOPSHELF_WC_CS = process.env.TOPSHELF_WC_CONSUMER_SECRET ?? "";
const FORGE_API_URL = (process.env.BUILT_IN_FORGE_API_URL ?? "").replace(/\/+$/, "");
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY ?? "";
const DATABASE_URL = process.env.DATABASE_URL ?? "";

if (!TOPSHELF_WC_CK || !TOPSHELF_WC_CS) {
  console.error("Missing TOPSHELF_WC_CONSUMER_KEY or TOPSHELF_WC_CONSUMER_SECRET");
  process.exit(1);
}

const auth = Buffer.from(`${TOPSHELF_WC_CK}:${TOPSHELF_WC_CS}`).toString("base64");

/** Upload image buffer to Manus storage, returns /manus-storage/... URL */
async function storagePut(key, buffer, contentType) {
  const presignRes = await fetch(`${FORGE_API_URL}/v1/storage/presign/put?path=${encodeURIComponent(key)}`, {
    headers: { "Authorization": `Bearer ${FORGE_API_KEY}` },
  });
  if (!presignRes.ok) throw new Error(`Presign failed: ${presignRes.status}`);
  const { url: presignedUrl } = await presignRes.json();
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: buffer,
  });
  if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
  return `/manus-storage/${key}`;
}

/** Download image from URL, strip WordPress thumbnail suffix for full-res */
async function downloadImage(imageUrl) {
  // Strip WordPress thumbnail size suffix like -300x300 or -1024x1024
  const fullSizeUrl = imageUrl.replace(/-\d+x\d+(\.\w+)$/, "$1");
  
  // Try full-size first
  try {
    const res = await fetch(fullSizeUrl, { signal: AbortSignal.timeout(20_000) });
    if (res.ok) {
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      const buffer = Buffer.from(await res.arrayBuffer());
      console.log(`  ✓ Full-res: ${fullSizeUrl} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return { buffer, contentType, url: fullSizeUrl };
    }
  } catch {}
  
  // Fall back to original
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${imageUrl}`);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  console.log(`  ✓ Original: ${imageUrl} (${(buffer.length / 1024).toFixed(0)}KB)`);
  return { buffer, contentType, url: imageUrl };
}

async function main() {
  console.log("Fetching WooCommerce product catalog...");
  
  // Fetch all variable products with their images
  const res = await fetch(`${TOPSHELF_WC_BASE_URL}/products?type=variable&per_page=100&status=publish`, {
    headers: { "Authorization": `Basic ${auth}` },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`WC API failed: ${res.status}`);
  const wcProducts = await res.json();
  
  console.log(`Found ${wcProducts.length} WC products`);
  
  // Build map: product_id → best image URL (highest resolution from images array)
  const productImageMap = new Map();
  for (const p of wcProducts) {
    if (p.images && p.images.length > 0) {
      // WC images array: first image is the featured/main image, src is full-res
      const mainImage = p.images[0];
      if (mainImage?.src) {
        productImageMap.set(p.id, mainImage.src);
        console.log(`  WC #${p.id} "${p.name}": ${mainImage.src}`);
      }
    }
  }
  
  // Connect to DB
  const db = await createConnection(DATABASE_URL);
  
  // Get all active products with their topshelf_product_id
  const [products] = await db.execute(
    "SELECT id, name, slug, imageUrl, topshelfProductId FROM products WHERE isActive = 1 AND topshelfProductId IS NOT NULL"
  );
  
  console.log(`\nFound ${products.length} active products with TopShelf product IDs`);
  
  let updated = 0;
  for (const product of products) {
    const wcImageUrl = productImageMap.get(product.topshelfProductId);
    if (!wcImageUrl) {
      console.log(`  ⚠ No WC image for product "${product.name}" (WC ID: ${product.topshelfProductId})`);
      continue;
    }
    
    console.log(`\nProcessing "${product.name}"...`);
    console.log(`  WC image: ${wcImageUrl}`);
    
    try {
      const { buffer, contentType } = await downloadImage(wcImageUrl);
      const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const key = `products/${product.slug}-hq-${Date.now()}.${ext}`;
      const storageUrl = await storagePut(key, buffer, contentType);
      
      await db.execute(
        "UPDATE products SET imageUrl = ? WHERE id = ?",
        [storageUrl, product.id]
      );
      
      console.log(`  ✓ Updated to: ${storageUrl}`);
      updated++;
      
      // Small delay to avoid hammering the APIs
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ✗ Failed for "${product.name}":`, err.message);
    }
  }
  
  await db.end();
  console.log(`\n✅ Done. Updated ${updated}/${products.length} product images.`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
