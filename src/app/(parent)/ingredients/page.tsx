"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

interface IngredientRow {
  name: string;
  dishCount: number;
  available: boolean;
}

export default function IngredientsPage() {
  const { t } = useLanguage();
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
  }, []);

  async function loadIngredients() {
    setLoading(true);
    if (!supabase) { setLoading(false); return; }

    // Fetch all dishes with their ingredients
    const { data: dishes } = await supabase
      .from("dishes")
      .select("ingredients")
      .not("ingredients", "eq", "{}");

    // Fetch currently unavailable ingredients
    const { data: unavailable } = await supabase
      .from("unavailable_ingredients")
      .select("name");

    const unavailableSet = new Set((unavailable ?? []).map((r: { name: string }) => r.name));

    // Count how many dishes use each ingredient
    const countMap = new Map<string, number>();
    for (const dish of dishes ?? []) {
      const ings: string[] = dish.ingredients ?? [];
      for (const ing of ings) {
        if (ing) countMap.set(ing, (countMap.get(ing) ?? 0) + 1);
      }
    }

    const rows: IngredientRow[] = Array.from(countMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, dishCount]) => ({
        name,
        dishCount,
        available: !unavailableSet.has(name),
      }));

    setIngredients(rows);
    setLoading(false);
  }

  async function toggleIngredient(name: string, currentlyAvailable: boolean) {
    if (!supabase) return;
    // Optimistic update
    setIngredients((prev) =>
      prev.map((i) => (i.name === name ? { ...i, available: !currentlyAvailable } : i))
    );

    if (currentlyAvailable) {
      // Mark as unavailable
      await supabase
        .from("unavailable_ingredients")
        .upsert({ name }, { onConflict: "name" });
    } else {
      // Mark as available
      await supabase
        .from("unavailable_ingredients")
        .delete()
        .eq("name", name);
    }
  }

  async function enableAll() {
    if (!supabase) return;
    setIngredients((prev) => prev.map((i) => ({ ...i, available: true })));
    await supabase.from("unavailable_ingredients").delete().neq("name", "");
  }

  const unavailableCount = ingredients.filter((i) => !i.available).length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-eel">
          {t("admin.ingredients.title")}
        </h1>
        <p className="mt-1 text-sm text-eel-light">{t("admin.ingredients.subtitle")}</p>
      </div>

      {loading ? (
        <p className="text-center text-eel-light py-12">{t("admin.ingredients.loading")}</p>
      ) : ingredients.length === 0 ? (
        <p className="text-center text-eel-light py-12">{t("admin.ingredients.empty")}</p>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            {unavailableCount > 0 ? (
              <span className="text-sm font-bold text-cardinal">
                {t("admin.ingredients.unavailableCount").replace("{count}", String(unavailableCount))}
              </span>
            ) : (
              <span />
            )}
            {unavailableCount > 0 && (
              <button
                onClick={enableAll}
                className="text-sm font-bold text-feather hover:underline"
              >
                {t("admin.ingredients.markAll")}
              </button>
            )}
          </div>

          <ul className="flex flex-col gap-2">
            {ingredients.map((ing) => (
              <motion.li
                key={ing.name}
                layout
                className="flex items-center justify-between rounded-2xl bg-cloud px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-heading font-extrabold capitalize ${
                      ing.available ? "text-eel" : "text-eel-light line-through"
                    }`}
                  >
                    {ing.name}
                  </span>
                  <span className="text-xs text-eel-light">
                    {ing.dishCount} {ing.dishCount === 1 ? "dish" : "dishes"}
                  </span>
                </div>

                <button
                  onClick={() => toggleIngredient(ing.name, ing.available)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${
                    ing.available ? "bg-feather" : "bg-eel-light/30"
                  }`}
                  aria-label={`${ing.available ? "Disable" : "Enable"} ${ing.name}`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      ing.available ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
