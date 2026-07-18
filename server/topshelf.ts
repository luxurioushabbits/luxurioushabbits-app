/**
 * TopShelf Dropship API Integration
 *
 * Mirrors the WordPress plugin (tsdm-vendor-connector) exactly:
 *   Base URL : https://topshelfnc.com/wp-json/tsdm/v1
 *   Auth     : X-TSDM-API-Key header
 *
 * Endpoints used:
 *   GET  /catalog  — fetch available products
 *   GET  /orders   — fetch pending orders
 *   POST /orders   — submit a new dropship order
 *   POST /pay      — record batch payment
 */

const TOPSHELF_BASE_URL = (process.env.TOPSHELF_URL ?? "https://topshelfnc.com").replace(/\/$/, "") + "/wp-json/tsdm/v1";
const TOPSHELF_WC_BASE_URL = (process.env.TOPSHELF_URL ?? "https://topshelfnc.com").replace(/\/$/, "") + "/wp-json/wc/v3";
const TOPSHELF_API_KEY  = process.env.TOPSHELF_API_KEY ?? "";
const TOPSHELF_VENDOR_ID = process.env.TOPSHELF_VENDOR_ID ?? "";
const TOPSHELF_COUPON   = process.env.TOPSHELF_COUPON ?? "austin50";
const TOPSHELF_WC_CK    = process.env.TOPSHELF_WC_CONSUMER_KEY ?? "";
const TOPSHELF_WC_CS    = process.env.TOPSHELF_WC_CONSUMER_SECRET ?? "";

function authHeaders(): Record<string, string> {
  return {
    "X-TSDM-API-Key": TOPSHELF_API_KEY,
    "Content-Type": "application/json",
  };
}

async function tsRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${TOPSHELF_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { message?: string }).message ?? `HTTP ${res.status}`;
    throw new Error(`[TopShelf] ${msg}`);
  }
  return body as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopShelfProduct {
  variation_id: number;
  product_id?: number;       // WooCommerce parent product ID (from WC REST API lookup)
  sku: string;
  name: string;
  wholesale_price: number;
  retail_price?: number;
  wc_retail_price?: number;  // TopShelf's own WC regular_price (from WC REST API, used for order line items)
  stock_status?: string;
  category?: string;
}

export interface TopShelfOrderItem {
  variation_id: number;  // TopShelf API expects 'variation_id', not 'topshelf_variation_id'
  sku: string;
  name: string;
  qty: number;
  wholesale_price: number;
  line_total: number;
}

export interface TopShelfShipping {
  name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface TopShelfOrderPayload {
  wc_order_id: string;       // Our internal order number (LH-XXXXXX)
  vendor_id?: string;
  coupon_code?: string;
  items: TopShelfOrderItem[];
  shipping: TopShelfShipping;
  customer_note?: string;
}

export interface TopShelfOrderResponse {
  tsdm_order_number: string;
  status?: string;
  message?: string;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * Fetch all WooCommerce products from TopShelf's store (with their variations).
 * Returns a map of variation_id → { product_id, regular_price }
 * so we can enrich catalog rows with the exact WC parent product ID and retail price.
 */
export async function fetchWCProductMap(): Promise<Map<number, { product_id: number; regular_price: number; coa_url?: string }>> {
  const auth = Buffer.from(`${TOPSHELF_WC_CK}:${TOPSHELF_WC_CS}`).toString("base64");
  const map = new Map<number, { product_id: number; regular_price: number; coa_url?: string }>();

  /** Extract the first PDF/COA URL from a WooCommerce product description */
  function extractCoaUrl(description: string): string | undefined {
    if (!description) return undefined;
    // Match any https URL ending in .pdf or containing 'coa' in the path
    const matches = description.match(/https?:\/\/[^\s"<>]+\.pdf(?:[^\s"<>]*)?/gi);
    return matches?.[0] ?? undefined;
  }

