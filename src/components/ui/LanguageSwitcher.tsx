"use client";

import { motion } from "framer-motion";
import { LANGUAGES } from "@/lib/i18n/translations";
import { useLanguage } from "@/context/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
}

/** Small pill toggle for switching between English and Russian. */
export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-card ${className}`}
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map((option) => (
        <motion.button
          key={option.code}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-heading font-extrabold transition-colors sm:text-sm ${
            lang === option.code ? "bg-feather text-white" : "text-eel-light"
          }`}
        >
          <span>{option.flag}</span>
          <span>{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
