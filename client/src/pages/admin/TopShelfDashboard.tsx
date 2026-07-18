/**
 * TopShelf Admin Dashboard
 * Admin-only page for managing the TopShelf dropship integration.
 * Tabs: Catalog Sync | Product Mapping | Orders | Payments | Settings
 */
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  RefreshCw, Package, Link2, ShoppingBag, CreditCard, Settings,
  CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink, Search, Trash2
} from "lucide-react";

type Tab = "catalog" | "import" | "mapping" | "orders" | "payments" | "settings";

export default function TopShelfDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const [catalogData, setCatalogData] = useState<any[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [mappingSearch, setMappingSearch] = useState("");
  const [editingMapping, setEditingMapping] = useState<Record<number, { variationId: string; sku: string; productId: string; retailPrice: string }>>({});
  const [paymentOrderNumbers, setPaymentOrderNumbers] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  // Import state
  const [importSelections, setImportSelections] = useState<Record<number, { selected: boolean; retailPrice: string; category: string }>>({});
  const [importSearch, setImportSearch] = useState("");
  const [importResults, setImportResults] = useState<{ created: number; skipped: number } | null>(null);

  // Redirect non-admins
  if (!loading && (!user || user.role !== "admin")) {
    navigate("/");
    return null;
  }

  // ─── Queries ────────────────────────────────────────────────────────────────
  const mappingsQuery = trpc.topshelf.listMappings.useQuery(undefined, { enabled: activeTab === "mapping" });
  const ordersQuery = trpc.topshelf.listOrders.useQuery(
    { limit: 50, offset: 0, status: "all" },
    { enabled: activeTab === "orders" }
  );
  const settingsQuery = trpc.topshelf.getSettings.useQuery(undefined, { enabled: activeTab === "settings" });

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const hasSyncedRef = useRef(false);
  const [syncElapsed, setSyncElapsed] = useState(0);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncCatalog = trpc.topshelf.syncCatalog.useMutation({
    onMutate: () => {
      setSyncElapsed(0);
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      syncTimerRef.current = setInterval(() => setSyncElapsed(s => s + 1), 1000);
    },
    onSettled: () => {
      if (syncTimerRef.current) { clearInterval(syncTimerRef.current); syncTimerRef.current = null; }
    },
    onSuccess: (data) => {
      // Normalize: API may return array, object with products key, or wrapped object
      const raw = data.products;
      const normalized: any[] = Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object"
          ? Object.values(raw as Record<string, any>).filter(v => v && typeof v === "object")
          : [];
      setCatalogData(normalized);
      setLastSyncedAt(new Date());
      hasSyncedRef.current = true;
      toast.success(`Catalog synced — ${normalized.length} products loaded`, { description: "TopShelf catalog is up to date." });
    },
    onError: (err) => toast.error("Sync failed", { description: err.message }),
  });

  // Auto-sync catalog when the component mounts (i.e. when the TopShelf tab is opened)
  useEffect(() => {
    if (!hasSyncedRef.current && !syncCatalog.isPending) {
      syncCatalog.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMapping = trpc.topshelf.updateMapping.useMutation({
    onSuccess: () => {
      mappingsQuery.refetch();
      toast.success("Mapping saved");
    },
    onError: (err) => toast.error("Save failed", { description: err.message }),
  });

  const resubmitOrder = trpc.topshelf.resubmitOrder.useMutation({
    onSuccess: (data) => {
      ordersQuery.refetch();
      toast.success("Order resubmitted", { description: `TopShelf #${data.topshelfOrderNumber}` });
    },
    onError: (err) => toast.error("Resubmit failed", { description: err.message }),
  });

  const deleteOrder = trpc.topshelf.deleteOrder.useMutation({
    onSuccess: () => {
      ordersQuery.refetch();
      toast.success("Order removed from list");
    },
    onError: (err) => toast.error("Delete failed", { description: err.message }),
  });

  const importProducts = trpc.topshelf.importProducts.useMutation({
    onSuccess: (data) => {
      setImportResults({ created: data.created, skipped: data.skipped });
      toast.success(`Import complete: ${data.created} created, ${data.skipped} already existed`);
      // Clear selections for imported items
      setImportSelections({});
    },
    onError: (err) => toast.error("Import failed", { description: err.message }),
  });

  const recordPayment = trpc.topshelf.recordPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      setPaymentOrderNumbers("");
      setPaymentNote("");
      setSelectedOrders(new Set());
    },
    onError: (err) => toast.error("Payment failed", { description: err.message }),
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────
  // Auto-detect our store category from TopShelf's catalog category string
  const detectCategory = (tsCat: string | undefined): string => {
    if (!tsCat) return "flower";
    const c = tsCat.toLowerCase();
    if (c.includes("rosin") || c.includes("hash") || c.includes("concentrate") || c.includes("extract") || c.includes("wax") || c.includes("shatter") || c.includes("live resin") || c.includes("dab")) return "extract";
    if (c.includes("edible") || c.includes("gummy") || c.includes("chocolate") || c.includes("candy")) return "edible";
    if (c.includes("tincture") || c.includes("oil") || c.includes("drops")) return "tincture";
    if (c.includes("topical") || c.includes("cream") || c.includes("lotion") || c.includes("salve")) return "topical";
    if (c.includes("accessory") || c.includes("accessories") || c.includes("glass") || c.includes("pipe")) return "accessory";
    if (c.includes("flower") || c.includes("hemp") || c.includes("pre-roll") || c.includes("preroll")) return "flower";
    return "flower";
  };

  const filteredCatalog = catalogData.filter(p =>
    !catalogSearch || p.name?.toLowerCase().includes(catalogSearch.toLowerCase()) || p.sku?.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const filteredMappings = (mappingsQuery.data?.products ?? []).filter(p =>
    !mappingSearch || p.name.toLowerCase().includes(mappingSearch.toLowerCase())
  );

  const handleSaveMapping = (productId: number) => {
    const edit = editingMapping[productId];
    if (!edit) return;
    const variationId = parseInt(edit.variationId);
    const productIdNum = parseInt(edit.productId);
    const retailPriceNum = parseFloat(edit.retailPrice);
    updateMapping.mutate({
      productId,
      topshelfVariationId: isNaN(variationId) || !edit.variationId ? null : variationId,
      topshelfProductId: isNaN(productIdNum) || !edit.productId ? null : productIdNum,
      topshelfSku: edit.sku || null,
      topshelfRetailPrice: isNaN(retailPriceNum) || !edit.retailPrice ? null : retailPriceNum,
    });
    setEditingMapping(prev => { const n = { ...prev }; delete n[productId]; return n; });
  };

  const handleBulkPayment = () => {
    const numbers = Array.from(selectedOrders);
    if (numbers.length === 0) {
      toast.error("Select orders first");
      return;
    }
    recordPayment.mutate({ orderNumbers: numbers, note: paymentNote });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "catalog", label: "Catalog Sync", icon: <RefreshCw size={15} /> },
    { id: "import", label: "Import Products", icon: <Package size={15} /> },
    { id: "mapping", label: "Product Mapping", icon: <Link2 size={15} /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag size={15} /> },
    { id: "payments", label: "Payments", icon: <CreditCard size={15} /> },
    { id: "settings", label: "Settings", icon: <Settings size={15} /> },
  ];

  return (
    <div>
      {/* Header */}
      <div>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <Package size={24} style={{ color: "oklch(0.75 0.18 295)" }} />
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>
              TOPSHELF DROPSHIP
            </h1>
            <Badge style={{ background: "oklch(0.75 0.18 295 / 0.15)", color: "oklch(0.75 0.18 295)", border: "1px solid oklch(0.75 0.18 295 / 0.3)", fontSize: "0.65rem" }}>
              ADMIN ONLY
            </Badge>
          </div>
          <p style={{ color: "oklch(0.50 0 0)", fontSize: "0.875rem" }}>
            Manage your TopShelf NC dropship integration — sync catalog, map products, track orders, and record payments.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "1px solid oklch(1 0 0 / 8%)", paddingBottom: "0" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.6rem 1rem",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.8rem", fontFamily: "'Inter', sans-serif",
                color: activeTab === tab.id ? "oklch(0.75 0.18 295)" : "oklch(0.50 0 0)",
                borderBottom: activeTab === tab.id ? "2px solid oklch(0.75 0.18 295)" : "2px solid transparent",
                marginBottom: "-1px", transition: "color 0.15s",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── CATALOG SYNC TAB ── */}
        {activeTab === "catalog" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ color: "oklch(0.96 0 0)", fontSize: "1rem", fontWeight: 600 }}>TopShelf Catalog</h2>
                <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.8rem" }}>
                  {syncCatalog.isPending
                    ? "Auto-syncing catalog from TopShelf NC..."
                    : lastSyncedAt
                      ? `Last synced: ${lastSyncedAt.toLocaleTimeString()} — ${catalogData.length} products`
                      : "Auto-syncing on tab open. Click Refresh to force a new sync."}
                </p>
              </div>
              <Button
                onClick={() => syncCatalog.mutate()}
                disabled={syncCatalog.isPending}
                style={{ background: "oklch(0.75 0.18 295)", color: "white", fontSize: "0.8rem" }}
              >
                {syncCatalog.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} style={{ marginRight: "0.4rem" }} />}
                {syncCatalog.isPending ? "Syncing..." : "Refresh"}
              </Button>
            </div>

            {/* Loading state */}
            {syncCatalog.isPending && (
              <div style={{ padding: "2rem", color: "oklch(0.55 0 0)", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <Loader2 size={20} className="animate-spin" style={{ color: "oklch(0.75 0.18 295)" }} />
                  <span>Fetching catalog from TopShelf NC — please wait, this can take up to 60 seconds...</span>
                </div>
                <div style={{ background: "oklch(1 0 0 / 5%)", borderRadius: "4px", height: "4px", overflow: "hidden", maxWidth: "300px" }}>
                  <div style={{
                    height: "100%",
                    background: "oklch(0.75 0.18 295)",
                    width: `${Math.min((syncElapsed / 60) * 100, 95)}%`,
                    transition: "width 1s linear",
                  }} />
                </div>
                <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "oklch(0.40 0 0)" }}>
                  {syncElapsed}s elapsed — fetching WooCommerce product data...
                </div>
              </div>
            )}

            {catalogData.length > 0 && (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <Input
                    placeholder="Search by name or SKU..."
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 10%)", color: "oklch(0.96 0 0)", maxWidth: "320px" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {filteredCatalog.map((product: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "0.5rem" }}>
                      {product.image && (
                        <img src={product.image} alt={product.parent_name || product.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", flexShrink: 0, background: "oklch(0.10 0 0)" }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "oklch(0.96 0 0)", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.15rem" }}>
                          {product.parent_name || product.name}
                        </div>
                        <div style={{ color: "oklch(0.55 0 0)", fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                          {product.variation_name && <span style={{ color: "oklch(0.75 0.18 295)", marginRight: "0.75rem" }}>{product.variation_name}</span>}
                          SKU: {product.sku || "—"}
                        </div>
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.7rem", color: "oklch(0.45 0 0)", flexWrap: "wrap" }}>
                          <span>Wholesale: <strong style={{ color: "oklch(0.75 0.18 295)" }}>${product.wholesale_price}</strong></span>
                          {product.category && <span>{product.category}</span>}
                          {product.strain_type && <span>{product.strain_type}</span>}
                        </div>
                      </div>
                      <Badge style={{
                        background: product.stock_status === "instock" ? "oklch(0.55 0.18 145 / 0.15)" : "oklch(0.55 0.18 25 / 0.15)",
                        color: product.stock_status === "instock" ? "oklch(0.70 0.18 145)" : "oklch(0.70 0.18 25)",
                        fontSize: "0.65rem", flexShrink: 0,
                      }}>
                        {product.stock_status ?? "unknown"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}

            {catalogData.length === 0 && !syncCatalog.isPending && (
              <div style={{ textAlign: "center", padding: "4rem 2rem", color: "oklch(0.40 0 0)" }}>
                <Package size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p style={{ fontSize: "0.875rem" }}>No products found. Click "Refresh" to retry the catalog sync.</p>
              </div>
            )}
          </div>
        )}

        {/* ── IMPORT PRODUCTS TAB ── */}
        {activeTab === "import" && (() => {
          const CATEGORIES = ["flower", "extracts", "accessories", "edibles", "other"];
          const filteredImport = catalogData.filter(p =>
            !importSearch || p.name?.toLowerCase().includes(importSearch.toLowerCase()) || p.sku?.toLowerCase().includes(importSearch.toLowerCase())
          );
          const selectedCount = Object.values(importSelections).filter(s => s.selected).length;

          const toggleSelect = (idx: number, product: any) => {
            setImportSelections(prev => {
              const existing = prev[idx];
              if (existing) {
                return { ...prev, [idx]: { ...existing, selected: !existing.selected } };
              }
              return {
                ...prev,
                [idx]: {
                  selected: true,
                  retailPrice: product.retail_price?.toString() ?? "",
                  category: detectCategory(product.category),
                },
              };
            });
          };

          const handleImport = () => {
            const items = filteredImport
              .map((p: any, i: number) => ({ product: p, sel: importSelections[i] }))
              .filter(({ sel }) => sel?.selected)
              .map(({ product, sel }) => ({
                name: product.name,
                sku: product.sku ?? "",
                topshelfVariationId: product.variation_id,
                topshelfProductId: product.product_id ?? undefined,
                wholesalePrice: parseFloat(product.wholesale_price ?? "0"),
                retailPrice: parseFloat(sel!.retailPrice) || parseFloat(product.wc_retail_price ?? product.retail_price ?? "0") || parseFloat(product.wholesale_price ?? "0") * 1.4,
                topshelfRetailPrice: product.wc_retail_price ? parseFloat(product.wc_retail_price) : undefined,
                category: sel!.category,
                stockStatus: product.stock_status ?? "instock",
                imageUrl: product.image ?? undefined,
              }));
            if (!items.length) { toast.error("Select at least one product"); return; }
            importProducts.mutate({ items: items.map(it => ({ ...it, variationId: it.topshelfVariationId, productId: it.topshelfProductId, topshelfRetailPrice: it.topshelfRetailPrice, category: (it.category === 'extracts' ? 'extract' : it.category === 'accessories' ? 'accessory' : it.category === 'edibles' ? 'edible' : it.category) as 'flower' | 'extract' | 'edible' | 'tincture' | 'topical' | 'accessory' | 'other' })) });
          };

          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h2 style={{ color: "oklch(0.96 0 0)", fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Import Products</h2>
                  <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.8rem" }}>
                    Select TopShelf catalog items to create as store products. First sync the catalog on the Catalog Sync tab.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {selectedCount > 0 && (
                    <span style={{ fontSize: "0.75rem", color: "oklch(0.75 0.18 295)" }}>{selectedCount} selected</span>
                  )}
                  <Button
                    onClick={handleImport}
                    disabled={importProducts.isPending || selectedCount === 0}
                    style={{ background: "oklch(0.75 0.18 295)", color: "white", fontSize: "0.8rem" }}
                  >
                    {importProducts.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Package size={14} style={{ marginRight: "0.4rem" }} />}
                    Import Selected
                  </Button>
                </div>
              </div>

              {importResults && (
                <div style={{ background: "oklch(0.55 0.18 145 / 0.10)", border: "1px solid oklch(0.55 0.18 145 / 0.25)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "oklch(0.70 0.18 145)" }}>
                  ✓ Last import: {importResults.created} products created, {importResults.skipped} already existed
                </div>
              )}

              {catalogData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", color: "oklch(0.40 0 0)" }}>
                  <Package size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                  <p style={{ fontSize: "0.875rem" }}>Go to "Catalog Sync" tab first to load the TopShelf catalog</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
                    <Input
                      placeholder="Search catalog..."
                      value={importSearch}
                      onChange={e => setImportSearch(e.target.value)}
                      style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 10%)", color: "oklch(0.96 0 0)", maxWidth: "280px" }}
                    />
                    <button
                      onClick={() => {
                        const allSelected = filteredImport.every((_: any, i: number) => importSelections[i]?.selected);
                        if (allSelected) {
                          setImportSelections({});
                        } else {
                          const next: typeof importSelections = {};
                          filteredImport.forEach((p: any, i: number) => {
                            next[i] = importSelections[i] ?? { selected: true, retailPrice: p.retail_price?.toString() ?? "", category: detectCategory(p.category) };
                            next[i].selected = true;
                          });
                          setImportSelections(next);
                        }
                      }}
                      style={{ fontSize: "0.75rem", color: "oklch(0.60 0 0)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.5rem" }}
                    >
                      {filteredImport.every((_: any, i: number) => importSelections[i]?.selected) ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {filteredImport.map((product: any, i: number) => {
                      const sel = importSelections[i];
                      const isSelected = sel?.selected ?? false;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex", alignItems: "center", gap: "1rem",
                            padding: "0.875rem 1rem",
                            background: isSelected ? "oklch(0.75 0.18 295 / 0.06)" : "oklch(0.07 0 0)",
                            border: `1px solid ${isSelected ? "oklch(0.75 0.18 295 / 0.30)" : "oklch(1 0 0 / 8%)"}`,
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            transition: "all 150ms ease",
                          }}
                          onClick={() => toggleSelect(i, product)}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: "18px", height: "18px", flexShrink: 0,
                            borderRadius: "4px",
                            border: `2px solid ${isSelected ? "oklch(0.75 0.18 295)" : "oklch(0.25 0 0)"}`,
                            background: isSelected ? "oklch(0.75 0.18 295)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSelected && <CheckCircle size={12} style={{ color: "white" }} />}
                          </div>

                          {/* Product image */}
                          {product.image && (
                            <img src={product.image} alt={product.parent_name || product.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "5px", flexShrink: 0, background: "oklch(0.10 0 0)" }} />
                          )}

                          {/* Product info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: "oklch(0.90 0 0)", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                              {product.parent_name || product.name}
                              {product.variation_name && <span style={{ color: "oklch(0.75 0.18 295)", fontWeight: 400, marginLeft: "0.5rem", fontSize: "0.8rem" }}>{product.variation_name}</span>}
                            </div>
                            <div style={{ display: "flex", gap: "1rem", fontSize: "0.7rem", color: "oklch(0.45 0 0)", flexWrap: "wrap" }}>
                              <span>SKU: {product.sku || "—"}</span>
                              <span>Wholesale: <strong style={{ color: "oklch(0.75 0.18 295)" }}>${product.wholesale_price}</strong></span>
                              {product.category && <span>{product.category}</span>}
                              <Badge style={{
                                background: product.stock_status === "instock" ? "oklch(0.55 0.18 145 / 0.15)" : "oklch(0.55 0.18 25 / 0.15)",
                                color: product.stock_status === "instock" ? "oklch(0.70 0.18 145)" : "oklch(0.70 0.18 25)",
                                fontSize: "0.6rem", padding: "0 0.4rem",
                              }}>{product.stock_status ?? "unknown"}</Badge>
                            </div>
                          </div>

                          {/* Controls (only when selected) */}
                          {isSelected && (
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                              <div>
                                <div style={{ fontSize: "0.6rem", color: "oklch(0.40 0 0)", marginBottom: "0.2rem" }}>Retail Price ($)</div>
                                <Input
                                  type="number"
                                  value={sel?.retailPrice ?? product.retail_price ?? ""}
                                  onChange={e => setImportSelections(prev => ({ ...prev, [i]: { ...prev[i], retailPrice: e.target.value } }))}
                                  placeholder={product.retail_price ?? "0.00"}
                                  style={{ width: "90px", background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 12%)", color: "oklch(0.96 0 0)", fontSize: "0.8rem", height: "32px" }}
                                />
                              </div>
                              <div>
                                <div style={{ fontSize: "0.6rem", color: "oklch(0.40 0 0)", marginBottom: "0.2rem" }}>Category</div>
                                <select
                                  value={sel?.category ?? "flower"}
                                  onChange={e => setImportSelections(prev => ({ ...prev, [i]: { ...prev[i], category: e.target.value } }))}
                                  style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 12%)", color: "oklch(0.80 0 0)", fontSize: "0.75rem", borderRadius: "6px", padding: "0.2rem 0.4rem", height: "32px" }}
                                >
                                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* ── PRODUCT MAPPING TAB ── */}
        {activeTab === "mapping" && (
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ color: "oklch(0.96 0 0)", fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Product Mapping</h2>
              <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.8rem" }}>
                Map your store products to TopShelf variation IDs so orders are automatically forwarded for fulfillment.
              </p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <Input
                placeholder="Search products..."
                value={mappingSearch}
                onChange={e => setMappingSearch(e.target.value)}
                style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 10%)", color: "oklch(0.96 0 0)", maxWidth: "320px" }}
              />
            </div>

            {mappingsQuery.isLoading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "oklch(0.40 0 0)" }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {filteredMappings.map(product => {
                  const isEditing = product.id in editingMapping;
                  const edit = editingMapping[product.id] ?? {
                    variationId: product.topshelfVariationId?.toString() ?? "",
                    sku: product.sku ?? "",
                  };
                  const isMapped = product.topshelfVariationId != null;

                  return (
                    <div key={product.id} style={{
                      display: "flex", alignItems: "center", gap: "1rem",
                      padding: "0.875rem 1rem",
                      background: "oklch(0.07 0 0)",
                      border: `1px solid ${isMapped ? "oklch(0.55 0.18 145 / 0.25)" : "oklch(1 0 0 / 8%)"}`,
                      borderRadius: "0.5rem",
                    }}>
                      {/* Status icon */}
                      {isMapped
                        ? <CheckCircle size={16} style={{ color: "oklch(0.70 0.18 145)", flexShrink: 0 }} />
                        : <XCircle size={16} style={{ color: "oklch(0.40 0 0)", flexShrink: 0 }} />
                      }

                      {/* Product info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "oklch(0.96 0 0)", fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {product.name}
                        </p>
                        <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.75rem" }}>
                          {product.category} · ${product.retailPrice}
                        </p>
                      </div>

                      {/* Mapping fields */}
                      {isEditing ? (
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontSize: "0.6rem", color: "oklch(0.40 0 0)", marginBottom: "0.2rem" }}>Variation ID</div>
                            <Input
                              placeholder="e.g. 1451"
                              value={edit.variationId}
                              onChange={e => setEditingMapping(prev => ({ ...prev, [product.id]: { ...edit, variationId: e.target.value } }))}
                              style={{ width: "100px", background: "oklch(0.10 0 0)", border: "1px solid oklch(0.75 0.18 295 / 0.4)", color: "oklch(0.96 0 0)", fontSize: "0.8rem", padding: "0.3rem 0.5rem" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.6rem", color: "oklch(0.40 0 0)", marginBottom: "0.2rem" }}>Product ID</div>
                            <Input
                              placeholder="e.g. 1450"
                              value={edit.productId}
                              onChange={e => setEditingMapping(prev => ({ ...prev, [product.id]: { ...edit, productId: e.target.value } }))}
                              style={{ width: "100px", background: "oklch(0.10 0 0)", border: "1px solid oklch(0.75 0.18 295 / 0.4)", color: "oklch(0.96 0 0)", fontSize: "0.8rem", padding: "0.3rem 0.5rem" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.6rem", color: "oklch(0.40 0 0)", marginBottom: "0.2rem" }}>SKU</div>
                            <Input
                              placeholder="SKU"
                              value={edit.sku}
                              onChange={e => setEditingMapping(prev => ({ ...prev, [product.id]: { ...edit, sku: e.target.value } }))}
                              style={{ width: "110px", background: "oklch(0.10 0 0)", border: "1px solid oklch(0.75 0.18 295 / 0.4)", color: "oklch(0.96 0 0)", fontSize: "0.8rem", padding: "0.3rem 0.5rem" }}
                            />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.6rem", color: "oklch(0.40 0 0)", marginBottom: "0.2rem" }}>TS Retail Price ($)</div>
                            <Input
                              type="number"
                              placeholder="e.g. 1800"
                              value={edit.retailPrice}
                              onChange={e => setEditingMapping(prev => ({ ...prev, [product.id]: { ...edit, retailPrice: e.target.value } }))}
                              style={{ width: "110px", background: "oklch(0.10 0 0)", border: "1px solid oklch(0.75 0.18 295 / 0.4)", color: "oklch(0.96 0 0)", fontSize: "0.8rem", padding: "0.3rem 0.5rem" }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "flex-end", paddingBottom: "0.1rem" }}>
                            <Button size="sm" onClick={() => handleSaveMapping(product.id)} disabled={updateMapping.isPending}
                              style={{ background: "oklch(0.75 0.18 295)", color: "white", fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingMapping(prev => { const n = { ...prev }; delete n[product.id]; return n; })}
                              style={{ color: "oklch(0.50 0 0)", fontSize: "0.75rem" }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                          {isMapped && (
                            <span style={{ color: "oklch(0.55 0 0)", fontSize: "0.75rem" }}>
                              Var: {product.topshelfVariationId}{product.topshelfProductId ? ` · Prod: ${product.topshelfProductId}` : ""}{product.topshelfRetailPrice ? ` · $${product.topshelfRetailPrice}` : ""}{product.sku ? ` · ${product.sku}` : ""}
                            </span>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setEditingMapping(prev => ({ ...prev, [product.id]: { variationId: product.topshelfVariationId?.toString() ?? "", sku: product.sku ?? "", productId: product.topshelfProductId?.toString() ?? "", retailPrice: product.topshelfRetailPrice?.toString() ?? "" } }))}
                            style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", borderColor: "oklch(1 0 0 / 15%)", color: "oklch(0.70 0 0)" }}>
                            {isMapped ? "Edit" : "Map"}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ color: "oklch(0.96 0 0)", fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Order Submissions</h2>
                <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.8rem" }}>
                  Track which orders have been forwarded to TopShelf. Resubmit failed orders manually.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => ordersQuery.refetch()}
                style={{ fontSize: "0.75rem", borderColor: "oklch(1 0 0 / 15%)", color: "oklch(0.70 0 0)" }}>
                <RefreshCw size={13} style={{ marginRight: "0.3rem" }} /> Refresh
              </Button>
            </div>

            {ordersQuery.isLoading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "oklch(0.40 0 0)" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(ordersQuery.data?.orders ?? []).map(order => {
                  const submitted = order.topshelfOrderNumber != null;
                  const hasError = order.topshelfError != null;
                  return (
                    <div key={order.id} style={{
                      display: "flex", alignItems: "center", gap: "1rem",
                      padding: "0.875rem 1rem",
                      background: "oklch(0.07 0 0)",
                      border: `1px solid ${submitted ? "oklch(0.55 0.18 145 / 0.2)" : hasError ? "oklch(0.55 0.18 25 / 0.3)" : "oklch(1 0 0 / 8%)"}`,
                      borderRadius: "0.5rem",
                    }}>
                      {submitted
                        ? <CheckCircle size={16} style={{ color: "oklch(0.70 0.18 145)", flexShrink: 0 }} />
                        : hasError
                          ? <XCircle size={16} style={{ color: "oklch(0.70 0.18 25)", flexShrink: 0 }} />
                          : <AlertCircle size={16} style={{ color: "oklch(0.55 0 0)", flexShrink: 0 }} />
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                          <span style={{ color: "oklch(0.96 0 0)", fontSize: "0.875rem", fontWeight: 500 }}>{order.orderNumber}</span>
                          <span style={{ color: "oklch(0.50 0 0)", fontSize: "0.75rem" }}>{order.customerName}</span>
                          <span style={{ color: "oklch(0.50 0 0)", fontSize: "0.75rem" }}>${order.total}</span>
                        </div>
                        {submitted && (
                          <p style={{ color: "oklch(0.55 0 0)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                            TopShelf #{order.topshelfOrderNumber} · {order.topshelfSubmittedAt ? new Date(order.topshelfSubmittedAt).toLocaleDateString() : ""}
                          </p>
                        )}
                        {hasError && (
                          <p style={{ color: "oklch(0.65 0.18 25)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                            Error: {order.topshelfError}
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {/* Select for payment */}
                        {submitted && (
                          <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={selectedOrders.has(order.topshelfOrderNumber!)}
                              onChange={e => {
                                setSelectedOrders(prev => {
                                  const n = new Set(prev);
                                  if (e.target.checked) n.add(order.topshelfOrderNumber!);
                                  else n.delete(order.topshelfOrderNumber!);
                                  return n;
                                });
                              }}
                              style={{ accentColor: "oklch(0.75 0.18 295)" }}
                            />
                            <span style={{ color: "oklch(0.50 0 0)", fontSize: "0.7rem" }}>Pay</span>
                          </label>
                        )}
                        {(!submitted || hasError) && (
                          <Button size="sm" onClick={() => resubmitOrder.mutate({ orderId: order.id })}
                            disabled={resubmitOrder.isPending}
                            style={{ background: "oklch(0.75 0.18 295)", color: "white", fontSize: "0.7rem", padding: "0.25rem 0.6rem" }}>
                            {resubmitOrder.isPending ? <Loader2 size={12} className="animate-spin" /> : "Submit"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Remove order ${order.orderNumber} from this list?`)) {
                              deleteOrder.mutate({ orderId: order.id });
                            }
                          }}
                          disabled={deleteOrder.isPending}
                          style={{ borderColor: "oklch(0.55 0.18 25 / 0.4)", color: "oklch(0.65 0.18 25)", padding: "0.25rem 0.4rem" }}
                          title="Remove from list"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {(ordersQuery.data?.orders ?? []).length === 0 && (
                  <div style={{ textAlign: "center", padding: "3rem", color: "oklch(0.40 0 0)" }}>
                    <ShoppingBag size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                    <p style={{ fontSize: "0.875rem" }}>No orders yet</p>
                  </div>
                )}
              </div>
            )}

            {selectedOrders.size > 0 && (
              <div style={{ marginTop: "1.5rem", padding: "1rem", background: "oklch(0.08 0 0)", borderRadius: "0.5rem", border: "1px solid oklch(0.75 0.18 295 / 0.2)" }}>
                <p style={{ color: "oklch(0.80 0 0)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                  {selectedOrders.size} order{selectedOrders.size > 1 ? "s" : ""} selected for payment
                </p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Input
                    placeholder="Payment note (optional)"
                    value={paymentNote}
                    onChange={e => setPaymentNote(e.target.value)}
                    style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 10%)", color: "oklch(0.96 0 0)", fontSize: "0.8rem" }}
                  />
                  <Button onClick={handleBulkPayment} disabled={recordPayment.isPending}
                    style={{ background: "oklch(0.75 0.18 145)", color: "white", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {recordPayment.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <CreditCard size={14} style={{ marginRight: "0.4rem" }} />}
                    Record Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === "payments" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ color: "oklch(0.96 0 0)", fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Manual Payment Entry</h2>
              <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.8rem" }}>
                Enter TopShelf order numbers manually to record a batch payment.
              </p>
            </div>

            <Card style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", maxWidth: "600px" }}>
              <CardContent style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ color: "oklch(0.70 0 0)", fontSize: "0.8rem", display: "block", marginBottom: "0.4rem" }}>
                    TopShelf Order Numbers (one per line)
                  </label>
                  <textarea
                    value={paymentOrderNumbers}
                    onChange={e => setPaymentOrderNumbers(e.target.value)}
                    placeholder={"TSDM-001\nTSDM-002\nTSDM-003"}
                    rows={5}
                    style={{
                      width: "100%", background: "oklch(0.10 0 0)",
                      border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "0.375rem",
                      color: "oklch(0.96 0 0)", fontSize: "0.875rem",
                      padding: "0.6rem 0.75rem", fontFamily: "monospace",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ color: "oklch(0.70 0 0)", fontSize: "0.8rem", display: "block", marginBottom: "0.4rem" }}>
                    Payment Note (optional)
                  </label>
                  <Input
                    value={paymentNote}
                    onChange={e => setPaymentNote(e.target.value)}
                    placeholder="e.g. Wire transfer 2025-01-15"
                    style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 10%)", color: "oklch(0.96 0 0)" }}
                  />
                </div>
                <Button
                  onClick={() => {
                    const numbers = paymentOrderNumbers.split("\n").map(s => s.trim()).filter(Boolean);
                    if (numbers.length === 0) {
                      toast.error("Enter at least one order number");
                      return;
                    }
                    recordPayment.mutate({ orderNumbers: numbers, note: paymentNote });
                  }}
                  disabled={recordPayment.isPending}
                  style={{ background: "oklch(0.75 0.18 145)", color: "white", width: "100%" }}
                >
                  {recordPayment.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <CreditCard size={14} style={{ marginRight: "0.5rem" }} />}
                  Submit Payment to TopShelf
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ color: "oklch(0.96 0 0)", fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Integration Settings</h2>
              <p style={{ color: "oklch(0.45 0 0)", fontSize: "0.8rem" }}>
                TopShelf API credentials are managed via environment variables. Contact your developer to update them.
              </p>
            </div>

            {settingsQuery.isLoading ? (
              <Loader2 size={20} className="animate-spin" style={{ color: "oklch(0.40 0 0)" }} />
            ) : (
              <Card style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", maxWidth: "500px" }}>
                <CardContent style={{ padding: "1.5rem" }}>
                  {[
                    { label: "API Base URL", value: settingsQuery.data?.url },
                    { label: "Vendor ID", value: settingsQuery.data?.vendorId || "Not set" },
                    { label: "API Key", value: settingsQuery.data?.apiKeyConfigured ? settingsQuery.data.apiKeyMasked : "⚠ Not configured" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
                      <span style={{ color: "oklch(0.55 0 0)", fontSize: "0.8rem" }}>{row.label}</span>
                      <span style={{ color: settingsQuery.data?.apiKeyConfigured || row.label !== "API Key" ? "oklch(0.80 0 0)" : "oklch(0.70 0.18 25)", fontSize: "0.8rem", fontFamily: "monospace" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: "1rem", padding: "0.75rem", background: "oklch(0.10 0 0)", borderRadius: "0.375rem" }}>
                    <p style={{ color: "oklch(0.50 0 0)", fontSize: "0.75rem", lineHeight: 1.6 }}>
                      To configure: add <code style={{ color: "oklch(0.75 0.18 295)" }}>TOPSHELF_API_KEY</code>, <code style={{ color: "oklch(0.75 0.18 295)" }}>TOPSHELF_VENDOR_ID</code>, and optionally <code style={{ color: "oklch(0.75 0.18 295)" }}>TOPSHELF_URL</code> to your project secrets.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
