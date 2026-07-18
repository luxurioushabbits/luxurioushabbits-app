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
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get the most recent order with crowdshipOrderId set
  const [rows] = await conn.execute(
    "SELECT orderNumber, crowdshipOrderId, crowdshipSubmittedAt, status FROM orders WHERE crowdshipOrderId IS NOT NULL ORDER BY createdAt DESC LIMIT 5"
  );
  await conn.end();

  console.log("=== Orders with Crowdship Submission ===");
  for (const row of rows) {
    console.log(`\n  Order: ${row.orderNumber}`);
    console.log(`  Status: ${row.status}`);
    console.log(`  Submitted: ${row.crowdshipSubmittedAt}`);
    console.log(`  Crowdship ID/URL: ${row.crowdshipOrderId}`);
  }

  // Check the monitoring URL
  console.log("\n=== Crowdship Order Status Check ===");
  const monitoringUrl = `${BASE}/orders/status`;
  try {
    const res = await fetch(monitoringUrl, { headers: getHeaders() });
    const body = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${body.slice(0, 1000)}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  // Also check purchase orders
  console.log("\n=== Crowdship Purchase Orders ===");
  try {
    const res = await fetch(`${BASE}/purchase-orders`, { headers: getHeaders() });
    const data = await res.json();
    console.log(`Total POs: ${data.pagination?.total ?? 0}`);
    if (data.purchase_orders?.length > 0) {
      for (const po of data.purchase_orders) {
        console.log(`  PO: ${JSON.stringify(po).slice(0, 200)}`);
      }
    } else {
      console.log("  No purchase orders found");
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

main().catch(console.error);
