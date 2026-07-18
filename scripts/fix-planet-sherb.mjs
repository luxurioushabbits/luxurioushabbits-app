/**
 * Fix Planet Sherb topshelfProductId and topshelfRetailPrice
 * Fetches live data from TopShelf WooCommerce and updates the product record
 */
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const CK = process.env.TOPSHELF_WC_CONSUMER_KEY;
const CS = process.env.TOPSHELF_WC_CONSUMER_SECRET;
// TOPSHELF_API_URL is the TSDM API base (e.g. https://topshelfnc.com/wp-json/tsdm/v1)
// WooCommerce REST API is at the site root
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

async function findVariation793() {
  console.log('Fetching all variable products from TopShelf WooCommerce...');
  let page = 1;
  while (true) {
    const products = await fetchJson(`${WC_BASE}/products?type=variable&per_page=100&page=${page}&status=publish`);
    if (!products.length) break;
    console.log(`  Page ${page}: ${products.length} products`);
    
    for (const product of products) {
      // Check if this product has variation 793
      const variations = await fetchJson(`${WC_BASE}/products/${product.id}/variations?per_page=100`);
      const v793 = variations.find(v => v.id === 793);
      if (v793) {
        console.log(`\nFound variation 793 in product: ${product.id} — "${product.name}"`);
        console.log(`  Variation: id=${v793.id}, sku="${v793.sku}", regular_price=${v793.regular_price}, price=${v793.price}`);
        return { product_id: product.id, product_name: product.name, variation: v793 };
      }
    }
    
    if (products.length < 100) break;
    page++;
  }
  return null;
}

async function run() {
  const result = await findVariation793();
  if (!result) {
    console.error('Variation 793 not found in TopShelf WooCommerce!');
    process.exit(1);
  }

  const { product_id, product_name, variation } = result;
  const retailPrice = parseFloat(variation.regular_price || variation.price || '0');
  
  console.log(`\nUpdating Planet Sherb (product id 60001):`);
  console.log(`  topshelfProductId: ${product_id} (WC parent: "${product_name}")`);
  console.log(`  topshelfRetailPrice: ${retailPrice}`);

  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [res] = await conn.execute(
    'UPDATE products SET topshelfProductId = ?, topshelfRetailPrice = ? WHERE id = 60001',
    [product_id, retailPrice.toFixed(2)]
  );
  console.log(`\nUpdated ${res.affectedRows} row(s).`);
  
  // Verify
  const [rows] = await conn.execute(
    'SELECT id, name, topshelfVariationId, topshelfProductId, topshelfRetailPrice FROM products WHERE id = 60001'
  );
  console.log('Verified:', JSON.stringify(rows[0], null, 2));
  
  await conn.end();
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
