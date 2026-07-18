/**
 * extract-thca-percent.mjs
 * Fetches each product's COA URL, downloads the PDF text, asks the LLM for the THCA %,
 * and updates the products table.
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

dotenv.config();

const db = await mysql.createConnection(process.env.DATABASE_URL);

// Fetch all active products with coaUrl but missing thcaPercent
const [rows] = await db.execute(
  "SELECT id, name, coaUrl FROM products WHERE isActive = 1 AND coaUrl IS NOT NULL"
);

console.log(`Found ${rows.length} products to process`);

const FORGE_URL = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function extractThcaFromPdf(coaUrl, productName) {
  // Download the PDF to a temp file
  const tmpFile = path.join(os.tmpdir(), `coa_${Date.now()}.pdf`);
  try {
    // Download PDF
    const res = await fetch(coaUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${coaUrl}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(tmpFile, buf);

    // Extract text from PDF using pdftotext
    let pdfText = "";
    try {
      pdfText = execSync(`pdftotext "${tmpFile}" -`, { encoding: "utf8", timeout: 30000 });
    } catch {
      throw new Error("pdftotext failed");
    }

    // Ask LLM to extract THCA %
    const prompt = `You are analyzing a Certificate of Analysis (COA) for a hemp/cannabis product named "${productName}".
Extract the THCA percentage from this COA text. Look for "THCA", "Δ9-THCA", "d9-THCA", or similar labels.
Return ONLY a JSON object like: {"thcaPercent": 24.5}
If you cannot find a THCA percentage, return: {"thcaPercent": null}
Do not include any other text.

COA TEXT:
${pdfText.slice(0, 8000)}`;

    const llmRes = await fetch(`${FORGE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FORGE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 100,
      }),
    });

    if (!llmRes.ok) throw new Error(`LLM API error: ${llmRes.status}`);
    const llmData = await llmRes.json();
    const content = llmData.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    return parsed.thcaPercent;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

let updated = 0;
let failed = 0;

for (const row of rows) {
  try {
    console.log(`Processing: ${row.name}`);
    const thcaPercent = await extractThcaFromPdf(row.coaUrl, row.name);
    
    if (thcaPercent !== null && !isNaN(parseFloat(thcaPercent))) {
      await db.execute(
        "UPDATE products SET thcaPercent = ? WHERE id = ?",
        [parseFloat(thcaPercent).toFixed(2), row.id]
      );
      console.log(`  ✓ ${row.name}: ${thcaPercent}% THCA`);
      updated++;
    } else {
      console.log(`  ⚠ ${row.name}: THCA not found in COA`);
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  } catch (err) {
    console.error(`  ✗ ${row.name}: ${err.message}`);
    failed++;
  }
}

await db.end();
console.log(`\nDone: ${updated} updated, ${failed} failed/skipped`);
