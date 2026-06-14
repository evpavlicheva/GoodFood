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
import { DISHES as SEED_DISHES, type Dish } from "@/data/dishes";
import { supabase } from "@/lib/supabase/client";
import { dishToRow, dishUpdatesToRow, rowToDish, type DishRow } from "@/lib/supabase/mappers";

interface MenuContextValue {
  dishes: Dish[];
  isLoading: boolean;
  addDish: (dish: Omit<Dish, "id">) => Dish;
  updateDish: (id: string, updates: Partial<Omit<Dish, "id">>) => void;
  deleteDish: (id: string) => void;
  getDish: (id: string) => Dish | undefined;
}

const MenuContext = createContext<MenuContextValue | null>(null);
const STORAGE_KEY = "goodfood:menu";
const POLL_INTERVAL_MS = 15000;

/**
 * Editable menu store backed by Supabase's `dishes` table, so admin edits
 * (and AI photo analysis results) are shared across every device. Seeded
 * from `src/data/dishes.ts` the first time the table is empty.
 *
 * Falls back to `localStorage` (and the local seed) if Supabase isn't
 * configured, so the app still works without a backend.
 */
export function MenuProvider({ children }: { children: ReactNode }) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const loadedFromLocalStorage = useRef(false);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setDishes(raw ? JSON.parse(raw) : SEED_DISHES);
    } catch {
      setDishes(SEED_DISHES);
    }
    loadedFromLocalStorage.current = true;
  }, []);

  const fetchDishes = useCallback(async () => {
    if (!supabase) {
      loadFromLocalStorage();
      setHydrated(true);
      return;
    }

    const { data, error } = await supabase
      .from("dishes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase dishes fetch failed, using local data:", error);
      loadFromLocalStorage();
      setHydrated(true);
      return;
    }

    if (!data || data.length === 0) {
      // First run: seed the shared table from the local catalog.
      const rows = SEED_DISHES.map((d) => ({ id: d.id, ...dishToRow(d) }));
      const { error: upsertError } = await supabase
        .from("dishes")
        .upsert(rows, { onConflict: "id" });
      if (upsertError) {
        console.warn("Couldn't seed dishes table:", upsertError);
      }
      const { data: seeded } = await supabase
        .from("dishes")
        .select("*")
        .order("created_at", { ascending: true });
      const seededRows = seeded as DishRow[] | null;
      setDishes(seededRows && seededRows.length ? seededRows.map(rowToDish) : SEED_DISHES);
      setHydrated(true);
      return;
    }

    setDishes((data as DishRow[]).map(rowToDish));
    setHydrated(true);
  }, [loadFromLocalStorage]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  // Keep dishes fresh across devices (e.g. another admin editing the menu).
  useEffect(() => {
    if (!supabase) return;
    const interval = setInterval(fetchDishes, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDishes]);

  // localStorage fallback persistence (only used when Supabase isn't configured).
  useEffect(() => {
    if (supabase || !hydrated || !loadedFromLocalStorage.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
    } catch (err) {
      console.warn("Couldn't save menu to localStorage (storage full?)", err);
    }
  }, [dishes, hydrated]);

  const addDish = useCallback((dish: Omit<Dish, "id">) => {
    const id = `dish_${Date.now()}`;
    const newDish: Dish = { ...dish, id };
    setDishes((prev) => [...prev, newDish]);

    if (supabase) {
      supabase
        .from("dishes")
        .insert({ id, ...dishToRow(dish) })
        .then(({ error }) => {
          if (error) console.warn("Couldn't save dish to Supabase:", error);
        });
    }

    return newDish;
  }, []);

  const updateDish = useCallback((id: string, updates: Partial<Omit<Dish, "id">>) => {
    setDishes((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

    if (supabase) {
      supabase
        .from("dishes")
        .update(dishUpdatesToRow(updates))
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Couldn't update dish in Supabase:", error);
        });
    }
  }, []);

  const deleteDish = useCallback((id: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));

    if (supabase) {
      supabase
        .from("dishes")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Couldn't delete dish in Supabase:", error);
        });
    }
  }, []);

  const getDish = useCallback((id: string) => dishes.find((d) => d.id === id), [dishes]);

  return (
    <MenuContext.Provider
      value={{ dishes, isLoading: !hydrated, addDish, updateDish, deleteDish, getDish }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within a MenuProvider");
  return ctx;
}
