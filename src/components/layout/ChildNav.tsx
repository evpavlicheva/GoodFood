"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ProfileSwitcher from "@/components/layout/ProfileSwitcher";
import { useCart } from "@/context/CartContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";

/* ── SVG icons ── */
function IconHome({ active }: { active: boolean }) {
  const c = active ? "#ffffff" : "#58cc02";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.2 11 5.2a1.5 1.5 0 0 1 2 0l7 6" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.6 10v8.2a1 1 0 0 0 1 1H10v-4.4a2 2 0 0 1 4 0V19.2h3.4a1 1 0 0 0 1-1V10" fill={c} />
    </svg>
  );
}

function IconCart({ active }: { active: boolean }) {
  const c = active ? "#ffffff" : "#58cc02";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h2.2l1.4 8.4a1.6 1.6 0 0 0 1.6 1.3h7a1.6 1.6 0 0 0 1.55-1.2L19 8.3H7.2" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19" r="1.8" fill={c} />
      <circle cx="16.5" cy="19" r="1.8" fill={c} />
    </svg>
  );
}

function IconParent() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.4" r="3.6" fill="#58cc02" />
      <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0 1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Z" fill="#58cc02" />
    </svg>
  );
}

function IconCookie() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#f2b85a" />
      <path d="M12 3a9 9 0 0 0 0 18 9 9 0 0 0 8.5-6.1 2.4 2.4 0 0 1-3-3A9 9 0 0 1 12 3Z" fill="#e2a23f" />
      <circle cx="9"    cy="9.5"  r="1.4" fill="#8a5a1e" />
      <circle cx="14.5" cy="8.5"  r="1.2" fill="#8a5a1e" />
      <circle cx="13.5" cy="14"   r="1.4" fill="#8a5a1e" />
      <circle cx="8.5"  cy="14"   r="1.1" fill="#8a5a1e" />
    </svg>
  );
}

const SQ = "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-colors";

export default function ChildNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { totalCount } = useCart();
  const { isAuthenticated } = useAdminAuth();
  const { profile } = useChildProfile();

  const homeActive = pathname === "/home";
  const cartActive = pathname === "/cart";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#eef0ea] bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">

        {/* LEFT: logo + home */}
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-[46px] w-[46px] shrink-0">
              <Image src="/icons/logo.png" alt="" fill sizes="46px" className="object-contain" />
            </div>
            <span className="hidden font-heading text-xl font-extrabold text-[#3c4a2e] sm:inline">GoodFood</span>
          </Link>

          {/* Home button — next to logo */}
          <Link
            href="/home"
            aria-label={t("nav.home")}
            className={`${SQ} ${homeActive ? "border-2 border-[#58cc02] bg-[#58cc02]" : "border-2 border-[#eef0ea] bg-white"}`}
          >
            <IconHome active={homeActive} />
          </Link>
        </div>

        {/* CENTER: cart + coin badge */}
        <div className="flex flex-1 items-center justify-center gap-2">

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={t("nav.cart")}
            className={`${SQ} relative border-2 ${cartActive ? "border-[#58cc02] bg-[#58cc02]" : "border-[#eef0ea] bg-white"}`}
          >
            <IconCart active={cartActive} />
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

          {/* Coin/cookie badge */}
          {profile && (
            <Link
              href="/buddies"
              aria-label={t("coins.balanceLabel")}
              className="flex h-11 shrink-0 items-center gap-2 rounded-[14px] border-2 border-[#eef0ea] bg-white px-3 text-sm font-extrabold text-[#3c4a2e]"
            >
              <IconCookie />
              {profile.coins}
            </Link>
          )}
        </div>

        {/* RIGHT: parent mode + language + profile */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Switch to parent mode */}
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            aria-label={t("nav.parentMode")}
            className={`${SQ} border-2 border-[#d7edbc] bg-[#eef7e3] hover:border-[#58cc02]`}
          >
            <IconParent />
          </Link>

          {/* Language */}
          <LanguageSwitcher />

          {/* Profile switcher */}
          <ProfileSwitcher />
        </div>

      </div>
    </header>
  );
}
