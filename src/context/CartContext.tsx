"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import type { CartRow } from "@/lib/supabase/mappers";

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
const DEVICE_ID_KEY = "goodfood:device-id";

function getDeviceId(): string {
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * Cart contents, persisted to a Supabase `carts` row keyed by a per-browser
 * device id (so a cart survives reinstalls/cache clears on the same
 * device). Falls back to plain `localStorage` if Supabase isn't configured.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const deviceIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!supabase) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) setItems(JSON.parse(raw));
        } catch {
          // ignore malformed storage
        }
        if (active) setHydrated(true);
        return;
      }

      const deviceId = getDeviceId();
      deviceIdRef.current = deviceId;

      const { data, error } = await supabase
        .from("carts")
        .select("*")
        .eq("device_id", deviceId)
        .maybeSingle();

      if (error) {
        console.warn("Supabase cart fetch failed:", error);
      } else if (data) {
        const row = data as CartRow;
        if (active) setItems(row.items ?? []);
      }

      if (active) setHydrated(true);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!supabase) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.warn("Couldn't save cart to localStorage (storage full?)", err);
      }
      return;
    }

    const deviceId = deviceIdRef.current ?? getDeviceId();
    deviceIdRef.current = deviceId;
    supabase
      .from("carts")
      .upsert({ device_id: deviceId, items, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.warn("Couldn't save cart to Supabase:", error);
      });
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
