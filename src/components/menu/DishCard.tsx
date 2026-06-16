"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCoinValue, getDishName, getDishTip, isSnack as isSnackDish, type Dish } from "@/data/dishes";
import { useCart, type Portion } from "@/context/CartContext";
import { useChildProfile } from "@/context/ChildProfileContext";
import { useLanguage } from "@/context/LanguageContext";
import GoldCoin from "@/components/ui/GoldCoin";

interface DishCardProps {
  dish: Dish;
}

const PORTIONS: Portion[] = ["whole", "half"];

export default function DishCard({ dish }: DishCardProps) {
  const [imgError, setImgError] = useState(false);
  const [portion, setPortion] = useState<Portion>("whole");
  const [added, setAdded] = useState(false);
  const [showCoinMessage, setShowCoinMessage] = useState(false);
  const { items, addItem } = useCart();
  const { spendCoins } = useChildProfile();
  const { t, lang } = useLanguage();

  const name = getDishName(dish, lang);
  const tip = getDishTip(dish, lang);
  const hasPhoto = Boolean(dish.image) && !imgError;
  const isAvailable = dish.available ?? true;
  const snack = isSnackDish(dish);
  const coinValue = getCoinValue(dish);
  const inCart = items.some((i) => i.dishId === dish.id && i.quantity > 0);

  function handleAdd() {
    if (!isAvailable) return;

    if (snack) {
      if (!spendCoins(coinValue)) {
        setShowCoinMessage(true);
        setTimeout(() => setShowCoinMessage(false), 2400);
        return;
      }
    }

    addItem({
      dishId: dish.id,
      name: dish.name,
      emoji: dish.emoji,
      image: dish.image,
      portion,
      coinValue,
      isSnack: snack,
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
      <div className={`relative h-40 w-full bg-cloud ${!isAvailable ? "grayscale" : ""}`}>
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
        <span
          className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold shadow-card ${
            snack ? "bg-bee text-eel" : "bg-feather-50 text-feather-700"
          }`}
        >
          <GoldCoin size={14} />
          {snack ? t("menu.coinsCost", { count: coinValue }) : t("menu.earnCoins", { count: coinValue })}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-eel shadow-card">
          ⏱ {dish.prepTime} {t("menu.min")}
        </span>
        {inCart && (
          <span className="absolute bottom-3 right-3 rounded-full bg-feather px-3 py-1 text-xs font-extrabold text-white shadow-card">
            {t("menu.inCartBadge")}
          </span>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-eel/40">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-extrabold text-eel shadow-card">
              {t("menu.unavailable")}
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-2 p-4 ${!isAvailable ? "opacity-60" : ""}`}>
        <h3 className="font-heading text-lg font-extrabold text-eel">{name}</h3>
        <p className="text-sm text-eel-light">{tip}</p>

        <AnimatePresence>
          {showCoinMessage && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-bold text-cardinal"
            >
              {t("menu.needMoreCoins")}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex rounded-full bg-cloud p-1">
            {PORTIONS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={!isAvailable}
                onClick={() => setPortion(p)}
                className={`rounded-full px-3 py-1 text-sm font-heading font-bold transition-colors ${
                  portion === p ? "bg-feather text-white" : "text-eel-light"
                } ${!isAvailable ? "cursor-not-allowed" : ""}`}
              >
                {t(`menu.${p}`)}
              </button>
            ))}
          </div>

          <motion.button
            type="button"
            whileTap={isAvailable ? { scale: 0.94 } : undefined}
            onClick={handleAdd}
            disabled={!isAvailable}
            className={`btn-press rounded-2xl px-4 py-2 font-heading font-extrabold shadow-duo ${
              isAvailable
                ? "bg-feather text-white shadow-feather-700"
                : "cursor-not-allowed bg-cloud text-eel-light shadow-none"
            }`}
          >
            {added ? t("menu.added") : t("menu.addToCart")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
