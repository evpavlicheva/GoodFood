"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Mascot from "@/components/mascot/Mascot";
import { MASCOTS } from "@/components/mascot/mascotData";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";
import GoldCoin from "@/components/ui/GoldCoin";

export default function BuddiesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, isLoading, setProfile, unlockMascot } = useChildProfile();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !profile) {
      router.replace("/setup");
    }
  }, [isLoading, profile, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  if (isLoading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Mascot emotion="thinking" message={t("common.loading")} size="lg" />
      </main>
    );
  }

  function handleMascotTap(mascot: (typeof MASCOTS)[number]) {
    const unlocked = profile!.unlockedMascots.includes(mascot.id);

    if (unlocked) {
      if (mascot.id === profile!.mascotId) return;
      setProfile({ ...profile!, mascotId: mascot.id });
      setToast(t("buddies.nowPlaying", { name: mascot.name }));
      return;
    }

    if (unlockMascot(mascot.id)) {
      setToast(t("buddies.unlocked", { name: mascot.name }));
    } else {
      setToast(t("buddies.needMoreToUnlock", { count: mascot.cost - profile!.coins, name: mascot.name }));
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-6 py-10 pb-28">
      <Mascot
        mascotId={profile.mascotId}
        emotion="happy"
        message={null}
        size="lg"
      />

      <h1 className="text-center font-heading text-2xl font-extrabold text-eel">
        {t("buddies.title")}
      </h1>

      <div
        role="status"
        aria-label={t("coins.balanceLabel")}
        className="flex items-center gap-2 rounded-full bg-cloud px-5 py-2 font-heading text-lg font-extrabold text-eel shadow-card"
      >
        <GoldCoin size={24} />
        <span>{profile.coins}</span>
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-4 sm:grid-cols-3">
        {MASCOTS.map((mascot) => {
          const unlocked = profile.unlockedMascots.includes(mascot.id);
          const isActive = unlocked && mascot.id === profile.mascotId;
          const affordable = profile.coins >= mascot.cost;

          return (
            <motion.button
              key={mascot.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMascotTap(mascot)}
              className={`flex flex-col items-center gap-2 rounded-3xl p-4 shadow-card transition-all ${
                isActive ? `${mascot.bgClass} ring-4 ring-feather` : "bg-white"
              }`}
            >
              <div
                className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ${mascot.bgClass} ${
                  unlocked ? "" : "grayscale"
                }`}
              >
                <Image
                  src={mascot.image}
                  alt={mascot.name}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
                {!unlocked && (
                  <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-base shadow-card">
                    🔒
                  </span>
                )}
              </div>

              <span className="font-heading text-sm font-extrabold text-eel">{mascot.name}</span>

              {isActive ? (
                <span className="rounded-full bg-feather px-2 py-0.5 text-[11px] font-extrabold text-white">
                  {t("buddies.active")}
                </span>
              ) : unlocked ? (
                <span className="text-[11px] font-bold text-eel-light">{t("buddies.tapToSelect")}</span>
              ) : (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                    affordable ? "bg-feather-50 text-feather-700" : "bg-cloud text-eel-light"
                  }`}
                >
                  {t("buddies.unlockFor", { count: mascot.cost })}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-eel px-5 py-3 text-center font-heading font-extrabold text-white shadow-card"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
