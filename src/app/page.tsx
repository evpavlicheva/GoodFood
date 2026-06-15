"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Splash / intro screen — the very first thing the app shows. Full-bleed
 * hero image with the headline + sub-headline overlaid, and a
 * semi-transparent "Play" button that leads into profile setup.
 */
export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <Image
        src="/screen/meeting-screen.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/50" />

      <LanguageSwitcher className="absolute right-4 top-4 z-10" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-20 text-center">
        <h1 className="max-w-md font-heading text-4xl font-extrabold text-white drop-shadow-lg sm:text-5xl">
          {t("landing.headline")}
        </h1>
        <p className="mt-4 max-w-sm font-heading text-lg font-bold text-white drop-shadow sm:text-xl">
          {t("landing.subtitle")}
        </p>
      </div>

      <div className="relative z-10 flex justify-center px-6 pb-16">
        <Link
          href="/setup"
          className="btn-press flex items-center gap-3 rounded-2xl border-2 border-white/60 bg-white/20 px-12 py-4 font-heading text-xl font-extrabold uppercase tracking-wide text-white backdrop-blur-md transition-colors hover:bg-white/30"
        >
          <span className="text-2xl leading-none">▶</span>
          {t("landing.play")}
        </Link>
      </div>
    </main>
  );
}
