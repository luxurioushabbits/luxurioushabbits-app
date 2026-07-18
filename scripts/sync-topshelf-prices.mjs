/**
 * Sync all products' topshelfProductId and topshelfRetailPrice from TopShelf WooCommerce
 * Fetches the full WC product/variation catalog and updates any product that has a
 * topshelfVariationId but is missing topshelfProductId or topshelfRetailPrice.
 */
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const CK = process.env.TOPSHELF_WC_CONSUMER_KEY;
const CS = process.env.TOPSHELF_WC_CONSUMER_SECRET;
const SITE_BASE = (process.env.TOPSHELF_API_URL || 'https://topshelfnc.com').replace(/\/wp-json.*$/, '');
const WC_BASE = `${SITE_BASE}/wp-json/wc/v3`;
const auth = Buffer.from(`${CK}:${CS}`).toString('base64');

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'Authorization': `Basic ${auth}` },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function buildWCMap() {
  console.log('Building WooCommerce variation map...');
  const map = new Map(); // variationId -> { product_id, product_name, regular_price }
  let page = 1;
  while (true) {
    const products = await fetchJson(`${WC_BASE}/products?type=variable&per_page=100&page=${page}&status=publish`);
    if (!products.length) break;
    console.log(`  Page ${page}: ${products.length} products`);
    for (const product of products) {
      const variations = await fetchJson(`${WC_BASE}/products/${product.id}/variations?per_page=100`);
      for (const v of variations) {
        const price = parseFloat(v.regular_price || v.price || '0');
        if (v.id && price > 0) {
          map.set(v.id, { product_id: product.id, product_name: product.name, regular_price: price });
        }
      }
    }
    if (products.length < 100) break;
    page++;
  }
  console.log(`  Total variations mapped: ${map.size}`);
  return map;
}

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Get all products with a topshelfVariationId
  const [dbProducts] = await conn.execute(
    'SELECT id, name, topshelfVariationId, topshelfProductId, topshelfRetailPrice FROM products WHERE topshelfVariationId IS NOT NULL'
  );
  console.log(`Found ${dbProducts.length} products with TopShelf variation IDs\n`);

  const wcMap = await buildWCMap();

  let updated = 0;
  let alreadyCorrect = 0;
  let notFound = 0;

  for (const product of dbProducts) {
    const wc = wcMap.get(product.topshelfVariationId);
    if (!wc) {
      console.log(`  ⚠️  Variation ${product.topshelfVariationId} NOT FOUND in WC — "${product.name}"`);
      notFound++;
      continue;
    }

    const needsUpdate =
      product.topshelfProductId !== wc.product_id ||
      parseFloat(product.topshelfRetailPrice || '0') !== wc.regular_price;

    if (!needsUpdate) {
      console.log(`  ✓  "${product.name}" — already correct (productId=${wc.product_id}, price=$${wc.regular_price})`);
      alreadyCorrect++;
      continue;
    }

    await conn.execute(
      'UPDATE products SET topshelfProductId = ?, topshelfRetailPrice = ? WHERE id = ?',
      [wc.product_id, wc.regular_price.toFixed(2), product.id]
    );
    console.log(`  ✅ Updated "${product.name}" — productId: ${product.topshelfProductId ?? 'null'} → ${wc.product_id}, price: $${product.topshelfRetailPrice ?? 'null'} → $${wc.regular_price}`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Already correct: ${alreadyCorrect}, Not found in WC: ${notFound}`);
  await conn.end();
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
