import "dotenv/config";

const BASE = "https://api.crowdship.io/api/v1";

function getHeaders() {
  return {
    "X-CROWDSHIP-KEY": process.env.CROWDSHIP_API_KEY ?? "",
    "X-CROWDSHIP-SECRET": process.env.CROWDSHIP_SECRET_KEY ?? "",
    "Content-Type": "application/json",
  };
}

async function main() {
  console.log("=== Crowdship API Test ===");
  console.log("API Key:", process.env.CROWDSHIP_API_KEY ? process.env.CROWDSHIP_API_KEY.slice(0, 8) + "..." : "NOT SET");
  console.log("Secret Key:", process.env.CROWDSHIP_SECRET_KEY ? process.env.CROWDSHIP_SECRET_KEY.slice(0, 8) + "..." : "NOT SET");
  console.log("");

  // 1. Test basic connectivity — fetch products
  console.log("1. Testing product catalog fetch...");
  try {
    const res = await fetch(`${BASE}/inventory/products?limit=1`, { headers: getHeaders() });
    const body = await res.text();
    console.log(`   Status: ${res.status}`);
    if (res.ok) {
      const data = JSON.parse(body);
      console.log(`   ✅ Success — ${data.pagination?.total ?? "?"} total products`);
    } else {
      console.log(`   ❌ Error: ${body}`);
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }

  // 2. Test purchase orders endpoint
  console.log("\n2. Testing purchase orders endpoint...");
  try {
    const res = await fetch(`${BASE}/purchase-orders`, { headers: getHeaders() });
    const body = await res.text();
    console.log(`   Status: ${res.status}`);
    if (res.ok) {
      const data = JSON.parse(body);
      console.log(`   ✅ Success:`, JSON.stringify(data).slice(0, 200));
    } else {
      console.log(`   ❌ Error: ${body}`);
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }

  // 3. Test submitting a dry-run order (with obviously invalid SKU to see error format)
  console.log("\n3. Testing order submission endpoint (dry run with test data)...");
  try {
    const payload = {
      orders: [{
        order_name: "LH-TEST-001",
        customer: {
          first_name: "Test",
          last_name: "Customer",
          email: "test@luxurioushabbits.com",
        },
        shipping: {
          address1: "123 Test St",
          city: "Austin",
          state: "TX",
          zip: "78701",
          country: "US",
        },
        line_items: [{
          sku: "TEST-SKU-INVALID",
          quantity: "1",
          price: "99.99",
        }],
        note: "Crowdship API test — do not fulfill",
      }],
    };

    const res = await fetch(`${BASE}/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${body.slice(0, 500)}`);
    if (res.status === 202) {
      console.log("   ✅ Order endpoint reachable (202 = at least one order accepted)");
    } else if (res.status === 400) {
      console.log("   ⚠️  Order endpoint reachable (400 = validation errors, expected for test SKU)");
    } else if (res.status === 403 || res.status === 401) {
      console.log("   ❌ Authentication failed — check API keys");
    } else if (res.status === 402) {
      console.log("   ❌ Payment required — trial account may not support order submission");
    } else {
      console.log(`   ⚠️  Unexpected status ${res.status}`);
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }
}

main().catch(console.error);
