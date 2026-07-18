/**
 * Google Analytics 4 — Event Tracking Hook
 * Wraps window.gtag with type safety. Safe to call before GA4 loads (no-ops if not ready).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

/** Track a page view (called automatically by useGA4PageTracking) */
export function trackPageView(path: string, title?: string) {
  gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
  });
}

/** Track add-to-cart event */
export function trackAddToCart(params: {
  productId: number | string;
  productName: string;
  price: number;
  quantity: number;
  category?: string;
}) {
  gtag("event", "add_to_cart", {
    currency: "USD",
    value: params.price * params.quantity,
    items: [{
      item_id: String(params.productId),
      item_name: params.productName,
      price: params.price,
      quantity: params.quantity,
      item_category: params.category ?? "hemp",
    }],
  });
}

/** Track remove-from-cart event */
export function trackRemoveFromCart(params: {
  productId: number | string;
  productName: string;
  price: number;
  quantity: number;
}) {
  gtag("event", "remove_from_cart", {
    currency: "USD",
    value: params.price * params.quantity,
    items: [{
      item_id: String(params.productId),
      item_name: params.productName,
      price: params.price,
      quantity: params.quantity,
    }],
  });
}

/** Track begin checkout */
export function trackBeginCheckout(params: {
  total: number;
  items: Array<{ productId: number | string; productName: string; price: number; quantity: number }>;
}) {
  gtag("event", "begin_checkout", {
    currency: "USD",
    value: params.total,
    items: params.items.map(i => ({
      item_id: String(i.productId),
      item_name: i.productName,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

/** Track purchase (fire after order confirmed) */
export function trackPurchase(params: {
  orderNumber: string;
  total: number;
  subtotal: number;
  items: Array<{ productId: number | string; productName: string; price: number; quantity: number }>;
  couponCode?: string;
}) {
  gtag("event", "purchase", {
    transaction_id: params.orderNumber,
    currency: "USD",
    value: params.total,
    subtotal: params.subtotal,
    coupon: params.couponCode ?? undefined,
    items: params.items.map(i => ({
      item_id: String(i.productId),
      item_name: i.productName,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

/** Track email capture (lead generation) */
export function trackEmailCapture() {
  gtag("event", "generate_lead", {
    currency: "USD",
    value: 5.0, // estimated lead value
  });
}

/** Track loyalty points redemption */
export function trackLoyaltyRedeem(points: number) {
  gtag("event", "spend_virtual_currency", {
    virtual_currency_name: "Loyalty Points",
    value: points,
  });
}

/** Track view item (product detail page) */
export function trackViewItem(params: {
  productId: number | string;
  productName: string;
  price: number;
  category?: string;
}) {
  gtag("event", "view_item", {
    currency: "USD",
    value: params.price,
    items: [{
      item_id: String(params.productId),
      item_name: params.productName,
      price: params.price,
      item_category: params.category ?? "hemp",
    }],
  });
}
