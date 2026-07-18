/**
 * File Upload Routes — Product Images & COA PDFs
 * POST /api/upload/product-image  → returns { url, key }
 * POST /api/upload/coa            → returns { url, key }
 * Both require admin session cookie.
 */
import type { Express, Request, Response } from "express";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";
import { invokeLLM } from "./_core/llm";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_COA_BYTES = 20 * 1024 * 1024;   // 20 MB

async function getAdminUser(req: Request) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || user.role !== "admin") return null;
    return user;
  } catch {
    return null;
  }
}

export function registerUploadRoutes(app: Express) {
  // ── Product image upload ──────────────────────────────────────────────────
  app.post("/api/upload/product-image", async (req: Request, res: Response) => {
    const admin = await getAdminUser(req);
    if (!admin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const contentType = req.headers["content-type"] ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_IMAGE_BYTES) {
        req.destroy(new Error("File too large"));
        return;
      }
      chunks.push(chunk);
    });

    req.on("error", (err) => {
      if (err.message === "File too large") {
        res.status(413).json({ error: "Image must be under 10MB" });
      } else {
        res.status(500).json({ error: "Upload failed" });
      }
    });

    req.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const key = `products/images/product_${Date.now()}.${ext}`;
        const result = await storagePut(key, buffer, contentType);
        res.json({ url: result.url, key: result.key });
      } catch (err) {
        console.error("Image upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    });
  });

  // ── COA PDF upload ────────────────────────────────────────────────────────
  app.post("/api/upload/coa", async (req: Request, res: Response) => {
    const admin = await getAdminUser(req);
    if (!admin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const contentType = req.headers["content-type"] ?? "application/pdf";

    const chunks: Buffer[] = [];
    let size = 0;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_COA_BYTES) {
        req.destroy(new Error("File too large"));
        return;
      }
      chunks.push(chunk);
    });

    req.on("error", (err) => {
      if (err.message === "File too large") {
        res.status(413).json({ error: "COA PDF must be under 20MB" });
      } else {
        res.status(500).json({ error: "Upload failed" });
      }
    });

    req.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const key = `products/coas/coa_${Date.now()}.pdf`;
        const result = await storagePut(key, buffer, "application/pdf");

        // ── Terpene extraction via LLM ──────────────────────────────────────
        let parsedTerpenes: Array<{ name: string; slug: string; percentage: string | null }> = [];
        try {
          // Upload PDF to get a public URL for the LLM to read
          const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL ?? "").replace(/\/+$/, "");
          const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
          let pdfPublicUrl: string | null = null;

          if (forgeBaseUrl && forgeKey) {
            // Get a signed URL for the stored PDF so the LLM can access it
            const presignRes = await fetch(`${forgeBaseUrl}/v1/storage/presign/get?path=${encodeURIComponent(result.key)}`, {
              headers: { Authorization: `Bearer ${forgeKey}` },
            });
            if (presignRes.ok) {
              const { url } = await presignRes.json() as { url: string };
              pdfPublicUrl = url;
            }
          }

          if (pdfPublicUrl) {
            const llmRes = await invokeLLM({
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "file_url",
                      file_url: { url: pdfPublicUrl, mime_type: "application/pdf" },
                    },
                    {
                      type: "text",
                      text: `Extract the complete terpene panel from this Certificate of Analysis (COA) PDF. Return ONLY a JSON array of terpene objects. Each object must have: "name" (exact terpene name as shown on the COA), "slug" (lowercase, hyphens instead of spaces/special chars, e.g. "beta-myrcene", "limonene", "alpha-pinene"), and "percentage" (the numeric percentage as a string, e.g. "0.3500", or null if not detected/below LOQ). Include ALL terpenes listed in the terpene panel, even those with ND (non-detected) results — set percentage to null for those. Return only the JSON array, no other text.`,
                    },
                  ],
                },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "terpene_panel",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      terpenes: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            slug: { type: "string" },
                            percentage: { type: ["string", "null"] },
                          },
                          required: ["name", "slug", "percentage"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["terpenes"],
                    additionalProperties: false,
                  },
                },
              },
            });

            const content = llmRes?.choices?.[0]?.message?.content;
            if (content) {
              const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
              parsedTerpenes = parsed.terpenes ?? [];
            }
          }
        } catch (parseErr) {
          console.error("COA terpene parse error (non-fatal):", parseErr);
          // Non-fatal — still return the uploaded URL even if parsing fails
        }

        res.json({ url: result.url, key: result.key, terpenes: parsedTerpenes });
      } catch (err) {
        console.error("COA upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    });
  });
}
