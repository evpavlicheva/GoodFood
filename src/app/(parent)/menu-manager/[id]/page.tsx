"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DishForm, { type DishFormValues } from "@/components/admin/DishForm";
import { useMenu } from "@/context/MenuContext";
import { useLanguage } from "@/context/LanguageContext";

export default function EditDishPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const { getDish, updateDish, deleteDish, isLoading } = useMenu();

  const dish = getDish(params.id);

  function handleSubmit(values: DishFormValues) {
    if (!dish) return;
    updateDish(dish.id, values);
    router.push("/menu-manager");
  }

  function handleDelete() {
    if (!dish) return;
    if (window.confirm(t("admin.dishForm.confirmDelete", { name: dish.name }))) {
      deleteDish(dish.id);
      router.push("/menu-manager");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/menu-manager" className="mb-4 inline-block text-sm font-bold text-macaw hover:underline">
        {t("admin.editDish.back")}
      </Link>

      {isLoading ? (
        <p className="text-eel-light">{t("admin.editDish.loading")}</p>
      ) : !dish ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-card">
          <span className="text-5xl">🤔</span>
          <p className="mt-3 font-heading font-bold text-eel-light">{t("admin.editDish.notFound")}</p>
        </div>
      ) : (
        <>
          <h1 className="mb-6 font-heading text-3xl font-extrabold text-eel">
            {t("admin.editDish.title", { name: dish.name })}
          </h1>
          <div className="rounded-3xl bg-white p-6 shadow-card">
            <DishForm
              initial={dish}
              submitLabel={t("admin.editDish.submit")}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}
    </main>
  );
}
