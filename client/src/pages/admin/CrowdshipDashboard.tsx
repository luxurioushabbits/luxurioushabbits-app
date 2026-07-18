/**
 * CrowdshipDashboard — Live API Crowdship integration
 * Tabs: Pending Orders | Live Catalog | My Products | Settings
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ExternalLink, CheckCircle2, Clock, Package, Settings,
  Loader2, RefreshCw, ShoppingCart, Zap, ChevronDown, ChevronUp,
  Globe, AlertCircle,
} from "lucide-react";

// ─── Expanded Product Variants (lazy-loads when a product row is expanded) ────
function ExpandedProductVariants({
  productId,
  productName,
  productDescription,
  productImages,
}: {
  productId: string;
  productName: string;
  productDescription: string;
  productImages: string[];
}) {
  const [importingVariant, setImportingVariant] = useState<string | null>(null);
  const [retailPrices, setRetailPrices] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});

  const { data: product, isLoading, error } = trpc.crowdship.getProduct.useQuery({ id: productId });

  const importMutation = trpc.crowdship.importProducts.useMutation({
    onSuccess: (result) => {
      if (result.created > 0) {
        toast.success(`${result.created} variant(s) added to your storefront!`);
      } else {
        toast.info("Already in your catalog.");
      }
      setImportingVariant(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setImportingVariant(null);
    },
  });

  const handleImportVariant = (
    variant: { id: string; sku: string; supplier_id: string; cost: number; srp: number; stock: number; image?: string }
  ) => {
    // ── Stock guard: never import 0-stock variants ──────────────────────────
    if (variant.stock <= 0) {
      toast.error(`Cannot import ${variant.sku} — it is out of stock on Crowdship.`);
      return;
    }
    const retailPrice = parseFloat(retailPrices[variant.id] ?? String(variant.srp > 0 ? variant.srp : variant.cost * 2));
    if (isNaN(retailPrice) || retailPrice <= 0) {
      toast.error("Please enter a valid retail price.");
      return;
    }
    const category = (selectedCategories[variant.id] ?? "accessory") as "flower" | "extract" | "edible" | "tincture" | "topical" | "accessory" | "other";
    setImportingVariant(variant.id);
    importMutation.mutate({
      items: [{
        variantId: variant.id,
        sku: variant.sku,
        supplierId: variant.supplier_id,
        name: productName,
        wholesalePrice: variant.cost,
        retailPrice,
        stock: variant.stock,
        category,
        description: productDescription?.replace(/<[^>]*>/g, "").slice(0, 2000) || undefined,
        imageUrl: variant.image ?? productImages?.[0] ?? undefined,
      }],
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", gap: "0.5rem", color: "oklch(0.55 0 0)" }}>
        <Loader2 size={16} className="animate-spin" />
        <span style={{ fontSize: "0.82rem" }}>Loading variants...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <p style={{ color: "oklch(0.55 0.1 20)", fontSize: "0.82rem", textAlign: "center", padding: "1rem" }}>
        Failed to load variants. Please try again.
      </p>
    );
  }

  const variants = product.variants ?? [];

  if (variants.length === 0) {
    return (
      <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.82rem", textAlign: "center", padding: "1rem" }}>
        No variants available for this product.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {variants.map(variant => (
        <div key={variant.id} style={{ background: "oklch(0.05 0 0)", border: "1px solid oklch(0.14 0 0)", borderRadius: "0.5rem", padding: "0.875rem 1rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Variant info */}
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                {Object.entries(variant.attributes ?? {}).map(([k, v]) => (
                  <Badge key={k} variant="outline" style={{ fontSize: "0.65rem", borderColor: "oklch(0.25 0 0)", color: "oklch(0.65 0 0)" }}>
                    {k}: {v}
                  </Badge>
                ))}
              </div>
              <p style={{ color: "oklch(0.5 0 0)", fontSize: "0.75rem", fontFamily: "monospace" }}>SKU: {variant.sku}</p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.35rem" }}>
                <span style={{ color: "oklch(0.55 0 0)", fontSize: "0.78rem" }}>Cost: <strong style={{ color: "oklch(0.7 0.12 145)" }}>${variant.cost.toFixed(2)}</strong></span>
                {variant.srp > 0 && <span style={{ color: "oklch(0.55 0 0)", fontSize: "0.78rem" }}>SRP: <strong style={{ color: "oklch(0.7 0 0)" }}>${variant.srp.toFixed(2)}</strong></span>}
                <span style={{ color: "oklch(0.55 0 0)", fontSize: "0.78rem" }}>Stock: <strong style={{ color: variant.stock > 0 ? "oklch(0.7 0.12 145)" : "oklch(0.65 0.15 20)" }}>{variant.stock}</strong></span>
              </div>
            </div>

            {/* Import controls */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <Label style={{ color: "oklch(0.55 0 0)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Retail $</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={retailPrices[variant.id] ?? (variant.srp > 0 ? variant.srp : variant.cost * 2).toFixed(2)}
                  onChange={e => setRetailPrices(prev => ({ ...prev, [variant.id]: e.target.value }))}
                  style={{ width: "90px", height: "32px", fontSize: "0.82rem", background: "oklch(0.08 0 0)", border: "1px solid oklch(0.22 0 0)", color: "oklch(0.85 0 0)", marginTop: "0.25rem" }}
                />
              </div>
              <div>
                <Label style={{ color: "oklch(0.55 0 0)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</Label>
                <Select
                  value={selectedCategories[variant.id] ?? "accessory"}
                  onValueChange={v => setSelectedCategories(prev => ({ ...prev, [variant.id]: v }))}
                >
                  <SelectTrigger style={{ width: "110px", height: "32px", fontSize: "0.78rem", background: "oklch(0.08 0 0)", border: "1px solid oklch(0.22 0 0)", color: "oklch(0.85 0 0)", marginTop: "0.25rem" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["flower", "extract", "edible", "tincture", "topical", "accessory", "other"].map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {variant.stock <= 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", marginTop: "0.25rem" }}>
                  <Button
                    size="sm"
                    disabled
                    style={{ background: "oklch(0.18 0.04 20)", color: "oklch(0.55 0.1 20)", border: "1px solid oklch(0.28 0.06 20)", gap: "0.4rem", height: "32px", cursor: "not-allowed", opacity: 0.7 }}
                  >
                    <ShoppingCart size={13} />
                    Out of Stock
                  </Button>
                  <span style={{ fontSize: "0.62rem", color: "oklch(0.5 0.08 20)", letterSpacing: "0.03em" }}>Cannot import — 0 stock</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  disabled={importingVariant === variant.id}
                  onClick={() => handleImportVariant(variant)}
                  style={{ background: "oklch(0.45 0.2 280)", color: "white", border: "none", gap: "0.4rem", height: "32px", marginTop: "0.25rem" }}
                >
                  {importingVariant === variant.id ? <Loader2 size={13} className="animate-spin" /> : <ShoppingCart size={13} />}
                  Import
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pending Orders Tab ───────────────────────────────────────────────────────
function PendingOrdersTab() {
  const { data: pendingOrders = [], isLoading, refetch } = trpc.crowdship.listPendingOrders.useQuery();
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const submitOrder = trpc.crowdship.submitOrder.useMutation({
    onSuccess: (data) => {
      toast.success(data.message ?? "Order submitted to Crowdship successfully!");
      if (data.monitoringUrl) {
        toast.info("Monitoring URL saved. Order is being processed by Crowdship.", { duration: 5000 });
      }
      refetch();
      setSubmittingId(null);
    },
    onError: (err) => {
      toast.error(`Submission failed: ${err.message}`);
      setSubmittingId(null);
    },
  });

  const markSubmitted = trpc.crowdship.markSubmitted.useMutation({
    onSuccess: () => {
      toast.success("Order marked as manually submitted.");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    );
  }

  const pending = pendingOrders.filter(o => !o.crowdshipSubmittedAt);
  const submitted = pendingOrders.filter(o => o.crowdshipSubmittedAt);

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div style={{ background: "oklch(0.1 0.04 145)", border: "1px solid oklch(0.25 0.08 145)", borderRadius: "0.75rem", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Zap size={16} style={{ color: "oklch(0.7 0.2 145)", flexShrink: 0 }} />
        <p style={{ color: "oklch(0.75 0.1 145)", fontSize: "0.85rem", lineHeight: 1.5 }}>
          <strong style={{ color: "oklch(0.85 0.12 145)" }}>Live API connected.</strong> Click <strong>Auto-Submit</strong> to send orders directly to Crowdship — no manual dashboard login needed.
        </p>
      </div>

      {/* Pending orders */}
      <div>
        <h3 style={{ color: "oklch(0.9 0 0)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          PENDING SUBMISSION ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "oklch(0.45 0 0)", border: "1px dashed oklch(0.2 0 0)", borderRadius: "0.75rem" }}>
            <CheckCircle2 size={32} style={{ margin: "0 auto 0.75rem", color: "oklch(0.55 0.15 145)" }} />
            <p>No pending Crowdship orders. You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(order => (
              <div key={order.id} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(0.18 0 0)", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "oklch(0.9 0 0)", fontWeight: 600 }}>{order.orderNumber}</span>
                      <Badge variant="outline" style={{ borderColor: "oklch(0.35 0.1 280)", color: "oklch(0.7 0.1 280)", fontSize: "0.7rem" }}>
                        Crowdship
                      </Badge>
                    </div>
                    <p style={{ color: "oklch(0.55 0 0)", fontSize: "0.8rem" }}>{order.customerName} · {order.customerEmail}</p>
                    <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.75rem" }}>
                      Ship to: {order.shippingAddress1}, {order.shippingCity}, {order.shippingState} {order.shippingZip}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "oklch(0.75 0.15 145)", fontWeight: 700, fontSize: "1.1rem" }}>${order.total}</div>
                    <div style={{ color: "oklch(0.45 0 0)", fontSize: "0.75rem" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginTop: "0.75rem", borderTop: "1px solid oklch(0.15 0 0)", paddingTop: "0.75rem" }}>
                  <p style={{ color: "oklch(0.5 0 0)", fontSize: "0.75rem", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Line items:</p>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "oklch(0.7 0 0)", padding: "0.2rem 0" }}>
                      <span>{item.productName} × {item.quantity}</span>
                      <span style={{ color: "oklch(0.5 0 0)", fontFamily: "monospace" }}>SKU: {item.crowdshipSku ?? "—"}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <Button
                    size="sm"
                    disabled={submittingId === order.id}
                    onClick={() => { setSubmittingId(order.id); submitOrder.mutate({ orderId: order.id }); }}
                    style={{ background: "oklch(0.45 0.2 145)", color: "white", border: "none", gap: "0.4rem" }}
                  >
                    {submittingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    Auto-Submit to Crowdship
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markSubmitted.mutate({ orderId: order.id, crowdshipOrderId: "manual" })}
                    style={{ borderColor: "oklch(0.3 0 0)", color: "oklch(0.55 0 0)", gap: "0.4rem" }}
                  >
                    <CheckCircle2 size={14} /> Mark Manual
                  </Button>
                  <a href="https://app.crowdship.io" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" style={{ borderColor: "oklch(0.3 0.08 280)", color: "oklch(0.6 0.1 280)", gap: "0.4rem" }}>
                      <ExternalLink size={14} /> Crowdship Dashboard
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submitted orders */}
      {submitted.length > 0 && (
        <div>
          <h3 style={{ color: "oklch(0.6 0 0)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em", fontSize: "1rem", marginBottom: "0.75rem" }}>
            RECENTLY SUBMITTED ({submitted.length})
          </h3>
          <div className="space-y-2">
            {submitted.map(order => (
              <div key={order.id} style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(0.14 0 0)", borderRadius: "0.5rem", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ color: "oklch(0.7 0 0)", fontWeight: 600, fontSize: "0.9rem" }}>{order.orderNumber}</span>
                  <span style={{ color: "oklch(0.45 0 0)", fontSize: "0.8rem", marginLeft: "0.75rem" }}>{order.customerName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={14} style={{ color: "oklch(0.65 0.15 145)" }} />
                  <span style={{ color: "oklch(0.55 0 0)", fontSize: "0.75rem" }}>
                    Submitted {order.crowdshipSubmittedAt ? new Date(order.crowdshipSubmittedAt).toLocaleDateString() : ""}
                  </span>
                  {order.crowdshipOrderId && order.crowdshipOrderId !== "manual" && order.crowdshipOrderId.startsWith("http") && (
                    <a href={order.crowdshipOrderId} target="_blank" rel="noopener noreferrer" style={{ color: "oklch(0.6 0.15 280)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <ExternalLink size={12} /> Track
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Live Catalog Tab ─────────────────────────────────────────────────────────
function LiveCatalogTab() {
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const LIMIT = 20;
  const { data, isLoading, refetch } = trpc.crowdship.browseCatalog.useQuery({ limit: LIMIT, offset: page * LIMIT });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    );
  }

  const products = data?.products ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ color: "oklch(0.9 0 0)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em", fontSize: "1.1rem" }}>
            LIVE CROWDSHIP CATALOG
          </h3>
          <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
            {total} products available · Set your retail price and click Import to add to your storefront
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} style={{ borderColor: "oklch(0.25 0 0)", color: "oklch(0.55 0 0)", gap: "0.4rem" }}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "oklch(0.45 0 0)", border: "1px dashed oklch(0.2 0 0)", borderRadius: "0.75rem" }}>
          <Globe size={32} style={{ margin: "0 auto 0.75rem", color: "oklch(0.4 0 0)" }} />
          <p>No products found in your Crowdship catalog.</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "oklch(0.4 0 0)" }}>Make sure you've connected suppliers in your Crowdship account.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(0.16 0 0)", borderRadius: "0.75rem", overflow: "hidden" }}>
              {/* Product header */}
              <div
                style={{ padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "center", cursor: "pointer" }}
                onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
              >
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "0.375rem", border: "1px solid oklch(0.2 0 0)", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "52px", height: "52px", background: "oklch(0.1 0 0)", borderRadius: "0.375rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Package size={20} style={{ color: "oklch(0.4 0 0)" }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "oklch(0.88 0 0)", fontWeight: 600, fontSize: "0.92rem", marginBottom: "0.2rem" }}>{product.name}</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <Badge variant="outline" style={{ fontSize: "0.65rem", borderColor: "oklch(0.25 0.05 280)", color: "oklch(0.6 0.08 280)" }}>
                      {product.product_type || "Product"}
                    </Badge>
                    <Badge variant="outline" style={{ fontSize: "0.65rem", borderColor: "oklch(0.25 0 0)", color: "oklch(0.5 0 0)" }}>
                      {product.variants?.length ?? 0} variant{(product.variants?.length ?? 0) !== 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="outline" style={{ fontSize: "0.65rem", borderColor: "oklch(0.25 0.05 145)", color: "oklch(0.6 0.08 145)" }}>
                      {product.connection_type}
                    </Badge>
                  </div>
                </div>
                <div style={{ color: "oklch(0.45 0 0)", flexShrink: 0 }}>
                  {expandedId === product.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Expanded variants — lazy-loaded when row is clicked */}
              {expandedId === product.id && (
                <div style={{ borderTop: "1px solid oklch(0.13 0 0)", padding: "1rem 1.25rem" }}>
                  <ExpandedProductVariants
                    productId={product.id}
                    productName={product.name}
                    productDescription={product.description ?? ""}
                    productImages={product.images ?? []}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginTop: "1.5rem" }}>
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ borderColor: "oklch(0.25 0 0)", color: "oklch(0.55 0 0)" }}>
            Previous
          </Button>
          <span style={{ color: "oklch(0.5 0 0)", fontSize: "0.82rem", display: "flex", alignItems: "center" }}>
            Page {page + 1} of {Math.ceil(total / LIMIT)}
          </span>
          <Button size="sm" variant="outline" disabled={(page + 1) * LIMIT >= total} onClick={() => setPage(p => p + 1)} style={{ borderColor: "oklch(0.25 0 0)", color: "oklch(0.55 0 0)" }}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── My Products Tab ──────────────────────────────────────────────────────────
function MyProductsTab() {
  const { data: products = [], isLoading } = trpc.crowdship.listProducts.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ color: "oklch(0.9 0 0)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em", fontSize: "1.1rem" }}>
          MY CROWDSHIP PRODUCTS ({products.length})
        </h3>
      </div>
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "oklch(0.45 0 0)", border: "1px dashed oklch(0.2 0 0)", borderRadius: "0.75rem" }}>
          <Package size={32} style={{ margin: "0 auto 0.75rem", color: "oklch(0.4 0 0)" }} />
          <p>No Crowdship products yet. Browse the Live Catalog tab to import products.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {products.map(p => (
            <div key={p.id} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(0.16 0 0)", borderRadius: "0.5rem", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "0.375rem", border: "1px solid oklch(0.2 0 0)" }} />
                ) : (
                  <div style={{ width: "40px", height: "40px", background: "oklch(0.1 0 0)", borderRadius: "0.375rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Package size={16} style={{ color: "oklch(0.4 0 0)" }} />
                  </div>
                )}
                <div>
                  <p style={{ color: "oklch(0.85 0 0)", fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</p>
                  <p style={{ color: "oklch(0.5 0 0)", fontSize: "0.75rem" }}>
                    ID #{p.id} · SKU: {p.crowdshipSku} · Cost: ${p.wholesalePrice}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "oklch(0.75 0.15 145)", fontWeight: 700 }}>${p.retailPrice}</p>
                <Badge variant="outline" style={{ fontSize: "0.65rem", borderColor: p.isActive ? "oklch(0.35 0.15 145)" : "oklch(0.3 0 0)", color: p.isActive ? "oklch(0.65 0.15 145)" : "oklch(0.45 0 0)" }}>
                  {p.isActive ? "Live" : "Hidden"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const { data: settings } = trpc.crowdship.getSettings.useQuery();

  return (
    <div style={{ maxWidth: "500px" }}>
      <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(0.16 0 0)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1rem" }}>
        <h4 style={{ color: "oklch(0.8 0 0)", fontWeight: 600, marginBottom: "0.75rem" }}>API Connection Status</h4>
        <div className="space-y-2">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
            <span style={{ color: "oklch(0.55 0 0)" }}>API Key (X-CROWDSHIP-KEY)</span>
            <span style={{ color: settings?.apiKeyConfigured ? "oklch(0.65 0.15 145)" : "oklch(0.65 0.15 20)" }}>
              {settings?.apiKeyConfigured ? `✓ Configured (${settings.apiKeyMasked})` : "✗ Not configured"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
            <span style={{ color: "oklch(0.55 0 0)" }}>API Secret (X-CROWDSHIP-SECRET)</span>
            <span style={{ color: settings?.secretKeyConfigured ? "oklch(0.65 0.15 145)" : "oklch(0.65 0.15 20)" }}>
              {settings?.secretKeyConfigured ? "✓ Configured" : "✗ Not configured"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
            <span style={{ color: "oklch(0.55 0 0)" }}>Integration Mode</span>
            <span style={{ color: settings?.isFullyConfigured ? "oklch(0.65 0.15 145)" : "oklch(0.65 0.1 280)" }}>
              {settings?.isFullyConfigured ? "Live API" : "Manual"}
            </span>
          </div>
        </div>
      </div>

      {settings?.isFullyConfigured ? (
        <div style={{ background: "oklch(0.08 0.03 145)", border: "1px solid oklch(0.22 0.06 145)", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
            <Zap size={16} style={{ color: "oklch(0.7 0.2 145)" }} />
            <h4 style={{ color: "oklch(0.8 0.12 145)", fontWeight: 600 }}>Live API Active</h4>
          </div>
          <p style={{ color: "oklch(0.6 0.08 145)", fontSize: "0.82rem", lineHeight: 1.7 }}>
            {settings.note}
          </p>
          <a href="https://app.crowdship.io" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "0.75rem", color: "oklch(0.7 0.2 280)", fontSize: "0.85rem", textDecoration: "underline" }}>
            <ExternalLink size={14} /> Open Crowdship Dashboard
          </a>
        </div>
      ) : (
        <div style={{ background: "oklch(0.08 0.02 20)", border: "1px solid oklch(0.22 0.05 20)", borderRadius: "0.75rem", padding: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
            <AlertCircle size={16} style={{ color: "oklch(0.7 0.2 20)" }} />
            <h4 style={{ color: "oklch(0.8 0.12 20)", fontWeight: 600 }}>API Not Configured</h4>
          </div>
          <p style={{ color: "oklch(0.6 0.08 20)", fontSize: "0.82rem", lineHeight: 1.7 }}>
            Add your Crowdship API key and secret in the project secrets to enable live catalog browsing and auto order submission.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TABS = [
  { id: "orders", label: "Pending Orders", icon: <Clock size={14} /> },
  { id: "catalog", label: "Live Catalog", icon: <Globe size={14} /> },
  { id: "products", label: "My Products", icon: <Package size={14} /> },
  { id: "settings", label: "Settings", icon: <Settings size={14} /> },
];

export default function CrowdshipDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <h2 style={{ color: "oklch(0.9 0 0)", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em", fontSize: "1.5rem" }}>
            CROWDSHIP DROPSHIP
          </h2>
          <Badge style={{ background: "oklch(0.2 0.08 145)", color: "oklch(0.75 0.15 145)", border: "1px solid oklch(0.3 0.1 145)", fontSize: "0.7rem" }}>
            LIVE API
          </Badge>
        </div>
        <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.82rem", marginTop: "0.25rem" }}>
          Browse your Crowdship catalog, import products, and auto-submit orders via the live API.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "1px solid oklch(0.15 0 0)", paddingBottom: "0" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.5rem 1rem",
              fontSize: "0.82rem",
              fontFamily: "'Inter', sans-serif",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid oklch(0.65 0.2 280)" : "2px solid transparent",
              color: activeTab === tab.id ? "oklch(0.85 0 0)" : "oklch(0.45 0 0)",
              cursor: "pointer",
              transition: "color 150ms",
              marginBottom: "-1px",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "orders" && <PendingOrdersTab />}
      {activeTab === "catalog" && <LiveCatalogTab />}
      {activeTab === "products" && <MyProductsTab />}
      {activeTab === "settings" && <SettingsTab />}
    </div>
  );
}
