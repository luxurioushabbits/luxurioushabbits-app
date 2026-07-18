/**
 * CartContext — Global cart state management
 * Persisted to localStorage for guest users.
 * Each line item is uniquely identified by productId + weightGrams so different
 * weight selections of the same product appear as separate cart lines.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  productId: number;
  name: string;
  price: string; // decimal string e.g. "49.99"
  quantity: number;
  imageUrl?: string;
  vendorName?: string;
  weightGrams?: number | null;
  category?: string; // e.g. "flower", "extract", "accessory"
}

/** Stable key that uniquely identifies a cart line (product + variant). */
function lineKey(productId: number, weightGrams?: number | null): string {
  return `${productId}:${weightGrams ?? ""}`;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: number, weightGrams?: number | null) => void;
  updateQuantity: (productId: number, quantity: number, weightGrams?: number | null) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "lh_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const key = lineKey(item.productId, item.weightGrams);
    setItems(prev => {
      const existing = prev.find(i => lineKey(i.productId, i.weightGrams) === key);
      if (existing) {
        return prev.map(i =>
          lineKey(i.productId, i.weightGrams) === key
            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity ?? 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: number, weightGrams?: number | null) => {
    const key = lineKey(productId, weightGrams);
    setItems(prev => prev.filter(i => lineKey(i.productId, i.weightGrams) !== key));
  };

  const updateQuantity = (productId: number, quantity: number, weightGrams?: number | null) => {
    if (quantity <= 0) {
      removeItem(productId, weightGrams);
      return;
    }
    const key = lineKey(productId, weightGrams);
    setItems(prev =>
      prev.map(i => lineKey(i.productId, i.weightGrams) === key ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      total, itemCount, isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
