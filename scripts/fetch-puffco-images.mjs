/**
 * fetch-puffco-images.mjs
 * Fetches Puffco Peak Pro product images from Crowdship API,
 * uploads them to Manus storage, and updates the products table.
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const CROWDSHIP_BASE = "https://api.crowdship.io/api/v1";
const FORGE_BASE = (process.env.BUILT_IN_FORGE_API_URL ?? "").replace(/\/+$/, "");
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY ?? "";

async function crowdshipGet(path) {
  const res = await fetch(`${CROWDSHIP_BASE}${path}`, {
    headers: {
      "X-CROWDSHIP-KEY": process.env.CROWDSHIP_API_KEY ?? "",
      "X-CROWDSHIP-SECRET": process.env.CROWDSHIP_SECRET_KEY ?? "",
    },
  });
  if (!res.ok) throw new Error(`Crowdship ${res.status}: ${await res.text()}`);
  return res.json();
}

async function uploadToStorage(imageUrl, slug) {
  try {
    console.log(`  Downloading: ${imageUrl}`);
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(20_000) });
    if (!imgRes.ok) {
      console.log(`  ✗ Failed to download image (${imgRes.status})`);
      return null;
    }
    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    console.log(`  Downloaded ${buffer.length} bytes (${contentType})`);

    // Upload to Manus storage via presign/put
    const key = `products/${slug}-${Date.now()}.${ext}`;
    const presignRes = await fetch(`${FORGE_BASE}/v1/storage/presign/put?path=${encodeURIComponent(key)}&content_type=${encodeURIComponent(contentType)}`, {
      headers: { Authorization: `Bearer ${FORGE_KEY}` },
    });
    if (!presignRes.ok) {
      console.log(`  ✗ Presign failed: ${presignRes.status}`);
      return null;
    }
    const { url: uploadUrl } = await presignRes.json();
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: buffer,
    });
    if (!putRes.ok) {
      console.log(`  ✗ Upload failed: ${putRes.status}`);
      return null;
    }
    const hostedUrl = `/manus-storage/${key}`;
    console.log(`  ✓ Uploaded → ${hostedUrl}`);
    return hostedUrl;
  } catch (err) {
    console.log(`  ✗ Error: ${err.message}`);
    return null;
  }
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Find the Crowdship product that contains both Puffco Peak Pro variants
  // The Crowdship product ID is the parent product — variants share the same product
  console.log("Fetching Puffco Peak Pro from Crowdship catalog...");
  
  // Search by variant IDs we know
  const variantIds = [
    "6a39bf36942d25acf72b7d8a", // Cloud
    "6a39bf36942d25acf72b7d8b", // Onyx
  ];

  // Fetch catalog to find the parent product
  const data = await crowdshipGet("/inventory/products?limit=100");
  const puffcoProduct = data.products?.find(p =>
    p.variants?.some(v => variantIds.includes(v.id))
  );

  if (!puffcoProduct) {
    console.log("Could not find Puffco Peak Pro in catalog. Trying direct search...");
    // Try fetching all products and search
    const data2 = await crowdshipGet("/inventory/products?limit=250");
    const found = data2.products?.find(p =>
      p.name?.toLowerCase().includes("peak pro") ||
      p.variants?.some(v => variantIds.includes(v.id))
    );
    if (!found) {
      console.log("Product not found in catalog.");
      await conn.end();
      return;
    }
    console.log(`Found: ${found.name} (ID: ${found.id})`);
    console.log(`Images: ${JSON.stringify(found.images)}`);
    
    // Use product-level images
    await processImages(conn, found, variantIds);
  } else {
    console.log(`Found: ${puffcoProduct.name} (ID: ${puffcoProduct.id})`);
    console.log(`Images: ${JSON.stringify(puffcoProduct.images)}`);
    await processImages(conn, puffcoProduct, variantIds);
  }

  await conn.end();
}

async function processImages(conn, product, variantIds) {
  const images = product.images ?? [];
  const variants = product.variants ?? [];

  if (images.length === 0) {
    console.log("No product-level images found.");
    return;
  }

  // Map variant IDs to our product IDs
  const variantToProductId = {
    "6a39bf36942d25acf72b7d8a": 60026, // Cloud
    "6a39bf36942d25acf72b7d8b": 60027, // Onyx
  };

  // Use the first product image as the primary for both variants
  // Also check if individual variants have their own images
  const primaryImageUrl = images[0];

  for (const [variantId, productId] of Object.entries(variantToProductId)) {
    const variant = variants.find(v => v.id === variantId);
    const variantImageUrl = variant?.image ?? null;
    const imageToUse = variantImageUrl || primaryImageUrl;

    if (!imageToUse) {
      console.log(`\nProduct ${productId}: No image available`);
      continue;
    }

    const label = variantId === "6a39bf36942d25acf72b7d8a" ? "cloud" : "onyx";
    console.log(`\nProduct ${productId} (${label}): Using image ${imageToUse}`);

    const hostedUrl = await uploadToStorage(imageToUse, `puffco-peak-pro-${label}`);
    if (hostedUrl) {
      const [result] = await conn.execute(
        `UPDATE products SET imageUrl = ? WHERE id = ?`,
        [hostedUrl, productId]
      );
      console.log(`  ✓ DB updated — imageUrl set for product ${productId}`);
    }
  }
}

main().catch(console.error);
