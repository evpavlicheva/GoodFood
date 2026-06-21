"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLanguage } from "@/context/LanguageContext";

/* ── Inline SVG icons ── */
function IconMenu({ active }: { active: boolean }) {
  const c = active ? "#3c9500" : "#5a6150";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="13" cy="12" r="7" stroke={c} strokeWidth="2.2" />
      <path d="M5 4.5v5a1.6 1.6 0 0 0 3.2 0v-5M6.6 4.5v3.4" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function IconOrders({ active }: { active: boolean }) {
  const c = active ? "#3c9500" : "#5a6150";
  const fill = active ? "#ffffff" : "none";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 4.8 6.4 3.6a1 1 0 0 1 1.25 0l1.1 1 1.45-1.05a1 1 0 0 1 1.18 0L13.8 4.6l1.4-1.05a1 1 0 0 1 1.25.02L17.9 4.8V19.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" fill={fill} stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 9h7M8 12.4h7M8 15.8h4.5" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconIngredients({ active }: { active: boolean }) {
  const c = active ? "#3c9500" : "#5a6150";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 8.2c1.7 1.7 1.6 4.7-1.8 8.1S8.1 20.6 6.4 18.9s-1-6 2.4-9.4 6-2.9 7.7-1.3Z" fill="#ff7a3d" />
      <path d="m14.6 9.4 2.4-2.4M16 7.4l.4-2.2 2 .3M17.2 8.6l2.2-.3.2 2" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCategories({ active }: { active: boolean }) {
  const c = active ? "#3c9500" : "#5a6150";
  const fill = active ? "#eef7e3" : "#f6f8f2";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 11.3V5.6a1 1 0 0 1 1-1h5.7a1 1 0 0 1 .7.3l7.1 7.1a1 1 0 0 1 0 1.4l-5.7 5.7a1 1 0 0 1-1.4 0l-7.1-7.1a1 1 0 0 1-.3-.7Z" fill={fill} stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="8.6" cy="8.6" r="1.7" fill={c} />
    </svg>
  );
}
function IconReminders({ active }: { active: boolean }) {
  const c = active ? "#3c9500" : "#5a6150";
  const fill = active ? "#eef7e3" : "none";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 16.5c-.6 0-1-.7-.6-1.2l1-1.3V11a5.6 5.6 0 0 1 11.2 0v3l1 1.3c.4.5 0 1.2-.6 1.2Z" fill={fill} stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 18.5a2 2 0 0 0 4 0" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconKidMode() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.4" fill="#58cc02" />
      <circle cx="9.2" cy="10.6" r="1.4" fill="#fff" />
      <circle cx="14.8" cy="10.6" r="1.4" fill="#fff" />
      <path d="M8.6 14.2a4 4 0 0 0 6.8 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.5 5.2H7a1.6 1.6 0 0 0-1.6 1.6v10.4A1.6 1.6 0 0 0 7 18.8h6.5" stroke="#9aa08f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8.5 19.5 12 16 15.5M10.5 12h8.5" stroke="#9aa08f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BTN = "h-11 box-border flex items-center gap-1.5 rounded-[14px] text-sm font-extrabold transition-colors";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { href: "/menu-manager", label: t("admin.nav.menu"),         Icon: IconMenu },
    { href: "/dashboard",    label: t("admin.nav.orders"),       Icon: IconOrders },
    { href: "/ingredients",  label: t("admin.nav.ingredients"),  Icon: IconIngredients },
    { href: "/categories",   label: t("admin.nav.categories"),   Icon: IconCategories },
    { href: "/notifications",label: t("admin.nav.notifications"),Icon: IconReminders },
  ];

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#eef0ea] bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-3">

        {/* Logo */}
        <Link href="/menu-manager" className="flex shrink-0 items-center gap-2">
          <div className="relative h-[40px] w-[70px] shrink-0">
            <Image src="/icons/logo.png" alt="" fill sizes="70px" className="object-contain object-left" />
          </div>
          <div className="hidden flex-col leading-none md:flex">
            <span className="font-heading text-lg font-extrabold text-[#3c4a2e]">{t("admin.nav.brand")}</span>
            <span className="text-[11px] font-extrabold tracking-wide text-[#58cc02]">{t("admin.nav.brandSuffix")}</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-1 items-center gap-0.5">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`${BTN} shrink-0 px-2 md:px-2.5 ${active ? "bg-[#eef7e3] text-[#3c9500]" : "text-[#5a6150] hover:bg-[#f6f8f2]"}`}
              >
                <Icon active={active} />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          <LanguageSwitcher />
          <Link
            href="/home"
            className={`${BTN} border-2 border-[#d7edbc] bg-[#eef7e3] px-2 md:px-3 text-[#3c9500]`}
          >
            <IconKidMode />
            <span className="hidden md:inline">{t("admin.nav.kidMode")}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={`${BTN} border-2 border-[#eef0ea] bg-white px-2 md:px-3 text-[#7c8273] hover:text-cardinal`}
          >
            <IconLogout />
            <span className="hidden md:inline">{t("admin.nav.logout")}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
