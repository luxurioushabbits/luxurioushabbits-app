import { execSync } from 'child_process';

function testUrl(url) {
  const target = url.startsWith('http') ? url : 'http://localhost:3000' + url;
  try {
    const code = execSync(`curl -s -o /dev/null -w "%{http_code}" -L --max-time 6 "${target}"`, {timeout: 9000}).toString().trim();
    return code;
  } catch(e) {
    return 'TIMEOUT';
  }
}

async function fetchTRPC(proc, input) {
  const encoded = encodeURIComponent(JSON.stringify({json: input || null}));
  const res = await fetch(`http://localhost:3000/api/trpc/${proc}?input=${encoded}`);
  const d = await res.json();
  return d?.result?.data?.json;
}

console.log('\n========================================');
console.log('FULL SITE IMAGE & CONTENT AUDIT');
console.log('========================================\n');

let issues = [];

// 1. Products
console.log('--- PRODUCTS ---');
const catalogData = await fetchTRPC('catalog.list', {});
const products = catalogData?.products || [];
console.log(`Total active products: ${products.length}`);

for (const p of products) {
  const prod = p.product;
  const name = (prod.name || '').substring(0, 50);
  const url = prod.imageUrl || '';
  if (!url) {
    issues.push(`NO IMAGE: ${name}`);
    console.log(`  NO IMAGE: ${name}`);
    continue;
  }
  const code = testUrl(url);
  if (code !== '200') {
    issues.push(`BROKEN IMAGE (${code}): ${name} | ${url.substring(0,70)}`);
    console.log(`  BROKEN (${code}): ${name}`);
    console.log(`     URL: ${url.substring(0,70)}`);
  } else {
    console.log(`  OK: ${name}`);
  }
}

// 2. Blog posts
console.log('\n--- BLOG POSTS ---');
try {
  const blogData = await fetchTRPC('blog.list', {});
  const posts = blogData?.posts || blogData || [];
  console.log(`Total blog posts: ${posts.length}`);
  for (const post of posts) {
    const title = (post.title || '').substring(0, 50);
    const url = post.coverImage || post.cover_image || '';
    if (!url) {
      console.log(`  NO COVER IMAGE: ${title}`);
    } else {
      const code = testUrl(url);
      if (code !== '200') {
        issues.push(`BROKEN BLOG IMAGE (${code}): ${title}`);
        console.log(`  BROKEN BLOG IMAGE (${code}): ${title}`);
      } else {
        console.log(`  OK: ${title}`);
      }
    }
  }
} catch(e) {
  console.log('  Blog fetch error: ' + e.message);
}

// 3. Static assets
console.log('\n--- STATIC ASSETS (hardcoded in source) ---');
const staticAssets = [
  '/manus-storage/logo_14152948.png',
  '/manus-storage/logo_skull_transparent_ad0d5e8b.png',
  '/manus-storage/optical_illusion_549ade92.webp',
  '/manus-storage/optical_swirls_27b9cf4e.webp',
  '/manus-storage/zebra-tunnel-optical-illusion_3c96324c.webp',
  '/manus-storage/optical_illusion_cc28b3da.webp',
  '/manus-storage/email_header_animated_33d37710.gif',
];
for (const url of staticAssets) {
  const code = testUrl(url);
  if (code !== '200') {
    issues.push(`BROKEN STATIC ASSET (${code}): ${url}`);
    console.log(`  BROKEN (${code}): ${url}`);
  } else {
    console.log(`  OK: ${url}`);
  }
}

// 4. External URLs
console.log('\n--- EXTERNAL IMAGE URLS ---');
const externalUrls = [
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663729872981/kfSRtBTLcfiebpgEWg2wEe/optical_tunnel_v2-dzVSF9n6ovDz3g3zAzQvE9.webp',
  'https://cdn.shopify.com/s/files/1/0621/5142/6304/files/puffco-new-peak-smart-e-rig-onyx.jpg?v=1721949211',
];
for (const url of externalUrls) {
  const code = testUrl(url);
  if (code !== '200') {
    issues.push(`BROKEN EXTERNAL (${code}): ${url.substring(0,80)}`);
    console.log(`  BROKEN (${code}): ${url.substring(0,80)}`);
  } else {
    console.log(`  OK: ${url.substring(0,80)}`);
  }
}

// 5. Summary
console.log('\n========================================');
console.log(`TOTAL ISSUES FOUND: ${issues.length}`);
if (issues.length > 0) {
  console.log('\nISSUES:');
  issues.forEach(i => console.log('  - ' + i));
} else {
  console.log('All images OK!');
}
console.log('========================================\n');
