import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Find the Crowdship vendor ID
  const [vendors] = await conn.execute("SELECT id FROM vendors WHERE slug = 'crowdship' LIMIT 1");
  if (vendors.length === 0) {
    console.log("Crowdship vendor not found");
    await conn.end();
    return;
  }
  const vendorId = vendors[0].id;
  console.log(`Crowdship vendor ID: ${vendorId}`);

  // Check if already imported
  const [existing] = await conn.execute(
    "SELECT id FROM products WHERE crowdshipVariantId = '6a39bf36942d25acf72b7d8b' LIMIT 1"
  );
  if (existing.length > 0) {
    console.log("Puffco Peak Pro Onyx already imported (id:", existing[0].id, ")");
    await conn.end();
    return;
  }

  // Insert the Onyx variant
  const [result] = await conn.execute(
    `INSERT INTO products 
     (vendorId, name, slug, description, category, retailPrice, wholesalePrice, 
      crowdshipVariantId, crowdshipSku, crowdshipSupplierId, variationLabel, 
      isActive, stockQuantity, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      vendorId,
      "Puffco Peak Pro Concentrate Vaporizer with 3DXL Atomizer",
      "puffco-peak-pro-concentrate-vaporizer-3dxl-onyx-cs-6a39bf36",
      "The Puffco Peak Pro with 3DXL Atomizer delivers the most advanced concentrate experience. The 3DXL chamber provides full-melt extraction with unmatched flavor. Color: Onyx.",
      "accessory",
      "419.99",   // retail price = SRP
      "307.00",   // wholesale cost from Crowdship
      "6a39bf36942d25acf72b7d8b",  // variant ID
      "PFCO-PEAKPRO-3DXL-ONYX",   // SKU
      null,       // supplierId (not stored separately)
      "Onyx",     // variation label
      1,          // isActive
      142,        // stock from Crowdship
    ]
  );

  console.log(`✅ Imported Puffco Peak Pro Onyx — product ID: ${result.insertId}`);
  console.log(`   Name: Puffco Peak Pro Concentrate Vaporizer with 3DXL Atomizer`);
  console.log(`   Color: Onyx`);
  console.log(`   SKU: PFCO-PEAKPRO-3DXL-ONYX`);
  console.log(`   Retail: $419.99 | Wholesale: $307.00`);
  console.log(`   Stock: 142`);

  await conn.end();
}

main().catch(console.error);
