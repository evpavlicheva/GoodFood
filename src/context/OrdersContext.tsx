"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Portion } from "./CartContext";

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

/**
 * Simple localStorage-backed order history. Swap for a Supabase `orders`
 * table once auth + backend are wired up — `addOrder` is the only place
 * that would need to change.
 */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setOrders(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
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
    return order;
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
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
