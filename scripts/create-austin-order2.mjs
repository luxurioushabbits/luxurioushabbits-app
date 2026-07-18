import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Get vendors
const [vendors] = await conn.execute('SELECT id, name, slug FROM vendors');
console.log('Vendors:', JSON.stringify(vendors, null, 2));

// Delete the partial order created earlier (id: 60002)
await conn.execute('DELETE FROM orders WHERE id = 60002');
console.log('Cleaned up partial order 60002');

// Use vendor id 1 (first/default vendor) for manual items
const vendorId = 1;

// ── Order details ──────────────────────────────────────────────
// $2 Tubeless Prerolls × 50 each
const prerolls = [
  'Alien Spacecraft',
  'Cake N Bake',
  'Cloud Burst',
  'Destiny',
  'Jungle Driver',
  'Lucky 13',
  'Marshmellow Mountain',
  'Pineapple Treat',
  'Planet Sherb',
  'Tropicana Cherry',
];

// $4 Tubeless Hashholes × 50 each
const hashholes = [
  'Blue Dream',
  'Cake N Money',
  'Cosmic Jet',
  'Galactic Gelato',
  'Island Fuel',
  'Jungle Driver',
  'Jungle Driver',
  'Space Cherry',
];

const PREROLL_PRICE = 2.00;
const HASHHOLE_PRICE = 4.00;
const QTY = 50;

const items = [
  ...prerolls.map(name => ({
    productName: `${name} — Tubeless Preroll`,
    quantity: QTY,
    unitPrice: PREROLL_PRICE,
    lineTotal: PREROLL_PRICE * QTY,
  })),
  ...hashholes.map(name => ({
    productName: `${name} — Tubeless Hashhole`,
    quantity: QTY,
    unitPrice: HASHHOLE_PRICE,
    lineTotal: HASHHOLE_PRICE * QTY,
  })),
];

const prerollSubtotal = prerolls.length * QTY * PREROLL_PRICE;   // 10 × 50 × $2 = $1,000
const hashholeSubtotal = hashholes.length * QTY * HASHHOLE_PRICE; // 8 × 50 × $4 = $1,600
const subtotal = prerollSubtotal + hashholeSubtotal;               // $2,600
const total = subtotal;

console.log(`\nPreroll subtotal:  $${prerollSubtotal}  (${prerolls.length} strains × ${QTY} × $${PREROLL_PRICE})`);
console.log(`Hashhole subtotal: $${hashholeSubtotal}  (${hashholes.length} strains × ${QTY} × $${HASHHOLE_PRICE})`);
console.log(`Grand Total:       $${total}`);
console.log(`Line items:        ${items.length}`);

const orderNumber = `LH-WS-${Date.now().toString().slice(-8)}`;

// Insert order
const [orderResult] = await conn.execute(
  `INSERT INTO orders (
    orderNumber, status, customerName, customerEmail,
    shippingName, shippingAddress1, shippingCity, shippingState, shippingZip,
    subtotal, shippingCost, total,
    paymentStatus, notes, userId, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    orderNumber,
    'pending',
    'Austin Woodward',
    'austinwoodward91@gmail.com',
    'Austin Woodward',
    'TBD',
    'TBD',
    'TBD',
    'TBD',
    subtotal,
    0,
    total,
    'pending',
    'Wholesale order — Tubeless Prerolls & Hashholes. Created manually by admin.',
    3781314,
  ]
);

const orderId = orderResult.insertId;
console.log(`\nOrder created: ${orderNumber} (id: ${orderId})`);

// Insert line items
for (const item of items) {
  await conn.execute(
    `INSERT INTO order_items (orderId, productId, vendorId, productName, quantity, unitPrice, lineTotal, createdAt)
     VALUES (?, NULL, ?, ?, ?, ?, ?, NOW())`,
    [orderId, vendorId, item.productName, item.quantity, item.unitPrice, item.lineTotal]
  );
  console.log(`  ✓ ${item.productName} × ${item.quantity} @ $${item.unitPrice} = $${item.lineTotal}`);
}

console.log(`\n✅ Order ${orderNumber} created successfully!`);
console.log(`   Customer: Austin Woodward (austinwoodward91@gmail.com)`);
console.log(`   Total: $${total.toLocaleString()}`);
console.log(`   Items: ${items.length} line items`);

await conn.end();
