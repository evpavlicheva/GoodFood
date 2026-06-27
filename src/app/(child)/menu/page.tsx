"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DishCard from "@/components/menu/DishCard";
import { CATEGORIES, CATEGORY_EMOJI, type Dish, type DishCategory } from "@/data/dishes";
import { useMenu } from "@/context/MenuContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { supabase } from "@/lib/supabase/client";

const ALL = "All" as const;
type CategoryFilter = DishCategory | string | typeof ALL;

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(ALL);
  const { dishes } = useMenu();
  const { t, lang } = useLanguage();
  const { customCategories } = useCustomCategories();
  const [unavailableIngredients, setUnavailableIngredients] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("unavailable_ingredients")
      .select("name")
      .then(({ data }) => {
        if (data) setUnavailableIngredients(new Set(data.map((r: { name: string }) => r.name)));
      });
  }, []);

  function effectiveDish(dish: Dish): Dish {
    if (!dish.available && dish.available !== undefined) return dish;
    const hasUnavailableIngredient = (dish.ingredients ?? []).some((ing) =>
      unavailableIngredients.has(ing)
    );
    if (hasUnavailableIngredient) return { ...dish, available: false };
    return dish;
  }

  // Only show categories that actually have dishes
  const usedCategories = new Set<string>(dishes.map((d) => d.category as string));
  const builtInFilters = CATEGORIES.filter((c) => usedCategories.has(c));
  const customFilters = customCategories.filter((c) => usedCategories.has(c.name));

  // All category labels in order (for grouping)
  const allCategoryLabels: { key: string; emoji: string; label: string }[] = [
    ...builtInFilters.map((c) => ({
      key: c,
      emoji: CATEGORY_EMOJI[c],
      label: t(`categories.${c}`),
    })),
    ...customFilters.map((c) => ({
      key: c.name,
      emoji: c.emoji,
      label: lang === "ru" && c.nameRu ? c.nameRu : c.name,
    })),
  ];

  const filteredDishes =
    activeCategory === ALL ? dishes : dishes.filter((d) => d.category === activeCategory);

  return (
    <main className="min-h-screen px-6 py-10 pb-28">
      <h1 className="mb-6 flex items-center justify-center gap-2 text-center font-heading text-4xl font-extrabold text-feather">
        <span className="relative block h-10 w-10 shrink-0">
          <Image src="/icons/menu.png" alt="" fill sizes="40px" className="object-contain" />
        </span>
        {t("menu.title")}
      </h1>

      {/* Category filter tabs */}
      <div className="mx-auto mb-8 flex max-w-5xl flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(ALL)}
          className={`btn-press rounded-2xl px-4 py-2 font-heading font-bold shadow-duo-sm ${
            activeCategory === ALL
              ? "bg-feather text-white shadow-feather-700"
              : "bg-white text-eel shadow-wolf"
          }`}
        >
          {CATEGORY_EMOJI["All"]} {t("categories.All")}
        </button>

        {builtInFilters.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`btn-press rounded-2xl px-4 py-2 font-heading font-bold shadow-duo-sm ${
              activeCategory === category
                ? "bg-feather text-white shadow-feather-700"
                : "bg-white text-eel shadow-wolf"
            }`}
          >
            {CATEGORY_EMOJI[category]} {t(`categories.${category}`)}
          </button>
        ))}

        {customFilters.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.name)}
            className={`btn-press rounded-2xl px-4 py-2 font-heading font-bold shadow-duo-sm ${
              activeCategory === cat.name
                ? "bg-feather text-white shadow-feather-700"
                : "bg-white text-eel shadow-wolf"
            }`}
          >
            {cat.emoji} {lang === "ru" && cat.nameRu ? cat.nameRu : cat.name}
          </button>
        ))}
      </div>

      {/* Dishes — grouped by category on "All", flat otherwise */}
      {activeCategory === ALL ? (
        <div className="mx-auto max-w-5xl space-y-10">
          {allCategoryLabels.map(({ key, emoji, label }) => {
            const group = dishes.filter((d) => d.category === key);
            if (group.length === 0) return null;
            return (
              <section key={key}>
                <h2 className="mb-4 flex items-center gap-2 font-heading text-2xl font-extrabold text-eel">
                  <span>{emoji}</span>
                  {label}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((dish) => (
                    <DishCard key={dish.id} dish={effectiveDish(dish)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={effectiveDish(dish)} />
          ))}
        </div>
      )}

      {filteredDishes.length === 0 && (
        <p className="mt-10 text-center font-heading text-lg text-eel-light">
          {t("menu.empty")}
        </p>
      )}
    </main>
  );
}
