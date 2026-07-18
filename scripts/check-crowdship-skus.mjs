import "dotenv/config";
import mysql from "mysql2/promise";

const BASE = "https://api.crowdship.io/api/v1";

function getHeaders() {
  return {
    "X-CROWDSHIP-KEY": process.env.CROWDSHIP_API_KEY ?? "",
    "X-CROWDSHIP-SECRET": process.env.CROWDSHIP_SECRET_KEY ?? "",
    "Content-Type": "application/json",
  };
}

async function main() {
  // 1. Check what SKUs our DB products have
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute(
    "SELECT id, name, crowdshipSku, crowdshipVariantId FROM products WHERE crowdshipSku IS NOT NULL OR crowdshipVariantId IS NOT NULL"
  );
  await conn.end();

  console.log("=== Products with Crowdship SKUs in DB ===");
  for (const row of rows) {
    console.log(`  ${row.name}: sku=${row.crowdshipSku}, variantId=${row.crowdshipVariantId}`);
  }

  // 2. Fetch Crowdship catalog to see all available SKUs
  console.log("\n=== Crowdship Catalog SKUs ===");
  const res = await fetch(`${BASE}/inventory/products?limit=50`, { headers: getHeaders() });
  const data = await res.json();
  for (const product of data.products ?? []) {
    console.log(`\nProduct: ${product.name} (id: ${product.id})`);
    for (const variant of product.variants ?? []) {
      console.log(`  Variant SKU: ${variant.sku} | cost: $${variant.cost} | stock: ${variant.stock}`);
    }
  }
}

main().catch(console.error);
