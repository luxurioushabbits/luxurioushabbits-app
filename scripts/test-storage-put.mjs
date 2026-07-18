/**
 * Test script: verify the full storagePut flow end-to-end
 * Run with: node scripts/test-storage-put.mjs
 */
const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

if (!forgeApiUrl || !forgeApiKey) {
  console.error('BUILT_IN_FORGE_API_URL or BUILT_IN_FORGE_API_KEY not set');
  process.exit(1);
}

const base = forgeApiUrl.replace(/\/+$/, '');
console.log('Forge URL:', base.substring(0, 40) + '...');

// 1. Request a presigned PUT URL
const testKey = `test-uploads/test_${Date.now()}.txt`;
console.log('\n1. Requesting presign/put for key:', testKey);
const putPresignUrl = new URL('v1/storage/presign/put', base + '/');
putPresignUrl.searchParams.set('path', testKey);
const putPresignResp = await fetch(putPresignUrl, {
  headers: { Authorization: `Bearer ${forgeApiKey}` },
});
console.log('   presign/put status:', putPresignResp.status);
if (!putPresignResp.ok) {
  const body = await putPresignResp.text();
  console.error('   FAILED:', body);
  process.exit(1);
}
const { url: s3PutUrl } = await putPresignResp.json();
console.log('   presigned PUT URL host:', new URL(s3PutUrl).host);

// 2. PUT the file to S3
console.log('\n2. Uploading test file to S3...');
const testContent = 'Hello from Luxurious Habbits storage test ' + Date.now();
const uploadResp = await fetch(s3PutUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'text/plain' },
  body: testContent,
});
console.log('   S3 PUT status:', uploadResp.status);
if (!uploadResp.ok) {
  const body = await uploadResp.text();
  console.error('   FAILED:', body.substring(0, 200));
  process.exit(1);
}
console.log('   Upload SUCCESS');

// 3. Request a presigned GET URL for the same key
console.log('\n3. Requesting presign/get for key:', testKey);
const getPresignUrl = new URL('v1/storage/presign/get', base + '/');
getPresignUrl.searchParams.set('path', testKey);
const getPresignResp = await fetch(getPresignUrl, {
  headers: { Authorization: `Bearer ${forgeApiKey}` },
});
console.log('   presign/get status:', getPresignResp.status);
if (!getPresignResp.ok) {
  const body = await getPresignResp.text();
  console.error('   FAILED:', body);
  process.exit(1);
}
const { url: s3GetUrl } = await getPresignResp.json();
console.log('   presigned GET URL host:', new URL(s3GetUrl).host);

// 4. Fetch the file via the signed GET URL
console.log('\n4. Fetching file via signed GET URL...');
const getResp = await fetch(s3GetUrl);
console.log('   GET status:', getResp.status);
if (getResp.ok) {
  const body = await getResp.text();
  console.log('   Content:', body.substring(0, 100));
  console.log('\n✅ Storage PUT/GET flow works correctly!');
} else {
  const body = await getResp.text();
  console.error('   FAILED:', body.substring(0, 200));
  console.error('\n❌ Storage GET failed — file may not have been uploaded to the correct bucket');
}
