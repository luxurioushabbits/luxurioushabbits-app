/**
 * CartDrawer — Slide-in cart panel
 * Black luxury aesthetic, glitch accents
 */
import { useCart } from "@/contexts/CartContext";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "wouter";
import RecentlyViewedRow from "@/components/RecentlyViewedRow";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          background: "oklch(0 0 0 / 70%)",
          zIndex: 200,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 250ms ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 100vw)",
          background: "oklch(0.05 0 0)",
          borderLeft: "1px solid oklch(1 0 0 / 10%)",
          zIndex: 201,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.23, 1, 0.32, 1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem",
          borderBottom: "1px solid oklch(1 0 0 / 8%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ShoppingBag size={18} style={{ color: "#bf5fff" }} />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.1em", color: "oklch(0.96 0 0)" }}>
              YOUR CART
            </span>
            {itemCount > 0 && (
              <span style={{ background: "#bf5fff", color: "oklch(0.04 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "100px" }}>
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            style={{ background: "none", border: "none", color: "oklch(0.45 0 0)", cursor: "pointer", padding: "4px", transition: "color 150ms ease" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "oklch(0.80 0 0)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "oklch(0.45 0 0)"}
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {items.length === 0 ? (
            <div>
              <div style={{ textAlign: "center", padding: "3rem 0 1.5rem" }}>
                <ShoppingBag size={40} style={{ color: "oklch(0.20 0 0)", marginBottom: "1rem" }} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "oklch(0.35 0 0)" }}>
                  Your cart is empty
                </div>
                <button
                  onClick={closeCart}
                  style={{ marginTop: "1.5rem", background: "none", border: "1px solid oklch(1 0 0 / 15%)", color: "oklch(0.55 0 0)", fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", padding: "0.6rem 1.25rem", borderRadius: "6px", cursor: "pointer" }}
                >
                  CONTINUE SHOPPING
                </button>
              </div>
              <RecentlyViewedRow />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {items.map(item => (
                <div
                  key={`${item.productId}:${item.weightGrams ?? ""}`}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    padding: "1rem",
                    background: "oklch(0.07 0 0)",
                    borderRadius: "8px",
                    border: "1px solid oklch(1 0 0 / 6%)",
                  }}
                >
                  {/* Image placeholder */}
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "6px",
                    background: "oklch(0.10 0 0)",
                    border: "1px solid oklch(1 0 0 / 8%)",
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                    ) : (
                      <ShoppingBag size={20} style={{ color: "oklch(0.25 0 0)" }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "oklch(0.85 0 0)", marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </div>
                    {item.vendorName && (
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.40 0 0)", marginBottom: "0.5rem" }}>
                        {item.vendorName}
                      </div>
                    )}
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "#bf5fff", letterSpacing: "0.05em" }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity + Remove */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <button
                      onClick={() => removeItem(item.productId, item.weightGrams)}
                      style={{ background: "none", border: "none", color: "oklch(0.30 0 0)", cursor: "pointer", padding: "2px", transition: "color 150ms ease" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ff4444"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "oklch(0.30 0 0)"}
                    >
                      <Trash2 size={13} />
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.weightGrams)}
                        style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "4px", color: "oklch(0.60 0 0)", cursor: "pointer" }}
                      >
                        <Minus size={10} />
                      </button>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "oklch(0.80 0 0)", minWidth: "20px", textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.weightGrams)}
                        style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.10 0 0)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "4px", color: "oklch(0.60 0 0)", cursor: "pointer" }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "1.5rem", borderTop: "1px solid oklch(1 0 0 / 8%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "oklch(0.50 0 0)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Subtotal</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "oklch(0.96 0 0)", letterSpacing: "0.05em" }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "oklch(0.35 0 0)", textAlign: "center", marginBottom: "1rem" }}>
              Shipping calculated at checkout. Adult signature required.
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <button
                className="btn-gold"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <span>Proceed to Checkout</span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
