"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Mascot from "@/components/mascot/Mascot";
import Button from "@/components/ui/Button";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { MASCOTS, type MascotId, type MascotEmotion } from "@/components/mascot/mascotData";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";

export default function SetupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setProfile } = useChildProfile();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<MascotId | null>(null);

  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0 && selected !== null;
  const previewMascot = selected ?? "broccoli";

  const emotion: MascotEmotion = !trimmedName ? "thinking" : !selected ? "happy" : "cheering";
  const message = !trimmedName
    ? t("setup.mascotAskName")
    : !selected
      ? t("setup.mascotPickBuddy", { name: trimmedName })
      : t("setup.mascotReady", { name: trimmedName });

  function handleContinue() {
    if (!selected || !canContinue) return;
    setProfile({ name: trimmedName, mascotId: selected });
    router.push("/home");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center gap-8 px-6 py-10 text-center">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <Mascot mascotId={previewMascot} emotion={emotion} message={message} size="xl" />

      <div className="w-full max-w-sm">
        <label htmlFor="child-name" className="mb-2 block font-heading text-xl font-extrabold text-eel">
          {t("setup.nameLabel")}
        </label>
        <input
          id="child-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("setup.namePlaceholder")}
          maxLength={20}
          autoComplete="off"
          className="w-full rounded-2xl border-2 border-cloud bg-white px-5 py-4 text-center text-xl font-bold text-eel shadow-card outline-none transition-colors focus:border-macaw"
        />
      </div>

      <div className="w-full max-w-md">
        <p className="mb-4 font-heading text-xl font-extrabold text-eel">{t("setup.chooseBuddy")}</p>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {MASCOTS.map((m) => (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              whileTap={{ scale: 0.92 }}
              className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-4xl shadow-card transition-all ${
                selected === m.id ? `${m.bgClass} ring-4 ring-feather` : "bg-white"
              }`}
            >
              <span>{m.emoji}</span>
              <span className="font-heading text-xs font-bold text-eel-light">{m.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!canContinue}
        color="feather"
        size="lg"
        className="w-full max-w-sm"
      >
        {t("setup.cta")}
      </Button>
    </main>
  );
}
