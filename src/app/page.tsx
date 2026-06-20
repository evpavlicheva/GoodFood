"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const STEPS = [
  { key: "snap",    stepColor: "#58cc02", bg: "#f4fbe9", border: "#e3f3cf", titleColor: "#3c4a2e", descColor: "#7c8273" },
  { key: "choose",  stepColor: "#1cb0f6", bg: "#eaf6fd", border: "#cfe9f7", titleColor: "#1a4a63", descColor: "#6f8390" },
  { key: "receive", stepColor: "#e5a100", bg: "#fdf3e3", border: "#f7e4c2", titleColor: "#6b4e15", descColor: "#8f7c52" },
] as const;

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-white text-center">
      <LanguageSwitcher className="absolute right-4 top-4 z-10" />

      {/* ── Hero text ── */}
      <div className="shrink-0 px-4 pb-1 pt-10 sm:pt-12">
        <div className="mb-2 inline-block rounded-full bg-[#eafadb] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#4b9b00] sm:text-xs">
          🥕 {t("landing.badge")}
        </div>
        <h1 className="font-heading text-5xl font-extrabold leading-none tracking-tight text-[#58cc02] sm:text-7xl">
          {t("landing.headline")}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm font-bold text-[#6b7163] sm:text-base">
          {t("landing.subtitle")}
        </p>
      </div>

      {/* ── Illustration (fills remaining space) ── */}
      <div className="relative mx-auto min-h-0 w-full max-w-2xl flex-1 px-4">
        <Image
          src="/screen/splash-hero.png"
          alt=""
          fill
          priority
          className="object-contain"
        />
        {/* Dotted arrow + phone overlay */}
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
          <path
            d="M 268 122 Q 339 45 422 129"
            fill="none"
            stroke="#ff8a3d"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="0.5 16"
            markerEnd="url(#ffArrow)"
          />
          <g transform="rotate(-15 342 69)">
            <rect x="327" y="44" width="30" height="50" rx="7" fill="#3a3f47" />
            <rect x="330.5" y="50" width="23" height="38" rx="3.5" fill="#d3e7f6" />
            <rect x="337" y="46.5" width="10" height="2" rx="1" fill="#5b6470" />
            <circle cx="342" cy="90.5" r="1.6" fill="#5b6470" />
          </g>
        </svg>
      </div>

      {/* ── Play button ── */}
      <div className="shrink-0 py-4 sm:py-6">
        <motion.div
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 0.65, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
        >
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 rounded-full bg-[#58cc02] px-10 py-3.5 font-heading text-xl font-extrabold uppercase tracking-wide text-white hover:opacity-90 active:translate-y-0.5 sm:px-12 sm:py-4 sm:text-2xl"
            style={{ boxShadow: "0 6px 0 #46a302" }}
          >
            <span className="leading-none">▶</span>
            {t("landing.play")}
          </Link>
        </motion.div>
      </div>

      {/* ── Steps ── */}
      <div className="mx-auto flex w-full max-w-2xl shrink-0 gap-2 px-4 pb-6 sm:pb-8">
        {STEPS.map((step, i) => (
          <div
            key={step.key}
            className="flex flex-1 items-center gap-2 rounded-xl border-2 px-2.5 py-2.5 text-left sm:gap-3 sm:rounded-2xl sm:px-4"
            style={{ background: step.bg, borderColor: step.border }}
          >
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white sm:px-3 sm:py-1 sm:text-[11px]"
              style={{ background: step.stepColor }}
            >
              {t("landing.step", { n: i + 1 })}
            </span>
            <div className="min-w-0">
              <div className="font-heading text-sm font-bold leading-tight sm:text-base" style={{ color: step.titleColor }}>
                {t(`landing.steps.${step.key}.title`)}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold leading-tight sm:text-xs" style={{ color: step.descColor }}>
                {t(`landing.steps.${step.key}.text`)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
