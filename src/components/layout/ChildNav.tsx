"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useCart } from "@/context/CartContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Persistent top navigation for the kid-facing app. Always visible (instead
 * of relying on per-page "back" links), so the child can jump straight to
 * any section, and a parent can hop into Parent Mode from anywhere.
 */
export default function ChildNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { totalCount } = useCart();
  const { isAuthenticated } = useAdminAuth();

  const NAV_LINKS = [
    { href: "/home", label: t("nav.home"), emoji: "🏠" },
    { href: "/menu", label: t("nav.menu"), emoji: "🍽️" },
    { href: "/orders", label: t("nav.myOrders"), emoji: "🧾" },
    { href: "/history", label: t("nav.history"), emoji: "📜" },
    { href: "/reports", label: t("nav.reports"), emoji: "📊" },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cloud bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-3 py-2 sm:gap-2 sm:px-6">
        <Link href="/home" className="mr-1 flex shrink-0 items-center gap-1.5">
          <span className="text-2xl">🥦</span>
          <span className="hidden font-heading text-lg font-extrabold text-eel sm:inline">
            GoodFood
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-xl px-2.5 py-2 text-sm font-heading font-bold transition-colors sm:px-3 ${
                isActive(link.href) ? "bg-feather-50 text-feather" : "text-eel-light hover:text-eel"
              }`}
            >
              <span className="text-base sm:mr-1">{link.emoji}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}

          {/* Cart gets its own slot with a live item-count badge on its icon */}
          <Link
            href="/cart"
            className={`mr-2 flex shrink-0 items-center rounded-xl px-2.5 py-2 text-sm font-heading font-bold transition-colors sm:mr-4 sm:px-3 ${
              isActive("/cart") ? "bg-feather-50 text-feather" : "text-eel-light hover:text-eel"
            }`}
          >
            <span className="relative inline-flex text-base sm:mr-1">
              🛒
              <AnimatePresence>
                {totalCount > 0 && (
                  <motion.span
                    key={totalCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cardinal px-1 text-[10px] font-extrabold text-white"
                  >
                    {totalCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="hidden sm:inline">{t("nav.cart")}</span>
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="rounded-xl px-2.5 py-2 text-sm font-heading font-bold text-macaw hover:underline sm:px-3"
          >
            <span className="sm:hidden">🔐</span>
            <span className="hidden sm:inline">{t("nav.parentMode")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
