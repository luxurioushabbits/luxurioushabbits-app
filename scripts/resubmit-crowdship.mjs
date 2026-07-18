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
  console.log(`Resubmitting order ${order.orderNumber} to Crowdship...`);
  console.log(`  Customer: ${order.customerName} <${order.customerEmail}>`);
  console.log(`  Shipping: ${order.shippingAddress1}, ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`);

  // Get order items with Crowdship SKUs
  const [items] = await conn.execute(
    `SELECT oi.quantity, oi.unitPrice, p.crowdshipSku, p.name
     FROM order_items oi
     LEFT JOIN products p ON oi.productId = p.id
     WHERE oi.orderId = ? AND p.crowdshipSku IS NOT NULL`,
    [order.id]
  );

  if (items.length === 0) {
    // Try camelCase table name
    const [items2] = await conn.execute(
      `SELECT oi.quantity, oi.unitPrice, p.crowdshipSku, p.name
       FROM orderItems oi
       LEFT JOIN products p ON oi.productId = p.id
       WHERE oi.orderId = ? AND p.crowdshipSku IS NOT NULL`,
      [order.id]
    );
    if (items2.length === 0) {
      console.log("No Crowdship items found in this order");
      await conn.end();
      return;
    }
    items.push(...items2);
  }

  console.log(`\nLine items:`);
  for (const item of items) {
    console.log(`  - ${item.name}: SKU=${item.crowdshipSku}, qty=${item.quantity}, price=$${item.unitPrice}`);
  }

  const nameParts = (order.shippingName ?? order.customerName ?? "").trim().split(" ");
  const firstName = nameParts[0] ?? "Customer";
  const lastName = nameParts.slice(1).join(" ") || "N/A";

  const payload = {
    orders: [{
      order_name: order.orderNumber,
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: order.customerEmail,
      },
      shipping: {
        address1: order.shippingAddress1 ?? "",
        address2: order.shippingAddress2 ?? undefined,
        city: order.shippingCity ?? "",
        state: order.shippingState ?? "",
        zip: order.shippingZip ?? "",
        country: "US",
        phone: order.customerPhone ?? undefined,
      },
      line_items: items.map(i => ({
        sku: i.crowdshipSku,
        quantity: String(i.quantity),
        price: String(parseFloat(i.unitPrice ?? "0").toFixed(2)),
      })),
      note: `Luxurious Habbits Dropship Order: #${order.orderNumber}`,
    }],
  };

  console.log(`\nSubmitting to Crowdship...`);
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log(`\nStatus: ${res.status}`);
  console.log(`Response: ${JSON.stringify(data, null, 2)}`);

  if (res.status === 202) {
    console.log("\n✅ Order submitted successfully!");
    // Update the DB
    await conn.execute(
      "UPDATE orders SET crowdshipOrderId = ?, crowdshipSubmittedAt = NOW(), status = 'processing' WHERE orderNumber = ?",
      [data.monitoringUrl ?? "submitted", orderNumber]
    );
    console.log("✅ DB updated");
  } else {
    console.log("\n❌ Submission failed");
  }

  await conn.end();
}

main().catch(console.error);
