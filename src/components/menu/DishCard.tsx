"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getDishName, getDishTip, type Dish } from "@/data/dishes";
import { useCart, type Portion } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

interface DishCardProps {
  dish: Dish;
}

const PORTIONS: Portion[] = ["whole", "half"];

export default function DishCard({ dish }: DishCardProps) {
  const [imgError, setImgError] = useState(false);
  const [portion, setPortion] = useState<Portion>("whole");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { t, lang } = useLanguage();

  const name = getDishName(dish, lang);
  const tip = getDishTip(dish, lang);
  const hasPhoto = Boolean(dish.image) && !imgError;

  function handleAdd() {
    addItem({
      dishId: dish.id,
      name: dish.name,
      emoji: dish.emoji,
      image: dish.image,
      portion,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-card"
    >
      <div className="relative h-40 w-full bg-cloud">
        {hasPhoto ? (
          // Plain <img> so admin-uploaded `data:` URLs (from FileReader)
          // work just as well as static files under /public.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.image.startsWith("data:") ? dish.image : encodeURI(dish.image)}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">
            {dish.emoji}
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-eel shadow-card">
          ⏱ {dish.prepTime} {t("menu.min")}
        </span>
        {dish.analysis && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-feather shadow-card">
            🔥 {dish.analysis.calories} {t("menu.kcal")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-heading text-lg font-extrabold text-eel">{name}</h3>
        <p className="text-sm text-eel-light">{tip}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex rounded-full bg-cloud p-1">
            {PORTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPortion(p)}
                className={`rounded-full px-3 py-1 text-sm font-heading font-bold transition-colors ${
                  portion === p ? "bg-feather text-white" : "text-eel-light"
                }`}
              >
                {t(`menu.${p}`)}
              </button>
            ))}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handleAdd}
            className="btn-press rounded-2xl bg-feather px-4 py-2 font-heading font-extrabold text-white shadow-duo shadow-feather-700"
          >
            {added ? t("menu.added") : t("menu.addToCart")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
