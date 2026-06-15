"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const STEPS = [
  { key: "snap", emoji: "📸" },
  { key: "choose", emoji: "🍽️" },
  { key: "receive", emoji: "🎁" },
] as const;

/**
 * Splash / intro screen — the very first thing the app shows.
 *
 * Composed from separate layers (background wash, headline text, Play
 * button, character illustration crops, flow steps) so it adapts cleanly
 * across phone, tablet and desktop instead of relying on one flat photo.
 */
export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-b from-[#DCE6C8] via-[#EEF3E3] to-[#FFFBF6] px-6 py-10 text-center">
      <LanguageSwitcher className="absolute right-4 top-4 z-10" />

      {/* Text layer */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-heading text-5xl font-extrabold text-[#8BA659] drop-shadow-[0_2px_0_rgba(255,255,255,0.8)] sm:text-6xl">
          {t("landing.headline")}
        </h1>
        <p className="max-w-sm font-heading text-lg font-bold text-[#4B5A2A] sm:text-xl">
          {t("landing.subtitle")}
        </p>
      </div>

      {/* Button layer */}
      <Link
        href="/setup"
        className="btn-press flex items-center gap-2 rounded-full border-2 border-[#8BA659] bg-[#FEF5EE]/90 px-8 py-3.5 font-heading text-lg font-extrabold uppercase tracking-wide text-[#5C7A36] shadow-card backdrop-blur-md transition-colors hover:bg-[#FEF5EE] sm:px-10 sm:py-4 sm:text-xl"
      >
        <span className="text-xl leading-none sm:text-2xl">▶</span>
        {t("landing.play")}
      </Link>

      {/* Illustration layer */}
      <div className="flex w-full max-w-xl items-center justify-center gap-3 sm:gap-5">
        <div className="relative aspect-square w-[44%] max-w-[260px] shrink-0 overflow-hidden rounded-3xl shadow-card sm:w-1/2">
          <Image
            src="/screen/splash-left.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 300px, 45vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAJABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUH/8QAIBAAAQQCAQUAAAAAAAAAAAAAAQACAwQGQTMFERIhcv/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAQIAAwQREv/aAAwDAQACEQMRAD8A3rO7LjRZWiLvMnWkGtVeowdrBfIHHYd7Kc5RyNUq9xR/QU3oqLv67G8TItQBQGf/2Q=="
            className="object-cover"
          />
        </div>

        <div className="relative aspect-[470/410] w-[44%] max-w-[300px] shrink-0 overflow-hidden rounded-3xl shadow-card sm:w-1/2">
          <Image
            src="/screen/splash-right.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 340px, 45vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAJABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQH/8QAIRAAAQMDBAMAAAAAAAAAAAAAAwECBAAFBhETMXEzNkL/xAAVAQEBAAAAAAAAAAAAAAAAAAAEBf/EABsRAAMAAgMAAAAAAAAAAAAAAAECAwBBBBES/9oADAMBAAIRAxEAPwDa8ly3ZlDtgSvEZ66K5E4oa648O6AdMLKc6Qn1rzUmVe4x+qakeBOqj8mKdBhsY9Jik/DDef/Z"
            className="object-cover"
          />
        </div>
      </div>

      {/* Flow steps layer */}
      <div className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:gap-3">
        {STEPS.map((step) => (
          <div
            key={step.key}
            className="flex flex-1 items-center gap-3 rounded-2xl border border-[#8BA659]/30 bg-[#FEF5EE]/80 px-4 py-2.5 text-left shadow-card backdrop-blur-sm"
          >
            <span className="text-2xl leading-none">{step.emoji}</span>
            <span>
              <span className="block font-heading text-sm font-extrabold text-[#5C7A36]">
                {t(`landing.steps.${step.key}.title`)}
              </span>
              <span className="block text-xs font-bold text-[#4B5A2A]/80">
                {t(`landing.steps.${step.key}.text`)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
