/**
 * Explore TopShelf catalog — show all 454g flower and 28g rosin variations
 * with their WooCommerce product IDs and retail prices
 */
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const CK = process.env.TOPSHELF_WC_CONSUMER_KEY;
const CS = process.env.TOPSHELF_WC_CONSUMER_SECRET;
const TSDM_BASE = process.env.TOPSHELF_API_URL || 'https://topshelfnc.com/wp-json/tsdm/v1';
const SITE_BASE = TSDM_BASE.replace(/\/wp-json.*$/, '');
const WC_BASE = `${SITE_BASE}/wp-json/wc/v3`;
const TSDM_KEY = process.env.TOPSHELF_API_KEY || '';
const WC_AUTH = Buffer.from(`${CK}:${CS}`).toString('base64');

async function fetchJson(url, auth, isTsdm = false) {
  const headers = isTsdm
    ? { 'X-TSDM-API-Key': TSDM_KEY, 'Content-Type': 'application/json' }
    : { 'Authorization': `Basic ${auth}` };
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function buildWCMap() {
  console.log('Fetching WooCommerce product map...');
  const map = new Map();
  let page = 1;
  while (true) {
    const products = await fetchJson(`${WC_BASE}/products?type=variable&per_page=100&page=${page}&status=publish`, WC_AUTH);
    if (!products.length) break;
    for (const product of products) {
      const variations = await fetchJson(`${WC_BASE}/products/${product.id}/variations?per_page=100`, WC_AUTH);
      for (const v of variations) {
        const price = parseFloat(v.regular_price || v.price || '0');
        map.set(v.id, { product_id: product.id, product_name: product.name, regular_price: price, sku: v.sku });
      }
    }
    if (products.length < 100) break;
    page++;
  }
  console.log(`  Mapped ${map.size} variations from WooCommerce\n`);
  return map;
}

async function run() {
  // Fetch TSDM catalog
  console.log('Fetching TopShelf TSDM catalog...');
  const raw = await fetchJson(`${TSDM_BASE}/catalog`, null, true);
  
  let productList = [];
  if (Array.isArray(raw)) productList = raw;
  else if (raw && Array.isArray(raw.products)) productList = raw.products;
  else if (raw && typeof raw === 'object') productList = Object.values(raw).filter(v => Array.isArray(v)).flat();
  
  console.log(`  Found ${productList.length} products in TSDM catalog\n`);
  
  const wcMap = await buildWCMap();
  
  // Collect all variations
  const allVariations = [];
  for (const product of productList) {
    if (Array.isArray(product.variations)) {
      for (const v of product.variations) {
        const wc = wcMap.get(v.variation_id);
        allVariations.push({
          variation_id: v.variation_id,
          sku: v.sku || '',
          parent_name: product.name,
          variation_name: v.name || '',
          category: product.category || '',
          wholesale_price: v.wholesale_price || 0,
          wc_product_id: wc?.product_id || null,
          wc_retail_price: wc?.regular_price || null,
          wc_sku: wc?.sku || null,
        });
      }
    }
  }
  
  // Filter: 454g flower (pound) and 28g rosin
  const poundFlower = allVariations.filter(v => {
    const name = (v.variation_name + ' ' + v.sku + ' ' + v.parent_name).toLowerCase();
    return name.includes('pound') || name.includes('454') || name.includes('1 lb') || name.includes('lb flower');
  });
  
  const rosin28g = allVariations.filter(v => {
    const name = (v.variation_name + ' ' + v.sku + ' ' + v.parent_name).toLowerCase();
    return (name.includes('rosin') || name.includes('live rosin') || name.includes('hash rosin')) && 
           (name.includes('28') || name.includes('oz') || name.includes('28g'));
  });
  
  console.log('=== 454g POUND FLOWER VARIATIONS ===');
  for (const v of poundFlower) {
    console.log(`  [${v.variation_id}] ${v.parent_name} — ${v.variation_name}`);
    console.log(`    SKU: ${v.sku} | WC Product: ${v.wc_product_id} | Retail: $${v.wc_retail_price} | Wholesale: $${v.wholesale_price}`);
  }
  
  console.log(`\n=== 28g ROSIN VARIATIONS ===`);
  for (const v of rosin28g) {
    console.log(`  [${v.variation_id}] ${v.parent_name} — ${v.variation_name}`);
    console.log(`    SKU: ${v.sku} | WC Product: ${v.wc_product_id} | Retail: $${v.wc_retail_price} | Wholesale: $${v.wholesale_price}`);
  }
  
  console.log(`\nTotal: ${poundFlower.length} pound flower, ${rosin28g.length} 28g rosin`);
  
  // Also show existing DB products for reference
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [dbProducts] = await conn.execute(
    "SELECT id, name, topshelfVariationId, topshelfProductId, topshelfRetailPrice FROM products WHERE name LIKE '%454%' OR name LIKE '%Rosin%' OR name LIKE '%rosin%' ORDER BY name"
  );
  console.log('\n=== CURRENT DB PRODUCTS (454g / Rosin) ===');
  for (const p of dbProducts) {
    console.log(`  [DB ${p.id}] ${p.name}`);
    console.log(`    variationId: ${p.topshelfVariationId} | productId: ${p.topshelfProductId} | retailPrice: $${p.topshelfRetailPrice}`);
  }
  await conn.end();
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
