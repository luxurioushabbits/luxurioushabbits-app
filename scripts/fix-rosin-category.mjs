import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// List all flower products
const [rows] = await conn.execute(
  "SELECT id, name, category FROM products WHERE category = 'flower' ORDER BY name"
);

console.log('\n=== Current flower-category products ===');
for (const r of rows) {
  console.log(`  [${r.id}] ${r.name}`);
}

// Fix: any product whose name contains rosin/hash/concentrate keywords → extract
const rosinKeywords = ['rosin', 'hash', 'concentrate', 'extract', 'wax', 'shatter', 'live resin', 'dab', 'bubble'];
const toFix = rows.filter(r => {
  const n = r.name.toLowerCase();
  return rosinKeywords.some(k => n.includes(k));
});

if (toFix.length === 0) {
  console.log('\nNo misplaced rosin products found in flower category.');
} else {
  console.log(`\nFixing ${toFix.length} products → category: extract`);
  for (const r of toFix) {
    await conn.execute("UPDATE products SET category = 'extract', updatedAt = NOW() WHERE id = ?", [r.id]);
    console.log(`  ✅ Fixed: [${r.id}] ${r.name}`);
  }
}

await conn.end();
console.log('\nDone.');
