"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { buttonClasses } from "@/components/ui/Button";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ADMIN_PIN } from "@/lib/adminAuth";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAdminAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (login(pin)) {
      router.push("/menu-manager");
    } else {
      setError(true);
      setPin("");
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-cloud px-6 py-10">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card"
      >
        <div className="mb-6 text-center">
          <span className="text-4xl">🔐</span>
          <h1 className="mt-2 font-heading text-2xl font-extrabold text-eel">{t("admin.login.title")}</h1>
          <p className="mt-1 text-sm text-eel-light">{t("admin.login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder={t("admin.login.placeholder")}
            style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
            className={`rounded-2xl border-2 px-4 py-3 text-center font-heading text-2xl tracking-widest text-eel outline-none transition-colors ${
              error ? "border-cardinal bg-cardinal-50" : "border-cloud bg-cloud focus:border-feather"
            }`}
          />

          {error && (
            <p className="text-center text-sm font-bold text-cardinal">{t("admin.login.error")}</p>
          )}

          <button type="submit" className={buttonClasses({ color: "feather" })}>
            {t("admin.login.submit")}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-eel-light">
          {t("admin.login.tip", { pin: ADMIN_PIN })}
        </p>

        <div className="mt-6 text-center">
          <Link href="/home" className="text-sm font-bold text-macaw hover:underline">
            {t("admin.login.back")}
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
