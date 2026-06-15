"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const GREEN = "#8BA659";
const CREAM = "#FEF5EE";

/** Camera icon — step 1: snap a photo of a dish. */
function SnapIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" aria-hidden="true">
      <rect x="5" y="14" width="38" height="26" rx="7" fill={CREAM} stroke={GREEN} strokeWidth="3" />
      <path d="M16 14l3-5h10l3 5" fill={CREAM} stroke={GREEN} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="24" cy="27" r="8" fill={CREAM} stroke={GREEN} strokeWidth="3" />
      <circle cx="24" cy="27" r="3" fill={GREEN} />
      <circle cx="36" cy="20" r="1.6" fill={GREEN} />
    </svg>
  );
}

/** Tablet + heart icon — step 2: child chooses from the menu. */
function ChooseIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" aria-hidden="true">
      <rect x="8" y="5" width="32" height="38" rx="6" fill={CREAM} stroke={GREEN} strokeWidth="3" />
      <path d="M21 41h6" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M24 28c-5-4-8-7-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 4-3 7-8 11z"
        fill={GREEN}
        stroke={GREEN}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Gift box icon — step 3: child receives their order. */
function ReceiveIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" aria-hidden="true">
      <rect x="7" y="20" width="34" height="20" rx="3" fill={CREAM} stroke={GREEN} strokeWidth="3" />
      <rect x="5" y="13" width="38" height="9" rx="2.5" fill={CREAM} stroke={GREEN} strokeWidth="3" />
      <path d="M24 13v27" stroke={GREEN} strokeWidth="3" />
      <path
        d="M24 13c-2-7-13-6-12 0c1 4 8 4 12 0zM24 13c2-7 13-6 12 0c-1 4-8 4-12 0z"
        fill={CREAM}
        stroke={GREEN}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STEPS = [
  { key: "snap", Icon: SnapIcon },
  { key: "choose", Icon: ChooseIcon },
  { key: "receive", Icon: ReceiveIcon },
] as const;

/**
 * Splash / intro screen — the very first thing the app shows.
 *
 * Composed from separate layers (background wash, headline text, character
 * illustration crops, a Play button, and a "how it works" flow) so it
 * adapts cleanly across phone, tablet and desktop instead of relying on
 * one flat photo.
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

      {/* Illustration layer */}
      <div className="relative mt-4 flex w-full max-w-xl items-center justify-center gap-3 sm:gap-5">
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

      {/* Button layer */}
      <motion.div
        animate={{ scale: [1, 1.18, 0.95, 1.05, 0.99, 1] }}
        transition={{
          duration: 0.9,
          times: [0, 0.25, 0.5, 0.7, 0.85, 1],
          repeat: Infinity,
          repeatDelay: 2.1,
          ease: "easeInOut",
        }}
      >
        <Link
          href="/setup"
          className="btn-press flex items-center gap-2 rounded-full border-2 border-[#8BA659] bg-[#FEF5EE]/90 px-8 py-3.5 font-heading text-lg font-extrabold uppercase tracking-wide text-[#5C7A36] shadow-card backdrop-blur-md transition-colors hover:bg-[#FEF5EE] sm:px-10 sm:py-4 sm:text-xl"
        >
          <span className="text-xl leading-none sm:text-2xl">▶</span>
          {t("landing.play")}
        </Link>
      </motion.div>

      {/* Flow steps layer */}
      <div className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:gap-3">
        {STEPS.map((step, index) => (
          <div
            key={step.key}
            className="flex flex-1 flex-col gap-1.5 rounded-2xl border border-[#8BA659]/30 bg-[#FEF5EE]/80 px-4 py-3 text-left shadow-card backdrop-blur-sm"
          >
            <span
              className="self-start rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
              style={{ backgroundColor: GREEN }}
            >
              {t("landing.step", { n: index + 1 })}
            </span>
            <div className="flex items-center gap-3">
              <step.Icon />
              <span>
                <span className="block font-heading text-sm font-extrabold text-[#5C7A36]">
                  {t(`landing.steps.${step.key}.title`)}
                </span>
                <span className="block text-xs font-bold text-[#4B5A2A]/80">
                  {t(`landing.steps.${step.key}.text`)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
