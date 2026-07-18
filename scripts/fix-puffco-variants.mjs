/**
 * fix-puffco-variants.mjs
 * 1. Deactivate Puffco Peak Pro Cloud (ID 60026) — 0 stock on Crowdship
 * 2. Add "Cloud" variation label to product 60026
 * 3. Set stockQuantity = 0 and isOutOfStock = 1 on product 60026
 * 4. Confirm Onyx (60027) has correct variation label "Onyx"
 */
import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Fix Cloud variant: deactivate, label, mark out of stock
  const [cloudResult] = await conn.execute(
    `UPDATE products 
     SET isActive = 0, isOutOfStock = 1, stockQuantity = 0, variationLabel = 'Cloud'
     WHERE id = 60026`,
  );
  console.log(`Cloud variant (60026): updated ${cloudResult.affectedRows} row(s) — deactivated, labeled 'Cloud', stock=0`);

  // Confirm Onyx has the right label
  const [onyxResult] = await conn.execute(
    `UPDATE products 
     SET variationLabel = 'Onyx'
     WHERE id = 60027 AND (variationLabel IS NULL OR variationLabel != 'Onyx')`,
  );
  console.log(`Onyx variant (60027): updated ${onyxResult.affectedRows} row(s) — label confirmed 'Onyx'`);

  // Verify
  const [rows] = await conn.execute(
    `SELECT id, name, variationLabel, isActive, isOutOfStock, stockQuantity, crowdshipSku 
     FROM products WHERE id IN (60026, 60027)`,
  );
  console.log("\nFinal state:");
  for (const row of rows) {
    console.log(`  ID ${row.id}: ${row.name} [${row.variationLabel}] — active=${row.isActive}, outOfStock=${row.isOutOfStock}, stock=${row.stockQuantity}, sku=${row.crowdshipSku}`);
  }

  await conn.end();
}

main().catch(console.error);
