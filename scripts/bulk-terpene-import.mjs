/**
 * Bulk COA Terpene Import
 * Downloads each product's Badger Labs COA PDF, parses terpene weight %,
 * and upserts into product_terpenes table.
 *
 * Run: node scripts/bulk-terpene-import.mjs
 */

import { createConnection } from 'mysql2/promise';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import dotenv from 'dotenv';
dotenv.config();

// ── Terpene name → slug mapping (Badger Labs uses these exact names) ──────────
const TERPENE_SLUG_MAP = {
  'alpha-bisabolol':    'alpha-bisabolol',
  'alpha-cedrene':      'alpha-cedrene',
  'alpha-humulene':     'alpha-humulene',
  'alpha-phellandrene': 'alpha-phellandrene',
  'alpha-pinene':       'alpha-pinene',
  'alpha-terpinene':    'alpha-terpinene',
  'beta-caryophyllene': 'beta-caryophyllene',
  'beta-myrcene':       'beta-myrcene',
  'beta-pinene':        'beta-pinene',
  'borneol':            'borneol',
  'camphene':           'camphene',
  'camphor':            'camphor',
  '3-carene':           '3-carene',
  'caryophyllene oxide':'caryophyllene-oxide',
  'cedrol':             'cedrol',
  'eucalyptol':         'eucalyptol',
  'farnesene':          'farnesene',
  'fenchone':           'fenchone',
  'fenchyl alcohol':    'fenchyl-alcohol',
  'gamma-terpinene':    'gamma-terpinene',
  'geraniol':           'geraniol',
  'geranyl acetate':    'geranyl-acetate',
  'guaiol':             'guaiol',
  'hexahydrothymol':    'hexahydrothymol',
  'isoborneol':         'isoborneol',
  'isopulegol':         'isopulegol',
  'limonene':           'limonene',
  'linalool':           'linalool',
  'nerol':              'nerol',
  'nerolidol':          'nerolidol',
  'ocimene':            'ocimene',
  'pulegone':           'pulegone',
  'sabinene':           'sabinene',
  'sabinene hydrate':   'sabinene-hydrate',
  'terpineol':          'terpineol',
  'terpinolene':        'terpinolene',
  'valencene':          'valencene',
};

// All Badger Labs terpene names in the order they appear in the PDF
const TERPENE_NAMES_ORDERED = [
  'alpha-Bisabolol', 'alpha-Cedrene', 'alpha-Humulene', 'alpha-Phellandrene',
  'alpha-Pinene', 'alpha-Terpinene', 'beta-Caryophyllene', 'beta-Myrcene',
  'beta-Pinene', 'Borneol', 'Camphene', 'Camphor', '3-Carene',
  'Caryophyllene oxide', 'Cedrol', 'Eucalyptol', 'Farnesene', 'Fenchone',
  'Fenchyl Alcohol', 'gamma-Terpinene', 'Geraniol', 'Geranyl acetate',
  'Guaiol', 'Hexahydrothymol', 'Isoborneol', 'Isopulegol',
  'Limonene', 'Linalool', 'Nerol', 'Nerolidol', 'Ocimene', 'Pulegone',
  'Sabinene', 'Sabinene hydrate', 'Terpineol', 'Terpinolene', 'Valencene',
];

/**
 * Parse terpene data from Badger Labs PDF text.
 * Returns array of { name, slug, percentage } for detected (non-ND) terpenes.
 */
