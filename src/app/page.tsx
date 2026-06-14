"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <h1 className="font-heading text-5xl font-extrabold text-feather">GoodFood</h1>
      <p className="max-w-md text-lg text-eel-light">{t("landing.subtitle")}</p>
      <Link href="/setup" className={buttonClasses({ color: "macaw" })}>
        {t("landing.cta")}
      </Link>
    </main>
  );
}
