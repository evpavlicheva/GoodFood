"use client";

import { useState } from "react";
import Image from "next/image";
import DishCard from "@/components/menu/DishCard";
import { CATEGORIES, CATEGORY_EMOJI, type DishCategory } from "@/data/dishes";
import { useMenu } from "@/context/MenuContext";
import { useLanguage } from "@/context/LanguageContext";

const ALL = "All" as const;
type CategoryFilter = DishCategory | typeof ALL;

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(ALL);
  const { dishes } = useMenu();
  const { t } = useLanguage();

  const filteredDishes =
    activeCategory === ALL ? dishes : dishes.filter((dish) => dish.category === activeCategory);

  return (
    <main className="min-h-screen px-6 py-10 pb-28">
      <h1 className="mb-6 flex items-center justify-center gap-2 text-center font-heading text-4xl font-extrabold text-feather">
        <span className="relative block h-10 w-10 shrink-0">
          <Image src="/icons/menu.png" alt="" fill sizes="40px" className="object-contain" />
        </span>
        {t("menu.title")}
      </h1>

      <div className="mx-auto mb-8 flex max-w-5xl flex-wrap justify-center gap-2">
        {([ALL, ...CATEGORIES] as CategoryFilter[]).map((category) => (
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
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <p className="mt-10 text-center font-heading text-lg text-eel-light">
          {t("menu.empty")}
        </p>
      )}
    </main>
  );
}
