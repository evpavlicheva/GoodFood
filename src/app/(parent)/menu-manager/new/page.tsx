"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import DishForm, { type DishFormValues } from "@/components/admin/DishForm";
import { useMenu } from "@/context/MenuContext";
import { useLanguage } from "@/context/LanguageContext";

export default function NewDishPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addDish } = useMenu();

  function handleSubmit(values: DishFormValues) {
    addDish(values);
    router.push("/menu-manager");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/menu-manager" className="mb-4 inline-block text-sm font-bold text-macaw hover:underline">
        {t("admin.newDish.back")}
      </Link>
      <h1 className="mb-6 font-heading text-3xl font-extrabold text-eel">{t("admin.newDish.title")}</h1>
      <div className="rounded-3xl bg-white p-6 shadow-card">
        <DishForm submitLabel={t("admin.newDish.submit")} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
