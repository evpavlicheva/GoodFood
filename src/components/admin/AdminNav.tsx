"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: "/dashboard", label: t("admin.nav.orders"), emoji: "🧾" },
    { href: "/menu-manager", label: t("admin.nav.menu"), emoji: "🍽️" },
  ];

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cloud bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥦</span>
          <span className="font-heading text-lg font-extrabold text-eel">
            {t("admin.nav.brand")} <span className="text-feather">{t("admin.nav.brandSuffix")}</span>
          </span>
        </div>

        <nav className="flex items-center gap-2">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm font-heading font-bold transition-colors ${
                  active ? "bg-feather-50 text-feather" : "text-eel-light hover:text-eel"
                }`}
              >
                {link.emoji} {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/home"
            className="rounded-xl px-3 py-2 text-sm font-heading font-bold text-macaw hover:underline"
          >
            {t("admin.nav.kidMode")}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-cloud px-3 py-2 text-sm font-heading font-bold text-eel-light hover:text-cardinal"
          >
            {t("admin.nav.logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
