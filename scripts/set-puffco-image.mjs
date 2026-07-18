import "dotenv/config";
import mysql from "mysql2/promise";

const ONYX_IMAGE = "/manus-storage/puffco-peak-pro-onyx_e8a56808.png";

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Update Onyx (60027) with the image
  const [r1] = await conn.execute(
    "UPDATE products SET imageUrl = ? WHERE id = 60027",
    [ONYX_IMAGE]
  );
  console.log(`Onyx (60027): updated ${r1.affectedRows} row(s) — imageUrl = ${ONYX_IMAGE}`);

  // Verify
  const [rows] = await conn.execute(
    "SELECT id, name, variationLabel, imageUrl, isActive, stockQuantity FROM products WHERE id IN (60026, 60027)"
  );
  for (const row of rows) {
    console.log(`  ID ${row.id} [${row.variationLabel}]: active=${row.isActive}, stock=${row.stockQuantity}, image=${row.imageUrl ?? 'null'}`);
  }

  await conn.end();
}

main().catch(console.error);
