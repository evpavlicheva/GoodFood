"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ProfileSwitcher from "@/components/layout/ProfileSwitcher";
import GoldCoin from "@/components/ui/GoldCoin";
import { useCart } from "@/context/CartContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useChildProfile } from "@/hooks/useChildProfile";
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
  const { profile } = useChildProfile();

  const NAV_LINKS = [
    { href: "/home", label: t("nav.home"), emoji: "🏠" },
    { href: "/menu", label: t("nav.menu"), emoji: "🍽️", icon: "/icons/menu.png" },
    { href: "/orders", label: t("nav.myOrders"), emoji: "🧾", icon: "/icons/orders.png" },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cloud bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-2 py-2 sm:px-4">
        {/* Logo — just emoji on xs, "Good\nFood" on sm, one-line on lg */}
        <Link href="/" className="mr-1 flex shrink-0 items-center gap-1.5">
          <span className="text-3xl sm:text-4xl">🥦</span>
          <span className="hidden font-heading text-sm font-extrabold leading-tight text-eel sm:inline lg:text-lg lg:leading-none">
            <span className="lg:hidden">Good<br/>Food</span>
            <span className="hidden lg:inline">GoodFood</span>
          </span>
        </Link>

        {/* Nav links — icons only below lg, icon+text on lg+ */}
        <nav className="flex flex-1 items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-xl px-2 py-2 text-sm font-heading font-bold transition-colors sm:px-2.5 lg:px-3 ${
                isActive(link.href) ? "bg-feather-50 text-feather" : "text-eel-light hover:text-eel"
              }`}
            >
              {link.icon ? (
                <span className="relative inline-block h-[28px] w-[28px] align-middle lg:mr-1">
                  <Image src={link.icon} alt="" fill sizes="28px" className="object-contain" />
                </span>
              ) : (
                <span className="text-2xl lg:mr-1">{link.emoji}</span>
              )}
              <span className="hidden lg:inline">{link.label}</span>
            </Link>
          ))}

          {/* Cart with live badge */}
          <Link
            href="/cart"
            className={`mr-1 flex shrink-0 items-center rounded-xl px-2 py-2 text-sm font-heading font-bold transition-colors sm:mr-2 sm:px-2.5 lg:px-3 ${
              isActive("/cart") ? "bg-feather-50 text-feather" : "text-eel-light hover:text-eel"
            }`}
          >
            <span className="relative inline-flex text-2xl lg:mr-1">
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
            <span className="hidden lg:inline">{t("nav.cart")}</span>
          </Link>
        </nav>

        {/* Right side — coin balance + lang + parent mode + profile */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {profile && (
            <span
              role="status"
              aria-label={t("coins.balanceLabel")}
              className="flex shrink-0 items-center gap-1 rounded-full bg-cloud px-2 py-1 text-sm font-heading font-extrabold text-eel shadow-card sm:px-2.5 sm:py-1.5"
            >
              <GoldCoin size={18} />
              {profile.coins}
            </span>
          )}
          <LanguageSwitcher />
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="rounded-xl px-2 py-2 text-sm font-heading font-bold text-macaw hover:underline sm:px-2.5 lg:px-3"
          >
            <span className="lg:hidden">🔐</span>
            <span className="hidden lg:inline">{t("nav.parentMode")}</span>
          </Link>
          <ProfileSwitcher />
        </div>
      </div>
    </header>
  );
}
