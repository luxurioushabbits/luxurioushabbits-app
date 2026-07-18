/**
 * crowdshipApi.ts — Crowdship REST API Client
 * Base URL: https://api.crowdship.io/api/v1
 * Auth: X-CROWDSHIP-KEY + X-CROWDSHIP-SECRET headers
 */

const BASE = "https://api.crowdship.io/api/v1";

function getHeaders() {
  const apiKey = process.env.CROWDSHIP_API_KEY ?? "";
  const secretKey = process.env.CROWDSHIP_SECRET_KEY ?? "";
  return {
    "X-CROWDSHIP-KEY": apiKey,
    "X-CROWDSHIP-SECRET": secretKey,
    "Content-Type": "application/json",
  };
}

export function isCrowdshipConfigured(): boolean {
  return !!(process.env.CROWDSHIP_API_KEY && process.env.CROWDSHIP_SECRET_KEY);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CrowdshipShippingTerm {
  shippingType: string;
  availableRates: string;
  startDeliveryTime: number;
  finishDeliveryTime: number;
  customShippingTypeName?: string;
  flatRateCost: number;
}

export interface CrowdshipVariant {
  id: string;
  attributes: Record<string, string>;
  allow_backorders: boolean;
  connected: boolean;
  image?: string;
  sku: string;
  cost: number;
  srp: number;
  price_sync_option: string;
  price_sync_cost_markup: number;
  price: number;
  stock: number;
  supplier_id: string;
  track_inventory: boolean;
  shipping_terms: CrowdshipShippingTerm[];
  updated_at: string;
}

export interface CrowdshipProduct {
  id: string;
  name: string;
  description: string;
  brand: string;
  product_type: string;
  images: string[];
  tags: string[];
  attributes: Array<{ name: string; values: string[] }>;
  variants?: CrowdshipVariant[];
  connection_type: string;
  updatedAt?: string;
}

export interface CrowdshipProductsResponse {
  products: CrowdshipProduct[];
  pagination: { total: number; limit: number; offset: number };
}

export interface CrowdshipOrderLineItem {
  sku: string;
  quantity: string;
  price: string;
}

export interface CrowdshipOrderInput {
  order_name: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  shipping: {
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    method?: string;
    cost?: string;
  };
  line_items: CrowdshipOrderLineItem[];
  note?: string;
}

export interface CrowdshipOrderResponse {
  message: string;
  monitoringUrl?: string;
  details?: Array<{
    orderName: string;
    errors?: Array<{ message: string; path: string[]; code: string }>;
  }>;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch all products from the Crowdship catalog (paginates automatically).
 */
export async function fetchCrowdshipProducts(params?: {
  limit?: number;
  offset?: number;
  supplier_id?: string;
  updated_since?: string;
}): Promise<CrowdshipProductsResponse> {
  const url = new URL(`${BASE}/inventory/products`);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));
  if (params?.supplier_id) url.searchParams.set("supplier_id", params.supplier_id);
  if (params?.updated_since) url.searchParams.set("updated_since", params.updated_since);

  const res = await fetch(url.toString(), { headers: getHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Crowdship API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<CrowdshipProductsResponse>;
}

/**
 * Fetch a single product with its variants included.
 */
export async function fetchCrowdshipProduct(id: string): Promise<CrowdshipProduct | null> {
  const url = new URL(`${BASE}/inventory/products`);
  url.searchParams.set("id", id);

  const res = await fetch(url.toString(), { headers: getHeaders() });
  if (!res.ok) return null;
  const data = await res.json() as CrowdshipProductsResponse;
  return data.products?.[0] ?? null;
}

/**
 * Submit one or more orders to Crowdship for fulfillment.
 */
export async function submitCrowdshipOrders(
  orders: CrowdshipOrderInput[]
): Promise<CrowdshipOrderResponse> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ orders }),
  });

  const data = await res.json() as CrowdshipOrderResponse;

  // 202 = at least one order valid; 400 = all invalid
  if (res.status !== 202 && res.status !== 400) {
    throw new Error(`Crowdship order submission error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Check order status via monitoring URL returned from submitCrowdshipOrders.
 */
export async function checkCrowdshipOrderStatus(monitoringUrl: string): Promise<unknown> {
  const res = await fetch(monitoringUrl, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Crowdship status check error ${res.status}`);
  return res.json();
}

/**
 * Get purchase orders list.
 */
export async function fetchCrowdshipPurchaseOrders(): Promise<unknown> {
  const res = await fetch(`${BASE}/purchase-orders`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Crowdship PO error ${res.status}`);
  return res.json();
}
