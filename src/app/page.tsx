"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const STEPS = [
  {
    key: "snap",
    stepColor: "#58cc02",
    bg: "#f4fbe9",
    border: "#e3f3cf",
    titleColor: "#3c4a2e",
    descColor: "#7c8273",
  },
  {
    key: "choose",
    stepColor: "#1cb0f6",
    bg: "#eaf6fd",
    border: "#cfe9f7",
    titleColor: "#1a4a63",
    descColor: "#6f8390",
  },
  {
    key: "receive",
    stepColor: "#e5a100",
    bg: "#fdf3e3",
    border: "#f7e4c2",
    titleColor: "#6b4e15",
    descColor: "#8f7c52",
  },
] as const;

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white font-body text-center">
      <LanguageSwitcher className="absolute right-4 top-4 z-10" />

      {/* ── Hero ── */}
      <div className="px-5 pb-6 pt-14 sm:pt-20">
        {/* Pill badge */}
        <div className="mb-5 inline-block rounded-full bg-[#eafadb] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4b9b00]">
          🥕 {t("landing.badge")}
        </div>

        <h1 className="font-heading text-6xl font-extrabold leading-none tracking-tight text-[#58cc02] sm:text-8xl">
          {t("landing.headline")}
        </h1>

        <p className="mx-auto mt-4 max-w-xs font-body text-lg font-bold text-[#6b7163] sm:max-w-sm sm:text-xl">
          {t("landing.subtitle")}
        </p>
      </div>

      {/* ── Illustration ── */}
      <div className="relative mx-auto max-w-2xl px-5 sm:px-8">
        <Image
          src="/screen/splash-hero.png"
          alt=""
          width={760}
          height={520}
          priority
          className="w-full h-auto"
        />
        {/* Arrow + phone overlay — matches design doc SVG (viewBox 820×470) */}
        <svg
          viewBox="0 0 820 470"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <marker id="ffArrow" markerWidth="6" markerHeight="6" refX="3.2" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L6,3 L0,6 Z" fill="#ff8a3d" />
            </marker>
          </defs>
          {/* Dashed curved arrow */}
          <path
            d="M 268 122 Q 339 45 422 129"
            fill="none"
            stroke="#ff8a3d"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="0.5 16"
            markerEnd="url(#ffArrow)"
          />
          {/* Phone icon */}
          <g transform="rotate(-15 342 69)">
            <rect x="327" y="44" width="30" height="50" rx="7" fill="#3a3f47" />
            <rect x="330.5" y="50" width="23" height="38" rx="3.5" fill="#d3e7f6" />
            <rect x="337" y="46.5" width="10" height="2" rx="1" fill="#5b6470" />
            <circle cx="342" cy="90.5" r="1.6" fill="#5b6470" />
          </g>
        </svg>
      </div>

      {/* ── Play button ── */}
      <div className="py-10">
        <motion.div
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 0.65, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
        >
          <Link
            href="/setup"
            className="inline-flex items-center gap-3 rounded-full bg-[#58cc02] px-12 py-4 font-heading text-2xl font-extrabold uppercase tracking-wide text-white transition-opacity hover:opacity-90 active:translate-y-1 sm:text-3xl"
            style={{ boxShadow: "0 7px 0 #46a302" }}
          >
            <span className="text-xl leading-none">▶</span>
            {t("landing.play")}
          </Link>
        </motion.div>
      </div>

      {/* ── Steps ── */}
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-5 pb-14 sm:flex-row sm:px-8">
        {STEPS.map((step, i) => (
          <div
            key={step.key}
            className="flex flex-1 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left"
            style={{ background: step.bg, borderColor: step.border }}
          >
            <span
              className="shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
              style={{ background: step.stepColor }}
            >
              {t("landing.step", { n: i + 1 })}
            </span>
            <div className="min-w-0">
              <div
                className="font-heading text-base font-bold leading-tight"
                style={{ color: step.titleColor }}
              >
                {t(`landing.steps.${step.key}.title`)}
              </div>
              <div className="mt-0.5 text-xs font-semibold" style={{ color: step.descColor }}>
                {t(`landing.steps.${step.key}.text`)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
