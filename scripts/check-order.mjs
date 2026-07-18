import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const orderNumber = process.argv[2] ?? "LH-MQQBVWOG";
  
  // Get the order
  const [orders] = await conn.execute(
    "SELECT * FROM orders WHERE orderNumber = ?",
    [orderNumber]
  );
  
  if (orders.length === 0) {
    console.log(`Order ${orderNumber} not found`);
    await conn.end();
    return;
  }
  
  const order = orders[0];
  console.log("=== Order ===");
  console.log(`  Number: ${order.orderNumber}`);
  console.log(`  Customer: ${order.customerName} <${order.customerEmail}>`);
  console.log(`  Phone: ${order.customerPhone ?? 'none'}`);
  console.log(`  Shipping: ${order.shippingAddress1}, ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`);
  console.log(`  Total: $${order.totalAmount}`);
  console.log(`  Status: ${order.status}`);
  console.log(`  TopShelf Order #: ${order.topshelfOrderNumber ?? 'null'}`);
  console.log(`  TopShelf Error: ${order.topshelfError ?? 'none'}`);
  console.log(`  Crowdship Order ID: ${order.crowdshipOrderId ?? 'null'}`);
  console.log(`  Crowdship Submitted: ${order.crowdshipSubmittedAt ?? 'NOT SUBMITTED'}`);
  console.log(`  Created: ${order.createdAt}`);
  
  // Get order items
  const [items] = await conn.execute(
    `SELECT oi.*, p.name, p.crowdshipSku, p.crowdshipVariantId, p.topshelfVariationId 
     FROM orderItems oi 
     LEFT JOIN products p ON oi.productId = p.id 
     WHERE oi.orderId = ?`,
    [order.id]
  );
  
  console.log("\n=== Order Items ===");
  for (const item of items) {
    console.log(`  - ${item.name} x${item.quantity} @ $${item.unitPrice}`);
    console.log(`    Crowdship SKU: ${item.crowdshipSku ?? 'null'}`);
    console.log(`    TopShelf Variation: ${item.topshelfVariationId ?? 'null'}`);
  }
  
  await conn.end();
}

main().catch(console.error);
