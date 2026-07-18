const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

console.log('Forge URL:', forgeApiUrl ? forgeApiUrl.substring(0, 40) + '...' : 'MISSING');
console.log('Forge Key:', forgeApiKey ? forgeApiKey.substring(0, 10) + '...' : 'MISSING');

// Test with the old key
const oldKey = 'profile-photos/user_1_1782286512600.png';
const url = new URL('v1/storage/presign/get', forgeApiUrl.replace(/\/+$/, '') + '/');
url.searchParams.set('path', oldKey);

console.log('\nTesting presign for old key:', oldKey);
const resp = await fetch(url, { headers: { Authorization: `Bearer ${forgeApiKey}` } });
console.log('Presign status:', resp.status);
const body = await resp.text();
console.log('Presign body:', body.substring(0, 300));

// Also test a PUT presign to see if upload works
const testKey = 'profile-photos/test_' + Date.now() + '.png';
const putUrl = new URL('v1/storage/presign/put', forgeApiUrl.replace(/\/+$/, '') + '/');
putUrl.searchParams.set('path', testKey);
const putResp = await fetch(putUrl, { headers: { Authorization: `Bearer ${forgeApiKey}` } });
console.log('\nPUT presign status:', putResp.status);
const putBody = await putResp.text();
console.log('PUT presign body:', putBody.substring(0, 200));
