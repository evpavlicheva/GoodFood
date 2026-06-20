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

/* ── Inline SVG icons ── */
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.2 11 5.2a1.5 1.5 0 0 1 2 0l7 6" stroke={active ? "#fff" : "#58cc02"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.6 10v8.2a1 1 0 0 0 1 1H10v-4.4a2 2 0 0 1 4 0V19.2h3.4a1 1 0 0 0 1-1V10" fill={active ? "#fff" : "#58cc02"} />
    </svg>
  );
}
function IconCart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h2.2l1.4 8.4a1.6 1.6 0 0 0 1.6 1.3h7a1.6 1.6 0 0 0 1.55-1.2L19 8.3H7.2" stroke="#58cc02" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19" r="1.8" fill="#58cc02" />
      <circle cx="16.5" cy="19" r="1.8" fill="#58cc02" />
    </svg>
  );
}
function IconParent() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.4" r="3.6" fill="#3c4a2e" />
      <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0 1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Z" fill="#3c4a2e" />
    </svg>
  );
}
function IconMenu({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="13" cy="12" r="7" stroke={active ? "#3c9500" : "#5a6150"} strokeWidth="2.2" />
      <path d="M5 4.5v5a1.6 1.6 0 0 0 3.2 0v-5M6.6 4.5v3.4" stroke={active ? "#3c9500" : "#5a6150"} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function IconOrders({ active }: { active: boolean }) {
  const c = active ? "#3c9500" : "#5a6150";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 4.8 6.4 3.6a1 1 0 0 1 1.25 0l1.1 1 1.45-1.05a1 1 0 0 1 1.18 0L13.8 4.6l1.4-1.05a1 1 0 0 1 1.25.02L17.9 4.8V19.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" fill={active ? "#fff" : "none"} stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 9h7M8 12.4h7M8 15.8h4.5" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const SQ = "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-colors";
const PILL = "flex h-11 shrink-0 items-center rounded-[14px] border-2 border-[#eef0ea] bg-white transition-colors";

export default function ChildNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { totalCount } = useCart();
  const { isAuthenticated } = useAdminAuth();
  const { profile } = useChildProfile();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const NAV_LINKS = [
    { href: "/menu",   Icon: IconMenu,   label: t("nav.menu") },
    { href: "/orders", Icon: IconOrders, label: t("nav.myOrders") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#eef0ea] bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="relative h-[46px] w-[46px] shrink-0">
            <Image src="/mascots/broccoli.png" alt="" fill sizes="46px" className="object-contain drop-shadow-sm" />
          </div>
          <span className="hidden font-heading text-xl font-extrabold text-[#3c4a2e] sm:inline">GoodFood</span>
        </Link>

        {/* Nav links — Menu + Orders */}
        <nav className="flex flex-1 items-center gap-1">
          {NAV_LINKS.map(({ href, Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex h-11 shrink-0 items-center gap-2 rounded-[14px] px-3 text-sm font-extrabold transition-colors ${
                  active ? "bg-[#eef7e3] text-[#3c9500]" : "text-[#5a6150] hover:bg-[#f6f8f2]"
                }`}
              >
                <Icon active={active} />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Coin balance */}
          {profile && (
            <Link href="/buddies" className={`${PILL} gap-2 px-3`}>
              <GoldCoin size={21} />
              <span className="font-extrabold text-[#3c4a2e]">{profile.coins}</span>
            </Link>
          )}

          {/* Language */}
          <LanguageSwitcher />

          {/* Home — square icon button */}
          <Link
            href="/home"
            className={`${SQ} ${isActive("/home") ? "bg-[#58cc02] border-[#58cc02]" : "border-2 border-[#eef0ea] bg-white"}`}
          >
            <IconHome active={isActive("/home")} />
          </Link>

          {/* Cart — square icon button with badge */}
          <Link href="/cart" className={`${SQ} relative border-2 ${isActive("/cart") ? "border-[#58cc02] bg-[#58cc02]" : "border-[#eef0ea] bg-white"}`}>
            <span className={isActive("/cart") ? "text-white" : ""}>
              <IconCart />
            </span>
            <AnimatePresence>
              {totalCount > 0 && (
                <motion.span
                  key={totalCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#ff5b5b] px-1 text-[10px] font-extrabold text-white"
                >
                  {totalCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Switch to parent mode */}
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className={`${SQ} border-2 border-[#eef7e3] bg-[#eef7e3] hover:border-[#d7edbc]`}
          >
            <IconParent />
          </Link>

          {/* Profile switcher */}
          <ProfileSwitcher />
        </div>
      </div>
    </header>
  );
}
