import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ── Step 1: Fix rosin categories ──────────────────────────────────────────────
const [allFlower] = await conn.execute(
  "SELECT id, name, category FROM products WHERE category = 'flower' ORDER BY name"
);

const rosinKeywords = ['rosin', 'hash rosin', 'live resin', 'concentrate', 'wax', 'shatter', 'dab', 'bubble hash'];
const toFix = allFlower.filter(r => {
  const n = r.name.toLowerCase();
  return rosinKeywords.some(k => n.includes(k));
});

console.log('\n=== STEP 1: Fixing misplaced rosin products ===');
if (toFix.length === 0) {
  console.log('  No misplaced rosin products found.');
} else {
  for (const r of toFix) {
    await conn.execute("UPDATE products SET category = 'extract' WHERE id = ?", [r.id]);
    console.log(`  ✅ Fixed: [${r.id}] ${r.name}  flower → extract`);
  }
}

// ── Step 2: Audit all products against TopShelf WooCommerce ──────────────────
console.log('\n=== STEP 2: Auditing all products against TopShelf WooCommerce ===');

const CK = process.env.TOPSHELF_WC_CONSUMER_KEY;
const CS = process.env.TOPSHELF_WC_CONSUMER_SECRET;
const TSDM_BASE = process.env.TOPSHELF_API_URL || 'https://topshelfnc.com/wp-json/tsdm/v1';
const SITE_BASE = TSDM_BASE.replace(/\/wp-json.*$/, '');
const WC_BASE = `${SITE_BASE}/wp-json/wc/v3`;
const WC_AUTH = Buffer.from(`${CK}:${CS}`).toString('base64');

// Build WC variation map: variationId → { product_id, regular_price, sku, name }
console.log('  Fetching WooCommerce products...');
const wcMap = new Map();
try {
  const res = await fetch(`${WC_BASE}/products?type=variable&per_page=100&status=publish`, {
    headers: { 'Authorization': `Basic ${WC_AUTH}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (res.ok) {
    const wcProducts = await res.json();
    for (const wcp of wcProducts) {
      const varRes = await fetch(`${WC_BASE}/products/${wcp.id}/variations?per_page=100`, {
        headers: { 'Authorization': `Basic ${WC_AUTH}` },
        signal: AbortSignal.timeout(15_000),
      });
      if (!varRes.ok) continue;
      const variations = await varRes.json();
      for (const v of variations) {
        const price = parseFloat(v.regular_price ?? v.price ?? '0');
        if (v.id) {
          wcMap.set(v.id, {
            product_id: wcp.id,
            regular_price: price,
            sku: v.sku,
            name: `${wcp.name} — ${v.name || v.attributes?.map(a => a.option).join(', ')}`,
          });
        }
      }
    }
    console.log(`  Loaded ${wcMap.size} WooCommerce variations.`);
  }
} catch (e) {
  console.error('  WC fetch failed:', e.message);
}

// Get all products with TopShelf mappings
const [products] = await conn.execute(
  `SELECT id, name, category, topshelfVariationId, topshelfProductId, topshelfRetailPrice, wholesalePrice, isActive
   FROM products ORDER BY category, name`
);

console.log('\n  Product Audit Results:');
console.log('  ' + '─'.repeat(100));

let issues = 0;
const fixes = [];

for (const p of products) {
  const varId = p.topshelfVariationId;
  const storedProductId = p.topshelfProductId;
  const storedPrice = p.topshelfRetailPrice ? parseFloat(p.topshelfRetailPrice) : null;

  if (!varId) {
    console.log(`  ⚠️  [${p.id}] ${p.name} (${p.category}) — NO TopShelf variation mapped`);
    continue;
  }

  const wc = wcMap.get(varId);
  if (!wc) {
    console.log(`  ❌ [${p.id}] ${p.name} — variation ${varId} NOT FOUND in WooCommerce`);
    issues++;
    continue;
  }

  const productIdOk = storedProductId === wc.product_id;
  const priceOk = storedPrice !== null && Math.abs(storedPrice - wc.regular_price) < 0.01;

  if (productIdOk && priceOk) {
    console.log(`  ✅ [${p.id}] ${p.name} — var:${varId} prod:${wc.product_id} price:$${wc.regular_price}`);
  } else {
    console.log(`  🔧 [${p.id}] ${p.name}`);
    if (!productIdOk) console.log(`      product_id: stored=${storedProductId} → correct=${wc.product_id}`);
    if (!priceOk) console.log(`      retail_price: stored=$${storedPrice} → correct=$${wc.regular_price}`);
    fixes.push({ id: p.id, product_id: wc.product_id, price: wc.regular_price });
    issues++;
  }
}

// Apply fixes
if (fixes.length > 0) {
  console.log(`\n  Applying ${fixes.length} fixes...`);
  for (const f of fixes) {
    await conn.execute(
      "UPDATE products SET topshelfProductId = ?, topshelfRetailPrice = ? WHERE id = ?",
      [f.product_id, String(f.price.toFixed(2)), f.id]
    );
    console.log(`  ✅ Fixed product ${f.id}: product_id=${f.product_id} price=$${f.price}`);
  }
}

console.log('\n' + '─'.repeat(100));
console.log(`Audit complete. ${issues} issues found and fixed.`);
console.log(`Rosin category fixes: ${toFix.length}`);

await conn.end();