  try {
    // Fetch all variable products (per_page=100 should cover TopShelf's catalog)
    const res = await fetch(`${TOPSHELF_WC_BASE_URL}/products?type=variable&per_page=100&status=publish`, {
      headers: { "Authorization": `Basic ${auth}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return map;
    const wcProducts: any[] = await res.json();

    // For each variable product, fetch its variations
    for (const wcProduct of wcProducts) {
      // Extract COA URL from the parent product description
      const coaUrl = extractCoaUrl(wcProduct.description ?? "") ?? extractCoaUrl(wcProduct.short_description ?? "");

      const varRes = await fetch(`${TOPSHELF_WC_BASE_URL}/products/${wcProduct.id}/variations?per_page=100`, {
        headers: { "Authorization": `Basic ${auth}` },
        signal: AbortSignal.timeout(15_000),
      });
      if (!varRes.ok) continue;
      const variations: any[] = await varRes.json();
      for (const v of variations) {
        const price = parseFloat(v.regular_price ?? v.price ?? "0");
        if (v.id && price > 0) {
          map.set(v.id, { product_id: wcProduct.id, regular_price: price, coa_url: coaUrl });
        }
      }
    }
  } catch {
    // Non-fatal: if WC lookup fails, catalog still works without product_id/wc_retail_price
  }

  return map;
}

/** Fetch the full TopShelf product catalog */
export async function getTopShelfCatalog(): Promise<TopShelfProduct[]> {
  // API returns { vendor_id, coupon_code, products: [ { id, name, slug, image, category, strain_type, variations: [...] } ] }
  const raw = await tsRequest<any>("/catalog");

  // Handle both flat array (legacy) and nested object (current API)
  let productList: any[] = [];
  if (Array.isArray(raw)) {
    productList = raw;
  } else if (raw && Array.isArray(raw.products)) {
    productList = raw.products;
  } else if (raw && typeof raw === "object") {
    productList = Object.values(raw).filter((v: any) => Array.isArray(v)).flat() as any[];
  }

  // Fetch WooCommerce product map to enrich variations with parent product_id and retail price
  const wcMap = await fetchWCProductMap();

  // Flatten parent products + their variations into individual TopShelfProduct rows
  const flat: TopShelfProduct[] = [];
  for (const product of productList) {
    if (Array.isArray(product.variations) && product.variations.length > 0) {
      // Nested structure: each variation becomes its own row, inheriting parent name/category
      for (const v of product.variations) {
        const wcData = wcMap.get(v.variation_id);
        flat.push({
          variation_id: v.variation_id,
          product_id: wcData?.product_id,
          sku: v.sku ?? "",
          name: `${product.name} — ${v.name}`,
          wholesale_price: v.wholesale_price ?? 0,
          retail_price: v.retail_price,
          wc_retail_price: wcData?.regular_price,
          coa_url: wcData?.coa_url,
          stock_status: v.stock_status ?? "instock",
          category: product.category,
          // Extra fields for display
          parent_name: product.name,
          variation_name: v.name,
          image: product.image,
          strain_type: product.strain_type,
        } as TopShelfProduct & Record<string, any>);
      }
    } else if (product.variation_id) {
      // Already flat
      flat.push(product as TopShelfProduct);
    }
  }

  return flat;
}

/** Fetch pending orders from TopShelf */
export async function getTopShelfOrders(): Promise<unknown[]> {
  return tsRequest<unknown[]>("/orders");
}

/**
 * Submit a dropship order to TopShelf.
 * Returns the TopShelf order number on success.
 */
export async function submitTopShelfOrder(
  payload: TopShelfOrderPayload
): Promise<TopShelfOrderResponse> {
  const body = {
    ...payload,
    vendor_id: payload.vendor_id ?? TOPSHELF_VENDOR_ID,
    coupon_code: payload.coupon_code ?? TOPSHELF_COUPON,
  };
  return tsRequest<TopShelfOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Record batch payment for a list of TopShelf order numbers.
 */
export async function submitTopShelfPayment(
  orderNumbers: string[],
  note?: string
): Promise<{ success: boolean; message?: string }> {
  return tsRequest("/pay", {
    method: "POST",
    body: JSON.stringify({ order_numbers: orderNumbers, note: note ?? "" }),
  });
}

/**
 * Submit a dropship order to TopShelf as a REAL WooCommerce order.
 * This creates an order in WooCommerce Orders (not just the TSDM table),
 * so TopShelf staff see it in their normal order management workflow.
 */
export async function submitTopShelfWooOrder(params: {
  orderNumber: string;
  items: Array<{
    topshelfVariationId: number;
    topshelfProductId?: number;  // WooCommerce parent product ID — required for inventory deduction
    name: string;
    sku: string;
    quantity: number;
    topshelfRetailPrice: number;  // TopShelf's own retail price in dollars (before coupon)
  }>;
  shipping: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    zip: string;
  };
  customerNote?: string;
  customerEmail?: string;
}): Promise<{ wcOrderId: number; orderNumber: string; status: string }> {
  const auth = Buffer.from(`${TOPSHELF_WC_CK}:${TOPSHELF_WC_CS}`).toString("base64");

  const lineItems = params.items.map(i => ({
    product_id: i.topshelfProductId ?? undefined,
    variation_id: i.topshelfVariationId,
    quantity: i.quantity,
    // Use TopShelf's own retail price so inventory + coupon math is correct on their end
    subtotal: (i.topshelfRetailPrice * i.quantity).toFixed(2),
    total: (i.topshelfRetailPrice * i.quantity).toFixed(2),
  }));

  const payload = {
    status: "pending",  // payment pending — customer has not yet paid
    customer_note: `Luxurious Habbits Dropship Order: #${params.orderNumber}${params.customerNote ? ` — ${params.customerNote}` : ""}`,
    billing: {
      first_name: params.shipping.firstName,
      last_name: params.shipping.lastName,
      address_1: params.shipping.address1,
      address_2: params.shipping.address2 ?? "",
      city: params.shipping.city,
      state: params.shipping.state,
      postcode: params.shipping.zip,
      country: "US",
      email: params.customerEmail ?? "",
    },
    shipping: {
      first_name: params.shipping.firstName,
      last_name: params.shipping.lastName,
      address_1: params.shipping.address1,
      address_2: params.shipping.address2 ?? "",
      city: params.shipping.city,
      state: params.shipping.state,
      postcode: params.shipping.zip,
      country: "US",
    },
    line_items: lineItems,
    coupon_lines: TOPSHELF_COUPON ? [{ code: TOPSHELF_COUPON }] : [],
    meta_data: [
      { key: "_lh_order_number", value: params.orderNumber },
      { key: "_lh_vendor_id", value: TOPSHELF_VENDOR_ID },
    ],
  };

  const res = await fetch(`${TOPSHELF_WC_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({})) as any;
  if (!res.ok) {
    const msg = body?.message ?? `HTTP ${res.status}`;
    throw new Error(`[TopShelf WC] ${msg}`);
  }

  return {
    wcOrderId: body.id,
    orderNumber: body.number ?? String(body.id),
    status: body.status,
  };
}

/**
 * Build a TopShelf order payload from our internal order data.
 * Maps our product SKUs to TopShelf variation IDs using the topshelfVariationId field on products.
 */
export function buildTopShelfPayload(params: {
  orderNumber: string;
  items: Array<{
    topshelfVariationId: number | null;
    sku: string;
    name: string;
    quantity: number;
    wholesalePrice: number;
  }>;
  shipping: {
    name: string;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    zip: string;
  };
  customerNote?: string;
}): TopShelfOrderPayload | null {
  // Only include items that have a TopShelf variation ID mapped
  const tsItems: TopShelfOrderItem[] = params.items
    .filter(i => i.topshelfVariationId != null)
    .map(i => ({
      variation_id: i.topshelfVariationId!,  // API expects 'variation_id'
      sku: i.sku,
      name: i.name,
      qty: i.quantity,
      wholesale_price: i.wholesalePrice,
      line_total: Math.round(i.wholesalePrice * i.quantity * 100) / 100,
    }));

  if (tsItems.length === 0) return null; // No TopShelf products in this order

  return {
    wc_order_id: params.orderNumber,
    items: tsItems,
    shipping: {
      name: params.shipping.name,
      address_1: params.shipping.address1,
      address_2: params.shipping.address2 ?? undefined,
      city: params.shipping.city,
      state: params.shipping.state,
      postcode: params.shipping.zip,
      country: "US",
    },
    customer_note: params.customerNote ?? "",
  };
}
