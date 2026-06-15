"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Splash / intro screen — the very first thing the app shows.
 *
 * Built as separate layers (background, text, illustration, button) instead
 * of one full-bleed cropped photo, so it adapts cleanly across phone,
 * tablet and desktop without cutting off content.
 */
export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-gradient-to-b from-feather-50 via-white to-feather-50 px-6 py-10 text-center">
      <LanguageSwitcher className="absolute right-4 top-4 z-10" />

      {/* Text layer */}
      <div className="flex flex-col items-center gap-3">
        <h1 className="max-w-md font-heading text-4xl font-extrabold text-eel sm:text-5xl">
          {t("landing.headline")}
        </h1>
        <p className="max-w-sm font-heading text-lg font-bold text-eel-light sm:text-xl">
          {t("landing.subtitle")}
        </p>
      </div>

      {/* Illustration layer, with the Play button layered on top */}
      <div className="relative w-full max-w-2xl">
        <div className="relative aspect-[1600/946] w-full overflow-hidden rounded-3xl shadow-card">
          <Image
            src="/screen/splash-screen.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 700px, 100vw"
            quality={80}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAJABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMFCP/EAB8QAAEEAgIDAAAAAAAAAAAAAAEAAgMEBRESMxMicf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGREAAwADAAAAAAAAAAAAAAAAAAERAhIx/9oADAMBAAIRAxEAPwDQ0U9me7KyxHxhafQhKFrJDIeKnqOJjtOLhvkqJ7H/AFEXcVKWEXRnq64f/9k="
            className="object-cover"
          />
        </div>

        {/* Button layer */}
        <Link
          href="/setup"
          className="btn-press absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-2xl border-2 border-feather bg-feather/25 px-10 py-4 font-heading text-xl font-extrabold uppercase tracking-wide text-feather-700 backdrop-blur-md transition-colors hover:bg-feather/35"
        >
          <span className="text-2xl leading-none">▶</span>
          {t("landing.play")}
        </Link>
      </div>
    </main>
  );
}
