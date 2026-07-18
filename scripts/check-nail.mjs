import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  "SELECT id, name, is_active, topshelf_variation_id, topshelf_product_id, topshelf_retail_price, retail_price, category FROM products WHERE LOWER(name) LIKE '%nail%' OR LOWER(name) LIKE '%mini%' OR LOWER(name) LIKE '%email%' LIMIT 10"
);
console.log("Products matching nail/mini/email:");
console.log(JSON.stringify(rows, null, 2));

// Also list all products for reference
const [all] = await conn.execute(
  "SELECT id, name, is_active, category FROM products ORDER BY name LIMIT 50"
);
console.log("\nAll products:");
all.forEach(p => console.log(`  [${p.is_active ? 'ACTIVE' : 'inactive'}] ${p.name} (${p.category}) id=${p.id}`));

await conn.end();
