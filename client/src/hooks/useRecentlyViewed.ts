/**
 * useRecentlyViewed — localStorage-based recently viewed products hook.
 * Stores up to MAX_ITEMS product slugs. Records a view on mount from ProductDetail.
 */
import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "lh_recently_viewed";
const MAX_ITEMS = 6;

export interface RecentlyViewedItem {
  slug: string;
  name: string;
  imageUrl?: string | null;
  strainType?: string | null;
  retailPrice?: string | null;
}

function readStorage(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentlyViewedItem[];
  } catch {
    return [];
  }
}

function writeStorage(items: RecentlyViewedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable (private mode, etc.) — fail silently
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>(() => readStorage());

  // Sync across tabs
  useEffect(() => {
    const handler = () => setItems(readStorage());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const recordView = useCallback((item: RecentlyViewedItem) => {
    setItems(prev => {
      // Remove existing entry for this slug (dedup), then prepend
      const filtered = prev.filter(p => p.slug !== item.slug);
      const next = [item, ...filtered].slice(0, MAX_ITEMS);
      writeStorage(next);
      return next;
    });
  }, []);

  return { items, recordView };
}
