import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { productTerpenes, products } from "./drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
  const pool = await mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool);
  const rows = await db
    .select({ productName: products.name, slug: productTerpenes.terpeneSlug, pct: productTerpenes.percentage, active: products.isActive })
    .from(productTerpenes)
    .innerJoin(products, eq(productTerpenes.productId, products.id))
    .orderBy(products.name, desc(productTerpenes.percentage));
  const grouped: Record<string, {active: boolean, slugs: string[]}> = {};
  for (const r of rows) {
    if (!grouped[r.productName]) grouped[r.productName] = { active: r.active, slugs: [] };
    grouped[r.productName].slugs.push(r.slug);
  }
  for (const [name, data] of Object.entries(grouped)) {
    console.log(`[${data.active ? 'ACTIVE' : 'inactive'}] ${name}: ${data.slugs.join(', ')}`);
  }
  await pool.end();
}
main().catch(console.error);
