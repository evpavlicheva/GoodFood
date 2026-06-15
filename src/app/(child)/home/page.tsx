"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Mascot from "@/components/mascot/Mascot";
import { MASCOTS } from "@/components/mascot/mascotData";
import NavCard, { type NavCardProps } from "@/components/ui/NavCard";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";

export default function ChildHomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, isLoading, unlockMascot } = useChildProfile();
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

  const navItems: NavCardProps[] = [
    { href: "/menu", emoji: "🍽️", icon: "/icons/menu.png", label: t("nav.menu"), colorClass: "bg-feather-50 text-feather-700" },
    { href: "/orders", emoji: "🛒", icon: "/icons/orders.png", label: t("nav.myOrders"), colorClass: "bg-macaw-50 text-macaw-700" },
    { href: "/history", emoji: "📜", icon: "/icons/history.png", label: t("nav.history"), colorClass: "bg-bee-50 text-bee-700" },
    { href: "/reports", emoji: "📊", icon: "/icons/reports.png", label: t("nav.reports"), colorClass: "bg-beetle-50 text-beetle-700" },
  ];

  function handleMascotTap(id: (typeof MASCOTS)[number]["id"], cost: number, name: string) {
    if (profile?.unlockedMascots.includes(id)) return;
    if (unlockMascot(id)) {
      setToast(t("home.unlocked", { name }));
    } else {
      setToast(t("home.needMoreToUnlock", { count: cost - (profile?.coins ?? 0), name }));
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-6 py-10 pb-28">
      <Mascot
        mascotId={profile.mascotId}
        emotion="excited"
        message={t("home.greeting", { name: profile.name })}
        size="xl"
      />

      <div
        role="status"
        aria-label={t("coins.balanceLabel")}
        className="flex items-center gap-2 rounded-full bg-bee-50 px-5 py-2 font-heading text-lg font-extrabold text-bee-700 shadow-card"
      >
        <span className="text-2xl">🪙</span>
        <span>{profile.coins}</span>
      </div>

      <div className="w-full max-w-md">
        <h2 className="mb-3 text-center font-heading text-lg font-extrabold text-eel">
          {t("home.myBuddies")}
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {MASCOTS.map((mascot) => {
            const unlocked = profile.unlockedMascots.includes(mascot.id);
            const affordable = profile.coins >= mascot.cost;
            return (
              <motion.button
                key={mascot.id}
                type="button"
                whileTap={!unlocked ? { scale: 0.94 } : undefined}
                onClick={() => handleMascotTap(mascot.id, mascot.cost, mascot.name)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full shadow-card ${mascot.bgClass} ${
                    unlocked ? "" : "grayscale"
                  }`}
                >
                  <Image
                    src={mascot.image}
                    alt={mascot.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-eel/40 text-xl">
                      🔒
                    </div>
                  )}
                </div>
                <span className="font-heading text-xs font-extrabold text-eel">{mascot.name}</span>
                {!unlocked && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                      affordable ? "bg-feather-50 text-feather-700" : "bg-cloud text-eel-light"
                    }`}
                  >
                    {t("home.unlockFor", { count: mascot.cost })}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
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

      <div className="grid w-full max-w-md grid-cols-2 gap-4">
        {navItems.map((item) => (
          <NavCard key={item.href} {...item} />
        ))}
      </div>
    </main>
  );
}
