"use client";

import Mascot from "@/components/mascot/Mascot";
import { useLanguage } from "@/context/LanguageContext";

export default function HistoryPage() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Mascot emotion="thinking" message={t("common.comingSoon")} size="lg" />
      <h1 className="font-heading text-3xl font-extrabold text-eel">{t("history.title")}</h1>
      <p className="max-w-sm text-eel-light">{t("history.text")}</p>
    </main>
  );
}
