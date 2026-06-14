"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DISHES as SEED_DISHES, type Dish } from "@/data/dishes";

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

/**
 * Editable menu store, seeded from `src/data/dishes.ts`. Persisted to
 * localStorage so admin edits (and AI photo analysis results) stick around.
 * Swap for a Supabase `dishes` table later — only this file should need
 * to change.
 */
export function MenuProvider({ children }: { children: ReactNode }) {
  const [dishes, setDishes] = useState<Dish[]>(SEED_DISHES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setDishes(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
    } catch (err) {
      // Most likely a quota error from large photo data URLs — don't crash
      // the app, the in-memory menu still works for this session.
      console.warn("Couldn't save menu to localStorage (storage full?)", err);
    }
  }, [dishes, hydrated]);

  const addDish = useCallback((dish: Omit<Dish, "id">) => {
    const newDish: Dish = { ...dish, id: `dish_${Date.now()}` };
    setDishes((prev) => [...prev, newDish]);
    return newDish;
  }, []);

  const updateDish = useCallback((id: string, updates: Partial<Omit<Dish, "id">>) => {
    setDishes((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const deleteDish = useCallback((id: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));
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
