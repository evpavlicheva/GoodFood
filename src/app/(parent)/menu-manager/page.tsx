"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES, getDishName } from "@/data/dishes";
import { useMenu } from "@/context/MenuContext";
import { buttonClasses } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { pluralRu } from "@/lib/i18n/translations";

export default function MenuManagerPage() {
  const { dishes, isLoading } = useMenu();
  const { t, lang } = useLanguage();

  const dishesWord =
    lang === "ru"
      ? pluralRu(dishes.length, "блюдо", "блюда", "блюд")
      : `dish${dishes.length === 1 ? "" : "es"}`;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-eel">{t("admin.menuManager.title")}</h1>
          <p className="text-eel-light">
            {t("admin.menuManager.dishesOnMenu", { count: `${dishes.length} ${dishesWord}` })}
          </p>
        </div>
        <Link href="/menu-manager/new" className={buttonClasses({ color: "feather" })}>
          {t("admin.menuManager.addDish")}
        </Link>
      </div>

      {isLoading ? (
        <p className="text-eel-light">{t("admin.menuManager.loading")}</p>
      ) : (
        CATEGORIES.map((category) => {
          const items = dishes.filter((d) => d.category === category);
          if (items.length === 0) return null;

          return (
            <section key={category} className="mb-8">
              <h2 className="mb-3 font-heading text-lg font-extrabold text-eel-light">
                {t(`categories.${category}`)}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((dish) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cloud text-2xl">
                      {dish.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={dish.image.startsWith("data:") ? dish.image : encodeURI(dish.image)}
                          alt={getDishName(dish, lang)}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        dish.emoji
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-extrabold text-eel">{getDishName(dish, lang)}</p>
                      <p className="text-sm text-eel-light">
                        ⏱ {dish.prepTime} {t("menu.min")}
                        {dish.analysis ? ` · 🔥 ${dish.analysis.calories} ${t("menu.kcal")}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/menu-manager/${dish.id}`}
                      className="btn-press rounded-xl bg-cloud px-3 py-2 text-sm font-heading font-bold text-eel hover:text-feather"
                    >
                      {t("admin.menuManager.edit")}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })
      )}

      {!isLoading && dishes.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center shadow-card">
          <span className="text-5xl">🍽️</span>
          <p className="mt-3 font-heading font-bold text-eel-light">{t("admin.menuManager.empty")}</p>
        </div>
      )}
    </main>
  );
}
