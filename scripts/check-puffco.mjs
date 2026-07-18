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
  // 1. Check what Puffco products we have in the DB
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.execute(
    "SELECT id, name, retailPrice, crowdshipSku, crowdshipVariantId, category, isActive FROM products WHERE name LIKE '%puffco%' OR name LIKE '%Puffco%' OR name LIKE '%peak%' ORDER BY createdAt DESC"
  );
  await conn.end();

  console.log("=== Puffco Products in DB ===");
  for (const r of rows) {
    console.log(`  [${r.id}] ${r.name}`);
    console.log(`    Price: $${r.retailPrice} | SKU: ${r.crowdshipSku ?? 'null'} | VariantID: ${r.crowdshipVariantId ?? 'null'} | Active: ${r.isActive}`);
  }

  // 2. Fetch all Puffco products from Crowdship catalog with their variants
  console.log("\n=== Crowdship Catalog — Puffco Products ===");
  const res = await fetch(`${BASE}/inventory/products?limit=50`, { headers: getHeaders() });
  const data = await res.json();
  
  const puffcoProducts = (data.products ?? []).filter(p => 
    p.name.toLowerCase().includes("puffco") || p.name.toLowerCase().includes("peak")
  );

  for (const product of puffcoProducts) {
    console.log(`\nProduct: ${product.name}`);
    console.log(`  ID: ${product.id}`);
    
    // Fetch full product with variants
    const varRes = await fetch(`${BASE}/inventory/products?id=${product.id}`, { headers: getHeaders() });
    const varData = await varRes.json();
    const fullProduct = varData.products?.[0];
    
    if (fullProduct?.variants?.length > 0) {
      console.log(`  Variants (${fullProduct.variants.length}):`);
      for (const v of fullProduct.variants) {
        const imported = rows.find(r => r.crowdshipVariantId === v.id);
        console.log(`    - ID: ${v.id}`);
        console.log(`      SKU: ${v.sku}`);
        console.log(`      Attributes: ${JSON.stringify(v.attributes)}`);
        console.log(`      Cost: $${v.cost} | SRP: $${v.srp} | Stock: ${v.stock}`);
        console.log(`      Status: ${imported ? '✅ IMPORTED as "' + imported.name + '"' : '❌ NOT IMPORTED'}`);
      }
    } else {
      console.log(`  No variants found`);
    }
  }
}

main().catch(console.error);
