import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// ── Order details ──────────────────────────────────────────────
// Customer: Austin Woodward (id: 3781314, email: austinwoodward91@gmail.com)

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
  'Jungle Driver',  // listed twice per the order
  'Space Cherry',
];

const PREROLL_PRICE = 2.00;
const HASHHOLE_PRICE = 4.00;
const QTY = 50;

// Build line items
const items = [
  ...prerolls.map(name => ({
    productName: `${name} — Tubeless Preroll`,
    quantity: QTY,
    unitPrice: PREROLL_PRICE,
    lineTotal: PREROLL_PRICE * QTY,
    vendorId: 'manual',
    productId: null,
  })),
  ...hashholes.map(name => ({
    productName: `${name} — Tubeless Hashhole`,
    quantity: QTY,
    unitPrice: HASHHOLE_PRICE,
    lineTotal: HASHHOLE_PRICE * QTY,
    vendorId: 'manual',
    productId: null,
  })),
];

// Totals
const prerollSubtotal = prerolls.length * QTY * PREROLL_PRICE;   // 10 × 50 × $2 = $1,000
const hashholeSubtotal = hashholes.length * QTY * HASHHOLE_PRICE; // 8 × 50 × $4 = $1,600
const subtotal = prerollSubtotal + hashholeSubtotal;               // $2,600
const shippingCost = 0;
const total = subtotal + shippingCost;

console.log(`Preroll subtotal: $${prerollSubtotal}`);
console.log(`Hashhole subtotal: $${hashholeSubtotal}`);
console.log(`Total: $${total}`);
console.log(`Line items: ${items.length}`);

// Generate order number
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
    shippingCost,
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
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      orderId,
      item.productId,
      item.vendorId,
      item.productName,
      item.quantity,
      item.unitPrice,
      item.lineTotal,
    ]
  );
  console.log(`  ✓ ${item.productName} × ${item.quantity} @ $${item.unitPrice} = $${item.lineTotal}`);
}

console.log(`\n✅ Order ${orderNumber} created successfully!`);
console.log(`   Customer: Austin Woodward (austinwoodward91@gmail.com)`);
console.log(`   Total: $${total.toLocaleString()}`);
console.log(`   Items: ${items.length} line items`);

await conn.end();
