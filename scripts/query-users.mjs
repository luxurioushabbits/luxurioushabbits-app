import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load env
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Get users
const [users] = await conn.execute('SELECT id, name, email FROM users LIMIT 30');
console.log('USERS:', JSON.stringify(users, null, 2));

// Get orders table columns
const [cols] = await conn.execute('DESCRIBE orders');
console.log('\nORDERS COLUMNS:', JSON.stringify(cols.map(c => c.Field), null, 2));

// Get order_items table columns
try {
  const [itemCols] = await conn.execute('DESCRIBE order_items');
  console.log('\nORDER_ITEMS COLUMNS:', JSON.stringify(itemCols.map(c => c.Field), null, 2));
} catch(e) {
  console.log('No order_items table:', e.message);
}

await conn.end();
