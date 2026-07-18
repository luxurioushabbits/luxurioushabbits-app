import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Find Happy Kit Mini
  const [rows] = await conn.execute(
    "SELECT id, name, retailPrice, crowdshipSku, crowdshipVariantId, category, isActive FROM products WHERE name LIKE '%happy%' OR name LIKE '%Happy%' OR name LIKE '%kit%' ORDER BY createdAt DESC LIMIT 10"
  );
  
  console.log("=== Happy Kit / Related Products ===");
  if (rows.length === 0) {
    console.log("No products found matching 'happy' or 'kit'");
    // Show all recent products
    const [recent] = await conn.execute(
      "SELECT id, name, retailPrice, crowdshipSku, crowdshipVariantId, category, isActive FROM products ORDER BY createdAt DESC LIMIT 15"
    );
    console.log("\n=== Most Recent Products ===");
    for (const r of recent) {
      console.log(`  [${r.id}] ${r.name} | $${r.retailPrice} | sku: ${r.crowdshipSku ?? 'null'} | variantId: ${r.crowdshipVariantId ?? 'null'} | active: ${r.isActive} | cat: ${r.category}`);
    }
  } else {
    for (const r of rows) {
      console.log(`  [${r.id}] ${r.name}`);
      console.log(`    Price: $${r.retailPrice}`);
      console.log(`    Crowdship SKU: ${r.crowdshipSku ?? 'NULL ⚠️'}`);
      console.log(`    Crowdship Variant ID: ${r.crowdshipVariantId ?? 'NULL ⚠️'}`);
      console.log(`    Active: ${r.isActive} | Category: ${r.category}`);
    }
  }
  
  await conn.end();
}

main().catch(console.error);