function parseBadgerLabsTerpenes(pdfText) {
  const results = [];

  // Strategy: find the WEIGHT % values that follow the terpene name columns.
  // The PDF has 3 columns of terpenes, each with a WEIGHT % column after.
  // pdftotext linearizes them so we get: names col1, names col2, names col3,
  // then values col1, values col2, values col3.
  // We extract all numeric values (not ND) in order and map to terpene names.

  // Extract all terpene weight % values in document order
  // Match lines that are numeric percentages (e.g. "0.096", "1.477") or "ND"
  const lines = pdfText.split('\n').map(l => l.trim()).filter(Boolean);

  // Find the TERPENE PROFILE section
  const profileStart = lines.findIndex(l => l.includes('TERPENE PROFILE'));
  if (profileStart === -1) return results;

  // Find the end marker (page 3 or "Analyzed by method")
  const profileEnd = lines.findIndex((l, i) => i > profileStart && 
    (l.includes('Analyzed by method') || l.includes('Page 3')));
  const section = lines.slice(profileStart, profileEnd === -1 ? profileStart + 200 : profileEnd);

  // Extract all WEIGHT % numeric values in order (skip ND)
  // Values look like: "0.096", "1.477", "ND", "0.287"
  const weightPattern = /^(\d+\.\d+|ND)$/;
  const allValues = [];
  let inWeightSection = false;

  for (const line of section) {
    if (line === 'WEIGHT %') {
      inWeightSection = true;
      continue;
    }
    if (inWeightSection && weightPattern.test(line)) {
      allValues.push(line === 'ND' ? null : parseFloat(line));
    } else if (inWeightSection && line.length > 0 && !weightPattern.test(line)) {
      // Stop collecting values when we hit non-value text (next terpene name column)
      if (!/^\d/.test(line) && line !== 'WEIGHT %') {
        inWeightSection = false;
      }
    }
  }

  // Alternative approach: collect all weight values across all 3 WEIGHT % sections
  const weightSections = [];
  let currentSection = null;
  for (const line of section) {
    if (line === 'WEIGHT %') {
      currentSection = [];
      weightSections.push(currentSection);
    } else if (currentSection !== null) {
      if (weightPattern.test(line)) {
        currentSection.push(line === 'ND' ? null : parseFloat(line));
      } else if (line.length > 2 && !/^\d/.test(line) && line !== 'WEIGHT %') {
        // End of this weight section
        currentSection = null;
      }
    }
  }

  // Flatten all weight sections into one ordered array
  const flatValues = weightSections.flat();

  // Map to terpene names (37 terpenes total, 3 columns of ~13 each)
  const col1Names = TERPENE_NAMES_ORDERED.slice(0, 13);
  const col2Names = TERPENE_NAMES_ORDERED.slice(13, 26);
  const col3Names = TERPENE_NAMES_ORDERED.slice(26);

  const col1Values = weightSections[0] || [];
  const col2Values = weightSections[1] || [];
  const col3Values = weightSections[2] || [];

  const allPairs = [
    ...col1Names.map((name, i) => ({ name, value: col1Values[i] ?? null })),
    ...col2Names.map((name, i) => ({ name, value: col2Values[i] ?? null })),
    ...col3Names.map((name, i) => ({ name, value: col3Values[i] ?? null })),
  ];

  for (const { name, value } of allPairs) {
    if (value !== null && value > 0) {
      const slug = TERPENE_SLUG_MAP[name.toLowerCase()];
      if (slug) {
        results.push({ name, slug, percentage: value.toFixed(4) });
      }
    }
  }

  return results;
}

async function downloadAndParsePDF(url, productId) {
  const tmpFile = join(tmpdir(), `coa_${productId}_${Date.now()}.pdf`);
  try {
    // Download PDF
    execSync(`curl -sL --max-time 30 "${url}" -o "${tmpFile}"`, { stdio: 'pipe' });
    if (!existsSync(tmpFile)) return [];

    // Convert to text
    const text = execSync(`pdftotext "${tmpFile}" -`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    return parseBadgerLabsTerpenes(text);
  } catch (err) {
    console.error(`  ✗ Failed to parse PDF for product ${productId}: ${err.message}`);
    return [];
  } finally {
    try { if (existsSync(tmpFile)) unlinkSync(tmpFile); } catch {}
  }
}

async function main() {
  const db = await createConnection(process.env.DATABASE_URL);

  // Get all products with COA URLs (skip accessories)
  const [products] = await db.execute(`
    SELECT id, name, coaUrl, category
    FROM products
    WHERE coaUrl IS NOT NULL AND coaUrl != ''
      AND category NOT IN ('accessories', 'accessory')
    ORDER BY category, name
  `);

  console.log(`\n🌿 Bulk Terpene Import — ${products.length} products\n`);

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const product of products) {
    console.log(`\n[${product.id}] ${product.name}`);
    console.log(`  COA: ${product.coaUrl}`);

    // Check if terpenes already exist for this product
    const [existing] = await db.execute(
      'SELECT COUNT(*) as cnt FROM product_terpenes WHERE productId = ?',
      [product.id]
    );
    
    if (existing[0].cnt > 0) {
      console.log(`  ⚠ Already has ${existing[0].cnt} terpene records — clearing and re-importing`);
      await db.execute('DELETE FROM product_terpenes WHERE productId = ?', [product.id]);
    }

    const terpenes = await downloadAndParsePDF(product.coaUrl, product.id);

    if (terpenes.length === 0) {
      console.log(`  ✗ No terpene data found in PDF`);
      totalFailed++;
      continue;
    }

    // Insert terpenes
    for (const t of terpenes) {
      await db.execute(
        'INSERT INTO product_terpenes (productId, terpeneSlug, terpeneName, percentage) VALUES (?, ?, ?, ?)',
        [product.id, t.slug, t.name, t.percentage]
      );
    }

    console.log(`  ✓ Inserted ${terpenes.length} terpenes: ${terpenes.map(t => `${t.name} ${t.percentage}%`).join(', ')}`);
    totalInserted += terpenes.length;
  }

  await db.end();

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✅ Import complete`);
  console.log(`   Products processed: ${products.length}`);
  console.log(`   Total terpenes inserted: ${totalInserted}`);
  console.log(`   Failed/no data: ${totalFailed}`);
  console.log(`${'─'.repeat(60)}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
