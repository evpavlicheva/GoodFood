import type { Dish, DishCategory } from "@/data/dishes";
import type { CartItem } from "@/context/CartContext";
import type { Order, OrderItem, OrderStatus } from "@/context/OrdersContext";

/** Row shape of the `dishes` table. */
export interface DishRow {
  id: string;
  category: string;
  name: string;
  name_ru: string;
  mascot_tip: string;
  mascot_tip_ru: string;
  emoji: string;
  prep_time: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fun_fact: string;
  image_url: string | null;
  is_available: boolean;
  coin_value: number | null;
  ingredients: string[];
  created_at: string;
}

export function rowToDish(row: DishRow): Dish {
  const hasAnalysis =
    row.calories > 0 || row.protein > 0 || row.fat > 0 || row.carbs > 0 || !!row.fun_fact;

  return {
    id: row.id,
    name: row.name,
    nameRu: row.name_ru || undefined,
    category: row.category as DishCategory,
    image: row.image_url ?? "",
    emoji: row.emoji,
    mascotTip: row.mascot_tip,
    mascotTipRu: row.mascot_tip_ru || undefined,
    prepTime: row.prep_time,
    available: row.is_available ?? true,
    coinValue: row.coin_value ?? undefined,
    ingredients: row.ingredients ?? [],
    analysis: hasAnalysis
      ? {
          calories: row.calories,
          protein: row.protein,
          fat: row.fat,
          carbs: row.carbs,
          funFact: row.fun_fact,
        }
      : undefined,
  };
}

/** Converts a full dish (or new-dish payload) into a DB row, without `id`/`created_at`. */
export function dishToRow(dish: Omit<Dish, "id">): Omit<DishRow, "id" | "created_at"> {
  return {
    category: dish.category,
    name: dish.name,
    name_ru: dish.nameRu ?? "",
    mascot_tip: dish.mascotTip,
    mascot_tip_ru: dish.mascotTipRu ?? "",
    emoji: dish.emoji,
    prep_time: dish.prepTime,
    calories: dish.analysis?.calories ?? 0,
    protein: dish.analysis?.protein ?? 0,
    fat: dish.analysis?.fat ?? 0,
    carbs: dish.analysis?.carbs ?? 0,
    fun_fact: dish.analysis?.funFact ?? "",
    image_url: dish.image || null,
    is_available: dish.available ?? true,
    coin_value: dish.coinValue ?? null,
    ingredients: dish.ingredients ?? [],
  };
}

/** Converts a partial dish update into a partial DB row patch. */
export function dishUpdatesToRow(
  updates: Partial<Omit<Dish, "id">>
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.nameRu !== undefined) row.name_ru = updates.nameRu ?? "";
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.image !== undefined) row.image_url = updates.image || null;
  if (updates.emoji !== undefined) row.emoji = updates.emoji;
  if (updates.mascotTip !== undefined) row.mascot_tip = updates.mascotTip;
  if (updates.mascotTipRu !== undefined) row.mascot_tip_ru = updates.mascotTipRu ?? "";
  if (updates.prepTime !== undefined) row.prep_time = updates.prepTime;
  if (updates.available !== undefined) row.is_available = updates.available;
  if (updates.coinValue !== undefined) row.coin_value = updates.coinValue ?? null;
  if (updates.ingredients !== undefined) row.ingredients = updates.ingredients ?? [];
  if (updates.analysis !== undefined) {
    row.calories = updates.analysis?.calories ?? 0;
    row.protein = updates.analysis?.protein ?? 0;
    row.fat = updates.analysis?.fat ?? 0;
    row.carbs = updates.analysis?.carbs ?? 0;
    row.fun_fact = updates.analysis?.funFact ?? "";
  }
  return row;
}

/** Row shape of the `orders` table. */
export interface OrderRow {
  id: string;
  child_name: string;
  status: string;
  items: OrderItem[];
  mascot_message: string;
  created_at: string;
  updated_at: string;
}

export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    childName: row.child_name,
    items: row.items,
    status: row.status as OrderStatus,
    mascotMessage: row.mascot_message,
    createdAt: row.created_at,
  };
}

export function orderToRow(
  order: Order
): Omit<OrderRow, "created_at" | "updated_at"> {
  return {
    id: order.id,
    child_name: order.childName,
    status: order.status,
    items: order.items,
    mascot_message: order.mascotMessage,
  };
}

/** Row shape of the `carts` table. */
export interface CartRow {
  device_id: string;
  items: CartItem[];
  updated_at: string;
}
