"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CATEGORIES, CATEGORY_EMOJI, DEFAULT_COIN_VALUE, type Dish, type DishAnalysis, type DishCategory } from "@/data/dishes";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { analyzeDishPhoto } from "@/lib/ai/analyzeDish";
import { resizeImageDataUrl } from "@/lib/image";
import { uploadDishImage } from "@/lib/supabase/storage";
import { buttonClasses } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export type DishFormValues = Omit<Dish, "id">;

interface DishFormProps {
  initial?: Dish;
  submitLabel: string;
  onSubmit: (values: DishFormValues) => void;
  onDelete?: () => void;
}

const EMPTY_ANALYSIS: DishAnalysis = { calories: 0, protein: 0, fat: 0, carbs: 0, funFact: "" };

export default function DishForm({ initial, submitLabel, onSubmit, onDelete }: DishFormProps) {
  const { t, lang } = useLanguage();
  const { customCategories } = useCustomCategories();
  const [name, setName] = useState(initial?.name ?? "");
  const [nameRu, setNameRu] = useState(initial?.nameRu ?? "");
  const [category, setCategory] = useState<DishCategory>(initial?.category ?? CATEGORIES[0]);
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🍽️");
  const [mascotTip, setMascotTip] = useState(initial?.mascotTip ?? "");
  const [mascotTipRu, setMascotTipRu] = useState(initial?.mascotTipRu ?? "");
  const [prepTime, setPrepTime] = useState(initial?.prepTime ?? 10);
  const [coinValue, setCoinValue] = useState(
    initial?.coinValue ?? DEFAULT_COIN_VALUE[initial?.category ?? CATEGORIES[0]]
  );
  const [image, setImage] = useState(initial?.image ?? "");
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [analysis, setAnalysis] = useState<DishAnalysis | undefined>(initial?.analysis);
  const [ingredients, setIngredients] = useState<string[]>(initial?.ingredients ?? []);
  const [ingredientInput, setIngredientInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      // Shrink the photo before storing it — full-size camera photos can be
      // several MB each, which quickly exceeds localStorage's quota.
      const dataUrl = await resizeImageDataUrl(rawDataUrl);
      setImage(dataUrl); // instant local preview

      // Ask Claude Vision to identify the dish, suggest copy, and estimate
      // nutrition, while uploading the photo to Supabase Storage so it's
      // shared across devices.
      setAnalyzing(true);
      const [result, hostedUrl] = await Promise.all([
        analyzeDishPhoto(dataUrl, name),
        uploadDishImage(dataUrl),
      ]);
      setImage(hostedUrl);
      setAnalysis({
        calories: result.calories,
        protein: result.protein,
        fat: result.fat,
        carbs: result.carbs,
        funFact: result.funFact,
      });

      // Only fill in name/description fields the admin hasn't already typed,
      // so re-analyzing a photo on an existing dish won't clobber edits.
      if (!name.trim() && result.name) setName(result.name);
      if (!nameRu.trim() && result.nameRu) setNameRu(result.nameRu);
      if (!mascotTip.trim() && result.mascotTip) setMascotTip(result.mascotTip);
      if (!mascotTipRu.trim() && result.mascotTipRu) setMascotTipRu(result.mascotTipRu);
      // Auto-fill ingredients from AI (merge with any already entered manually)
      if (result.ingredients.length > 0) {
        setIngredients((prev) => {
          const merged = [...prev];
          for (const ing of result.ingredients) {
            if (!merged.includes(ing)) merged.push(ing);
          }
          return merged;
        });
      }

      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  }

  function handleAnalysisChange(field: keyof DishAnalysis, value: string) {
    setAnalysis((prev) => {
      const base = prev ?? EMPTY_ANALYSIS;
      if (field === "funFact") {
        return { ...base, funFact: value };
      }
      return { ...base, [field]: Number(value) || 0 } as DishAnalysis;
    });
  }

  function addIngredient(value: string) {
    const tag = value.trim().toLowerCase();
    if (tag && !ingredients.includes(tag)) {
      setIngredients((prev) => [...prev, tag]);
    }
    setIngredientInput("");
  }

  function removeIngredient(tag: string) {
    setIngredients((prev) => prev.filter((i) => i !== tag));
  }

  function handleIngredientKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(ingredientInput);
    } else if (e.key === "Backspace" && !ingredientInput && ingredients.length > 0) {
      setIngredients((prev) => prev.slice(0, -1));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Commit any partially-typed ingredient before saving
    const finalIngredients = [...ingredients];
    const pending = ingredientInput.trim().toLowerCase();
    if (pending && !finalIngredients.includes(pending)) finalIngredients.push(pending);
    onSubmit({
      name,
      nameRu: nameRu.trim() || undefined,
      category,
      emoji,
      mascotTip,
      mascotTipRu: mascotTipRu.trim() || undefined,
      prepTime,
      coinValue,
      image,
      analysis,
      available,
      ingredients: finalIngredients,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Photo */}
      <div>
        <label className="mb-2 block font-heading text-sm font-extrabold text-eel">
          {t("admin.dishForm.photo")}
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cloud text-4xl">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name || "Dish photo"} className="h-full w-full object-cover" />
            ) : (
              emoji
            )}
          </div>
          <div>
            <label className={buttonClasses({ color: "macaw", size: "md", className: "cursor-pointer" })}>
              {t("admin.dishForm.uploadPhoto")}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
            {analyzing && (
              <p className="mt-2 text-sm font-bold text-macaw">{t("admin.dishForm.analyzing")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Availability */}
      <label className="flex items-center gap-3 rounded-2xl bg-cloud px-4 py-3">
        <input
          type="checkbox"
          checked={!available}
          onChange={(e) => setAvailable(!e.target.checked)}
          className="h-5 w-5 accent-cardinal"
        />
        <span className="font-heading text-sm font-extrabold text-eel">
          {t("admin.dishForm.unavailable")}
        </span>
      </label>

      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-heading text-sm font-extrabold text-eel">
            {t("admin.dishForm.name")}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border-2 border-cloud bg-cloud px-3 py-2 text-eel outline-none focus:border-feather"
            placeholder={t("admin.dishForm.namePlaceholder")}
          />
        </div>

        <div>
          <label className="mb-1 block font-heading text-sm font-extrabold text-eel">
            {t("admin.dishForm.nameRu")}
          </label>
          <input
            type="text"
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            className="w-full rounded-xl border-2 border-cloud bg-cloud px-3 py-2 text-eel outline-none focus:border-feather"
            placeholder={t("admin.dishForm.nameRuPlaceholder")}
          />
          <p className="mt-1 text-xs text-eel-light">{t("admin.dishForm.nameRuHint")}</p>
        </div>

        <div>
          <label className="mb-1 block font-heading text-sm font-extrabold text-eel">
            {t("admin.dishForm.category")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DishCategory)}
            className="w-full rounded-xl border-2 border-cloud bg-cloud px-3 py-2 text-eel outline-none focus:border-feather"
          >
            <optgroup label="—">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_EMOJI[c]} {t(`categories.${c}`)}
                </option>
              ))}
            </optgroup>
            {customCategories.length > 0 && (
              <optgroup label="✦ Custom">
                {customCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.emoji} {lang === "ru" && c.nameRu ? c.nameRu : c.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-heading text-sm font-extrabold text-eel">
            {t("admin.dishForm.emoji")}
          </label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-full rounded-xl border-2 border-cloud bg-cloud px-3 py-2 text-eel outline-none focus:border-feather"
          />
        </div>

        <div>
          <label className="mb-1 block font-heading text-sm font-extrabold text-eel">
            {t("admin.dishForm.prepTime")}
          </label>
          <input
            type="number"
            min={1}
            value={prepTime}
            onChange={(e) => setPrepTime(Number(e.target.value) || 0)}
            className="w-full rounded-xl border-2 border-cloud bg-cloud px-3 py-2 text-eel outline-none focus:border-feather"
          />
        </div>

        <div>
          <label className="mb-1 block font-heading text-sm font-extrabold text-eel">
            {category === "Snacks" ? t("admin.dishForm.coinPrice") : t("admin.dishForm.coinValue")} 🪙
          </label>
          <input
            type="number"
            min={1}
            max={category === "Snacks" ? 20 : 3}
            value={coinValue}
            onChange={(e) => setCoinValue(Number(e.target.value) || 1)}
            className="w-full rounded-xl border-2 border-cloud bg-cloud px-3 py-2 text-eel outline-none focus:border-feather"
          />
          <p className="mt-1 text-xs text-eel-light">
            {category === "Snacks" ? t("admin.dishForm.coinPriceHint") : t("admin.dishForm.coinValueHint")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-heading text-sm font-extrabold text-eel">
            {t("admin.dishForm.mascotDescription")}
          </label>
          <textarea
            required
            value={mascotTip}
            onChange={(e) => setMascotTip(e.target.value)}
            rows={2}
            className="w-full rounded-xl border-2 border-cloud bg-cloud px-3 py-2 text-eel outline-none focus:border-feather"
            placeholder={t("admin.dishForm.mascotDescriptionPlaceholder")}
          />
        </div>

        <div>
          <label className="mb-1 block font-heading text-sm font-extrabold text-eel">
            {t("admin.dishForm.mascotDescriptionRu")}
          </label>
          <textarea
            value={mascotTipRu}
            onChange={(e) => setMascotTipRu(e.target.value)}
            rows={2}
            className="w-full rounded-xl border-2 border-cloud bg-cloud px-3 py-2 text-eel outline-none focus:border-feather"
            placeholder={t("admin.dishForm.mascotDescriptionRuPlaceholder")}
          />
        </div>
      </div>

      {/* Nutrition / AI analysis */}
      <div className="rounded-2xl bg-cloud p-4">
        <p className="mb-3 font-heading text-sm font-extrabold text-eel">
          {t("admin.dishForm.nutritionTitle")}{" "}
          {analysis ? t("admin.dishForm.nutritionAi") : t("admin.dishForm.nutritionOptional")}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-eel-light">{t("admin.dishForm.calories")}</label>
            <input
              type="number"
              min={0}
              value={analysis?.calories ?? ""}
              onChange={(e) => handleAnalysisChange("calories", e.target.value)}
              className="w-full rounded-xl border-2 border-snow bg-snow px-2 py-2 text-eel outline-none focus:border-feather"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-eel-light">{t("admin.dishForm.protein")}</label>
            <input
              type="number"
              min={0}
              value={analysis?.protein ?? ""}
              onChange={(e) => handleAnalysisChange("protein", e.target.value)}
              className="w-full rounded-xl border-2 border-snow bg-snow px-2 py-2 text-eel outline-none focus:border-feather"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-eel-light">{t("admin.dishForm.fat")}</label>
            <input
              type="number"
              min={0}
              value={analysis?.fat ?? ""}
              onChange={(e) => handleAnalysisChange("fat", e.target.value)}
              className="w-full rounded-xl border-2 border-snow bg-snow px-2 py-2 text-eel outline-none focus:border-feather"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-eel-light">{t("admin.dishForm.carbs")}</label>
            <input
              type="number"
              min={0}
              value={analysis?.carbs ?? ""}
              onChange={(e) => handleAnalysisChange("carbs", e.target.value)}
              className="w-full rounded-xl border-2 border-snow bg-snow px-2 py-2 text-eel outline-none focus:border-feather"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs font-bold text-eel-light">{t("admin.dishForm.funFact")}</label>
          <input
            type="text"
            value={analysis?.funFact ?? ""}
            onChange={(e) => handleAnalysisChange("funFact", e.target.value)}
            placeholder={t("admin.dishForm.funFactPlaceholder")}
            className="w-full rounded-xl border-2 border-snow bg-snow px-2 py-2 text-eel outline-none focus:border-feather"
          />
        </div>
      </div>

      {/* Ingredients */}
      <div className="rounded-2xl bg-cloud p-4">
        <p className="mb-3 font-heading text-sm font-extrabold text-eel">
          {t("admin.dishForm.ingredientsTitle")} <span className="font-normal text-eel-light">{t("admin.dishForm.ingredientsHint")}</span>
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {ingredients.map((ing) => (
            <span
              key={ing}
              className="inline-flex items-center gap-1 rounded-full bg-feather/20 px-3 py-1 text-sm font-bold text-feather"
            >
              {ing}
              <button
                type="button"
                onClick={() => removeIngredient(ing)}
                className="ml-1 text-feather/60 hover:text-cardinal leading-none"
                aria-label={`Remove ${ing}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
          onKeyDown={handleIngredientKeyDown}
          onBlur={() => addIngredient(ingredientInput)}
          placeholder={t("admin.dishForm.ingredientsPlaceholder")}
          className="w-full rounded-xl border-2 border-snow bg-snow px-3 py-2 text-eel outline-none focus:border-feather"
        />
        {analyzing && (
          <p className="mt-1 text-xs text-macaw font-bold">{t("admin.dishForm.ingredientsAutoFilling")}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className={buttonClasses({ color: "feather" })}
        >
          {submitLabel}
        </motion.button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="btn-press rounded-2xl bg-cardinal-50 px-4 py-2 font-heading font-extrabold text-cardinal shadow-duo-sm shadow-cardinal-100"
          >
            {t("admin.dishForm.delete")}
          </button>
        )}
      </div>
    </form>
  );
}
