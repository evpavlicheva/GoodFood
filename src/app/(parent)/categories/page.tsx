"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, CATEGORY_EMOJI } from "@/data/dishes";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { useLanguage } from "@/context/LanguageContext";

export default function CategoriesPage() {
  const { t, lang } = useLanguage();
  const { customCategories, loading, addCategory, deleteCategory } = useCustomCategories();
  const [name, setName] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [emoji, setEmoji] = useState("🍴");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await addCategory(name.trim(), nameRu.trim(), emoji || "🍴");
    setName("");
    setNameRu("");
    setEmoji("🍴");
    setSaving(false);
  }

  async function handleDelete(id: string, catName: string) {
    if (!confirm(t("admin.categories.deleteConfirm").replace("{name}", catName))) return;
    await deleteCategory(id);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-eel">
          {t("admin.categories.title")}
        </h1>
        <p className="mt-1 text-sm text-eel-light">{t("admin.categories.subtitle")}</p>
      </div>

      {/* Add new category */}
      <form onSubmit={handleAdd} className="mb-8 rounded-2xl bg-cloud p-5">
        <p className="mb-4 font-heading text-sm font-extrabold text-eel">
          {t("admin.categories.addTitle")}
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="mb-1 block text-xs font-bold text-eel-light">
              {t("admin.categories.nameLabel")}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("admin.categories.namePlaceholder")}
              className="w-full rounded-xl border-2 border-snow bg-white px-3 py-2 text-eel outline-none focus:border-feather"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-eel-light">
              {t("admin.categories.nameRuLabel")}
            </label>
            <input
              type="text"
              value={nameRu}
              onChange={(e) => setNameRu(e.target.value)}
              placeholder={t("admin.categories.nameRuPlaceholder")}
              className="w-full rounded-xl border-2 border-snow bg-white px-3 py-2 text-eel outline-none focus:border-feather"
            />
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-eel-light">
                {t("admin.categories.emojiLabel")}
              </label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="w-16 rounded-xl border-2 border-snow bg-white px-3 py-2 text-center text-lg outline-none focus:border-feather"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-xl bg-feather px-4 py-2 font-heading font-extrabold text-white shadow-duo shadow-feather-700 disabled:opacity-50"
            >
              {saving ? "…" : t("admin.categories.addButton")}
            </button>
          </div>
        </div>
      </form>

      {/* Built-in categories */}
      <p className="mb-3 font-heading text-xs font-extrabold uppercase tracking-wider text-eel-light">
        {t("admin.categories.builtIn")}
      </p>
      <ul className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <li
            key={cat}
            className="flex items-center gap-1.5 rounded-full bg-cloud px-4 py-2 font-heading text-sm font-bold text-eel-light"
          >
            <span>{CATEGORY_EMOJI[cat]}</span>
            <span>{cat}</span>
          </li>
        ))}
      </ul>

      {/* Custom categories */}
      <p className="mb-3 font-heading text-xs font-extrabold uppercase tracking-wider text-eel-light">
        {t("admin.categories.custom")}
      </p>

      {loading ? (
        <p className="text-sm text-eel-light">{t("admin.categories.loading")}</p>
      ) : customCategories.length === 0 ? (
        <p className="text-sm text-eel-light">{t("admin.categories.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence>
            {customCategories.map((cat) => (
              <motion.li
                key={cat.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between rounded-2xl bg-cloud px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <span className="font-heading font-extrabold text-eel">{cat.name}</span>
                    {cat.nameRu && (
                      <span className="ml-2 text-sm text-eel-light">{cat.nameRu}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cat.id, lang === "ru" && cat.nameRu ? cat.nameRu : cat.name)}
                  className="rounded-xl px-3 py-1.5 text-sm font-bold text-eel-light hover:bg-cardinal-50 hover:text-cardinal"
                >
                  ✕
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </main>
  );
}
