/**
 * IndexNow — Instant Search Engine Indexing
 *
 * IndexNow is an open protocol supported by Bing, Yandex, and other engines.
 * When you publish or update a URL, call notifyIndexNow() to ping search engines
 * immediately instead of waiting for their crawl schedule.
 *
 * Key file: /client/public/{INDEXNOW_KEY}.txt must exist and contain the key.
 * The key is auto-generated on first use and stored in env or a fallback constant.
 *
 * Docs: https://www.indexnow.org/documentation
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "luxurioushabbits-indexnow-2024";
const SITE_HOST = "luxurioushabbits.manus.space";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Notify IndexNow-compatible search engines about one or more URLs.
 * Silently swallows errors so it never breaks the main request flow.
 */
export async function notifyIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;

  // Normalize: ensure full URLs
  const fullUrls = urls.map(u =>
    u.startsWith("http") ? u : `https://${SITE_HOST}${u.startsWith("/") ? u : `/${u}`}`
  );

  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: fullUrls,
  };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] Submitted ${fullUrls.length} URL(s) — status ${res.status}`);
    } else {
      console.warn(`[IndexNow] Unexpected status ${res.status} for ${fullUrls.length} URL(s)`);
    }
  } catch (err) {
    // Non-fatal — never block the main flow
    console.warn("[IndexNow] Ping failed (non-fatal):", err);
  }
}

/**
 * Convenience: notify a single product URL by slug.
 */
export function notifyProductIndexed(slug: string): Promise<void> {
  return notifyIndexNow([`/products/${slug}`]);
}

/**
 * Convenience: notify a blog post URL by slug.
 */
export function notifyBlogIndexed(slug: string): Promise<void> {
  return notifyIndexNow([`/blog/${slug}`]);
}
