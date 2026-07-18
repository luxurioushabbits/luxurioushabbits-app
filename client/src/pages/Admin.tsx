/**
 * Admin Panel — Luxurious Habbits
 * Curated product management, vendor management, order dashboard, subscription oversight
 * Protected: admin role only
 */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Package,
  Store,
  ShoppingBag,
  Repeat,
  Plus,
  Edit2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  Box,
  Trash2,
  Gift,
  ChevronDown,
  Bell,
  Mail,
  Star,
  Award,
  Sliders,
  MessageSquare,
  ShoppingCart,
  BadgeDollarSign,
  Heart,
  MessageCircle,
  Send,
  Download,
  UserPlus,
  Link2,
  RefreshCw,
  Leaf,
  Newspaper,
  MapPin,
  UserCircle,
  Globe,
  X,
  Megaphone,
} from "lucide-react";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import TopShelfDashboardInline from "@/pages/admin/TopShelfDashboard";
import CrowdshipDashboard from "@/pages/admin/CrowdshipDashboard";
import BlogEditorInline from "@/pages/admin/BlogEditor";
import AdminChatTab from "@/pages/AdminChatTab";
import AdminMessagesTab from "@/pages/AdminMessagesTab";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "oklch(0.07 0 0)",
      border: "1px solid oklch(1 0 0 / 8%)",
      borderRadius: "8px",
      padding: "1.5rem",
      display: "flex",
      gap: "1rem",
      alignItems: "flex-start",
    }}>
      <div style={{ color: "#bf5fff", marginTop: "2px" }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "oklch(0.96 0 0)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "0.25rem" }}>{label}</div>
        {sub && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", marginTop: "0.2rem" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "#22c55e",
    confirmed: "#22c55e",
    delivered: "#22c55e",
    shipped: "#3b82f6",
    processing: "#f59e0b",
    pending: "#f59e0b",
    pending_approval: "#f59e0b",
    paused: "#6b7280",
    cancelled: "#ef4444",
    refunded: "#ef4444",
  };
  const color = colors[status] ?? "#6b7280";
  return (
    <span style={{
      display: "inline-block",
      padding: "0.2rem 0.6rem",
      borderRadius: "4px",
      background: `${color}22`,
      color,
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.65rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: orderStats } = trpc.admin.orders.stats.useQuery();
  const { data: subStats } = trpc.admin.subscriptions.stats.useQuery();
  const { data: recentOrders } = trpc.admin.orders.list.useQuery({ limit: 5, offset: 0 });

  return (
    <div>
      <div className="admin-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<ShoppingBag size={20} />} label="Total Orders" value={orderStats?.totalOrders ?? 0} />
        <StatCard icon={<DollarSign size={20} />} label="Total Revenue" value={`$${(orderStats?.totalRevenue ?? 0).toFixed(2)}`} />
        <StatCard icon={<Clock size={20} />} label="Pending Orders" value={orderStats?.pendingOrders ?? 0} />
        <StatCard icon={<Repeat size={20} />} label="Active Subscriptions" value={subStats?.active ?? 0} sub={`${subStats?.pending ?? 0} pending approval`} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
          RECENT ORDERS
        </h3>
        {!recentOrders?.length ? (
          <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
            No orders yet. Products will appear here once customers start buying.
          </div>
        ) : (
          <div className="admin-table-wrap" style={{ border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "oklch(0.07 0 0)", borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                  {["Order #", "Customer", "Total", "Status", "Date"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={order.id} style={{ borderBottom: i < recentOrders.length - 1 ? "1px solid oklch(1 0 0 / 5%)" : "none" }}>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#bf5fff" }}>{order.orderNumber}</td>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.70 0 0)" }}>{order.customerName}</td>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.96 0 0)" }}>${order.total}</td>
                    <td style={{ padding: "0.75rem 1rem" }}><StatusBadge status={order.status} /></td>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "flower" | "extract" | "preroll" | "edible" | "tincture" | "topical" | "accessory" | "other">("all");
  const { data, refetch } = trpc.admin.products.list.useQuery({ search: search || undefined });
  const deleteMutation = trpc.admin.products.delete.useMutation({ onSuccess: () => refetch() });
  const updateCategory = trpc.admin.products.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Category updated"); },
    onError: () => toast.error("Failed to update category"),
  });
  const toggleActive = trpc.admin.products.toggleActive.useMutation({
    onSuccess: () => refetch(),
    onError: () => toast.error("Failed to update product status"),
  });

  const filtered = (data ?? []).filter(({ product }) => {
    if (statusFilter === "active" && !product.isActive) return false;
    if (statusFilter === "inactive" && product.isActive) return false;
    if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
    return true;
  });

  // Category counts from full data
  const catCounts = (data ?? []).reduce((acc, { product }) => {
    acc[product.category as string] = (acc[product.category as string] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.5rem 1rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", width: "220px", outline: "none" }}
          />
          {/* Status filter pills */}
          {(["all", "active", "inactive"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{ background: statusFilter === f ? "#bf5fff22" : "oklch(0.07 0 0)", border: `1px solid ${statusFilter === f ? "#bf5fff66" : "oklch(1 0 0 / 10%)"}`, borderRadius: "6px", padding: "0.4rem 0.85rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600, color: statusFilter === f ? "#bf5fff" : "oklch(0.55 0 0)", cursor: "pointer", textTransform: "capitalize" }}
            >
              {f === "all" ? `All (${data?.length ?? 0})` : f === "active" ? `Active (${data?.filter(d => d.product.isActive).length ?? 0})` : `Inactive (${data?.filter(d => !d.product.isActive).length ?? 0})`}
            </button>
          ))}
        </div>
        <Link href="/admin/products/new">
          <button className="btn-gold" style={{ fontSize: "0.75rem", padding: "0.5rem 1.25rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Plus size={14} /> Add Product</span>
          </button>
        </Link>
      </div>

      {/* Category filter tabs */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {(["all", "flower", "extract", "preroll", "edible", "tincture", "topical", "accessory", "other"] as const).map(cat => {
          const catColors: Record<string, string> = {
            flower: "#00e5a0", extract: "#bf5fff", preroll: "#f59e0b",
            edible: "#3b82f6", tincture: "#06b6d4", topical: "#ec4899",
            accessory: "#f97316", other: "oklch(0.50 0 0)", all: "oklch(0.70 0 0)",
          };
          const color = catColors[cat];
          const count = cat === "all" ? (data?.length ?? 0) : (catCounts[cat] ?? 0);
          const isActive = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                background: isActive ? `${color}22` : "oklch(0.07 0 0)",
                border: `1px solid ${isActive ? `${color}66` : "oklch(1 0 0 / 10%)"}`,
                borderRadius: "6px",
                padding: "0.35rem 0.8rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: isActive ? color : "oklch(0.50 0 0)",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 150ms ease",
                letterSpacing: "0.03em",
              }}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {!filtered.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          {data?.length ? "No products match this filter." : "No products yet. Import from TopShelf or add manually."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {filtered.map(({ product, vendor }) => (
            <div key={product.id} style={{ background: "oklch(0.07 0 0)", border: `1px solid ${product.isActive ? "oklch(0.55 0.18 145 / 0.15)" : "oklch(1 0 0 / 8%)"}`, borderRadius: "8px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", transition: "border-color 200ms ease" }}>
              {/* Thumbnail */}
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: "52px", height: "52px", objectFit: "cover", objectPosition: "top", borderRadius: "6px", flexShrink: 0, opacity: product.isActive ? 1 : 0.45 }} />
              ) : (
                <div style={{ width: "52px", height: "52px", background: "oklch(0.10 0 0)", borderRadius: "6px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: product.isActive ? 1 : 0.45 }}>
                  <Leaf size={20} style={{ color: "oklch(0.25 0 0)" }} />
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: "180px", opacity: product.isActive ? 1 : 0.6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.90 0 0)", fontWeight: 500 }}>{product.name}</div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.06em", color: "oklch(0.30 0 0)", background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "3px", padding: "0.1rem 0.35rem", flexShrink: 0 }}>#{product.id}</span>
                  {product.variationLabel && (
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", padding: "0.15rem 0.5rem", borderRadius: "4px", background: "#bf5fff22", color: "#bf5fff", border: "1px solid #bf5fff44", textTransform: "uppercase" }}>
                      {product.variationLabel}
                    </span>
                  )}
                  {product.parentProductId && (
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", letterSpacing: "0.05em" }}>
                      child of #{product.parentProductId}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)" }}>{vendor?.name ?? "No vendor"}</span>
                  <select
                    value={product.category}
                    onChange={e => updateCategory.mutate({ id: product.id, category: e.target.value as any })}
                    onClick={e => e.stopPropagation()}
                    style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 14%)", borderRadius: "4px", padding: "0.1rem 0.4rem", color: "oklch(0.70 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer", outline: "none" }}
                  >
                    {["flower","extract","preroll","edible","tincture","topical","accessory","other"].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                  {product.strainType && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>· {product.strainType}</span>}
                  {product.thcaPercent && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>· {product.thcaPercent}% THCA</span>}
                </div>
              </div>

              {/* Price */}
              <div style={{ textAlign: "right", flexShrink: 0, opacity: product.isActive ? 1 : 0.6 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#bf5fff" }}>${product.retailPrice}</div>
                {product.wholesalePrice && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)" }}>cost: ${product.wholesalePrice}</div>}
              </div>

              {/* Toggle switch */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
                <button
                  onClick={() => toggleActive.mutate({ id: product.id, isActive: !product.isActive })}
                  disabled={toggleActive.isPending}
                  title={product.isActive ? "Click to deactivate" : "Click to activate"}
                  style={{
                    width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
                    background: product.isActive ? "oklch(0.55 0.18 145)" : "oklch(0.20 0 0)",
                    position: "relative", transition: "background 200ms ease", flexShrink: 0,
                    opacity: toggleActive.isPending ? 0.6 : 1,
                  }}
                >
                  <div style={{
                    position: "absolute", top: "3px", width: "18px", height: "18px", borderRadius: "50%",
                    background: "#fff", transition: "left 200ms ease",
                    left: product.isActive ? "23px" : "3px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  }} />
                </button>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", letterSpacing: "0.08em", color: product.isActive ? "oklch(0.55 0.18 145)" : "oklch(0.35 0 0)", textTransform: "uppercase" }}>
                  {product.isActive ? "Live" : "Off"}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <Link href={`/admin/products/${product.id}/edit`}>
                  <button style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.35rem 0.6rem", cursor: "pointer", color: "oklch(0.60 0 0)", display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem" }}>
                    <Edit2 size={13} /> Edit
                  </button>
                </Link>
                <button
                  onClick={() => { if (confirm(`Permanently remove "${product.name}" from the catalog?`)) deleteMutation.mutate({ id: product.id }); }}
                  style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.35rem", cursor: "pointer", color: "#ef4444" }}
                  title="Delete product"
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vendors Tab ──────────────────────────────────────────────────────────────
function VendorsTab() {
  const { data, refetch } = trpc.admin.vendors.list.useQuery();
  const deleteMutation = trpc.admin.vendors.delete.useMutation({ onSuccess: () => refetch() });
  const updateMutation = trpc.admin.vendors.update.useMutation({ onSuccess: () => { refetch(); setEditingVendor(null); toast.success("Vendor updated."); } });
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [editHideVendor, setEditHideVendor] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);

  const openEdit = (v: any) => {
    setEditingVendor(v);
    setEditHideVendor(v.hideVendor ?? false);
    setEditIsActive(v.isActive ?? true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <Link href="/admin/vendors/new">
          <button className="btn-gold" style={{ fontSize: "0.75rem", padding: "0.5rem 1.25rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Plus size={14} /> Add Vendor</span>
          </button>
        </Link>
      </div>

      {!data?.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          No vendors yet. Add TopShelfNC as your first vendor.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {data.map(vendor => (
            <div key={vendor.id} style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}>
              {vendor.logoUrl && <img src={vendor.logoUrl} alt={vendor.name} style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "4px", flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.90 0 0)", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {vendor.name}
                  {vendor.hideVendor && (
                    <span style={{ background: "oklch(0.55 0.25 295 / 0.15)", border: "1px solid oklch(0.55 0.25 295 / 0.35)", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                      White-Label
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)", marginTop: "0.2rem" }}>
                  {vendor.integrationMethod} integration · {vendor.contactEmail ?? "no email set"} · {parseFloat(vendor.commissionRate ?? "0") * 100}% margin
                </div>
              </div>
              <StatusBadge status={vendor.isActive ? "active" : "cancelled"} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => openEdit(vendor)}
                  style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.35rem", cursor: "pointer", color: "oklch(0.60 0 0)" }}
                  title="Edit vendor"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Edit Dialog */}
      {editingVendor && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setEditingVendor(null)}>
          <div style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "12px", padding: "2rem", maxWidth: "480px", width: "100%" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em", color: "oklch(0.90 0 0)", marginBottom: "1.5rem" }}>Edit Vendor — {editingVendor.name}</div>

            {/* White-Label Toggle */}
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.85 0 0)", fontWeight: 600, marginBottom: "0.25rem" }}>White-Label Mode</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)", lineHeight: 1.5 }}>Hide vendor name on storefront. Customers see only "Luxurious Habbits" as the brand.</div>
                </div>
                <button
                  onClick={() => setEditHideVendor(v => !v)}
                  style={{ flexShrink: 0, width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", background: editHideVendor ? "#bf5fff" : "oklch(0.18 0 0)", position: "relative", transition: "background 200ms ease" }}
                >
                  <span style={{ position: "absolute", top: "3px", left: editHideVendor ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 200ms ease" }} />
                </button>
              </div>
            </div>

            {/* Active Toggle */}
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.85 0 0)", fontWeight: 600, marginBottom: "0.25rem" }}>Active</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.45 0 0)" }}>Inactive vendors cannot receive new orders.</div>
                </div>
                <button
                  onClick={() => setEditIsActive(v => !v)}
                  style={{ flexShrink: 0, width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer", background: editIsActive ? "#22c55e" : "oklch(0.18 0 0)", position: "relative", transition: "background 200ms ease" }}
                >
                  <span style={{ position: "absolute", top: "3px", left: editIsActive ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 200ms ease" }} />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setEditingVendor(null)} style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "6px", padding: "0.55rem 1.25rem", color: "oklch(0.55 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>Cancel</button>
              <button
                onClick={() => updateMutation.mutate({ id: editingVendor.id, hideVendor: editHideVendor, isActive: editIsActive })}
                disabled={updateMutation.isPending}
                style={{ background: "#bf5fff", border: "none", borderRadius: "6px", padding: "0.55rem 1.25rem", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", opacity: updateMutation.isPending ? 0.6 : 1 }}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: orders, refetch } = trpc.admin.orders.list.useQuery({
    limit: 100,
    offset: 0,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const updateStatus = trpc.admin.orders.updateStatus.useMutation({ onSuccess: () => refetch() });
  const updateAdminNotes = trpc.admin.orders.updateAdminNotes.useMutation({ onSuccess: () => refetch() });
  const trashOrder = trpc.admin.orders.trash.useMutation({ onSuccess: () => { refetch(); refetchTrashed(); } });
  const restoreOrder = trpc.admin.orders.restore.useMutation({ onSuccess: () => { refetch(); refetchTrashed(); } });
  const hardDeleteOrder = trpc.admin.orders.hardDelete.useMutation({ onSuccess: () => refetchTrashed() });
  const { data: trashedOrders, refetch: refetchTrashed } = trpc.admin.orders.listTrashed.useQuery();
  const [viewTrash, setViewTrash] = useState(false);
  const [confirmHardDelete, setConfirmHardDelete] = useState<number | null>(null);
  const [statusChangeId, setStatusChangeId] = useState<number | null>(null);
  const [shipId, setShipId] = useState<number | null>(null);
  const [trackingNum, setTrackingNum] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("UPS");
  const [notesId, setNotesId] = useState<number | null>(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState("");
  const [exportStatus, setExportStatus] = useState<"all" | "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded">("all");
  const [exporting, setExporting] = useState(false);
  const exportCsvQuery = trpc.orders.adminExportCsv.useQuery(
    { status: exportStatus },
    { enabled: false }
  );
  const utils = trpc.useUtils();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<"pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded">("confirmed");
  const confirmCrowdship = trpc.crowdship.submitOrder.useMutation({
    onSuccess: (res) => {
      toast.success(`Order sent to Crowdship successfully!`);
      refetch();
    },
    onError: (err) => toast.error(err.message ?? "Failed to send to Crowdship."),
  });

  const bulkUpdateStatus = trpc.admin.orders.bulkUpdateStatus.useMutation({
    onSuccess: (res) => {
      toast.success(`Updated ${res.updated} order${res.updated !== 1 ? "s" : ""} to "${bulkStatus}".`);
      setSelectedIds(new Set());
      refetch();
    },
    onError: (err) => toast.error(err.message ?? "Bulk update failed."),
  });

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const result = await utils.orders.adminExportCsv.fetch({ status: exportStatus });
      if (!result?.csv) { toast.error("No orders to export."); return; }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${exportStatus}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.count} order${result.count !== 1 ? "s" : ""} to CSV.`);
    } catch (err: any) {
      toast.error(err?.message ?? "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleMarkShipped = (orderId: number) => {
    updateStatus.mutate({
      id: orderId,
      status: "shipped",
      trackingNumber: trackingNum || undefined,
      trackingCarrier: trackingCarrier || undefined,
    }, {
      onSuccess: () => { setShipId(null); setTrackingNum(""); setTrackingCarrier("UPS"); },
    });
  };

  return (
    <div>
      {/* Trash / Active toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setViewTrash(false)}
          style={{ background: !viewTrash ? "#bf5fff" : "oklch(0.07 0 0)", border: "1px solid #bf5fff44", borderRadius: "6px", padding: "0.4rem 1rem", color: !viewTrash ? "#fff" : "oklch(0.55 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
        >
          Active Orders {orders ? `(${orders.length})` : ""}
        </button>
        <button
          onClick={() => setViewTrash(true)}
          style={{ background: viewTrash ? "#ef444422" : "oklch(0.07 0 0)", border: viewTrash ? "1px solid #ef444444" : "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.4rem 1rem", color: viewTrash ? "#ef4444" : "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
        >
          🗑 Trash {trashedOrders?.length ? `(${trashedOrders.length})` : ""}
        </button>
      </div>

      {/* ── TRASH VIEW ── */}
      {viewTrash && (
        <div>
          {!trashedOrders?.length ? (
            <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
              Trash is empty. Deleted orders will appear here and can be restored.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {trashedOrders.map((order) => (
                <div key={order.id} style={{ background: "oklch(0.06 0 0)", border: "1px solid #ef444422", borderRadius: "8px", overflow: "hidden", opacity: 0.85 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.25rem", flexWrap: "wrap" }}>
                    <div style={{ minWidth: "90px" }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", color: "#ef4444", letterSpacing: "0.05em" }}>{order.orderNumber}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)" }}>Deleted {order.deletedAt ? new Date(order.deletedAt).toLocaleDateString() : ""}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: "140px" }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.70 0 0)", fontWeight: 500 }}>{order.customerName}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>{order.customerEmail}</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "oklch(0.70 0 0)", letterSpacing: "0.05em", flexShrink: 0 }}>${order.total}</div>
                    {order.deletedBy && (
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", flexShrink: 0 }}>by {order.deletedBy}</div>
                    )}
                    <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                      <button
                        onClick={() => restoreOrder.mutate({ id: order.id })}
                        disabled={restoreOrder.isPending}
                        style={{ background: "#22c55e22", border: "1px solid #22c55e44", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "#22c55e", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600 }}
                      >
                        ↩ Restore
                      </button>
                      {confirmHardDelete === order.id ? (
                        <>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "#ef4444", alignSelf: "center" }}>Permanently delete?</span>
                          <button
                            onClick={() => { hardDeleteOrder.mutate({ id: order.id }); setConfirmHardDelete(null); }}
                            disabled={hardDeleteOrder.isPending}
                            style={{ background: "#ef4444", border: "none", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700 }}
                          >
                            Yes, Delete Forever
                          </button>
                          <button
                            onClick={() => setConfirmHardDelete(null)}
                            style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.3rem 0.6rem", cursor: "pointer", color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem" }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmHardDelete(order.id)}
                          style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "#ef4444", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600 }}
                        >
                          🗑 Delete Forever
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVE ORDERS VIEW ── */}
      {!viewTrash && (
      <div>
      {/* Search + Status filter toolbar */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        <form
          onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}
          style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: "240px" }}
        >
          <input
            placeholder="Search by order #, name, or email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(1 0 0 / 12%)",
              borderRadius: "6px",
              padding: "0.45rem 1rem",
              color: "oklch(0.80 0 0)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.78rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{ background: "#bf5fff22", border: "1px solid #bf5fff44", borderRadius: "6px", padding: "0.45rem 1rem", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
          >
            Search
          </button>
          {(searchQuery || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setSearchQuery(""); setStatusFilter("all"); }}
              style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.45rem 0.75rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer" }}
            >
              Clear
            </button>
          )}
        </form>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.45rem 0.75rem", color: "oklch(0.75 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", cursor: "pointer" }}
        >
          {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"].map(s => (
            <option key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {orders && (
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.40 0 0)", whiteSpace: "nowrap" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Export toolbar */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Export CSV:</span>
        <select
          value={exportStatus}
          onChange={e => setExportStatus(e.target.value as typeof exportStatus)}
          style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.4rem 0.75rem", color: "oklch(0.75 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer" }}
        >
          {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button
          onClick={handleExportCsv}
          disabled={exporting}
          style={{ background: "#00e5a022", border: "1px solid #00e5a044", borderRadius: "4px", padding: "0.4rem 1rem", color: "#00e5a0", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, cursor: exporting ? "not-allowed" : "pointer", opacity: exporting ? 0.6 : 1 }}
        >
          {exporting ? "Exporting..." : "⬇ Download CSV"}
        </button>
      </div>

      {/* Bulk action bar — appears when orders are selected */}
      {selectedIds.size > 0 && (
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", padding: "0.75rem 1rem", background: "#bf5fff15", border: "1px solid #bf5fff33", borderRadius: "8px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#bf5fff", fontWeight: 700 }}>{selectedIds.size} selected</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.45 0 0)" }}>Set status to:</span>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value as typeof bulkStatus)}
            style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.3rem 0.6rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer" }}
          >
            {["pending","confirmed","processing","shipped","delivered","cancelled","refunded"].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => bulkUpdateStatus.mutate({ ids: Array.from(selectedIds), status: bulkStatus })}
            disabled={bulkUpdateStatus.isPending}
            style={{ background: "#bf5fff", border: "none", borderRadius: "4px", padding: "0.35rem 1rem", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", opacity: bulkUpdateStatus.isPending ? 0.6 : 1 }}
          >
            {bulkUpdateStatus.isPending ? "Updating..." : "Apply"}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.35rem 0.75rem", color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", cursor: "pointer" }}
          >
            Deselect All
          </button>
        </div>
      )}

      {!orders?.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          No orders yet. Orders will appear here once customers start buying.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Select All row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0 0.25rem", marginBottom: "0.25rem" }}>
            <input
              type="checkbox"
              checked={orders.length > 0 && selectedIds.size === orders.length}
              onChange={e => setSelectedIds(e.target.checked ? new Set(orders.map(o => o.id)) : new Set())}
              style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "#bf5fff" }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>Select All</span>
          </div>
          {orders.map((order) => (
            <div key={order.id} style={{ background: selectedIds.has(order.id) ? "oklch(0.09 0.02 300)" : "oklch(0.07 0 0)", border: selectedIds.has(order.id) ? "1px solid #bf5fff44" : "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", overflow: "hidden", transition: "background 150ms ease, border-color 150ms ease" }}>
              {/* Order row */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.25rem", flexWrap: "wrap" }}>
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedIds.has(order.id)}
                  onChange={e => {
                    const next = new Set(selectedIds);
                    if (e.target.checked) next.add(order.id); else next.delete(order.id);
                    setSelectedIds(next);
                  }}
                  style={{ width: "15px", height: "15px", cursor: "pointer", accentColor: "#bf5fff", flexShrink: 0 }}
                />
                <div style={{ minWidth: "90px" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", color: "#bf5fff", letterSpacing: "0.05em" }}>{order.orderNumber}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.85 0 0)", fontWeight: 500 }}>{order.customerName}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)" }}>{order.customerEmail}</div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em", flexShrink: 0 }}>${order.total}</div>
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  <StatusBadge status={order.paymentStatus} />
                  <StatusBadge status={order.status} />
                </div>
                {/* Tracking info if shipped */}
                {order.trackingNumber && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#3b82f6", background: "#3b82f622", border: "1px solid #3b82f640", borderRadius: "4px", padding: "0.2rem 0.6rem", flexShrink: 0 }}>
                    {order.trackingCarrier ?? ""} {order.trackingNumber}
                  </div>
                )}
                {/* Phone + SMS badge */}
                {(order as any).customerPhone && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "#00e5a0", background: "#00e5a011", border: "1px solid #00e5a033", borderRadius: "4px", padding: "0.2rem 0.5rem", flexShrink: 0 }}>
                    📱 {(order as any).customerPhone}{(order as any).smsOptIn ? " ✓SMS" : ""}
                  </div>
                )}
                {/* Actions */}
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, alignItems: "center" }}>
                  {/* Status change dropdown */}
                  <select
                    value={order.status}
                    onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value as any })}
                    disabled={updateStatus.isPending}
                    style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.3rem 0.6rem", color: "oklch(0.75 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}
                  >
                    {["pending","confirmed","processing","shipped","delivered","cancelled","refunded"].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  {/* Confirm & Send to Crowdship button — only for orders with Crowdship items not yet submitted */}
                  {(order as any).hasCrowdshipItems && !(order as any).crowdshipSubmittedAt && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Send order ${order.orderNumber} to Crowdship? This will charge your Crowdship account.`)) {
                          confirmCrowdship.mutate({ orderId: order.id });
                        }
                      }}
                      disabled={confirmCrowdship.isPending}
                      style={{ background: "#f59e0b22", border: "1px solid #f59e0b66", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "#f59e0b", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      📦 Send to Crowdship
                    </button>
                  )}
                  {/* Crowdship submitted badge */}
                  {(order as any).crowdshipSubmittedAt && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "#22c55e", background: "#22c55e11", border: "1px solid #22c55e33", borderRadius: "4px", padding: "0.2rem 0.5rem", flexShrink: 0 }}
                      title={`Sent to Crowdship: ${new Date((order as any).crowdshipSubmittedAt).toLocaleString()}`}
                    >
                      ✓ Crowdship
                    </div>
                  )}
                  {/* Mark Shipped shortcut */}
                  {(order.status === "pending" || order.status === "confirmed" || order.status === "processing") && (
                    <button
                      onClick={() => setShipId(shipId === order.id ? null : order.id)}
                      style={{ background: "#3b82f622", border: "1px solid #3b82f640", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "#3b82f6", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600 }}
                    >
                      ✈ Ship
                    </button>
                  )}
                  {/* Trash button */}
                  <button
                    onClick={() => { if (window.confirm(`Move order ${order.orderNumber} to trash?`)) trashOrder.mutate({ id: order.id }); }}
                    disabled={trashOrder.isPending}
                    title="Move to trash (recoverable)"
                    style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: "4px", padding: "0.3rem 0.55rem", cursor: "pointer", color: "#ef4444", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", lineHeight: 1 }}
                  >
                    🗑
                  </button>
                </div>
              </div>
              {/* Admin notes */}
              {(order as any).adminNotes && notesId !== order.id && (
                <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", padding: "0.6rem 1.25rem", background: "oklch(0.05 0 0)", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0, marginTop: "1px" }}>Admin Note:</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.65 0 0)", flex: 1, lineHeight: 1.5 }}>{(order as any).adminNotes}</span>
                  <button onClick={() => { setNotesId(order.id); setAdminNotesDraft((order as any).adminNotes ?? ""); }} style={{ background: "none", border: "none", color: "oklch(0.40 0 0)", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>Edit</button>
                </div>
              )}
              {notesId === order.id && (
                <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", padding: "0.75rem 1.25rem", background: "oklch(0.05 0 0)", display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <textarea
                    value={adminNotesDraft}
                    onChange={e => setAdminNotesDraft(e.target.value)}
                    placeholder="Internal admin note (not visible to customer)..."
                    rows={2}
                    style={{ flex: 1, minWidth: "200px", background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.5rem 0.75rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", resize: "vertical" }}
                  />
                  <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                    <button
                      onClick={() => updateAdminNotes.mutate({ id: order.id, adminNotes: adminNotesDraft }, { onSuccess: () => setNotesId(null) })}
                      disabled={updateAdminNotes.isPending}
                      style={{ background: "#bf5fff", color: "#fff", border: "none", borderRadius: "4px", padding: "0.4rem 0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                    >Save</button>
                    <button onClick={() => setNotesId(null)} style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.4rem 0.75rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              )}
              {/* Note add button (when no note yet) */}
              {!(order as any).adminNotes && notesId !== order.id && (
                <div style={{ borderTop: "1px solid oklch(1 0 0 / 5%)", padding: "0.4rem 1.25rem" }}>
                  <button onClick={() => { setNotesId(order.id); setAdminNotesDraft(""); }} style={{ background: "none", border: "none", color: "oklch(0.30 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.05em" }}>+ Add admin note</button>
                </div>
              )}
              {/* Inline ship form */}
              {shipId === order.id && (
                <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", padding: "0.85rem 1.25rem", background: "oklch(0.05 0 0)", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tracking:</span>
                  <select
                    value={trackingCarrier}
                    onChange={e => setTrackingCarrier(e.target.value)}
                    style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.35rem 0.6rem", color: "oklch(0.75 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}
                  >
                    {["UPS", "USPS", "FedEx", "DHL", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Tracking number (optional)"
                    value={trackingNum}
                    onChange={e => setTrackingNum(e.target.value)}
                    style={{ flex: 1, minWidth: "180px", background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.35rem 0.75rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}
                  />
                  <button
                    onClick={() => handleMarkShipped(order.id)}
                    disabled={updateStatus.isPending}
                    style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px", padding: "0.4rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    Confirm Shipped
                  </button>
                  <button
                    onClick={() => setShipId(null)}
                    style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.4rem 0.75rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
      )}
    </div>
  );
}

// ─── Subscriptions Tab ────────────────────────────────────────────────────────
function SubscriptionsTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: subs, refetch } = trpc.admin.subscriptions.list.useQuery();
  const { data: stats } = trpc.admin.subscriptions.stats.useQuery();
  const updateStatus = trpc.admin.subscriptions.updateStatus.useMutation({ onSuccess: () => refetch() });

  const filtered = subs?.filter(({ subscription }) =>
    statusFilter === "all" ? true : subscription.status === statusFilter
  ) ?? [];

  const STATUS_FILTERS = [
    { value: "all", label: "All", count: subs?.length ?? 0 },
    { value: "pending_approval", label: "Pending", count: stats?.pending ?? 0 },
    { value: "active", label: "Active", count: stats?.active ?? 0 },
    { value: "paused", label: "Paused", count: stats?.paused ?? 0 },
  ];

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard icon={<Repeat size={18} />} label="Total Subscribers" value={stats?.total ?? 0} />
        <StatCard icon={<CheckCircle size={18} />} label="Active" value={stats?.active ?? 0} />
        <StatCard icon={<Clock size={18} />} label="Pending Approval" value={stats?.pending ?? 0} />
        <StatCard icon={<XCircle size={18} />} label="Paused" value={stats?.paused ?? 0} />
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "4px",
              border: statusFilter === f.value ? "1px solid #bf5fff" : "1px solid oklch(1 0 0 / 10%)",
              background: statusFilter === f.value ? "#bf5fff18" : "oklch(0.07 0 0)",
              color: statusFilter === f.value ? "#bf5fff" : "oklch(0.50 0 0)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.72rem",
              fontWeight: statusFilter === f.value ? 600 : 400,
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "all 150ms ease",
            }}
          >
            {f.label}{f.count > 0 ? ` (${f.count})` : ""}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          {statusFilter === "all" ? "No subscriptions yet. The Habbits Box subscribers will appear here." : `No ${statusFilter.replace(/_/g, " ")} subscriptions.`}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {filtered.map(({ subscription, plan }) => (
            <div key={subscription.id} style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.90 0 0)", fontWeight: 500 }}>
                  {subscription.contactName ?? subscription.shippingName}
                  {subscription.businessName && <span style={{ color: "oklch(0.50 0 0)", fontWeight: 400 }}> · {subscription.businessName}</span>}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)", marginTop: "0.2rem" }}>
                  {plan?.name} · {subscription.frequency} · {subscription.customBudget ? `$${subscription.customBudget} custom budget` : `$${plan?.monthlyPrice}/mo`}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", marginTop: "0.15rem" }}>
                  {subscription.contactEmail} · {subscription.shippingCity}, {subscription.shippingState}
                </div>
                {subscription.nextBillingDate && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.30 0 0)", marginTop: "0.15rem" }}>
                    Next box: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    {(subscription.boxCount ?? 0) > 0 && ` · ${subscription.boxCount} box${subscription.boxCount !== 1 ? "es" : ""} shipped`}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                <StatusBadge status={subscription.status} />
                {subscription.status === "pending_approval" && (
                  <button
                    onClick={() => updateStatus.mutate({ id: subscription.id, status: "active" })}
                    disabled={updateStatus.isPending}
                    style={{ background: "#22c55e22", border: "1px solid #22c55e44", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "#22c55e", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600 }}
                  >
                    Approve
                  </button>
                )}
                {subscription.status === "active" && (
                  <button
                    onClick={() => updateStatus.mutate({ id: subscription.id, status: "paused" })}
                    disabled={updateStatus.isPending}
                    style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "oklch(0.55 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem" }}
                  >
                    Pause
                  </button>
                )}
                {subscription.status === "paused" && (
                  <button
                    onClick={() => updateStatus.mutate({ id: subscription.id, status: "active" })}
                    disabled={updateStatus.isPending}
                    style={{ background: "#22c55e22", border: "1px solid #22c55e44", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "#22c55e", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600 }}
                  >
                    Resume
                  </button>
                )}
                {subscription.status !== "cancelled" && (
                  <button
                    onClick={() => { if (confirm(`Cancel ${subscription.contactName ?? subscription.shippingName}'s subscription?`)) updateStatus.mutate({ id: subscription.id, status: "cancelled" }); }}
                    disabled={updateStatus.isPending}
                    style={{ background: "#ef444412", border: "1px solid #ef444430", borderRadius: "4px", padding: "0.3rem 0.75rem", cursor: "pointer", color: "#ef4444", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Box Curator Tab ─────────────────────────────────────────────────────────
// Tier colors by slug — used for UI accents
const TIER_COLORS: Record<string, string> = {
  baby_lungs: "#00e5a0",
  stoner: "#bf5fff",
  connoisseur: "#f5a623",
  smoke_shop: "#3b82f6",
};

function BoxCuratorTab() {
  const now = new Date();
  const defaultPeriod = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [periodLabel, setPeriodLabel] = useState(defaultPeriod);
  const [addProductId, setAddProductId] = useState<string>("");
  const [addQty, setAddQty] = useState(1);
  const [addNotes, setAddNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: plans, isLoading: plansLoading } = trpc.subscriptions.plans.useQuery();

  // Auto-select first plan once loaded
  useEffect(() => {
    if (plans && plans.length > 0 && selectedPlanId === null) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const { data: contents, refetch } = trpc.admin.boxContents.list.useQuery(
    { planId: selectedPlanId ?? 0, periodLabel },
    { enabled: !!selectedPlanId && !!periodLabel }
  );
  const { data: allProducts } = trpc.admin.products.list.useQuery({ search: undefined });
  const addMutation = trpc.admin.boxContents.add.useMutation({
    onSuccess: () => {
      refetch();
      setAddProductId("");
      setAddQty(1);
      setAddNotes("");
      setShowAddForm(false);
    },
  });
  const removeMutation = trpc.admin.boxContents.remove.useMutation({ onSuccess: () => refetch() });

  const selectedPlan = plans?.find(p => p.id === selectedPlanId);
  const selectedTierColor = selectedPlan ? (TIER_COLORS[selectedPlan.slug] ?? "#bf5fff") : "#bf5fff";

  // Generate period options: current month + next 5 months + last 3 months
  const periodOptions: string[] = [];
  for (let i = -3; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    periodOptions.push(d.toLocaleDateString("en-US", { month: "long", year: "numeric" }));
  }

  const activeProducts = allProducts?.filter(p => p.product.isActive) ?? [];

  return (
    <div>
      {/* Tier + Period selectors */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Tier</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {plansLoading && <span style={{ color: "oklch(0.40 0 0)", fontSize: "0.75rem" }}>Loading tiers...</span>}
            {(plans ?? []).map(plan => {
              const color = TIER_COLORS[plan.slug] ?? "#bf5fff";
              const price = parseFloat(plan.monthlyPrice) >= 1000 ? "Custom" : `$${parseFloat(plan.monthlyPrice).toFixed(0)}/mo`;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    border: selectedPlanId === plan.id ? `1px solid ${color}` : "1px solid oklch(1 0 0 / 10%)",
                    background: selectedPlanId === plan.id ? `${color}18` : "oklch(0.07 0 0)",
                    color: selectedPlanId === plan.id ? color : "oklch(0.55 0 0)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: selectedPlanId === plan.id ? 600 : 400,
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    transition: "all 150ms ease",
                  }}
                >
                  {plan.name}
                  <span style={{ marginLeft: "0.4rem", fontSize: "0.65rem", opacity: 0.7 }}>{price}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Period</div>
          <select
            value={periodLabel}
            onChange={e => setPeriodLabel(e.target.value)}
            style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(1 0 0 / 12%)",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              color: "oklch(0.80 0 0)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {periodOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-gold"
          style={{ fontSize: "0.75rem", padding: "0.5rem 1.25rem" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Plus size={14} /> Add Product to Box</span>
        </button>
      </div>

      {/* Box header */}
      <div style={{
        background: "oklch(0.07 0 0)",
        border: `1px solid ${selectedTierColor}33`,
        borderRadius: "8px",
        padding: "1rem 1.5rem",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}>
        <Gift size={18} style={{ color: selectedTierColor }} />
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.08em", color: selectedTierColor }}>
            {selectedPlan?.name} Box — {periodLabel}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)", marginTop: "0.15rem" }}>
            {contents?.length ?? 0} product{contents?.length !== 1 ? "s" : ""} curated for this box · Contents are never revealed to subscribers in advance
          </div>
        </div>
      </div>

      {/* Add product form */}
      {showAddForm && (
        <div style={{
          background: "oklch(0.07 0 0)",
          border: "1px solid oklch(1 0 0 / 12%)",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>ADD PRODUCT TO BOX</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", alignItems: "end", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginBottom: "0.35rem" }}>Product</div>
              <select
                value={addProductId}
                onChange={e => setAddProductId(e.target.value)}
                style={{
                  width: "100%",
                  background: "oklch(0.05 0 0)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: "4px",
                  padding: "0.5rem 0.75rem",
                  color: addProductId ? "oklch(0.80 0 0)" : "oklch(0.35 0 0)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.8rem",
                  outline: "none",
                }}
              >
                <option value="">Select a product...</option>
                {activeProducts.map(({ product }) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.thcaPercent ? `(${product.thcaPercent}% THCA)` : ""} — ${product.retailPrice}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginBottom: "0.35rem" }}>Qty</div>
              <input
                type="number"
                min={1}
                max={10}
                value={addQty}
                onChange={e => setAddQty(parseInt(e.target.value) || 1)}
                style={{
                  width: "64px",
                  background: "oklch(0.05 0 0)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: "4px",
                  padding: "0.5rem 0.75rem",
                  color: "oklch(0.80 0 0)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.8rem",
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={() => {
                if (!addProductId) return;
                addMutation.mutate({
                  planId: selectedPlanId!,
                  periodLabel,
                  productId: parseInt(addProductId),
                  quantity: addQty,
                  notes: addNotes || undefined,
                });
              }}
              disabled={!addProductId || addMutation.isPending}
              className="btn-gold"
              style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
            >
              <span>{addMutation.isPending ? "Adding..." : "Add"}</span>
            </button>
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: "oklch(0.40 0 0)", textTransform: "uppercase", marginBottom: "0.35rem" }}>Internal Notes (optional)</div>
            <input
              placeholder="e.g. Include with handwritten note"
              value={addNotes}
              onChange={e => setAddNotes(e.target.value)}
              style={{
                width: "100%",
                background: "oklch(0.05 0 0)",
                border: "1px solid oklch(1 0 0 / 12%)",
                borderRadius: "4px",
                padding: "0.5rem 0.75rem",
                color: "oklch(0.80 0 0)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
          </div>
        </div>
      )}

      {/* Contents list */}
      {!contents?.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          No products curated for this box yet. Click "Add Product to Box" to start building the {selectedPlan?.name} box for {periodLabel}.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.6rem" }}>
          {contents.map(({ content, product }) => (
            <div key={content.id} style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(1 0 0 / 8%)",
              borderRadius: "6px",
              padding: "0.85rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}>
              {product?.imageUrl && (
                <img src={product.imageUrl} alt={product.name} style={{ width: "44px", height: "44px", objectFit: "cover", objectPosition: "top", borderRadius: "4px", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.90 0 0)", fontWeight: 500 }}>
                  {product?.name ?? "Unknown Product"}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)", marginTop: "0.15rem" }}>
                  {product?.category} {product?.strainType ? `· ${product.strainType}` : ""} {product?.thcaPercent ? `· ${product.thcaPercent}% THCA` : ""} · ${product?.retailPrice}
                </div>
                {content.notes && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", marginTop: "0.2rem", fontStyle: "italic" }}>
                    {content.notes}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: selectedTierColor, lineHeight: 1 }}>{content.quantity}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.35 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>qty</div>
                </div>
                <button
                  onClick={() => removeMutation.mutate({ id: content.id })}
                  disabled={removeMutation.isPending}
                  style={{ background: "none", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "4px", padding: "0.35rem", cursor: "pointer", color: "oklch(0.40 0 0)", transition: "color 150ms" }}
                  title="Remove from box"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder note */}
      {(contents?.length ?? 0) > 0 && (
        <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 6%)", borderRadius: "6px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", lineHeight: 1.6 }}>
            <strong style={{ color: "oklch(0.60 0 0)" }}>Reminder:</strong> These contents are for internal reference only. Subscribers never see what's in their box in advance — the surprise is part of the experience. Use this panel to track what you're packing for each tier and period.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notify Me Leads Tab ─────────────────────────────────────────────────────
function NotifyMeTab() {
  const [categoryFilter, setCategoryFilter] = useState<"all" | "flower" | "extracts" | "accessories" | "general">("all");
  const { data: leads, isLoading } = trpc.notifyMe.list.useQuery({ category: categoryFilter });

  const flowerCount = leads?.filter((l: any) => l.category === "flower").length ?? 0;
  const extractsCount = leads?.filter((l: any) => l.category === "extracts").length ?? 0;
  const accessoriesCount = leads?.filter((l: any) => l.category === "accessories").length ?? 0;
  const totalCount = leads?.length ?? 0;

  const filterBtns: { id: "all" | "flower" | "extracts" | "accessories" | "general"; label: string; color: string }[] = [
    { id: "all", label: `All (${totalCount})`, color: "#bf5fff" },
    { id: "flower", label: `Flower (${flowerCount})`, color: "#d97706" },
    { id: "extracts", label: `Extracts (${extractsCount})`, color: "#bf5fff" },
    { id: "accessories", label: `Accessories (${accessoriesCount})`, color: "#f59e0b" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Mail size={18} style={{ color: "#bf5fff" }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)" }}>NOTIFY ME LEADS</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {filterBtns.map(btn => (
            <button
              key={btn.id}
              onClick={() => setCategoryFilter(btn.id)}
              style={{
                padding: "0.35rem 0.9rem",
                borderRadius: "100px",
                border: categoryFilter === btn.id ? `1px solid ${btn.color}` : "1px solid oklch(1 0 0 / 12%)",
                background: categoryFilter === btn.id ? `${btn.color}22` : "none",
                color: categoryFilter === btn.id ? btn.color : "oklch(0.50 0 0)",
                fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600,
                letterSpacing: "0.05em", cursor: "pointer", transition: "all 150ms ease",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem 0" }}>Loading leads...</div>
      ) : !leads || leads.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          border: "1px dashed oklch(1 0 0 / 10%)", borderRadius: "8px",
        }}>
          <Bell size={32} style={{ color: "oklch(0.25 0 0)", marginBottom: "1rem" }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "oklch(0.30 0 0)" }}>NO LEADS YET</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.30 0 0)", marginTop: "0.5rem" }}>Leads will appear here when customers sign up on the Flower or Extracts coming soon pages.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                {["Email", "Category", "Signed Up"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: any) => (
                <tr key={lead.id} style={{ borderBottom: "1px solid oklch(1 0 0 / 5%)", transition: "background 150ms ease" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.07 0 0)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.75 0 0)" }}>{lead.email}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{
                      display: "inline-block", padding: "0.2rem 0.7rem", borderRadius: "100px",
                      fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "capitalize",
                      background: lead.category === "flower" ? "#d9770622" : lead.category === "extracts" ? "#bf5fff22" : lead.category === "accessories" ? "#f59e0b22" : "oklch(0.10 0 0)",
                      color: lead.category === "flower" ? "#d97706" : lead.category === "extracts" ? "#bf5fff" : lead.category === "accessories" ? "#f59e0b" : "oklch(0.50 0 0)",
                      border: `1px solid ${lead.category === "flower" ? "#d9770640" : lead.category === "extracts" ? "#bf5fff40" : lead.category === "accessories" ? "#f59e0b40" : "oklch(1 0 0 / 8%)"}`,
                    }}>
                      {lead.category}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)" }}>
                    {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Loyalty Tab ────────────────────────────────────────────────────────────
function LoyaltyTab() {
  const { data: leaderboard, isLoading } = trpc.loyalty.adminGetLeaderboard.useQuery();
  const [adjustUserId, setAdjustUserId] = useState<number | null>(null);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const adjustMutation = trpc.loyalty.adminAdjustPoints.useMutation({
    onSuccess: () => {
      setAdjustUserId(null); setAdjustPoints(""); setAdjustNote("");
    },
  });

  const totalPoints = leaderboard?.reduce((sum: number, u: any) => sum + u.totalPoints, 0) ?? 0;
  const totalUsers = leaderboard?.length ?? 0;
  const totalDollarValue = Math.floor(totalPoints / 100);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Star size={18} style={{ color: "#bf5fff" }} />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)" }}>LOYALTY POINTS</span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Users size={18} />} label="Members with Points" value={totalUsers} />
        <StatCard icon={<Star size={18} />} label="Total Points Issued" value={totalPoints.toLocaleString()} />
        <StatCard icon={<DollarSign size={18} />} label="Total Redeemable Value" value={`$${totalDollarValue}`} />
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem 0" }}>Loading...</div>
      ) : !leaderboard || leaderboard.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed oklch(1 0 0 / 10%)", borderRadius: "8px" }}>
          <Award size={32} style={{ color: "oklch(0.25 0 0)", marginBottom: "1rem" }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "oklch(0.30 0 0)" }}>NO POINTS ISSUED YET</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.30 0 0)", marginTop: "0.5rem" }}>Points are awarded automatically after purchases and approved reviews.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                {["Customer", "Email", "Points", "Value", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.40 0 0)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u: any) => (
                <tr key={u.userId} style={{ borderBottom: "1px solid oklch(1 0 0 / 5%)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.07 0 0)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.75 0 0)" }}>{u.userName ?? "—"}</td>
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.50 0 0)" }}>{u.userEmail ?? "—"}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", color: u.totalPoints > 0 ? "#bf5fff" : "oklch(0.40 0 0)" }}>
                      {u.totalPoints.toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "#f5a623" }}>
                    ${u.dollarValue}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    {adjustUserId === u.userId ? (
                      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                        <input type="number" placeholder="±pts" value={adjustPoints} onChange={e => setAdjustPoints(e.target.value)}
                          style={{ width: "70px", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.3rem 0.5rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }} />
                        <input type="text" placeholder="Reason" value={adjustNote} onChange={e => setAdjustNote(e.target.value)}
                          style={{ width: "120px", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.3rem 0.5rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }} />
                        <button onClick={() => adjustMutation.mutate({ userId: u.userId, points: Number(adjustPoints), note: adjustNote })}
                          style={{ background: "#bf5fff", color: "#fff", border: "none", borderRadius: "4px", padding: "0.3rem 0.6rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer" }}>Save</button>
                        <button onClick={() => setAdjustUserId(null)}
                          style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.3rem 0.6rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setAdjustUserId(u.userId)}
                        style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.3rem 0.7rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}>
                        <Sliders size={11} /> Adjust
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Coupons Tab ────────────────────────────────────────────────────────────
function CouponsTab() {
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all");
  const { data: coupons, isLoading, refetch } = trpc.coupons.adminList.useQuery({ filter });
  const createMutation = trpc.coupons.adminCreate.useMutation({ onSuccess: () => { refetch(); setShowCreate(false); setCreateCode(""); setCreateEmail(""); setCreateDiscount(15); setCreateExpiry(""); } });
  const deleteMutation = trpc.coupons.adminDelete.useMutation({ onSuccess: () => refetch() });
  const [showCreate, setShowCreate] = useState(false);
  const [createCode, setCreateCode] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createDiscount, setCreateDiscount] = useState(15);
  const [createExpiry, setCreateExpiry] = useState("");

  const filterBtns: { id: typeof filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unused", label: "Available" },
    { id: "used", label: "Used" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>COUPON CODES</h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)" }}>Newsletter signup codes + manually created codes.</p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#bf5fff22", border: "1px solid #bf5fff44", color: "#bf5fff", padding: "0.55rem 1.1rem", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
        >
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      {/* Create coupon form */}
      {showCreate && (
        <div style={{ background: "oklch(0.07 0 0)", border: "1px solid #bf5fff33", borderRadius: "10px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)", marginBottom: "1rem" }}>CREATE NEW COUPON</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>Code (leave blank to auto-generate)</label>
              <input type="text" value={createCode} onChange={e => setCreateCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER25" style={{ width: "100%", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.55rem 0.75rem", color: "oklch(0.85 0 0)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>Customer Email (optional)</label>
              <input type="email" value={createEmail} onChange={e => setCreateEmail(e.target.value)} placeholder="customer@email.com" style={{ width: "100%", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.55rem 0.75rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>Discount %</label>
              <input type="number" min={1} max={100} value={createDiscount} onChange={e => setCreateDiscount(Number(e.target.value))} style={{ width: "100%", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.55rem 0.75rem", color: "#bf5fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>Expires (optional)</label>
              <input type="date" value={createExpiry} onChange={e => setCreateExpiry(e.target.value)} style={{ width: "100%", background: "oklch(0.05 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.55rem 0.75rem", color: "oklch(0.75 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => createMutation.mutate({ code: createCode || undefined, email: createEmail || undefined, discountPct: createDiscount, expiresAt: createExpiry || undefined })}
              disabled={createMutation.isPending}
              style={{ background: "#bf5fff", color: "#fff", border: "none", borderRadius: "6px", padding: "0.6rem 1.25rem", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
            >
              {createMutation.isPending ? "Creating..." : "Create Coupon"}
            </button>
            <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "6px", padding: "0.6rem 1rem", color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>Cancel</button>
          </div>
          {createMutation.isError && <div style={{ marginTop: "0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#ff4444" }}>{createMutation.error.message}</div>}
          {createMutation.isSuccess && <div style={{ marginTop: "0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00e5a0" }}>✓ Created: {createMutation.data.code}</div>}
        </div>
      )}

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {filterBtns.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: filter === btn.id ? "#bf5fff" : "oklch(1 0 0 / 12%)",
              background: filter === btn.id ? "#bf5fff22" : "transparent",
              color: filter === btn.id ? "#bf5fff" : "oklch(0.50 0 0)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.7rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
              fontWeight: filter === btn.id ? 600 : 400,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>Loading...</div>
      ) : !coupons || coupons.length === 0 ? (
        <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "3rem", textAlign: "center" }}>
          <Mail size={32} style={{ color: "oklch(0.25 0 0)", marginBottom: "1rem" }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "oklch(0.50 0 0)", letterSpacing: "0.05em" }}>NO COUPONS YET</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.30 0 0)", marginTop: "0.5rem" }}>Codes are generated automatically when customers subscribe to the newsletter.</p>
        </div>
      ) : (
        <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                {["Code", "Email", "Discount", "Status", "Created", "Expires", ""].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c: any) => (
                <tr key={c.id} style={{ borderBottom: "1px solid oklch(1 0 0 / 5%)" }}>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", color: "#bf5fff" }}>{c.code}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.65 0 0)" }}>{c.email}</td>
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.75 0 0)" }}>{c.discountPct}%</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "12px",
                      fontSize: "0.62rem",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      background: c.usedAt ? "oklch(0.12 0 0)" : "#00e5a022",
                      color: c.usedAt ? "oklch(0.40 0 0)" : "#00e5a0",
                      border: `1px solid ${c.usedAt ? "oklch(1 0 0 / 8%)" : "#00e5a044"}`,
                    }}>
                      {c.usedAt ? "Used" : "Available"}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)" }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: c.expiresAt && new Date(c.expiresAt) < new Date() ? "#ff4444" : "oklch(0.45 0 0)" }}>
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "No expiry"}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    {!c.usedAt && (
                      <button
                        onClick={() => { if (confirm(`Delete coupon ${c.code}?`)) deleteMutation.mutate({ id: c.id }); }}
                        disabled={deleteMutation.isPending}
                        style={{ background: "none", border: "1px solid #ff444433", borderRadius: "4px", padding: "0.25rem 0.6rem", color: "#ff4444", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", cursor: "pointer" }}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Reviews Tab ────────────────────────────────────────────────────────────
function ReviewsTab() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const { data: reviews, isLoading, refetch } = trpc.reviews.adminList.useQuery({ status: statusFilter });
  const approveMutation = trpc.reviews.adminApprove.useMutation({ onSuccess: () => refetch() });
  const rejectMutation = trpc.reviews.adminReject.useMutation({ onSuccess: () => refetch() });
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const statusColor = (s: string) => s === "approved" ? "#2ecc71" : s === "rejected" ? "#e74c3c" : "#f5a623";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <MessageSquare size={18} style={{ color: "#bf5fff" }} />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)" }}>REVIEW MODERATION</span>
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["pending", "approved", "rejected", "all"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "0.4rem 1rem", borderRadius: "4px", border: "1px solid oklch(1 0 0 / 12%)", background: statusFilter === s ? "#bf5fff" : "transparent", color: statusFilter === s ? "#fff" : "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, textTransform: "capitalize", cursor: "pointer" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem 0" }}>Loading...</div>
      ) : !reviews || reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed oklch(1 0 0 / 10%)", borderRadius: "8px" }}>
          <MessageSquare size={32} style={{ color: "oklch(0.25 0 0)", marginBottom: "1rem" }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "oklch(0.30 0 0)" }}>NO REVIEWS YET</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.30 0 0)", marginTop: "0.5rem" }}>Reviews submitted by customers will appear here for moderation.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((r: any) => (
            <div key={r.id} style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "oklch(0.85 0 0)" }}>{r.reviewerName ?? r.userName ?? "Anonymous"}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>{r.userEmail} · {r.productName}</div>
                  <div style={{ display: "flex", gap: "2px", marginTop: "0.3rem" }}>
                    {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.rating ? "#f5a623" : "oklch(0.25 0 0)", fontSize: "0.9rem" }}>★</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ padding: "0.2rem 0.6rem", borderRadius: "4px", background: statusColor(r.status) + "22", color: statusColor(r.status), fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>{r.status}</span>
                  {r.rewardIssued && <span style={{ padding: "0.2rem 0.6rem", borderRadius: "4px", background: "#2ecc7122", color: "#2ecc71", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700 }}>$1 ISSUED</span>}
                </div>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.65 0 0)", lineHeight: 1.6, marginBottom: "0.75rem" }}>{r.reviewText}</p>
              {r.rejectReason && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#e74c3c", marginBottom: "0.75rem" }}>Reject reason: {r.rejectReason}</p>}
              {r.status === "pending" && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => approveMutation.mutate({ reviewId: r.id })}
                    style={{ background: "#2ecc71", color: "#fff", border: "none", borderRadius: "4px", padding: "0.4rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                    ✓ Approve + Issue $1 Credit
                  </button>
                  {rejectId === r.id ? (
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <input type="text" placeholder="Reason (optional)" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                        style={{ width: "160px", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.3rem 0.5rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }} />
                      <button onClick={() => { rejectMutation.mutate({ reviewId: r.id, reason: rejectReason }); setRejectId(null); setRejectReason(""); }}
                        style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: "4px", padding: "0.4rem 0.8rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>Confirm Reject</button>
                      <button onClick={() => setRejectId(null)}
                        style={{ background: "none", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.4rem 0.8rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setRejectId(r.id)}
                      style={{ background: "none", border: "1px solid #e74c3c44", borderRadius: "4px", padding: "0.4rem 0.8rem", color: "#e74c3c", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}>✗ Reject</button>
                  )}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)" }}>{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── GBP Reviews Tab ──────────────────────────────────────────────────────────
function GbpReviewsTab() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "duplicate" | "all">("pending");
  const { data: submissions, isLoading, refetch } = trpc.gbpReviews.adminList.useQuery({ status: statusFilter });
  const approveMutation = trpc.gbpReviews.approve.useMutation({ onSuccess: () => refetch() });
  const rejectMutation = trpc.gbpReviews.reject.useMutation({ onSuccess: () => refetch() });
  const dupMutation = trpc.gbpReviews.markDuplicate.useMutation({ onSuccess: () => refetch() });
  const [noteId, setNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const statusColor = (s: string) => s === "approved" ? "#00e5a0" : s === "rejected" ? "#ff4444" : s === "duplicate" ? "#f59e0b" : "#bf5fff";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Award size={18} style={{ color: "#d4af37" }} />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)" }}>GOOGLE REVIEW SUBMISSIONS</span>
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        Customers submit screenshots of their Google reviews to earn $1 store credit. Approve to issue credit, reject for invalid submissions, or mark duplicate.
      </p>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["pending", "approved", "rejected", "duplicate", "all"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "0.4rem 1rem", borderRadius: "4px", border: "1px solid oklch(1 0 0 / 12%)", background: statusFilter === s ? "#bf5fff" : "transparent", color: statusFilter === s ? "#fff" : "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, textTransform: "capitalize", cursor: "pointer" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem 0" }}>Loading...</div>
      ) : !submissions || submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed oklch(1 0 0 / 10%)", borderRadius: "8px" }}>
          <Award size={32} style={{ color: "oklch(0.25 0 0)", marginBottom: "1rem" }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "oklch(0.30 0 0)" }}>NO SUBMISSIONS YET</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.30 0 0)", marginTop: "0.5rem" }}>Customers who leave Google reviews and submit screenshots will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {submissions.map((s: any) => (
            <div key={s.id} style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ display: "flex", gap: "1rem", padding: "1.25rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Screenshot thumbnail */}
                {s.screenshotUrl && (
                  <a href={s.screenshotUrl} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                    <img src={s.screenshotUrl} alt="Review screenshot" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid oklch(1 0 0 / 15%)" }} />
                  </a>
                )}
                {/* Info */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", fontWeight: 700, color: "oklch(0.85 0 0)", marginBottom: "0.2rem" }}>{s.reviewerName}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", marginBottom: "0.5rem" }}>{s.userEmail} · {new Date(s.createdAt).toLocaleDateString()}</div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "4px", background: statusColor(s.status) + "22", color: statusColor(s.status), fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase" }}>{s.status}</span>
                    {s.creditIssued && <span style={{ padding: "0.2rem 0.6rem", borderRadius: "4px", background: "#00e5a022", color: "#00e5a0", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", fontWeight: 700 }}>$1 CREDIT ISSUED</span>}
                  </div>
                  {s.adminNotes && <div style={{ marginTop: "0.5rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.50 0 0)", fontStyle: "italic" }}>Note: {s.adminNotes}</div>}
                </div>
                {/* Actions */}
                {s.status === "pending" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                    <button
                      onClick={() => approveMutation.mutate({ id: s.id })}
                      disabled={approveMutation.isPending}
                      style={{ background: "#00e5a022", border: "1px solid #00e5a044", borderRadius: "4px", padding: "0.4rem 0.9rem", color: "#00e5a0", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                    >✓ Approve + Issue $1</button>
                    <button
                      onClick={() => rejectMutation.mutate({ id: s.id })}
                      disabled={rejectMutation.isPending}
                      style={{ background: "none", border: "1px solid #ff444433", borderRadius: "4px", padding: "0.4rem 0.9rem", color: "#ff4444", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}
                    >✗ Reject</button>
                    <button
                      onClick={() => dupMutation.mutate({ id: s.id })}
                      disabled={dupMutation.isPending}
                      style={{ background: "none", border: "1px solid #f59e0b33", borderRadius: "4px", padding: "0.4rem 0.9rem", color: "#f59e0b", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}
                    >Duplicate</button>
                  </div>
                )}
              </div>
              {/* Admin note editor */}
              {noteId === s.id ? (
                <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", padding: "0.75rem 1.25rem", background: "oklch(0.05 0 0)", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <input type="text" value={noteDraft} onChange={e => setNoteDraft(e.target.value)} placeholder="Admin note..." style={{ flex: 1, background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "4px", padding: "0.5rem 0.75rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", minWidth: "180px" }} />
                  <button onClick={() => approveMutation.mutate({ id: s.id, adminNotes: noteDraft }, { onSuccess: () => setNoteId(null) })} style={{ background: "#00e5a0", color: "#000", border: "none", borderRadius: "4px", padding: "0.5rem 0.9rem", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>Approve w/ Note</button>
                  <button onClick={() => setNoteId(null)} style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.5rem 0.75rem", color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <div style={{ borderTop: "1px solid oklch(1 0 0 / 5%)", padding: "0.35rem 1.25rem" }}>
                  <button onClick={() => { setNoteId(s.id); setNoteDraft(s.adminNotes ?? ""); }} style={{ background: "none", border: "none", color: "oklch(0.30 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem" }}>+ Add/edit admin note</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab ──────────────────────────────────────────────────────────
// ─── Visitor Admin Actions (Gift Credits + Wholesale Toggle) ─────────────────
function VisitorAdminActions({ userId, isWholesale, onClose }: { userId: number; isWholesale: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [giftPoints, setGiftPoints] = useState("100");
  const [giftMessage, setGiftMessage] = useState("You've been randomly selected for a special reward! Enjoy these bonus loyalty credits.");
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [giftSent, setGiftSent] = useState(false);

  // Direct message state
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgType, setMsgType] = useState<"info" | "promo" | "alert">("info");
  const [msgSent, setMsgSent] = useState(false);

  // Nickname edit state
  const [showNicknameEdit, setShowNicknameEdit] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameSaved, setNicknameSaved] = useState(false);
  const setNicknameMutation = trpc.profile.adminSetNickname.useMutation({
    onSuccess: () => {
      setNicknameSaved(true);
      setShowNicknameEdit(false);
      utils.profile.adminGetUser.invalidate({ userId });
      setTimeout(() => setNicknameSaved(false), 3000);
    },
    onError: (err) => alert(`Error: ${err.message}`),
  });

  // Live chat state
  const [chatConvId, setChatConvId] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const openChatMutation = trpc.chat.adminOpenChat.useMutation({
    onSuccess: (data) => {
      setChatConvId(data.conversationId);
      setChatOpen(true);
    },
    onError: (err) => alert(`Open chat error: ${err.message}`),
  });

  const closeChatMutation = trpc.chat.adminCloseChat.useMutation({
    onSuccess: () => {
      setChatOpen(false);
      setChatConvId(null);
      utils.chat.adminGetMessages.invalidate();
    },
  });

  const adminSendMutation = trpc.chat.adminSendMessage.useMutation({
    onSuccess: () => {
      setChatInput("");
      utils.chat.adminGetMessages.invalidate();
    },
  });

  const { data: chatData } = trpc.chat.adminGetMessages.useQuery(
    { conversationId: chatConvId! },
    { enabled: !!chatConvId, refetchInterval: chatOpen ? 2000 : false }
  );

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [chatData?.messages, chatOpen]);

  const handleChatSend = () => {
    const body = chatInput.trim();
    if (!body || !chatConvId) return;
    adminSendMutation.mutate({ conversationId: chatConvId, body });
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const sendMsgMutation = trpc.adminMessages.send.useMutation({
    onSuccess: () => {
      setMsgSent(true);
      setShowMsgForm(false);
      setMsgTitle("");
      setMsgBody("");
      setTimeout(() => setMsgSent(false), 3000);
    },
    onError: (err) => {
      alert(`Send Message Error: ${err.message}`);
    },
  });

  const giftMutation = trpc.loyalty.adminGiftCredits.useMutation({
    onSuccess: () => {
      setGiftSent(true);
      setShowGiftForm(false);
      setTimeout(() => setGiftSent(false), 3000);
    },
  });

  const wholesaleMutation = trpc.loyalty.setWholesale.useMutation({
    onSuccess: () => utils.profile.adminGetUser.invalidate({ userId }),
  });

  return (
    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.35 0 0)", marginBottom: "0.25rem" }}>Admin Actions</div>

      {/* Wholesale Toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.85rem", background: "oklch(0.09 0 0)", borderRadius: "7px", border: `1px solid ${isWholesale ? "#f5a62340" : "oklch(1 0 0 / 8%)"}` }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: isWholesale ? "#f5a623" : "oklch(0.75 0 0)", fontWeight: 600 }}>Wholesale Account</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)" }}>{isWholesale ? "Approved wholesale buyer" : "Standard retail account"}</div>
        </div>
        <button
          onClick={() => wholesaleMutation.mutate({ userId, isWholesale: !isWholesale })}
          disabled={wholesaleMutation.isPending}
          style={{
            padding: "0.35rem 0.85rem",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            background: isWholesale ? "oklch(0.20 0 0)" : "#f5a623",
            color: isWholesale ? "oklch(0.60 0 0)" : "oklch(0.08 0 0)",
            transition: "all 0.15s",
          }}
        >
          {wholesaleMutation.isPending ? "..." : isWholesale ? "REVOKE" : "APPROVE"}
        </button>
      </div>

      {/* Gift Credits */}
      {giftSent ? (
        <div style={{ padding: "0.75rem", background: "oklch(0.10 0 0)", borderRadius: "7px", border: "1px solid #00e5a040", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00e5a0" }}>
          ✨ Gift sent! The user will see a congratulations popup.
        </div>
      ) : !showGiftForm ? (
        <button
          onClick={() => setShowGiftForm(true)}
          style={{ padding: "0.6rem 0.85rem", borderRadius: "7px", border: "1px solid oklch(1 0 0 / 12%)", background: "oklch(0.09 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.75 0 0)", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Gift size={14} style={{ color: "#bf5fff" }} />
          Gift Loyalty Credits
        </button>
      ) : (
        <div style={{ padding: "0.85rem", background: "oklch(0.09 0 0)", borderRadius: "7px", border: "1px solid #bf5fff30", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Gift Credits</div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="number"
              min="1"
              max="10000"
              value={giftPoints}
              onChange={e => setGiftPoints(e.target.value)}
              style={{ width: "80px", padding: "0.35rem 0.5rem", background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "5px", color: "oklch(0.90 0 0)", fontFamily: "monospace", fontSize: "0.8rem" }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)" }}>points</span>
          </div>
          <textarea
            value={giftMessage}
            onChange={e => setGiftMessage(e.target.value)}
            rows={2}
            style={{ padding: "0.4rem 0.6rem", background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "5px", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => giftMutation.mutate({ userId, points: Number(giftPoints), message: giftMessage })}
              disabled={giftMutation.isPending || !giftPoints || Number(giftPoints) < 1}
              style={{ flex: 1, padding: "0.45rem", borderRadius: "5px", border: "none", cursor: "pointer", background: "#bf5fff", color: "oklch(0.06 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 700 }}
            >
              {giftMutation.isPending ? "Sending..." : "Send Gift"}
            </button>
            <button
              onClick={() => setShowGiftForm(false)}
              style={{ padding: "0.45rem 0.75rem", borderRadius: "5px", border: "1px solid oklch(1 0 0 / 12%)", cursor: "pointer", background: "none", color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Open Live Chat ── */}
      {!chatOpen ? (
        <button
          onClick={() => openChatMutation.mutate({ userId })}
          disabled={openChatMutation.isPending}
          style={{ padding: "0.6rem 0.85rem", borderRadius: "7px", border: "1px solid oklch(1 0 0 / 12%)", background: "oklch(0.09 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.75 0 0)", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <MessageCircle size={14} style={{ color: "#bf5fff" }} />
          {openChatMutation.isPending ? "Opening..." : "Open Live Chat"}
        </button>
      ) : (
        <div style={{ background: "oklch(0.09 0 0)", borderRadius: "10px", border: "1px solid #bf5fff30", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Chat header */}
          <div style={{ padding: "0.6rem 0.85rem", borderBottom: "1px solid oklch(1 0 0 / 8%)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00e5a0", display: "inline-block" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.80 0 0)", fontWeight: 600 }}>Live Chat Active</span>
            </div>
            <button
              onClick={() => chatConvId && closeChatMutation.mutate({ conversationId: chatConvId })}
              disabled={closeChatMutation.isPending}
              style={{ padding: "0.25rem 0.6rem", borderRadius: "4px", border: "1px solid oklch(1 0 0 / 12%)", background: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.50 0 0)", letterSpacing: "0.06em" }}
            >
              {closeChatMutation.isPending ? "..." : "End Chat"}
            </button>
          </div>
          {/* Messages */}
          <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "220px", overflowY: "auto", minHeight: "80px" }}>
            {(!chatData?.messages || chatData.messages.length === 0) && (
              <div style={{ textAlign: "center", color: "oklch(0.35 0 0)", fontSize: "0.68rem", fontFamily: "'Inter', sans-serif", fontStyle: "italic" }}>Chat opened — user will see the window on their screen.</div>
            )}
            {chatData?.messages?.map((msg) => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.senderRole === "admin" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%",
                  padding: "0.4rem 0.65rem",
                  borderRadius: msg.senderRole === "admin" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                  background: msg.senderRole === "admin" ? "linear-gradient(135deg, oklch(0.40 0.22 290), oklch(0.32 0.18 290))" : "oklch(0.15 0 0)",
                  color: "oklch(0.92 0 0)",
                  fontSize: "0.72rem",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.45,
                  wordBreak: "break-word",
                  border: msg.senderRole === "user" ? "1px solid oklch(1 0 0 / 8%)" : "none",
                }}>
                  {msg.body}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {/* Input */}
          <div style={{ padding: "0.6rem", borderTop: "1px solid oklch(1 0 0 / 8%)", display: "flex", gap: "0.4rem", alignItems: "flex-end" }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Type a message..."
              rows={1}
              style={{ flex: 1, background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "7px", padding: "0.4rem 0.6rem", color: "oklch(0.90 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", resize: "none", outline: "none", maxHeight: "80px", overflowY: "auto" }}
            />
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || adminSendMutation.isPending}
              style={{ width: "30px", height: "30px", borderRadius: "7px", background: chatInput.trim() ? "oklch(0.45 0.22 290)" : "oklch(0.15 0 0)", border: "none", cursor: chatInput.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <Send size={13} color={chatInput.trim() ? "white" : "oklch(0.30 0 0)"} />
            </button>
          </div>
        </div>
      )}

      {/* ── Set Display Name (Admin Only) ── */}
      {nicknameSaved ? (
        <div style={{ padding: "0.75rem", background: "oklch(0.10 0 0)", borderRadius: "7px", border: "1px solid #00e5a040", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00e5a0" }}>
          ✓ Display name updated!
        </div>
      ) : !showNicknameEdit ? (
        <button
          onClick={() => { setShowNicknameEdit(true); setNicknameInput(""); }}
          style={{ padding: "0.6rem 0.85rem", borderRadius: "7px", border: "1px solid oklch(1 0 0 / 12%)", background: "oklch(0.09 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.75 0 0)", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span style={{ color: "#00e5a0", fontSize: "0.9rem" }}>✏️</span>
          Set Display Name
        </button>
      ) : (
        <div style={{ padding: "0.85rem", background: "oklch(0.09 0 0)", borderRadius: "7px", border: "1px solid #00e5a030", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Set Display Name (Admin Only)</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)" }}>This name will appear on comments and reviews left by this account. Only admins can change it.</div>
          <input
            type="text"
            placeholder="e.g. Jake M. or StonerDave420"
            value={nicknameInput}
            onChange={e => setNicknameInput(e.target.value)}
            maxLength={40}
            style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 14%)", borderRadius: "5px", padding: "0.5rem 0.75rem", color: "oklch(0.85 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", outline: "none" }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setNicknameMutation.mutate({ userId, nickname: nicknameInput.trim() })}
              disabled={!nicknameInput.trim() || setNicknameMutation.isPending}
              style={{ flex: 1, padding: "0.5rem", borderRadius: "5px", border: "none", background: nicknameInput.trim() ? "#00e5a0" : "oklch(0.15 0 0)", color: nicknameInput.trim() ? "oklch(0.05 0 0)" : "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: nicknameInput.trim() ? "pointer" : "not-allowed" }}
            >
              {setNicknameMutation.isPending ? "Saving..." : "Save Name"}
            </button>
            <button
              onClick={() => setShowNicknameEdit(false)}
              style={{ padding: "0.5rem 0.85rem", borderRadius: "5px", border: "1px solid oklch(1 0 0 / 10%)", background: "oklch(0.07 0 0)", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Send Direct Message ── */}
      {msgSent ? (
        <div style={{ padding: "0.75rem", background: "oklch(0.10 0 0)", borderRadius: "7px", border: "1px solid #00f5ff40", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#00f5ff" }}>
          ✉️ Message sent! The user will see a popup on their screen.
        </div>
      ) : !showMsgForm ? (
        <button
          onClick={() => setShowMsgForm(true)}
          style={{ padding: "0.6rem 0.85rem", borderRadius: "7px", border: "1px solid oklch(1 0 0 / 12%)", background: "oklch(0.09 0 0)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.75 0 0)", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Send size={14} style={{ color: "#00f5ff" }} />
          Send Direct Message
        </button>
      ) : (
        <div style={{ padding: "0.85rem", background: "oklch(0.09 0 0)", borderRadius: "7px", border: "1px solid #00f5ff30", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Direct Message</div>
          <input
            type="text"
            placeholder="Title (e.g. Special Offer Just For You)"
            value={msgTitle}
            onChange={e => setMsgTitle(e.target.value)}
            style={{ padding: "0.4rem 0.6rem", background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "5px", color: "oklch(0.90 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}
          />
          <textarea
            placeholder="Message body..."
            value={msgBody}
            onChange={e => setMsgBody(e.target.value)}
            rows={3}
            style={{ padding: "0.4rem 0.6rem", background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "5px", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {(["info", "promo", "alert"] as const).map(t => (
              <button
                key={t}
                onClick={() => setMsgType(t)}
                style={{ flex: 1, padding: "0.3rem", borderRadius: "4px", border: `1px solid ${msgType === t ? "#00f5ff" : "oklch(1 0 0 / 10%)"}`, background: msgType === t ? "#00f5ff18" : "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: msgType === t ? "#00f5ff" : "oklch(0.45 0 0)", textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => sendMsgMutation.mutate({ userId, title: msgTitle, message: msgBody, type: msgType })}
              disabled={sendMsgMutation.isPending || !msgTitle.trim() || !msgBody.trim()}
              style={{ flex: 1, padding: "0.45rem", borderRadius: "5px", border: "none", cursor: "pointer", background: "#00f5ff", color: "oklch(0.06 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 700 }}
            >
              {sendMsgMutation.isPending ? "Sending..." : "Send Message"}
            </button>
            <button
              onClick={() => setShowMsgForm(false)}
              style={{ padding: "0.45rem 0.75rem", borderRadius: "5px", border: "1px solid oklch(1 0 0 / 12%)", cursor: "pointer", background: "none", color: "oklch(0.45 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [days, setDays] = useState(30);
  // Legacy order analytics (engagement metrics)
  const { data, isLoading: ordersLoading } = trpc.admin.orders.analytics.useQuery({ days });
  // New site analytics
  const { data: activeVisitorsData, isLoading: avLoading } = trpc.siteAnalytics.activeVisitors.useQuery(undefined, { refetchInterval: 30_000 });
  const { data: visitorStats, isLoading: vsLoading } = trpc.siteAnalytics.visitorStats.useQuery();
  const { data: dailyVisitors } = trpc.siteAnalytics.dailyVisitors.useQuery();
  const { data: topPages } = trpc.siteAnalytics.topPages.useQuery();
  const { data: activeCartsStats } = trpc.siteAnalytics.activeCartsStats.useQuery();
  const { data: orderFunnel } = trpc.siteAnalytics.orderFunnel.useQuery();
  const { data: revenueStats } = trpc.siteAnalytics.revenueStats.useQuery();
  const { data: dailyRevenue } = trpc.siteAnalytics.dailyRevenue.useQuery();
  const { data: topReferrers } = trpc.siteAnalytics.topReferrers.useQuery();
  const { data: newUsers } = trpc.siteAnalytics.newUsers.useQuery();
  const { data: hourlyTraffic } = trpc.siteAnalytics.hourlyTraffic.useQuery();
  const { data: conversionRate } = trpc.siteAnalytics.conversionRate.useQuery();
  const { data: cartAbandonmentRate } = trpc.siteAnalytics.cartAbandonmentRate.useQuery();
  const { data: topExitPages } = trpc.siteAnalytics.topExitPages.useQuery();
  const { data: repeatCustomerRate } = trpc.siteAnalytics.repeatCustomerRate.useQuery();
  const { data: locationBreakdown } = trpc.siteAnalytics.locationBreakdown.useQuery();
  const { data: newVsReturning } = trpc.siteAnalytics.newVsReturning.useQuery();
  const { data: avgSessionDuration } = trpc.siteAnalytics.avgSessionDuration.useQuery();
  const { data: deviceBreakdown } = trpc.siteAnalytics.deviceBreakdown.useQuery();

  const [selectedVisitorUserId, setSelectedVisitorUserId] = useState<number | null>(null);
  const [selectedVisitorSession, setSelectedVisitorSession] = useState<any | null>(null);
  const [selectedAnonSession, setSelectedAnonSession] = useState<any | null>(null);
  const { data: selectedUserProfile } = trpc.profile.adminGetUser.useQuery(
    { userId: selectedVisitorUserId! },
    { enabled: selectedVisitorUserId !== null }
  );

  const [pingResult, setPingResult] = useState<string | null>(null);
  const pingMutation = trpc.admin.pingSearchEngines.useMutation({
    onSuccess: (res) => setPingResult(`✓ ${res.pagesSubmitted} pages submitted to Bing, Yandex & IndexNow engines`),
    onError: () => setPingResult("✗ Ping failed — check server logs"),
  });

  // Build SVG sparkline path from data points
  function sparkline(points: number[], w = 400, h = 80): string {
    if (!points.length) return "";
    const max = Math.max(...points, 1);
    const step = w / Math.max(points.length - 1, 1);
    return points.map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(h - (v / max) * h * 0.9).toFixed(1)}`).join(" ");
  }

  const revPoints = data?.revenueByDay.map(d => d.revenue) ?? [];
  const ordPoints = data?.ordersByDay.map(d => d.count) ?? [];
  const maxRev = Math.max(...revPoints, 1);
  const maxOrd = Math.max(...ordPoints, 1);

  const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6",
    shipped: "#06b6d4", delivered: "#22c55e", cancelled: "#ef4444", refunded: "#6b7280",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header row: period selector + ping button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Period:</span>
          {[7, 14, 30, 60, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{ padding: "0.3rem 0.75rem", borderRadius: "4px", border: days === d ? "1px solid #bf5fff" : "1px solid oklch(1 0 0 / 10%)", background: days === d ? "#bf5fff18" : "oklch(0.07 0 0)", color: days === d ? "#bf5fff" : "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: days === d ? 600 : 400, cursor: "pointer" }}>
              {d}d
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
          <button
            onClick={() => { setPingResult(null); pingMutation.mutate(); }}
            disabled={pingMutation.isPending}
            style={{ padding: "0.4rem 1rem", borderRadius: "6px", border: "1px solid #00e5a044", background: pingMutation.isPending ? "oklch(0.08 0 0)" : "oklch(0.07 0.02 160)", color: pingMutation.isPending ? "oklch(0.40 0 0)" : "#00e5a0", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 600, cursor: pingMutation.isPending ? "default" : "pointer", letterSpacing: "0.05em" }}
          >
            {pingMutation.isPending ? "Pinging..." : "Ping Search Engines"}
          </button>
          {pingResult && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: pingResult.startsWith("✓") ? "#00e5a0" : "#ff4444" }}>{pingResult}</div>
          )}
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display: "none" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Period:</span>
        {[7, 14, 30, 60, 90].map(d => (
          <button key={d} onClick={() => setDays(d)} style={{ padding: "0.3rem 0.75rem", borderRadius: "4px", border: days === d ? "1px solid #bf5fff" : "1px solid oklch(1 0 0 / 10%)", background: days === d ? "#bf5fff18" : "oklch(0.07 0 0)", color: days === d ? "#bf5fff" : "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: days === d ? 600 : 400, cursor: "pointer" }}>
            {d}d
          </button>
        ))}
      </div>

      {/* ═══ SITE TRAFFIC SECTION ═══ */}
      <div style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)", paddingBottom: "1.5rem" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", color: "oklch(0.50 0 0)", marginBottom: "1rem" }}>SITE TRAFFIC</div>

        {/* Live visitors panel */}
        <div style={{ background: "oklch(0.06 0 0)", border: `1px solid ${(activeVisitorsData?.count ?? 0) > 0 ? "#00e5a044" : "oklch(1 0 0 / 8%)"}`, borderRadius: "10px", marginBottom: "1rem", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", borderBottom: (activeVisitorsData?.sessions?.length ?? 0) > 0 ? "1px solid oklch(1 0 0 / 6%)" : "none" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: (activeVisitorsData?.count ?? 0) > 0 ? "#00e5a0" : "oklch(0.30 0 0)", boxShadow: (activeVisitorsData?.count ?? 0) > 0 ? "0 0 8px #00e5a0" : "none", flexShrink: 0, animation: (activeVisitorsData?.count ?? 0) > 0 ? "pulse 2s infinite" : "none" }} />
            <div>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "oklch(0.96 0 0)", lineHeight: 1 }}>{avLoading ? "—" : (activeVisitorsData?.count ?? 0)}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.50 0 0)", marginLeft: "0.75rem", letterSpacing: "0.05em" }}>PEOPLE ON SITE RIGHT NOW</span>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>Updates every 30s</div>
          </div>
          {/* Session rows */}
          {(activeVisitorsData?.sessions ?? []).map((s: any, i: number) => {
            const timeOnSite = s.firstSeen ? Math.floor((Date.now() - new Date(s.firstSeen).getTime()) / 1000) : 0;
            const timeStr = timeOnSite < 60 ? `${timeOnSite}s` : timeOnSite < 3600 ? `${Math.floor(timeOnSite / 60)}m ${timeOnSite % 60}s` : `${Math.floor(timeOnSite / 3600)}h ${Math.floor((timeOnSite % 3600) / 60)}m`;
            const deviceIcon = s.deviceType === "mobile" ? "📱" : s.deviceType === "tablet" ? "⬛" : "🖥";
            const isLoggedIn = !!s.userId;
            return (
              <div
                key={s.sessionId}
                onClick={() => {
                  if (isLoggedIn) { setSelectedVisitorUserId(s.userId); setSelectedVisitorSession(s); setSelectedAnonSession(null); }
                  else { setSelectedAnonSession(s); setSelectedVisitorUserId(null); setSelectedVisitorSession(null); }
                }}
                style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: i < (activeVisitorsData?.sessions?.length ?? 0) - 1 ? "1px solid oklch(1 0 0 / 5%)" : "none", cursor: "pointer", transition: "background 150ms", flexWrap: "wrap" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "oklch(0.09 0 0)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {/* Identity */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: "140px", flex: "0 0 auto" }}>
                  <span style={{ fontSize: "0.85rem" }}>{deviceIcon}</span>
                  {isLoggedIn ? (
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: s.isAdmin ? "#f59e0b" : "#bf5fff", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      {s.userName || s.walletAddress?.slice(0, 8) + "..." || "User"}
                      {s.isAdmin && <span style={{ background: "#f59e0b22", color: "#f59e0b", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", padding: "0.1rem 0.3rem", borderRadius: "3px", border: "1px solid #f59e0b44" }}>ADMIN</span>}
                    </span>
                  ) : (
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)" }}>Anonymous</span>
                  )}
                </div>
                {/* Location */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", minWidth: "120px", flex: "0 0 auto" }}>
                  <MapPin size={11} style={{ color: "oklch(0.35 0 0)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.50 0 0)" }}>
                    {s.city && s.region ? `${s.city}, ${s.region}` : s.region || s.country || "Unknown"}
                  </span>
                </div>
                {/* Current page */}
                <div style={{ flex: 1, minWidth: "100px", overflow: "hidden" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "oklch(0.55 0 0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{s.path}</span>
                </div>
                {/* Time on site */}
                <div style={{ flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#00e5a0" }}>{timeStr}</span>
                </div>
                {/* Click hint */}
                <UserCircle size={14} style={{ color: isLoggedIn ? "oklch(0.35 0 0)" : "oklch(0.25 0 0)", flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* Anonymous visitor drawer */}
        {selectedAnonSession !== null && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }} onClick={() => setSelectedAnonSession(null)}>
            <div
              style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "12px 0 0 12px", width: "min(420px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem", boxShadow: "-8px 0 40px oklch(0 0 0 / 60%)" }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)" }}>ANONYMOUS VISITOR</div>
                <button onClick={() => setSelectedAnonSession(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(0.45 0 0)", padding: "0.25rem" }}><X size={18} /></button>
              </div>
              <div style={{ background: "oklch(0.09 0 0)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", border: "1px solid oklch(1 0 0 / 8%)" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.35 0 0)", marginBottom: "0.6rem" }}>Session Data</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  {[
                    { label: "IP Address", value: selectedAnonSession.ipAddress || "—" },
                    { label: "Location", value: [selectedAnonSession.city, selectedAnonSession.region].filter(Boolean).join(", ") || selectedAnonSession.country || "Unknown" },
                    { label: "Country", value: selectedAnonSession.country || "—" },
                    { label: "Timezone", value: selectedAnonSession.timezone || "—" },
                    { label: "Language", value: selectedAnonSession.browserLanguage || "—" },
                    { label: "Device", value: selectedAnonSession.deviceType || "desktop" },
                    { label: "Current Page", value: selectedAnonSession.path || "/" },
                    { label: "Pages Viewed", value: selectedAnonSession.pageCount?.toString() || "1" },
                    { label: "Referrer", value: selectedAnonSession.referrer ? (() => { try { return new URL(selectedAnonSession.referrer).hostname.replace('www.',''); } catch { return selectedAnonSession.referrer; } })() : "Direct" },
                    { label: "First Seen", value: selectedAnonSession.firstSeen ? new Date(selectedAnonSession.firstSeen).toLocaleTimeString() : "—" },
                    { label: "Last Seen", value: selectedAnonSession.lastSeen ? new Date(selectedAnonSession.lastSeen).toLocaleTimeString() : "—" },
                    { label: "Session ID", value: selectedAnonSession.sessionId?.slice(0, 12) + "..." || "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.15rem" }}>{label}</div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00f5ff", wordBreak: "break-all" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.30 0 0)", textAlign: "center", padding: "0.5rem" }}>Not logged in — no account data available</div>
            </div>
          </div>
        )}

        {/* User profile drawer */}
        {selectedVisitorUserId !== null && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }} onClick={() => setSelectedVisitorUserId(null)}>
            <div
              style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "12px 0 0 12px", width: "min(420px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem", boxShadow: "-8px 0 40px oklch(0 0 0 / 60%)" }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)" }}>VISITOR PROFILE</div>
                <button onClick={() => { setSelectedVisitorUserId(null); setSelectedVisitorSession(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(0.45 0 0)", padding: "0.25rem" }}><X size={18} /></button>
              </div>
              {!selectedUserProfile ? (
                <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", textAlign: "center", padding: "2rem" }}>Loading...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {/* Live session info */}
                  {selectedVisitorSession && (
                    <div style={{ background: "oklch(0.09 0 0)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", border: "1px solid oklch(1 0 0 / 8%)" }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "oklch(0.35 0 0)", marginBottom: "0.6rem" }}>Live Session</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        {[
                          { label: "IP Address", value: selectedVisitorSession.ipAddress || "—" },
                          { label: "Location", value: [selectedVisitorSession.city, selectedVisitorSession.region, selectedVisitorSession.country].filter(Boolean).join(", ") || "Unknown" },
                          { label: "Device", value: selectedVisitorSession.deviceType || "desktop" },
                          { label: "Current Page", value: selectedVisitorSession.path || "/" },
                          { label: "First Seen", value: selectedVisitorSession.firstSeen ? new Date(selectedVisitorSession.firstSeen).toLocaleTimeString() : "—" },
                          { label: "Last Seen", value: selectedVisitorSession.lastSeen ? new Date(selectedVisitorSession.lastSeen).toLocaleTimeString() : "—" },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.35 0 0)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.15rem" }}>{label}</div>
                            <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#00f5ff", wordBreak: "break-all" }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Account info */}
                  {[
                    { label: "Name", value: selectedUserProfile.name || "—" },
                    { label: "Nickname", value: selectedUserProfile.nickname || "—" },
                    { label: "Email", value: selectedUserProfile.email || "—" },
                    { label: "Phone", value: selectedUserProfile.phone || "—" },
                    { label: "Wallet", value: selectedUserProfile.walletAddress ? selectedUserProfile.walletAddress.slice(0, 12) + "..." : "—" },
                    { label: "Loyalty Tier", value: selectedUserProfile.loyaltyTier || "—" },
                    { label: "Points", value: selectedUserProfile.loyaltyPoints?.toString() ?? "0" },
                    { label: "Orders", value: selectedUserProfile.orderCount?.toString() ?? "0" },
                    { label: "Total Spent", value: selectedUserProfile.totalSpend != null ? `$${Number(selectedUserProfile.totalSpend).toFixed(2)}` : "$0.00" },
                    { label: "Member Since", value: selectedUserProfile.createdAt ? new Date(selectedUserProfile.createdAt).toLocaleDateString() : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", padding: "0.5rem 0", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.40 0 0)", letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.80 0 0)", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
                    </div>
                  ))}

                  {/* Admin Actions */}
                  <VisitorAdminActions
                    userId={selectedVisitorUserId!}
                    isWholesale={!!selectedUserProfile.isWholesale}
                    onClose={() => { setSelectedVisitorUserId(null); setSelectedVisitorSession(null); }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visitor stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <StatCard icon={<Users size={18} />} label="Visitors Today" value={vsLoading ? "—" : (visitorStats?.today ?? 0)} />
          <StatCard icon={<Users size={18} />} label="Visitors This Week" value={vsLoading ? "—" : (visitorStats?.week ?? 0)} />
          <StatCard icon={<Users size={18} />} label="Visitors This Month" value={vsLoading ? "—" : (visitorStats?.month ?? 0)} />
          <StatCard icon={<TrendingUp size={18} />} label="Total Page Views" value={vsLoading ? "—" : (visitorStats?.totalPageViews ?? 0)} />
          <StatCard icon={<ShoppingCart size={18} />} label="Active Carts" value={activeCartsStats?.total ?? 0} sub={`$${(activeCartsStats?.totalValue ?? 0).toFixed(2)} total value`} />
        </div>

        {/* Visitor chart — last 30 days */}
        {dailyVisitors && dailyVisitors.length > 1 && (() => {
          const visPoints = dailyVisitors.map((d: { date: string; visitors: number; pageViews: number }) => d.visitors);
          const maxVis = Math.max(...visPoints, 1);
          const W = 400; const H = 70;
          const step = W / Math.max(visPoints.length - 1, 1);
          const path = visPoints.map((v: number, i: number) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(H - (v / maxVis) * H * 0.9).toFixed(1)}`).join(" ");
          return (
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>UNIQUE VISITORS / DAY (LAST 30 DAYS)</div>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: `${H}px`, overflow: "visible" }}>
                <defs>
                  <linearGradient id="vis-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00e5a0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#vis-grad)" />
                <path d={path} fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>{dailyVisitors[0]?.date}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>{dailyVisitors[dailyVisitors.length - 1]?.date}</span>
              </div>
            </div>
          );
        })()}

        {/* Top pages table */}
        {topPages && topPages.length > 0 && (
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>TOP PAGES (LAST 30 DAYS)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {topPages.slice(0, 10).map((p: { path: string; views: number; uniqueVisitors: number }, i: number) => (
                <div key={p.path} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.8rem", color: "oklch(0.30 0 0)", width: "18px", flexShrink: 0 }}>#{i + 1}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "oklch(0.70 0 0)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.path}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.45 0 0)", flexShrink: 0 }}>{p.uniqueVisitors} uniq</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", color: "#00e5a0", flexShrink: 0 }}>{p.views}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referrers table */}
        {topReferrers && topReferrers.length > 0 && (
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>TOP REFERRERS (LAST 30 DAYS)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {topReferrers.slice(0, 10).map((r: { referrer: string; visits: number; sessions: number }, i: number) => {
                const maxVisits = topReferrers[0]?.visits ?? 1;
                const pct = (r.visits / maxVisits) * 100;
                const isDirect = r.referrer === '(direct)';
                const domain = isDirect ? '(direct / none)' : (() => { try { return new URL(r.referrer).hostname.replace('www.', ''); } catch { return r.referrer; } })();
                return (
                  <div key={r.referrer}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.2rem" }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.75rem", color: "oklch(0.30 0 0)", width: "18px", flexShrink: 0 }}>#{i + 1}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.68rem", color: isDirect ? "oklch(0.45 0 0)" : "oklch(0.70 0 0)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{domain}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.40 0 0)", flexShrink: 0 }}>{r.sessions} sessions</span>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", color: "#00f5ff", flexShrink: 0 }}>{r.visits}</span>
                    </div>
                    <div style={{ height: "2px", background: "oklch(0.10 0 0)", borderRadius: "1px", marginLeft: "26px" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#00f5ff44", borderRadius: "1px", transition: "width 400ms ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New Users stats */}
        {newUsers && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <StatCard icon={<Users size={18} />} label="New Users Today" value={newUsers.today} />
            <StatCard icon={<Users size={18} />} label="New Users This Week" value={newUsers.week} />
            <StatCard icon={<Users size={18} />} label="New Users This Month" value={newUsers.month} />
            <StatCard icon={<Users size={18} />} label="Total Registered Users" value={newUsers.allTime} />
          </div>
        )}

        {/* Hourly traffic heatmap */}
        {hourlyTraffic && hourlyTraffic.length > 0 && (() => {
          const maxV = Math.max(...hourlyTraffic.map((h: { hour: number; views: number; visitors: number }) => h.views), 1);
          const allHours = Array.from({ length: 24 }, (_, i) => {
            const found = hourlyTraffic.find((h: { hour: number; views: number; visitors: number }) => h.hour === i);
            return found ?? { hour: i, views: 0, visitors: 0 };
          });
          return (
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>TRAFFIC BY HOUR (LAST 7 DAYS)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: "2px" }}>
                {allHours.map((h: { hour: number; views: number; visitors: number }) => {
                  const intensity = h.views / maxV;
                  const bg = intensity > 0
                    ? `oklch(${0.35 + intensity * 0.45} ${0.15 + intensity * 0.15} 295)`
                    : "oklch(0.09 0 0)";
                  return (
                    <div
                      key={h.hour}
                      title={`${h.hour}:00 — ${h.views} views, ${h.visitors} visitors`}
                      style={{ height: "32px", background: bg, borderRadius: "3px", cursor: "default", transition: "background 200ms" }}
                    />
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.30 0 0)" }}>12am</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.30 0 0)" }}>6am</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.30 0 0)" }}>12pm</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.30 0 0)" }}>6pm</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", color: "oklch(0.30 0 0)" }}>11pm</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ═══ REVENUE SECTION ═══ */}
      <div style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)", paddingBottom: "1.5rem" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", color: "oklch(0.50 0 0)", marginBottom: "1rem" }}>REVENUE</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <StatCard icon={<DollarSign size={18} />} label="Revenue Today" value={`$${(revenueStats?.today ?? 0).toFixed(2)}`} />
          <StatCard icon={<DollarSign size={18} />} label="Revenue This Week" value={`$${(revenueStats?.week ?? 0).toFixed(2)}`} />
          <StatCard icon={<DollarSign size={18} />} label="Revenue This Month" value={`$${(revenueStats?.month ?? 0).toFixed(2)}`} />
          <StatCard icon={<DollarSign size={18} />} label="All-Time Revenue" value={`$${(revenueStats?.allTime ?? 0).toFixed(2)}`} />
        </div>
        {/* Daily revenue chart */}
        {dailyRevenue && dailyRevenue.length > 1 && (() => {
          const revPts = dailyRevenue.map((d: { date: string; revenue: number; orders: number }) => d.revenue);
          const maxR = Math.max(...revPts, 1);
          const W = 400; const H = 70;
          const step = W / Math.max(revPts.length - 1, 1);
          const path = revPts.map((v: number, i: number) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(H - (v / maxR) * H * 0.9).toFixed(1)}`).join(" ");
          return (
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem 1.5rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>DAILY REVENUE (LAST 30 DAYS)</div>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: `${H}px`, overflow: "visible" }}>
                <defs>
                  <linearGradient id="rev2-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bf5fff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#bf5fff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#rev2-grad)" />
                <path d={path} fill="none" stroke="#bf5fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>{dailyRevenue[0]?.date}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>{dailyRevenue[dailyRevenue.length - 1]?.date}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ═══ ORDER FUNNEL ═══ */}
      {orderFunnel && orderFunnel.length > 0 && (
        <div style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)", paddingBottom: "1.5rem" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", color: "oklch(0.50 0 0)", marginBottom: "1rem" }}>ORDER FUNNEL</div>
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem 1.5rem" }}>
            {(() => {
              const STATUS_COLORS: Record<string, string> = { pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6", shipped: "#06b6d4", delivered: "#22c55e", cancelled: "#ef4444", refunded: "#6b7280" };
              const total = orderFunnel.reduce((s: number, r: { status: string; count: number }) => s + r.count, 0);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {orderFunnel.map((r: { status: string; count: number }) => {
                    const pct = total ? (r.count / total) * 100 : 0;
                    const color = STATUS_COLORS[r.status] ?? "#64748b";
                    return (
                      <div key={r.status}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color, textTransform: "capitalize" }}>{r.status}</span>
                          <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "oklch(0.50 0 0)" }}>{r.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ height: "4px", background: "oklch(0.10 0 0)", borderRadius: "2px" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width 400ms ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ ORDER ANALYTICS (existing) ═══ */}
      <div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", color: "oklch(0.50 0 0)", marginBottom: "1rem" }}>ORDER ANALYTICS</div>
      {ordersLoading ? (
        <div style={{ color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center" }}>Loading analytics...</div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            <StatCard icon={<DollarSign size={18} />} label={`Revenue (${days}d)`} value={`$${(data?.totalRevenue ?? 0).toFixed(2)}`} />
            <StatCard icon={<ShoppingBag size={18} />} label={`Orders (${days}d)`} value={data?.totalOrders ?? 0} />
            <StatCard icon={<TrendingUp size={18} />} label="Avg Order Value" value={`$${(data?.avgOrderValue ?? 0).toFixed(2)}`} />
            <StatCard icon={<Mail size={18} />} label="Email Captures" value={(data as any)?.emailCaptures ?? 0} />
            <StatCard icon={<Heart size={18} />} label="Wishlist Adds" value={(data as any)?.wishlistAdds ?? 0} />
            <StatCard icon={<Star size={18} />} label="Reviews" value={(data as any)?.reviewsSubmitted ?? 0} />
          </div>

          {/* Engagement row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            <StatCard icon={<Award size={18} />} label="Loyalty Pts Earned" value={(data as any)?.loyaltyPointsEarned ?? 0} />
            <StatCard icon={<Users size={18} />} label="Referrals Created" value={(data as any)?.referralsCreated ?? 0} />
            <StatCard icon={<TrendingUp size={18} />} label="Conversion Rate" value={`${(data as any)?.conversionRate ?? 0}%`} />
          </div>

          {/* Revenue chart */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.5rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "1rem" }}>REVENUE / DAY</div>
            <svg viewBox={`0 0 400 80`} style={{ width: "100%", height: "80px", overflow: "visible" }}>
              <defs>
                <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bf5fff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#bf5fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {revPoints.length > 1 && (
                <>
                  <path d={`${sparkline(revPoints)} L ${(400).toFixed(1)} 80 L 0 80 Z`} fill="url(#rev-grad)" />
                  <path d={sparkline(revPoints)} fill="none" stroke="#bf5fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
            {/* X-axis labels — first and last */}
            {data && data.revenueByDay.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>{data.revenueByDay[0]?.date}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>{data.revenueByDay[data.revenueByDay.length - 1]?.date}</span>
              </div>
            )}
          </div>

          {/* Orders chart */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.5rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "1rem" }}>ORDERS / DAY</div>
            <svg viewBox="0 0 400 80" style={{ width: "100%", height: "80px", overflow: "visible" }}>
              <defs>
                <linearGradient id="ord-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {ordPoints.length > 1 && (
                <>
                  <path d={`${sparkline(ordPoints)} L 400 80 L 0 80 Z`} fill="url(#ord-grad)" />
                  <path d={sparkline(ordPoints)} fill="none" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
            {data && data.ordersByDay.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>{data.ordersByDay[0]?.date}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "oklch(0.30 0 0)" }}>{data.ordersByDay[data.ordersByDay.length - 1]?.date}</span>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Order status breakdown */}
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "1rem" }}>ORDERS BY STATUS</div>
              {Object.entries(data?.statusCounts ?? {}).length === 0 ? (
                <div style={{ color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}>No orders in period</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {Object.entries(data?.statusCounts ?? {}).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                    const total = Object.values(data?.statusCounts ?? {}).reduce((s, v) => s + v, 0);
                    const pct = total ? (count / total) * 100 : 0;
                    return (
                      <div key={status}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: STATUS_COLORS[status] ?? "oklch(0.60 0 0)", textTransform: "capitalize" }}>{status}</span>
                          <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "oklch(0.50 0 0)" }}>{count}</span>
                        </div>
                        <div style={{ height: "4px", background: "oklch(0.10 0 0)", borderRadius: "2px" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: STATUS_COLORS[status] ?? "#64748b", borderRadius: "2px", transition: "width 400ms ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top products */}
            <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "1rem" }}>TOP PRODUCTS</div>
              {!data?.topProducts.length ? (
                <div style={{ color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}>No sales data yet</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {data.topProducts.map((p, i) => (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", color: "oklch(0.30 0 0)", width: "16px", flexShrink: 0 }}>#{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.80 0 0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.40 0 0)" }}>{p.units} units</div>
                      </div>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", color: "#bf5fff", flexShrink: 0 }}>${p.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      </div>

      {/* ═══ CUSTOMER INTELLIGENCE ═══ */}
      <div style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)", paddingBottom: "1.5rem", marginTop: "1.5rem" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.15em", color: "oklch(0.50 0 0)", marginBottom: "1rem" }}>CUSTOMER INTELLIGENCE</div>

        {/* Key metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <StatCard icon={<TrendingUp size={18} />} label="Conversion Rate" value={`${conversionRate?.rate ?? 0}%`} sub={`${conversionRate?.orders ?? 0} orders / ${conversionRate?.sessions ?? 0} sessions`} />
          <StatCard icon={<ShoppingCart size={18} />} label="Cart Abandonment" value={`${cartAbandonmentRate?.rate ?? 0}%`} sub={`${cartAbandonmentRate?.carts ?? 0} abandoned`} />
          <StatCard icon={<Users size={18} />} label="Repeat Customer Rate" value={`${repeatCustomerRate?.rate ?? 0}%`} sub={`${repeatCustomerRate?.repeat ?? 0} repeat buyers`} />
          <StatCard icon={<TrendingUp size={18} />} label="Avg Session Duration" value={avgSessionDuration ? (avgSessionDuration.avgSeconds < 60 ? `${avgSessionDuration.avgSeconds}s` : `${Math.floor(avgSessionDuration.avgSeconds / 60)}m ${avgSessionDuration.avgSeconds % 60}s`) : "—"} />
          <StatCard icon={<Users size={18} />} label="New Visitors" value={newVsReturning?.newVisitors ?? 0} sub={`${newVsReturning?.returning ?? 0} returning`} />
        </div>

        {/* Device breakdown + Location breakdown side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          {/* Device breakdown */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>DEVICE BREAKDOWN</div>
            {!deviceBreakdown?.length ? (
              <div style={{ color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}>No data yet</div>
            ) : (() => {
              const total = deviceBreakdown.reduce((s: number, d: any) => s + d.visitors, 0);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {deviceBreakdown.map((d: any) => {
                    const pct = total ? (d.visitors / total) * 100 : 0;
                    const icon = d.device === "mobile" ? "📱" : d.device === "tablet" ? "⬛" : "🖥";
                    const color = d.device === "mobile" ? "#00f5ff" : d.device === "tablet" ? "#00e5a0" : "#bf5fff";
                    return (
                      <div key={d.device}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.70 0 0)" }}>{icon} {d.device}</span>
                          <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "oklch(0.50 0 0)" }}>{d.visitors} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div style={{ height: "4px", background: "oklch(0.10 0 0)", borderRadius: "2px" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width 400ms ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Location breakdown by state */}
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem", maxHeight: "260px", overflowY: "auto" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>VISITORS BY STATE</div>
            {!locationBreakdown?.length ? (
              <div style={{ color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}>No location data yet — visitors need to heartbeat first</div>
            ) : (() => {
              const maxV = Math.max(...locationBreakdown.map((l: any) => l.visitors), 1);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {locationBreakdown.map((l: any) => (
                    <div key={l.state}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.70 0 0)" }}>{l.state}{l.country && l.country !== "United States" ? `, ${l.country}` : ""}</span>
                        <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "oklch(0.50 0 0)" }}>{l.visitors}</span>
                      </div>
                      <div style={{ height: "3px", background: "oklch(0.10 0 0)", borderRadius: "2px" }}>
                        <div style={{ height: "100%", width: `${(l.visitors / maxV) * 100}%`, background: "#00e5a0", borderRadius: "2px", transition: "width 400ms ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Top pages + Top exit pages side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem", maxHeight: "280px", overflowY: "auto" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>TOP PAGES (30 DAYS)</div>
            {!topPages?.length ? (
              <div style={{ color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}>No data yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {topPages.map((p: any, i: number) => (
                  <div key={p.path} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.75rem", color: "oklch(0.30 0 0)", width: "16px", flexShrink: 0 }}>#{i + 1}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "oklch(0.60 0 0)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.path}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#00e5a0", flexShrink: 0 }}>{p.uniqueVisitors}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", padding: "1.25rem", maxHeight: "280px", overflowY: "auto" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em", color: "oklch(0.75 0 0)", marginBottom: "0.75rem" }}>MOST VISITED PAGES (EXIT PROXY)</div>
            {!topExitPages?.length ? (
              <div style={{ color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}>No data yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {topExitPages.map((p: any, i: number) => (
                  <div key={p.path} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.75rem", color: "oklch(0.30 0 0)", width: "16px", flexShrink: 0 }}>#{i + 1}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "oklch(0.60 0 0)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.path}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: "#ff6b6b", flexShrink: 0 }}>{p.exits}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}


// ─── Abandoned Carts Tab ─────────────────────────────────────────────────────
function AbandonedCartsTab() {
  const { data: carts, isLoading, refetch } = trpc.abandonedCarts.adminList.useQuery();
  const sendRecovery = trpc.abandonedCarts.sendRecoveryEmail.useMutation({
    onSuccess: () => { refetch(); },
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>ABANDONED CARTS</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)", marginTop: "0.25rem" }}>Carts abandoned for more than 1 hour without completing checkout.</p>
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "#bf5fff" }}>{carts?.length ?? 0} OPEN</div>
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem", textAlign: "center" }}>Loading...</div>
      ) : !carts?.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          No abandoned carts. Great job!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {carts.map((cart: any) => (
            <div key={cart.id} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.85 0 0)", fontWeight: 500 }}>{cart.email}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", marginTop: "0.2rem" }}>
                  {cart.itemCount ?? "?"} item(s) · ${cart.totalValue ?? "0.00"} · Abandoned {new Date(cart.updatedAt).toLocaleString()}
                </div>
                {cart.recoveryEmailSentAt && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "#22c55e", marginTop: "0.2rem" }}>
                    ✓ Recovery email sent {new Date(cart.recoveryEmailSentAt).toLocaleString()}
                  </div>
                )}
              </div>
              <button
                onClick={() => sendRecovery.mutate({ cartId: cart.id })}
                disabled={!!cart.recoveryEmailSentAt || sendRecovery.isPending}
                style={{
                  background: cart.recoveryEmailSentAt ? "oklch(0.10 0 0)" : "oklch(0.12 0.04 290)",
                  border: `1px solid ${cart.recoveryEmailSentAt ? "oklch(1 0 0 / 8%)" : "#bf5fff44"}`,
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: cart.recoveryEmailSentAt ? "oklch(0.35 0 0)" : "#bf5fff",
                  cursor: cart.recoveryEmailSentAt ? "default" : "pointer",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                  whiteSpace: "nowrap" as const,
                }}
              >
                {cart.recoveryEmailSentAt ? "Email Sent" : "Send Recovery Email"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Affiliate Credits Tab ───────────────────────────────────────────────────
function AffiliatesPayoutTab() {
  const { data: affiliateList, isLoading, refetch } = trpc.affiliates.adminList.useQuery();
  const approveConversion = trpc.affiliates.adminApproveConversion.useMutation({ onSuccess: () => refetch() });
  const markPaid = trpc.affiliates.adminMarkPaid.useMutation({ onSuccess: () => refetch() });
  const updateCommission = trpc.affiliates.adminUpdateCommission.useMutation({ onSuccess: () => refetch() });
  const setStatus = trpc.affiliates.adminSetStatus.useMutation({ onSuccess: () => refetch() });
  const markAllPaid = trpc.affiliates.adminMarkAllPaid.useMutation({ onSuccess: () => { refetch(); toast.success("All approved conversions marked as paid."); } });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editCommission, setEditCommission] = useState<{ id: number; value: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const utils = trpc.useUtils();

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const result = await utils.affiliates.adminExportPayoutCsv.fetch();
      if (!result?.csv || result.count === 0) { toast.error("No approved conversions to export."); return; }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `affiliate-payouts-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.count} conversion${result.count !== 1 ? "s" : ""} ($${(result.totalCents / 100).toFixed(2)} total).`);
    } catch (err: any) {
      toast.error(err?.message ?? "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>AFFILIATE CREDIT TRACKING</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)", marginTop: "0.25rem" }}>Manage affiliates, approve conversions, and mark commissions as site credit issued.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "6px", padding: "0.5rem 1rem", color: "oklch(0.75 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: exporting ? "not-allowed" : "pointer", opacity: exporting ? 0.6 : 1 }}
          >
            <Download size={13} />{exporting ? "Exporting..." : "Export CSV"}
          </button>
          <button
            onClick={() => { if (confirm("Mark ALL approved conversions as paid? This cannot be undone.")) markAllPaid.mutate(); }}
            disabled={markAllPaid.isPending}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#22c55e22", border: "1px solid #22c55e44", borderRadius: "6px", padding: "0.5rem 1rem", color: "#22c55e", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: markAllPaid.isPending ? "not-allowed" : "pointer", opacity: markAllPaid.isPending ? 0.6 : 1 }}
          >
            <CheckCircle size={13} />Mark All Paid
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem", textAlign: "center" }}>Loading...</div>
      ) : !affiliateList?.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          No affiliates yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {affiliateList.map((aff: any) => (
            <div key={aff.id} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", overflow: "hidden" }}>
              <div
                style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", cursor: "pointer" }}
                onClick={() => setExpandedId(expandedId === aff.id ? null : aff.id)}
              >
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.90 0 0)", fontWeight: 500 }}>{aff.userName ?? "Unknown"}</div>
                    <StatusBadge status={aff.status} />
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.75rem", color: "#bf5fff", background: "#bf5fff22", border: "1px solid #bf5fff33", borderRadius: "4px", padding: "0.1rem 0.4rem", letterSpacing: "0.1em" }}>{aff.affiliateCode}</span>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", marginTop: "0.2rem" }}>
                    {aff.userEmail} · Commission: {aff.commissionPercent}%
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#00e5a0" }}>${((aff.totalEarnedCents ?? 0) / 100).toFixed(2)}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Earned</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#f59e0b" }}>${((aff.totalPaidCents ?? 0) / 100).toFixed(2)}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Credited</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#bf5fff" }}>${(((aff.totalEarnedCents ?? 0) - (aff.totalPaidCents ?? 0)) / 100).toFixed(2)}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pending</div>
                  </div>
                  <ChevronDown size={16} style={{ color: "oklch(0.40 0 0)", transform: expandedId === aff.id ? "rotate(180deg)" : "none", transition: "transform 200ms ease", flexShrink: 0 }} />
                </div>
              </div>

              {expandedId === aff.id && (
                <div style={{ borderTop: "1px solid oklch(1 0 0 / 8%)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.45 0 0)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Commission %:</span>
                      {editCommission?.id === aff.id ? (
                        <>
                          <input
                            value={editCommission!.value}
                            onChange={e => setEditCommission({ id: aff.id, value: e.target.value })}
                            style={{ background: "oklch(0.10 0 0)", border: "1px solid #bf5fff44", borderRadius: "4px", padding: "0.25rem 0.5rem", color: "oklch(0.85 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", width: "60px", outline: "none" }}
                          />
                          <button
                            onClick={() => { updateCommission.mutate({ affiliateId: aff.id, commissionPercent: editCommission!.value }); setEditCommission(null); }}
                            style={{ background: "#bf5fff22", border: "1px solid #bf5fff44", borderRadius: "4px", padding: "0.25rem 0.6rem", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}
                          >Save</button>
                          <button
                            onClick={() => setEditCommission(null)}
                            style={{ background: "none", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "4px", padding: "0.25rem 0.6rem", color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}
                          >Cancel</button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditCommission({ id: aff.id, value: aff.commissionPercent })}
                          style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "4px", padding: "0.25rem 0.6rem", color: "oklch(0.60 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}
                        >{aff.commissionPercent}% — Edit</button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {aff.status !== "active" && (
                        <button onClick={() => setStatus.mutate({ affiliateId: aff.id, status: "active" })} style={{ background: "#22c55e22", border: "1px solid #22c55e44", borderRadius: "4px", padding: "0.3rem 0.75rem", color: "#22c55e", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer", fontWeight: 600 }}>Activate</button>
                      )}
                      {aff.status !== "paused" && (
                        <button onClick={() => setStatus.mutate({ affiliateId: aff.id, status: "paused" })} style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "4px", padding: "0.3rem 0.75rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}>Pause</button>
                      )}
                      {aff.status !== "terminated" && (
                        <button onClick={() => setStatus.mutate({ affiliateId: aff.id, status: "terminated" })} style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: "4px", padding: "0.3rem 0.75rem", color: "#ef4444", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer" }}>Terminate</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
// ─── Product Q&A Tab ─────────────────────────────────────────────────────────
function ProductQATab() {
  const [filter, setFilter] = useState<"unanswered" | "answered" | "all">("unanswered");
  const { data: questions, isLoading, refetch } = trpc.productQA.adminList.useQuery(
    filter === "unanswered" ? { answered: false } : filter === "answered" ? { answered: true } : {}
  );
  const answerMutation = trpc.productQA.answer.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = trpc.productQA.delete.useMutation({ onSuccess: () => refetch() });
  const togglePublishMutation = trpc.productQA.togglePublish.useMutation({ onSuccess: () => refetch() });

  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <MessageCircle size={18} style={{ color: "#bf5fff" }} />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: "oklch(0.90 0 0)" }}>PRODUCT Q&amp;A MODERATION</span>
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        Answer customer questions from product pages. Published answers appear publicly on the product page.
      </p>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["unanswered", "answered", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "0.4rem 1rem", borderRadius: "4px", border: "1px solid oklch(1 0 0 / 12%)", background: filter === f ? "#bf5fff" : "transparent", color: filter === f ? "#fff" : "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, textTransform: "capitalize", cursor: "pointer" }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem 0" }}>Loading...</div>
      ) : !questions || questions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed oklch(1 0 0 / 10%)", borderRadius: "8px" }}>
          <MessageCircle size={32} style={{ color: "oklch(0.25 0 0)", marginBottom: "1rem" }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.1em", color: "oklch(0.30 0 0)" }}>NO QUESTIONS YET</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.30 0 0)", marginTop: "0.5rem" }}>Customer questions from product pages will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {questions.map((q: any) => (
            <div key={q.id} style={{ background: "oklch(0.06 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)", marginBottom: "0.3rem" }}>
                      {q.productName} · Asked by {q.askerName ?? q.askerEmail} · {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "oklch(0.85 0 0)", marginBottom: q.answer ? "0.75rem" : 0, lineHeight: 1.5 }}>
                      <span style={{ color: "#bf5fff", fontWeight: 700, marginRight: "0.4rem" }}>Q:</span>{q.question}
                    </div>
                    {q.answer && (
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.60 0 0)", lineHeight: 1.5 }}>
                        <span style={{ color: "#00e5a0", fontWeight: 700, marginRight: "0.4rem" }}>A:</span>{q.answer}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                    {q.answer ? (
                      <button
                        onClick={() => togglePublishMutation.mutate({ id: q.id, isPublished: !q.isPublished })}
                        style={{ background: q.isPublished ? "#00e5a022" : "oklch(0.09 0 0)", border: `1px solid ${q.isPublished ? "#00e5a044" : "oklch(1 0 0 / 12%)"}`, borderRadius: "4px", padding: "0.4rem 0.9rem", color: q.isPublished ? "#00e5a0" : "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                        {q.isPublished ? "✓ Published" : "Unpublished"}
                      </button>
                    ) : null}
                    <button
                      onClick={() => { setAnsweringId(q.id); setAnswerDraft(q.answer ?? ""); }}
                      style={{ background: "#bf5fff22", border: "1px solid #bf5fff44", borderRadius: "4px", padding: "0.4rem 0.9rem", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                      {q.answer ? "Edit Answer" : "Answer"}
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this question?")) deleteMutation.mutate({ id: q.id }); }}
                      style={{ background: "none", border: "1px solid #ff444433", borderRadius: "4px", padding: "0.4rem 0.9rem", color: "#ff4444", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Answer form */}
                {answeringId === q.id && (
                  <div style={{ marginTop: "1rem", borderTop: "1px solid oklch(1 0 0 / 8%)", paddingTop: "1rem" }}>
                    <textarea
                      value={answerDraft}
                      onChange={e => setAnswerDraft(e.target.value)}
                      rows={3}
                      placeholder="Write your answer..."
                      style={{ width: "100%", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.7rem 0.9rem", color: "oklch(0.85 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: "0.75rem" }}
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => answerMutation.mutate({ id: q.id, answer: answerDraft, publish: true }, { onSuccess: () => setAnsweringId(null) })}
                        disabled={answerDraft.trim().length < 1 || answerMutation.isPending}
                        style={{ background: "#00e5a0", color: "#000", border: "none", borderRadius: "4px", padding: "0.5rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                        Save &amp; Publish
                      </button>
                      <button
                        onClick={() => answerMutation.mutate({ id: q.id, answer: answerDraft, publish: false }, { onSuccess: () => setAnsweringId(null) })}
                        disabled={answerDraft.trim().length < 1 || answerMutation.isPending}
                        style={{ background: "oklch(0.09 0 0)", color: "oklch(0.55 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.5rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer" }}>
                        Save (Unpublished)
                      </button>
                      <button onClick={() => setAnsweringId(null)} style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.5rem 0.75rem", color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Referrals Tab ───────────────────────────────────────────────────────────
function ReferralsTab() {
  const { data: referralList, isLoading } = trpc.referrals.adminGetAll.useQuery();
  const { data: stats } = trpc.referrals.adminStats.useQuery();

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>REFERRAL COMMISSION TRACKING</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)", marginTop: "0.25rem" }}>Track who referred whom, referral codes, conversions, and rewards issued.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard icon={<UserPlus size={18} />} label="Total Referrals" value={stats.total} />
          <StatCard icon={<Link2 size={18} />} label="Converted" value={stats.converted} />
          <StatCard icon={<CheckCircle size={18} />} label="Rewarded" value={stats.rewarded} />
          <StatCard icon={<DollarSign size={18} />} label="Total Rewards" value={`$${((stats.totalRewardCents ?? 0) / 100).toFixed(2)}`} />
        </div>
      )}

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem", textAlign: "center" }}>Loading...</div>
      ) : !referralList?.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          No referrals yet. Share referral links to start tracking.
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
            <thead>
              <tr style={{ background: "oklch(0.07 0 0)", borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
                {["Referrer", "Code", "Referred User", "Status", "Reward", "Date"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referralList.map((ref, i) => (
                <tr key={ref.id} style={{ borderBottom: i < referralList.length - 1 ? "1px solid oklch(1 0 0 / 5%)" : "none" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.85 0 0)", fontWeight: 500 }}>{ref.referrerName ?? `User #${ref.referrerId}`}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>{ref.referrerEmail ?? ""}</div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.75rem", color: "#bf5fff", background: "#bf5fff22", border: "1px solid #bf5fff33", borderRadius: "4px", padding: "0.1rem 0.5rem", letterSpacing: "0.1em" }}>{ref.referralCode}</span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.60 0 0)" }}>
                    {ref.referredUserId ? `User #${ref.referredUserId}` : <span style={{ color: "oklch(0.30 0 0)" }}>—</span>}
                    {ref.orderId && <span style={{ color: "oklch(0.40 0 0)", fontSize: "0.62rem", display: "block" }}>Order #{ref.orderId}</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}><StatusBadge status={ref.status} /></td>
                  <td style={{ padding: "0.75rem 1rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", color: ref.status === "rewarded" ? "#00e5a0" : "oklch(0.40 0 0)" }}>
                    ${(ref.rewardCents / 100).toFixed(2)}
                    {ref.rewardIssuedAt && <span style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)" }}>{new Date(ref.rewardIssuedAt).toLocaleDateString()}</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.40 0 0)" }}>{new Date(ref.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Email Theme Templates ───────────────────────────────────────────────────
const EMAIL_THEMES = [
  {
    id: "dark",
    label: "Dark Luxury",
    bg: "#0a0a0a",
    accent: "#bf5fff",
    preview: "#0a0a0a",
    template: (subject: string) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Animated GIF Header -->
        <tr><td style="padding:0;line-height:0;">
          <img src="https://www.luxurioushabbits.com/manus-storage/email_header_animated_33d37710.gif" width="600" alt="LUXURIOUS HABBITS" style="display:block;width:100%;max-width:600px;border:0;" />
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#111;padding:48px 40px;">
          <h1 style="font-family:'Arial Black',sans-serif;font-size:28px;letter-spacing:0.08em;color:#f0f0f0;text-transform:uppercase;margin:0 0 16px;">${subject || 'YOUR HEADLINE HERE'}</h1>
          <p style="font-size:15px;color:#888;line-height:1.8;margin:0 0 24px;">Write your message here. Keep it concise, on-brand, and valuable to your subscribers.</p>
          <p style="font-size:15px;color:#888;line-height:1.8;margin:0 0 32px;">Add a second paragraph with more details, a special offer, or a product highlight.</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#bf5fff;border-radius:4px;">
            <a href="https://luxurioushabbits.com/products" style="display:inline-block;padding:14px 32px;color:#fff;font-family:'Arial Black',sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">SHOP NOW</a>
          </td></tr></table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0a0a0a;border-top:1px solid #1a1a1a;padding:24px 40px;text-align:center;">
          <p style="font-size:10px;color:#444;letter-spacing:0.08em;margin:0 0 8px;">© 2025 LUXURIOUS HABBITS LLC · PREMIUM HEMP · 21+</p>
          <p style="font-size:10px;color:#333;margin:0;">2018 Farm Bill Compliant · <a href="https://luxurioushabbits.com/unsubscribe" style="color:#555;text-decoration:underline;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "purple",
    label: "Purple Glow",
    bg: "#0d0a14",
    accent: "#bf5fff",
    preview: "#0d0a14",
    template: (subject: string) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0a14;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a14;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Animated GIF Header -->
        <tr><td style="padding:0;line-height:0;">
          <img src="https://www.luxurioushabbits.com/manus-storage/email_header_animated_33d37710.gif" width="600" alt="LUXURIOUS HABBITS" style="display:block;width:100%;max-width:600px;border:0;" />
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#110d1a;border:1px solid #bf5fff22;border-top:none;padding:48px 40px;">
          <h1 style="font-family:'Arial Black',sans-serif;font-size:28px;letter-spacing:0.08em;color:#f0f0f0;text-transform:uppercase;margin:0 0 16px;">${subject || 'YOUR HEADLINE HERE'}</h1>
          <div style="width:48px;height:2px;background:linear-gradient(90deg,#bf5fff,transparent);margin:0 0 24px;"></div>
          <p style="font-size:15px;color:#9980b0;line-height:1.8;margin:0 0 24px;">Write your message here. Keep it concise, on-brand, and valuable to your subscribers.</p>
          <p style="font-size:15px;color:#9980b0;line-height:1.8;margin:0 0 32px;">Add a second paragraph with more details, a special offer, or a product highlight.</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:linear-gradient(135deg,#bf5fff,#7c3aed);border-radius:4px;">
            <a href="https://luxurioushabbits.com/products" style="display:inline-block;padding:14px 32px;color:#fff;font-family:'Arial Black',sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">SHOP NOW</a>
          </td></tr></table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0d0a14;border:1px solid #bf5fff22;border-top:none;border-radius:0 0 8px 8px;padding:24px 40px;text-align:center;">
          <p style="font-size:10px;color:#5a4a6a;letter-spacing:0.08em;margin:0 0 8px;">© 2025 LUXURIOUS HABBITS LLC · PREMIUM HEMP · 21+</p>
          <p style="font-size:10px;color:#4a3a5a;margin:0;">2018 Farm Bill Compliant · <a href="https://luxurioushabbits.com/unsubscribe" style="color:#7a5a9a;text-decoration:underline;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "gold",
    label: "Gold Edition",
    bg: "#0a0a0a",
    accent: "#d4a843",
    preview: "#0a0a0a",
    template: (subject: string) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Animated GIF Header -->
        <tr><td style="padding:0;line-height:0;">
          <img src="https://www.luxurioushabbits.com/manus-storage/email_header_animated_33d37710.gif" width="600" alt="LUXURIOUS HABBITS" style="display:block;width:100%;max-width:600px;border:0;" />
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#111;padding:48px 40px;">
          <h1 style="font-family:'Arial Black',sans-serif;font-size:28px;letter-spacing:0.08em;color:#f0f0f0;text-transform:uppercase;margin:0 0 16px;">${subject || 'YOUR HEADLINE HERE'}</h1>
          <div style="width:48px;height:1px;background:linear-gradient(90deg,#d4a843,transparent);margin:0 0 24px;"></div>
          <p style="font-size:15px;color:#888;line-height:1.8;margin:0 0 24px;">Write your message here. Keep it concise, on-brand, and valuable to your subscribers.</p>
          <p style="font-size:15px;color:#888;line-height:1.8;margin:0 0 32px;">Add a second paragraph with more details, a special offer, or a product highlight.</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:linear-gradient(135deg,#d4a843,#f5c842);border-radius:4px;">
            <a href="https://luxurioushabbits.com/products" style="display:inline-block;padding:14px 32px;color:#0a0a0a;font-family:'Arial Black',sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;font-weight:900;">SHOP NOW</a>
          </td></tr></table>
        </td></tr>
        <!-- Gold bottom bar -->
        <tr><td style="background:linear-gradient(90deg,#d4a843,#f5c842,#d4a843);height:1px;"></td></tr>
        <!-- Footer -->
        <tr><td style="background:#0a0a0a;padding:24px 40px;text-align:center;">
          <p style="font-size:10px;color:#444;letter-spacing:0.08em;margin:0 0 8px;">© 2025 LUXURIOUS HABBITS LLC · PREMIUM HEMP · 21+</p>
          <p style="font-size:10px;color:#333;margin:0;">2018 Farm Bill Compliant · <a href="https://luxurioushabbits.com/unsubscribe" style="color:#666;text-decoration:underline;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
  {
    id: "white",
    label: "Clean White",
    bg: "#ffffff",
    accent: "#bf5fff",
    preview: "#ffffff",
    template: (subject: string) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <!-- Animated GIF Header -->
        <tr><td style="padding:0;line-height:0;">
          <img src="https://www.luxurioushabbits.com/manus-storage/email_header_animated_33d37710.gif" width="600" alt="LUXURIOUS HABBITS" style="display:block;width:100%;max-width:600px;border:0;" />
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:48px 40px;">
          <h1 style="font-family:'Arial Black',sans-serif;font-size:26px;letter-spacing:0.04em;color:#111;text-transform:uppercase;margin:0 0 16px;">${subject || 'YOUR HEADLINE HERE'}</h1>
          <div style="width:48px;height:2px;background:#bf5fff;margin:0 0 24px;"></div>
          <p style="font-size:15px;color:#555;line-height:1.8;margin:0 0 24px;">Write your message here. Keep it concise, on-brand, and valuable to your subscribers.</p>
          <p style="font-size:15px;color:#555;line-height:1.8;margin:0 0 32px;">Add a second paragraph with more details, a special offer, or a product highlight.</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#bf5fff;border-radius:4px;">
            <a href="https://luxurioushabbits.com/products" style="display:inline-block;padding:14px 32px;color:#fff;font-family:'Arial Black',sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">SHOP NOW</a>
          </td></tr></table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8f8f8;border-top:1px solid #eee;padding:24px 40px;text-align:center;">
          <p style="font-size:10px;color:#999;letter-spacing:0.08em;margin:0 0 8px;">© 2025 LUXURIOUS HABBITS LLC · PREMIUM HEMP · 21+</p>
          <p style="font-size:10px;color:#bbb;margin:0;">2018 Farm Bill Compliant · <a href="https://luxurioushabbits.com/unsubscribe" style="color:#aaa;text-decoration:underline;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  },
];

// ─── Newsletter Campaigns Tab ─────────────────────────────────────────────────
function CampaignsTab() {
  const { data: campaigns, isLoading, refetch } = trpc.campaigns.adminList.useQuery();
  const { data: subData } = trpc.campaigns.adminSubscriberCount.useQuery();
  const createMutation = trpc.campaigns.adminCreate.useMutation({ onSuccess: () => { refetch(); setMode("list"); } });
  const updateMutation = trpc.campaigns.adminUpdate.useMutation({ onSuccess: () => { refetch(); setMode("list"); } });
  const sendMutation = trpc.campaigns.adminSend.useMutation({
    onSuccess: (res) => {
      refetch();
      toast.success(`Sent to ${res.sentCount} subscriber${res.sentCount !== 1 ? "s" : ""}${res.failedCount > 0 ? ` (${res.failedCount} failed)` : ""}.`);
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.campaigns.adminDelete.useMutation({ onSuccess: () => refetch() });
  const sendTestMutation = trpc.campaigns.adminSendTest.useMutation({
    onSuccess: () => { toast.success("Test email sent!"); setShowTestInput(null); setTestEmailInput(""); },
    onError: (err) => toast.error(err.message),
  });
  const [testEmailInput, setTestEmailInput] = useState("");
  const [showTestInput, setShowTestInput] = useState<number | null>(null);

  const [mode, setMode] = useState<"list" | "compose" | "edit">("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const applyTheme = (themeId: string) => {
    const theme = EMAIL_THEMES.find(t => t.id === themeId);
    if (!theme) return;
    setSelectedTheme(themeId);
    setHtmlBody(theme.template(subject));
    setShowPreview(true);
  };

  const inputStyle: React.CSSProperties = {
    background: "oklch(0.07 0 0)",
    border: "1px solid oklch(1 0 0 / 12%)",
    borderRadius: "6px",
    padding: "0.6rem 0.9rem",
    color: "oklch(0.85 0 0)",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.78rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  const handleSave = () => {
    if (!subject.trim() || !htmlBody.trim()) { toast.error("Subject and body are required."); return; }
    if (mode === "edit" && editId) {
      updateMutation.mutate({ id: editId, subject, previewText: previewText || undefined, htmlBody });
    } else {
      createMutation.mutate({ subject, previewText: previewText || undefined, htmlBody });
    }
  };

  const handleEdit = (c: any) => {
    setEditId(c.id);
    setSubject(c.subject);
    setPreviewText(c.previewText ?? "");
    setHtmlBody(c.htmlBody);
    setMode("edit");
  };

  const handleNew = () => {
    setEditId(null);
    setSubject("");
    setPreviewText("");
    setHtmlBody("");
    setMode("compose");
  };

  const statusColor: Record<string, string> = { draft: "#f59e0b", sending: "#3b82f6", sent: "#22c55e", failed: "#ef4444" };

  if (mode === "compose" || mode === "edit") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <button onClick={() => setMode("list")} style={{ background: "none", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.4rem 0.8rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", cursor: "pointer" }}>← Back</button>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>{mode === "edit" ? "EDIT CAMPAIGN" : "NEW CAMPAIGN"}</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "720px" }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Subject Line *</label>
            <input style={inputStyle} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. New Arrivals: Premium THCA Flower" />
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Preview Text (optional)</label>
            <input style={inputStyle} value={previewText} onChange={e => setPreviewText(e.target.value)} placeholder="Short preview shown in inbox..." />
          </div>
          {/* Brand Theme Selector */}
          <div>
            <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Choose a Brand Theme (auto-fills HTML)</label>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {EMAIL_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: selectedTheme === theme.id ? `${theme.accent}22` : "oklch(0.08 0 0)",
                    border: `1px solid ${selectedTheme === theme.id ? theme.accent : "oklch(1 0 0 / 12%)"}`,
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <div style={{ width: "16px", height: "16px", borderRadius: "3px", background: theme.bg, border: `2px solid ${theme.accent}`, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: selectedTheme === theme.id ? theme.accent : "oklch(0.65 0 0)", fontWeight: selectedTheme === theme.id ? 700 : 400 }}>{theme.label}</span>
                </button>
              ))}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.38 0 0)", margin: "0 0 0.75rem" }}>Selecting a theme replaces the HTML body with a branded template. You can then edit the HTML below.</p>
          </div>
          <div>
            <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>HTML Body *</label>
            <textarea
              style={{ ...inputStyle, minHeight: "280px", resize: "vertical", fontFamily: "'Courier New', monospace", fontSize: "0.72rem", lineHeight: 1.5 }}
              value={htmlBody}
              onChange={e => setHtmlBody(e.target.value)}
              placeholder="<div style='font-family:sans-serif;'>Your email HTML here...</div>"
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              style={{ background: "#bf5fff", border: "none", borderRadius: "6px", padding: "0.6rem 1.5rem", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}
            >{createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Draft"}</button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.6rem 1.25rem", color: "oklch(0.65 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", cursor: "pointer" }}
            >{showPreview ? "Hide Preview" : "Preview"}</button>
          </div>
          {showPreview && htmlBody && (
            <div style={{ border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "8px", overflow: "hidden", marginTop: "0.5rem" }}>
              <div style={{ background: "oklch(0.07 0 0)", padding: "0.5rem 1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Email Preview</div>
              <div style={{ background: "#fff", padding: "0" }}>
                <iframe
                  srcDoc={htmlBody}
                  style={{ width: "100%", minHeight: "400px", border: "none", display: "block" }}
                  title="Email Preview"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>NEWSLETTER CAMPAIGNS</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.40 0 0)", marginTop: "0.25rem" }}>
            {subData ? `${subData.count} subscriber${subData.count !== 1 ? "s" : ""} on list` : "Loading subscriber count..."}
          </p>
        </div>
        <button
          onClick={handleNew}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#bf5fff", border: "none", borderRadius: "6px", padding: "0.55rem 1.25rem", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}
        ><Plus size={14} />New Campaign</button>
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem", textAlign: "center" }}>Loading...</div>
      ) : !campaigns?.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>
          No campaigns yet. Create your first newsletter campaign.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {campaigns.map((c: any) => (
            <div key={c.id} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.90 0 0)", fontWeight: 500 }}>{c.subject}</span>
                  <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: "4px", background: `${statusColor[c.status] ?? "#6b7280"}22`, color: statusColor[c.status] ?? "#6b7280", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.status}</span>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)" }}>
                  {c.status === "sent" ? `Sent to ${c.sentCount}/${c.recipientCount} · ${c.sentAt ? new Date(c.sentAt).toLocaleDateString() : ""}` : `Created ${new Date(c.createdAt).toLocaleDateString()}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {c.status === "draft" && (
                  <>
                    <button onClick={() => handleEdit(c)} style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "5px", padding: "0.35rem 0.8rem", color: "oklch(0.65 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", cursor: "pointer" }}>Edit</button>
                    <button
                      onClick={() => setShowTestInput(showTestInput === c.id ? null : c.id)}
                      style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "oklch(0.10 0 0)", border: "1px solid #f5a62344", borderRadius: "5px", padding: "0.35rem 0.8rem", color: "#f5a623", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", cursor: "pointer" }}
                    ><Mail size={11} />Test Email</button>
                    <button
                      onClick={() => { if (confirm(`Send "${c.subject}" to ${subData?.count ?? 0} subscribers? This cannot be undone.`)) sendMutation.mutate({ id: c.id }); }}
                      disabled={sendMutation.isPending}
                      style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "#bf5fff22", border: "1px solid #bf5fff44", borderRadius: "5px", padding: "0.35rem 0.8rem", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 600, cursor: sendMutation.isPending ? "not-allowed" : "pointer" }}
                    ><Send size={11} />Send Now</button>
                    <button onClick={() => { if (confirm("Delete this draft?")) deleteMutation.mutate({ id: c.id }); }} style={{ background: "#ef444422", border: "1px solid #ef444433", borderRadius: "5px", padding: "0.35rem 0.8rem", color: "#ef4444", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", cursor: "pointer" }}>Delete</button>
                  </>
                )}
                {c.status === "sent" && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "#22c55e", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <CheckCircle size={13} />Delivered
                  </div>
                )}
                {c.status === "failed" && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <XCircle size={13} />Failed
                  </div>
                )}
              </div>
              {showTestInput === c.id && (
                <div style={{ width: "100%", marginTop: "0.75rem", padding: "0.75rem", background: "oklch(0.09 0 0)", borderRadius: "6px", border: "1px solid #f5a62333", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmailInput}
                    onChange={e => setTestEmailInput(e.target.value)}
                    style={{ flex: 1, minWidth: "200px", background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "5px", padding: "0.4rem 0.75rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", outline: "none" }}
                  />
                  <button
                    onClick={() => { if (testEmailInput.trim()) sendTestMutation.mutate({ id: c.id, toEmail: testEmailInput.trim() }); }}
                    disabled={sendTestMutation.isPending || !testEmailInput.trim()}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "#f5a62322", border: "1px solid #f5a62344", borderRadius: "5px", padding: "0.4rem 0.9rem", color: "#f5a623", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer" }}
                  ><Send size={11} />{sendTestMutation.isPending ? "Sending..." : "Send Test"}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dropship Applications Tab ───────────────────────────────────────────────
function DropshipAppsTab() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { data: apps, isLoading, refetch } = trpc.dropshipApplications.adminList.useQuery({ status: statusFilter });
  const updateMutation = trpc.dropshipApplications.adminUpdateStatus.useMutation({
    onSuccess: () => { refetch(); setSelectedApp(null); toast.success("Application updated."); },
    onError: (err) => toast.error(err.message),
  });

  const statusColor: Record<string, string> = { pending: "#f59e0b", approved: "#22c55e", rejected: "#ef4444" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>DROPSHIP APPLICATIONS</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["all", "pending", "approved", "rejected"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ background: statusFilter === s ? "#bf5fff22" : "oklch(0.07 0 0)", border: `1px solid ${statusFilter === s ? "#bf5fff66" : "oklch(1 0 0 / 10%)"}`, borderRadius: "5px", padding: "0.35rem 0.8rem", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 600, color: statusFilter === s ? "#bf5fff" : "oklch(0.50 0 0)", cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "2rem", textAlign: "center" }}>Loading...</div>
      ) : !apps?.length ? (
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", padding: "3rem", textAlign: "center", border: "1px dashed oklch(1 0 0 / 8%)", borderRadius: "8px" }}>No applications yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {apps.map((app: any) => (
            <div key={app.id} style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "oklch(0.90 0 0)", fontWeight: 500 }}>{app.businessName}</span>
                    <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: "4px", background: `${statusColor[app.status] ?? "#6b7280"}22`, color: statusColor[app.status] ?? "#6b7280", fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{app.status}</span>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "oklch(0.45 0 0)" }}>
                    {app.contactName} · {app.email}{app.phone ? ` · ${app.phone}` : ""}
                  </div>
                  {(app.website || app.instagram) && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.38 0 0)", marginTop: "0.2rem" }}>
                      {app.website && <span>{app.website}</span>}{app.website && app.instagram && " · "}{app.instagram && <span>{app.instagram}</span>}
                    </div>
                  )}
                  {app.monthlyVolume && (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#bf5fff", marginTop: "0.2rem" }}>Volume: {app.monthlyVolume}</div>
                  )}
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.35 0 0)", marginTop: "0.2rem" }}>
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {app.status === "pending" && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => { setSelectedApp(app); setAdminNotes(app.adminNotes ?? ""); }} style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "5px", padding: "0.35rem 0.8rem", color: "oklch(0.65 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", cursor: "pointer" }}>Review</button>
                  </div>
                )}
              </div>
              {app.whyPartner && (
                <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "oklch(0.05 0 0)", borderRadius: "6px", borderLeft: "3px solid oklch(1 0 0 / 10%)" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.35 0 0)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>Why Partner</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.55 0 0)", lineHeight: 1.6 }}>{app.whyPartner}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 70%)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setSelectedApp(null)}>
          <div style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "12px", padding: "2rem", maxWidth: "480px", width: "100%" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>REVIEW APPLICATION</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.50 0 0)", marginBottom: "1.25rem" }}>{selectedApp.businessName} — {selectedApp.contactName}</p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "oklch(0.40 0 0)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Admin Notes (optional — sent to applicant)</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Any notes for the applicant..."
                style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.6rem 0.9rem", color: "oklch(0.80 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", outline: "none", width: "100%", boxSizing: "border-box" as const, minHeight: "80px", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => updateMutation.mutate({ id: selectedApp.id, status: "approved", adminNotes: adminNotes || undefined })}
                disabled={updateMutation.isPending}
                style={{ flex: 1, background: "#22c55e22", border: "1px solid #22c55e44", borderRadius: "6px", padding: "0.6rem", color: "#22c55e", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
              >{updateMutation.isPending ? "..." : "Approve"}</button>
              <button
                onClick={() => updateMutation.mutate({ id: selectedApp.id, status: "rejected", adminNotes: adminNotes || undefined })}
                disabled={updateMutation.isPending}
                style={{ flex: 1, background: "#ef444422", border: "1px solid #ef444433", borderRadius: "6px", padding: "0.6rem", color: "#ef4444", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
              >{updateMutation.isPending ? "..." : "Reject"}</button>
              <button onClick={() => setSelectedApp(null)} style={{ background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "6px", padding: "0.6rem 1rem", color: "oklch(0.50 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────────────
function SettingsTab() {
  const { data: testModeData, refetch } = trpc.siteSettings.getTestMode.useQuery(
    undefined,
    { refetchInterval: 10_000 } // poll every 10s to catch customer attempts and auto-shutoff
  );
  const setTestMode = trpc.siteSettings.setTestMode.useMutation({
    onSuccess: () => { refetch(); },
  });
  const clearAttempts = trpc.siteSettings.clearCustomerAttempts.useMutation({
    onSuccess: () => { refetch(); },
  });

  const isTestMode = testModeData?.enabled ?? false;
  const expiresAt = testModeData?.expiresAt ?? null;
  const customerAttempts = testModeData?.customerAttempts ?? 0;

  // 30-min countdown display
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [alarmFlash, setAlarmFlash] = useState(false);
  const prevAttemptsRef = useRef(0);
  const alarmRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update countdown every second
  useEffect(() => {
    if (!isTestMode || !expiresAt) { setTimeLeft(0); return; }
    const tick = () => setTimeLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [isTestMode, expiresAt]);

  // Alarm: flash + beep when new customer attempts come in
  useEffect(() => {
    if (customerAttempts > prevAttemptsRef.current && customerAttempts > 0) {
      // Play alarm sound via Web Audio API
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
      } catch (_) {}
      // Flash the card
      setAlarmFlash(true);
      if (alarmRef.current) clearInterval(alarmRef.current);
      let count = 0;
      alarmRef.current = setInterval(() => {
        count++;
        setAlarmFlash(f => !f);
        if (count >= 10) { clearInterval(alarmRef.current!); setAlarmFlash(false); }
      }, 200);
    }
    prevAttemptsRef.current = customerAttempts;
  }, [customerAttempts]);

  useEffect(() => () => { if (alarmRef.current) clearInterval(alarmRef.current); }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.08em", color: "oklch(0.96 0 0)", marginBottom: "0.25rem" }}>SITE SETTINGS</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)" }}>Global configuration for the Luxurious Habbits store.</div>
      </div>

      {/* Alarm: customer attempted checkout while test mode was on */}
      {customerAttempts > 0 && isTestMode && (
        <div style={{
          background: alarmFlash ? "oklch(0.20 0.15 15)" : "oklch(0.10 0.08 15)",
          border: `2px solid ${alarmFlash ? "#ff3333" : "#ff444488"}`,
          borderRadius: "10px",
          padding: "1rem 1.25rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          transition: "background 100ms ease, border-color 100ms ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.4rem" }}>🚨</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.08em", color: "#ff4444" }}>
                CUSTOMER CHECKOUT BLOCKED
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "oklch(0.65 0 0)", lineHeight: 1.5 }}>
                {customerAttempts} customer{customerAttempts > 1 ? "s" : ""} tried to check out while test mode was on. They saw a 4:20 countdown.
              </div>
            </div>
          </div>
          <button
            onClick={() => clearAttempts.mutate()}
            style={{ background: "oklch(0.15 0 0)", border: "1px solid oklch(1 0 0 / 15%)", borderRadius: "6px", padding: "0.4rem 0.9rem", color: "oklch(0.55 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Test Mode Card */}
      <div style={{
        background: isTestMode ? "oklch(0.12 0.06 60)" : "oklch(0.07 0 0)",
        border: isTestMode ? "2px solid #f5a623" : "1px solid oklch(1 0 0 / 10%)",
        borderRadius: "12px",
        padding: "1.75rem",
        transition: "all 300ms ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🧪</span>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.08em", color: isTestMode ? "#f5a623" : "oklch(0.96 0 0)" }}>TEST MODE</div>
              {isTestMode && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: "#f5a623", background: "oklch(0.18 0.06 60)", border: "1px solid #f5a62366", borderRadius: "4px", padding: "0.15rem 0.5rem", textTransform: "uppercase" }}>ACTIVE</span>
              )}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.73rem", color: "oklch(0.60 0 0)", lineHeight: 1.7, marginBottom: "0.75rem" }}>
              When enabled, <strong style={{ color: "oklch(0.80 0 0)" }}>payment is bypassed at checkout</strong>. Orders are created and submitted to TopShelf fulfillment exactly as real orders — no charge occurs. Auto-disables after <strong style={{ color: "oklch(0.80 0 0)" }}>30 minutes</strong>.
            </div>

            {/* 30-min countdown */}
            {isTestMode && timeLeft > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "oklch(0.08 0.04 60)",
                  border: "1px solid #f5a62344",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.08em", color: timeLeft < 120 ? "#ff6644" : "#f5a623" }}>
                    {formatTime(timeLeft)}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.45 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>auto-off</span>
                </div>
                {timeLeft < 120 && (
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#ff6644" }}>⚠ Expiring soon</span>
                )}
              </div>
            )}

            {isTestMode && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "#ff8844", background: "oklch(0.10 0.04 30)", border: "1px solid oklch(0.5 0.15 30 / 40%)", borderRadius: "6px", padding: "0.6rem 0.9rem", lineHeight: 1.6 }}>
                ⚠ <strong>Test Mode is currently ON.</strong> Real customers see a maintenance message and 4:20 countdown. Turn this off before going live.
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <button
              onClick={() => setTestMode.mutate({ enabled: !isTestMode })}
              disabled={setTestMode.isPending}
              style={{
                position: "relative",
                width: "52px",
                height: "28px",
                borderRadius: "14px",
                border: "none",
                background: isTestMode ? "#f5a623" : "oklch(0.18 0 0)",
                cursor: setTestMode.isPending ? "not-allowed" : "pointer",
                transition: "background 250ms ease",
                outline: "none",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: "3px",
                left: isTestMode ? "27px" : "3px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "oklch(0.96 0 0)",
                transition: "left 250ms cubic-bezier(0.23, 1, 0.32, 1)",
                boxShadow: "0 1px 4px oklch(0 0 0 / 30%)",
              }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.30 0 0)", lineHeight: 1.6 }}>
        More settings will appear here as the store grows.
      </div>
    </div>
  );
}

function StrainCommentsTab() {
  const utils = trpc.useUtils();
  const { data: comments, isLoading } = trpc.strainComments.adminGetAll.useQuery();
  const moderate = trpc.strainComments.moderate.useMutation({
    onSuccess: () => utils.strainComments.adminGetAll.invalidate(),
  });

  if (isLoading) return <div style={{ padding: "2rem", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.40 0 0)" }}>Loading comments...</div>;

  type Comment = NonNullable<typeof comments>[number];
  const pending = (comments ?? []).filter((c: Comment) => !c.approved);
  const approved = (comments ?? []).filter((c: Comment) => c.approved);

  // Convert slug to readable article title
  const slugToTitle = (slug: string) =>
    slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const CommentCard = ({ c, showApprove }: { c: Comment; showApprove: boolean }) => (
    <div style={{ background: "oklch(0.07 0 0)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", padding: "1rem", marginBottom: "0.75rem" }}>
      {/* Article link row */}
      <div style={{ marginBottom: "0.6rem", paddingBottom: "0.6rem", borderBottom: "1px solid oklch(1 0 0 / 6%)" }}>
        <a
          href={`/blog/${c.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", letterSpacing: "0.08em", color: "#bf5fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          📄 {slugToTitle(c.slug)}
          <span style={{ fontSize: "0.65rem", opacity: 0.6 }}>↗</span>
        </a>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.35 0 0)", marginLeft: "0.75rem" }}>/blog/{c.slug}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.85 0 0)" }}>{c.userName}</span>
            {c.userId && (
              <span style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "oklch(0.35 0 0)", background: "oklch(0.10 0 0)", padding: "0.1rem 0.4rem", borderRadius: "3px" }}>uid:{c.userId}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#f5a623", fontSize: "0.8rem", letterSpacing: "0.05em" }}>{'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.40 0 0)" }}>{c.rating}/5</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.30 0 0)" }}>{new Date(c.createdAt).toLocaleString()}</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <a
            href={`/blog/${c.slug}#comments`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "oklch(0.12 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.3rem 0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.55 0 0)", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
          >View on Site ↗</a>
          {showApprove && (
            <button
              onClick={() => moderate.mutate({ id: c.id, approved: true })}
              style={{ background: "oklch(0.25 0.12 145)", border: "none", borderRadius: "4px", padding: "0.3rem 0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.85 0.10 145)", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >✓ Approve</button>
          )}
          {!showApprove && (
            <button
              onClick={() => moderate.mutate({ id: c.id, approved: false })}
              style={{ background: "oklch(0.15 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "4px", padding: "0.3rem 0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.45 0 0)", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >Hide</button>
          )}
          <button
            onClick={() => moderate.mutate({ id: c.id, approved: false })}
            style={{ background: "oklch(0.20 0.08 25)", border: "none", borderRadius: "4px", padding: "0.3rem 0.75rem", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.75 0.10 25)", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >Delete</button>
        </div>
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.65 0 0)", lineHeight: 1.6, margin: 0, background: "oklch(0.05 0 0)", padding: "0.6rem 0.75rem", borderRadius: "6px", borderLeft: "2px solid oklch(1 0 0 / 10%)" }}>{c.body}</p>
      {c.photoKey && <img src={`/manus-storage/${c.photoKey}`} alt="Comment photo" style={{ marginTop: "0.6rem", maxWidth: "140px", borderRadius: "6px", objectFit: "cover" }} />}
    </div>
  );

  return (
    <div style={{ padding: "1.5rem", maxWidth: "860px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div className="section-label" style={{ marginBottom: "0.4rem" }}>Moderation</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.05em", color: "oklch(0.96 0 0)", margin: 0 }}>STRAIN COMMENTS</h2>
      </div>

      {pending.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#f5a623", marginBottom: "0.75rem", fontWeight: 600 }}>Pending Approval ({pending.length})</div>
          {pending.map((c: Comment) => <CommentCard key={c.id} c={c} showApprove={true} />)}
        </div>
      )}

      {pending.length === 0 && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.35 0 0)", marginBottom: "2rem", padding: "1rem", background: "oklch(0.06 0 0)", borderRadius: "6px", border: "1px solid oklch(1 0 0 / 6%)" }}>No comments pending approval.</div>
      )}

      {approved.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.40 0 0)", marginBottom: "0.75rem", fontWeight: 600 }}>Live Comments ({approved.length})</div>
          {approved.map((c: Comment) => <CommentCard key={c.id} c={c} showApprove={false} />)}
        </div>
      )}
    </div>
  );
}

// ─── Wholesale Leads Tab ─────────────────────────────────────────────────────
function WholesaleLeadsTab() {
  const { data: leads, isLoading, refetch } = trpc.wholesale.list.useQuery();
  const updateStatus = trpc.wholesale.updateStatus.useMutation({ onSuccess: () => { refetch(); toast.success("Lead updated"); } });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState<Record<number, string>>({});

  const GRADE_COLOR: Record<string, string> = { hot: "#ff6b35", warm: "#bf5fff", cold: "#00f5ff" };
  const GRADE_EMOJI: Record<string, string> = { hot: "🔥", warm: "♨️", cold: "❄️" };
  const STATUS_COLORS: Record<string, string> = {
    new: "#f59e0b", contacted: "#3b82f6", qualified: "#22c55e",
    disqualified: "#6b7280", closed_won: "#22c55e", closed_lost: "#ef4444",
  };
  const CONTACT_LABELS: Record<string, string> = { email: "Email", phone: "Phone", text: "Text", whatsapp: "WhatsApp" };
  const PAYMENT_LABELS: Record<string, string> = { bank_transfer: "Bank Transfer", check: "Check", credit_card: "Credit Card", crypto: "Crypto", net_terms: "Net Terms", other: "Other" };

  const hotLeads = leads?.filter(l => l.leadGrade === "hot") ?? [];
  const warmLeads = leads?.filter(l => l.leadGrade === "warm") ?? [];
  const coldLeads = leads?.filter(l => l.leadGrade === "cold") ?? [];

  const CELL: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.75 0 0)", padding: "0.75rem 0.5rem", verticalAlign: "top" };

  function LeadRow({ lead }: { lead: NonNullable<typeof leads>[number] }) {
    const expanded = expandedId === lead.id;
    const gc = GRADE_COLOR[lead.leadGrade ?? "cold"] ?? "#6b7280";
    const notes = editNotes[lead.id] ?? lead.adminNotes ?? "";
    return (
      <>
        <tr
          onClick={() => setExpandedId(expanded ? null : lead.id)}
          style={{ borderBottom: "1px solid oklch(1 0 0 / 6%)", cursor: "pointer", background: expanded ? "oklch(0.07 0 0)" : "transparent" }}
        >
          <td style={CELL}>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: "1.2rem", color: gc }}>
              {GRADE_EMOJI[lead.leadGrade ?? "cold"]} {lead.leadScore}/100
            </span>
          </td>
          <td style={CELL}>
            <div style={{ fontWeight: 600, color: "oklch(0.92 0 0)" }}>{lead.contactName}</div>
            <div style={{ color: "oklch(0.45 0 0)", fontSize: "0.68rem" }}>{lead.email}</div>
            {lead.phone && <div style={{ color: "oklch(0.40 0 0)", fontSize: "0.65rem" }}>{lead.phone}</div>}
            <div style={{ marginTop: "0.2rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" as const }}>
              <span style={{ background: `${gc}22`, color: gc, padding: "0.1rem 0.4rem", borderRadius: "3px", fontSize: "0.6rem", fontWeight: 600 }}>
                {CONTACT_LABELS[lead.preferredContact ?? "email"]}
              </span>
              {lead.preferredPayment && (
                <span style={{ background: "#22c55e22", color: "#22c55e", padding: "0.1rem 0.4rem", borderRadius: "3px", fontSize: "0.6rem", fontWeight: 600 }}>
                  {PAYMENT_LABELS[lead.preferredPayment] ?? lead.preferredPayment}
                </span>
              )}
            </div>
          </td>
          <td style={CELL}>
            <div style={{ fontWeight: 600, color: "oklch(0.88 0 0)" }}>{lead.businessName}</div>
            <div style={{ color: "oklch(0.45 0 0)", fontSize: "0.68rem" }}>{lead.businessType?.replace(/_/g, " ")}</div>
            <div style={{ color: "oklch(0.40 0 0)", fontSize: "0.65rem" }}>{[lead.city, lead.state].filter(Boolean).join(", ")}</div>
          </td>
          <td style={CELL}>
            <div style={{ color: "oklch(0.75 0 0)", fontSize: "0.7rem", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
              {lead.productsInterested}
            </div>
            <div style={{ color: "oklch(0.40 0 0)", fontSize: "0.65rem", marginTop: "0.2rem" }}>{lead.monthlyVolume?.replace(/_/g, " ")}</div>
          </td>
          <td style={CELL}>
            <span style={{ background: `${STATUS_COLORS[lead.status ?? "new"]}22`, color: STATUS_COLORS[lead.status ?? "new"], padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase" as const }}>
              {lead.status?.replace(/_/g, " ") ?? "new"}
            </span>
          </td>
          <td style={CELL}>
            <div style={{ color: "oklch(0.40 0 0)", fontSize: "0.65rem" }}>
              {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
            </div>
          </td>
        </tr>
        {expanded && (
          <tr style={{ background: "oklch(0.065 0 0)" }}>
            <td colSpan={6} style={{ padding: "1.25rem 1rem", borderBottom: "1px solid oklch(1 0 0 / 8%)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.25rem" }}>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "oklch(0.35 0 0)", marginBottom: "0.4rem" }}>Products Looking For</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.80 0 0)", lineHeight: 1.5 }}>{lead.productsInterested || "—"}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "oklch(0.35 0 0)", marginBottom: "0.4rem" }}>Business Details</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.70 0 0)", lineHeight: 1.6 }}>
                    <div>Type: {lead.businessType?.replace(/_/g, " ")}</div>
                    <div>Locations: {lead.numberOfLocations?.replace(/_/g, " ")}</div>
                    <div>Years: {lead.yearsInBusiness?.replace(/_/g, " ")}</div>
                    <div>Revenue: {lead.averageMonthlyRevenue?.replace(/_/g, " ") ?? "N/A"}</div>
                    <div>Timeline: {lead.timeline?.replace(/_/g, " ")}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "oklch(0.35 0 0)", marginBottom: "0.4rem" }}>Online Presence</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.70 0 0)", lineHeight: 1.6 }}>
                    {lead.website && <div>🌐 {lead.website}</div>}
                    {lead.instagram && <div>📸 @{lead.instagram}</div>}
                    {lead.tiktok && <div>🎵 @{lead.tiktok}</div>}
                    {lead.facebook && <div>FB: {lead.facebook}</div>}
                    {lead.twitter && <div>𝕏 @{lead.twitter}</div>}
                    {!lead.website && !lead.instagram && !lead.tiktok && <div style={{ color: "oklch(0.35 0 0)" }}>No online presence listed</div>}
                  </div>
                </div>
              </div>
              {lead.whySwitch && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "oklch(0.35 0 0)", marginBottom: "0.3rem" }}>Why Switching Suppliers</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.65 0 0)", lineHeight: 1.5 }}>{lead.whySwitch}</div>
                </div>
              )}
              {lead.additionalNotes && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "oklch(0.35 0 0)", marginBottom: "0.3rem" }}>Additional Notes</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.65 0 0)", lineHeight: 1.5 }}>{lead.additionalNotes}</div>
                </div>
              )}
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" as const, paddingTop: "1rem", borderTop: "1px solid oklch(1 0 0 / 6%)" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "oklch(0.35 0 0)", marginBottom: "0.4rem" }}>Status</div>
                  <select
                    value={lead.status ?? "new"}
                    onChange={e => updateStatus.mutate({ id: lead.id, status: e.target.value as any })}
                    style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.5rem 0.75rem", color: "oklch(0.85 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", cursor: "pointer" }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="disqualified">Disqualified</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
                <div style={{ flex: 2, minWidth: "240px" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "oklch(0.35 0 0)", marginBottom: "0.4rem" }}>Admin Notes</div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      value={notes}
                      onChange={e => setEditNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                      placeholder="Add internal notes…"
                      style={{ flex: 1, background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "4px", padding: "0.5rem 0.75rem", color: "oklch(0.85 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem" }}
                    />
                    <button
                      onClick={() => updateStatus.mutate({ id: lead.id, status: (lead.status ?? "new") as any, adminNotes: notes })}
                      style={{ padding: "0.5rem 1rem", background: "#bf5fff22", border: "1px solid #bf5fff66", borderRadius: "4px", color: "#bf5fff", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", cursor: "pointer" }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Users size={20} />} label="Total Leads" value={leads?.length ?? 0} />
        <StatCard icon={<span style={{ fontSize: "1.1rem" }}>🔥</span>} label="Hot Leads" value={hotLeads.length} sub="Score ≥ 65" />
        <StatCard icon={<span style={{ fontSize: "1.1rem" }}>♨️</span>} label="Warm Leads" value={warmLeads.length} sub="Score 38–64" />
        <StatCard icon={<span style={{ fontSize: "1.1rem" }}>❄️</span>} label="Cold Leads" value={coldLeads.length} sub="Score < 38" />
        <StatCard icon={<CheckCircle size={20} />} label="Closed Won" value={leads?.filter(l => l.status === "closed_won").length ?? 0} />
      </div>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>Loading leads…</div>
      ) : !leads?.length ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "oklch(0.35 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>No wholesale leads yet. Leads submitted via the wholesale form will appear here.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(1 0 0 / 10%)" }}>
                {["Score", "Contact", "Business", "Products / Volume", "Status", "Date"].map(h => (
                  <th key={h} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "oklch(0.35 0 0)", padding: "0.5rem", textAlign: "left", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => <LeadRow key={lead.id} lead={lead} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const tabs = [
  { id: "abandoned_carts", label: "Abandoned Carts", icon: <ShoppingCart size={16} /> },
  { id: "affiliates_payout", label: "Affiliate Credits", icon: <BadgeDollarSign size={16} /> },
  { id: "analytics", label: "Analytics", icon: <TrendingUp size={16} /> },
  { id: "blog", label: "Blog Articles", icon: <Newspaper size={16} /> },
  { id: "box_curator", label: "Box Curator", icon: <Gift size={16} /> },
  { id: "campaigns", label: "Campaigns", icon: <Send size={16} /> },
  { id: "coupons", label: "Coupons", icon: <Mail size={16} /> },
  { id: "crowdship", label: "Crowdship Dropship", icon: <Package size={16} /> },
  { id: "dropship_apps", label: "Dropship Apps", icon: <UserPlus size={16} /> },
  { id: "gbp_reviews", label: "Google Reviews", icon: <Award size={16} /> },
  { id: "loyalty", label: "Loyalty Points", icon: <Star size={16} /> },
  { id: "notify_me", label: "Notify Me Leads", icon: <Bell size={16} /> },
  { id: "orders", label: "Orders", icon: <ShoppingBag size={16} /> },
  { id: "overview", label: "Overview", icon: <TrendingUp size={16} /> },
  { id: "products", label: "Products", icon: <Package size={16} /> },
  { id: "product_qa", label: "Product Q&A", icon: <MessageCircle size={16} /> },
  { id: "referrals", label: "Referrals", icon: <UserPlus size={16} /> },
  { id: "reviews", label: "Reviews", icon: <MessageSquare size={16} /> },
  { id: "settings", label: "Settings", icon: <Sliders size={16} /> },
  { id: "strain_comments", label: "Strain Comments", icon: <MessageCircle size={16} /> },
  { id: "subscriptions", label: "Subscribers", icon: <Repeat size={16} /> },
  { id: "topshelf", label: "TopShelf Dropship", icon: <Package size={16} /> },
  { id: "vendors", label: "Vendors", icon: <Store size={16} /> },
  { id: "wholesale_leads", label: "Wholesale Leads", icon: <Users size={16} /> },
  { id: "live_chat", label: "Live Chat", icon: <MessageCircle size={16} /> },
  { id: "messages", label: "Messages", icon: <Megaphone size={16} /> },
];

// ─── Tab groups for mobile drawer ────────────────────────────────────────────
const TAB_GROUPS = [
  { label: "Core", tabs: ["overview", "orders", "products", "subscriptions"] },
  { label: "Marketing", tabs: ["abandoned_carts", "affiliates_payout", "campaigns", "coupons", "loyalty", "referrals"] },
  { label: "Content", tabs: ["blog", "gbp_reviews", "notify_me", "product_qa", "reviews", "strain_comments"] },
  { label: "Vendors", tabs: ["crowdship", "dropship_apps", "topshelf", "vendors"] },
  { label: "Tools", tabs: ["analytics", "box_curator", "settings"] },
  { label: "Wholesale", tabs: ["wholesale_leads"] },
  { label: "Chat", tabs: ["live_chat", "messages"] },
];

export default function Admin() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "oklch(0.40 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}>Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>ACCESS DENIED</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "oklch(0.40 0 0)" }}>Admin access required.</div>
        <Link href="/"><button className="btn-gold"><span>Return Home</span></button></Link>
      </div>
    );
  }

  const activeTabObj = tabs.find(t => t.id === activeTab);

  const selectTab = (id: string) => {
    setActiveTab(id);
    setDrawerOpen(false);
  };

  return (
    <div style={{ background: "oklch(0.04 0 0)", minHeight: "100vh", paddingTop: "72px" }}>
      <SEO title="Admin Panel" description="Luxurious Habbits admin panel" noIndex={true} canonical="/admin" />

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "oklch(0 0 0 / 70%)",
            zIndex: 200, backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: "280px",
        background: "oklch(0.06 0 0)", borderRight: "1px solid oklch(1 0 0 / 10%)",
        zIndex: 201, transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 260ms cubic-bezier(0.23,1,0.32,1)",
        overflowY: "auto", paddingTop: "env(safe-area-inset-top, 0px)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Drawer header */}
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid oklch(1 0 0 / 8%)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "oklch(0.96 0 0)", letterSpacing: "0.06em", lineHeight: 1 }}>ADMIN</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", color: "oklch(0.40 0 0)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "0.15rem" }}>Luxurious Habbits</div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ background: "none", border: "none", color: "oklch(0.50 0 0)", cursor: "pointer", padding: "0.25rem", lineHeight: 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Drawer nav groups */}
        <div style={{ flex: 1, padding: "0.75rem 0" }}>
          {TAB_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: "0.25rem" }}>
              <div style={{ padding: "0.5rem 1.25rem 0.25rem", fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", letterSpacing: "0.14em", color: "oklch(0.30 0 0)", textTransform: "uppercase", fontWeight: 600 }}>
                {group.label}
              </div>
              {group.tabs.map(tabId => {
                const t = tabs.find(x => x.id === tabId);
                if (!t) return null;
                const isActive = activeTab === tabId;
                return (
                  <button
                    key={tabId}
                    onClick={() => selectTab(tabId)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.7rem 1.25rem",
                      background: isActive ? "oklch(0.55 0.18 300 / 0.12)" : "none",
                      border: "none",
                      borderLeft: isActive ? "2px solid #bf5fff" : "2px solid transparent",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif", fontSize: "0.82rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#bf5fff" : "oklch(0.65 0 0)",
                      textAlign: "left",
                      transition: "all 150ms ease",
                    }}
                  >
                    <span style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }}>{t.icon}</span>
                    {t.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Drawer footer */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid oklch(1 0 0 / 8%)", paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
          <Link href="/" onClick={() => setDrawerOpen(false)}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "oklch(0.40 0 0)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back to site
            </div>
          </Link>
        </div>
      </div>

      {/* ── Desktop header + tab bar ── */}
      <div style={{ borderBottom: "1px solid oklch(1 0 0 / 8%)", padding: "2rem 0 0" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Mobile top bar */}
          <div className="admin-mobile-bar" style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              style={{ background: "oklch(0.08 0 0)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "8px", padding: "0.55rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", color: "oklch(0.70 0 0)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}>Menu</span>
            </button>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#bf5fff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {activeTabObj?.icon}
              {activeTabObj?.label}
            </div>
            <div style={{ width: "64px" }} />{/* spacer */}
          </div>

          {/* Desktop title */}
          <div className="admin-desktop-title">
            <div className="section-label" style={{ marginBottom: "0.5rem" }}>Admin Panel</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
              LUXURIOUS <span className="text-holo">HABBITS</span>
            </h1>
          </div>

          {/* Desktop tab bar */}
          <div className="admin-desktop-tabs" style={{ display: "flex", gap: "0", flexWrap: "wrap", overflowX: "auto" }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.75rem 1.25rem", background: "none", border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid #bf5fff" : "2px solid transparent",
                  cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? "#bf5fff" : "oklch(0.50 0 0)",
                  letterSpacing: "0.05em", whiteSpace: "nowrap", transition: "color 150ms ease",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container admin-mobile-content" style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "vendors" && <VendorsTab />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "subscriptions" && <SubscriptionsTab />}
        {activeTab === "box_curator" && <BoxCuratorTab />}
        {activeTab === "notify_me" && <NotifyMeTab />}
        {activeTab === "loyalty" && <LoyaltyTab />}
        {activeTab === "coupons" && <CouponsTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "gbp_reviews" && <GbpReviewsTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "abandoned_carts" && <AbandonedCartsTab />}
        {activeTab === "affiliates_payout" && <AffiliatesPayoutTab />}
        {activeTab === "referrals" && <ReferralsTab />}
        {activeTab === "campaigns" && <CampaignsTab />}
        {activeTab === "product_qa" && <ProductQATab />}
        {activeTab === "topshelf" && <TopShelfDashboardInline />}
        {activeTab === "crowdship" && <CrowdshipDashboard />}
        {activeTab === "dropship_apps" && <DropshipAppsTab />}
        {activeTab === "blog" && <BlogEditorInline />}
        {activeTab === "strain_comments" && <StrainCommentsTab />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "wholesale_leads" && <WholesaleLeadsTab />}
        {activeTab === "live_chat" && <AdminChatTab />}
        {activeTab === "messages" && <AdminMessagesTab />}
      </div>
    </div>
  );
}
