"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Portion = "whole" | "half";

export interface CartItem {
  dishId: string;
  name: string;
  emoji: string;
  image: string;
  portion: Portion;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (dishId: string, portion: Portion) => void;
  clearCart: () => void;
  /** Replace the whole cart at once — used when editing a placed order. */
  replaceItems: (items: CartItem[]) => void;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "goodfood:cart";

/**
 * Simple localStorage-backed cart. Swap for Supabase-synced cart once
 * real ordering/checkout logic is wired up.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Couldn't save cart to localStorage (storage full?)", err);
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.dishId === item.dishId && i.portion === item.portion
      );
      if (existing) {
        return prev.map((i) =>
          i.dishId === item.dishId && i.portion === item.portion
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((dishId: string, portion: Portion) => {
    setItems((prev) => prev.filter((i) => !(i.dishId === dishId && i.portion === portion)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const replaceItems = useCallback((newItems: CartItem[]) => setItems(newItems), []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, replaceItems, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
