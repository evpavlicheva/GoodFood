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
import type { CartItem, Portion } from "./CartContext";
import { supabase } from "@/lib/supabase/client";
import { orderToRow, rowToOrder, type OrderRow } from "@/lib/supabase/mappers";

export type OrderStatus = "preparing" | "ready" | "completed" | "cancelled";

export interface OrderItem {
  dishId: string;
  name: string;
  emoji: string;
  portion: Portion;
  quantity: number;
}

export interface Order {
  id: string;
  childName: string;
  items: OrderItem[];
  status: OrderStatus;
  mascotMessage: string;
  createdAt: string; // ISO timestamp
}

export const STATUS_META: Record<
  OrderStatus,
  { label: string; emoji: string; colorClass: string }
> = {
  preparing: {
    label: "Accepted and being prepared",
    emoji: "👩‍🍳",
    colorClass: "bg-bee-50 text-bee-700",
  },
  ready: {
    label: "Ready to pick up",
    emoji: "🛎️",
    colorClass: "bg-macaw-50 text-macaw-700",
  },
  completed: {
    label: "Enjoy your meal!",
    emoji: "🎉",
    colorClass: "bg-feather-50 text-feather-700",
  },
  cancelled: {
    label: "Cancelled",
    emoji: "❌",
    colorClass: "bg-cardinal-50 text-cardinal-700",
  },
};

interface OrdersContextValue {
  orders: Order[];
  addOrder: (items: CartItem[], mascotMessage: string, childName: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  removeOrder: (orderId: string) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);
const STORAGE_KEY = "goodfood:orders";
const POLL_INTERVAL_MS = 5000;

/**
 * Order history backed by Supabase's `orders` table, so an order placed on
 * a child's phone shows up live in the parent's admin dashboard (polled
 * every few seconds).
 *
 * Falls back to `localStorage` if Supabase isn't configured.
 */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const loadedFromLocalStorage = useRef(false);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setOrders(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    loadedFromLocalStorage.current = true;
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!supabase) {
      if (!loadedFromLocalStorage.current) loadFromLocalStorage();
      setHydrated(true);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase orders fetch failed, using local data:", error);
      if (!loadedFromLocalStorage.current) loadFromLocalStorage();
      setHydrated(true);
      return;
    }

    setOrders((data as OrderRow[]).map(rowToOrder));
    setHydrated(true);
  }, [loadFromLocalStorage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Poll for new/updated orders placed from other devices.
  useEffect(() => {
    if (!supabase) return;
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // localStorage fallback persistence (only used when Supabase isn't configured).
  useEffect(() => {
    if (supabase || !hydrated || !loadedFromLocalStorage.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.warn("Couldn't save orders to localStorage (storage full?)", err);
    }
  }, [orders, hydrated]);

  const addOrder = useCallback((items: CartItem[], mascotMessage: string, childName: string) => {
    const order: Order = {
      id: `order_${Date.now()}`,
      childName,
      items: items.map(({ dishId, name, emoji, portion, quantity }) => ({
        dishId,
        name,
        emoji,
        portion,
        quantity,
      })),
      status: "preparing",
      mascotMessage,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);

    if (supabase) {
      supabase
        .from("orders")
        .insert(orderToRow(order))
        .then(({ error }) => {
          if (error) console.warn("Couldn't save order to Supabase:", error);
        });
    }

    return order;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    if (supabase) {
      supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .then(({ error }) => {
          if (error) console.warn("Couldn't update order status in Supabase:", error);
        });
    }
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    if (supabase) {
      supabase
        .from("orders")
        .delete()
        .eq("id", orderId)
        .then(({ error }) => {
          if (error) console.warn("Couldn't delete order in Supabase:", error);
        });
    }
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, removeOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
