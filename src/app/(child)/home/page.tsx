"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Mascot from "@/components/mascot/Mascot";
import NavCard, { type NavCardProps } from "@/components/ui/NavCard";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";

export default function ChildHomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, isLoading } = useChildProfile();

  useEffect(() => {
    if (!isLoading && !profile) {
      router.replace("/setup");
    }
  }, [isLoading, profile, router]);

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
    { href: "/buddies", emoji: "🥦", icon: "/icons/buddies.svg", label: t("nav.myBuddy"), colorClass: "bg-beetle-50 text-beetle-700" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-6 py-10 pb-28">
      <Mascot
        mascotId={profile.mascotId}
        emotion="excited"
        message={t("home.greeting", { name: profile.name })}
        size="xl"
      />

      <div className="grid w-full max-w-md grid-cols-2 gap-4">
        {navItems.map((item) => (
          <NavCard key={item.href} {...item} />
        ))}
      </div>
    </main>
  );
}
