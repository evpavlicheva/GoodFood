"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getMascot } from "@/components/mascot/mascotData";
import { useChildProfile, type ChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";

function sameProfile(a: ChildProfile, b: ChildProfile) {
  return a.name.trim().toLowerCase() === b.name.trim().toLowerCase();
}

/**
 * Small avatar button in the nav bar that opens a "who's playing?" panel —
 * lets a sibling sharing this device switch to their own saved profile (or
 * set up a brand new one) without affecting anyone else's data.
 */
export default function ProfileSwitcher() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, savedProfiles, switchProfile, clearProfile } = useChildProfile();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!profile) return null;

  const mascot = getMascot(profile.mascotId);

  function handleSelect(target: ChildProfile) {
    setOpen(false);
    if (sameProfile(target, profile!)) return;
    switchProfile(target);
    router.push("/home");
  }

  function handleAddChild() {
    setOpen(false);
    clearProfile();
    router.push("/setup");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("nav.switchProfile")}
        className="btn-press relative block h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-cloud transition-colors hover:ring-feather sm:h-10 sm:w-10"
      >
        <Image src={mascot.image} alt={mascot.name} fill sizes="40px" className="object-contain" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl bg-white p-2 shadow-card"
          >
            <p className="px-2 pb-1 pt-1 font-heading text-xs font-extrabold uppercase tracking-wide text-eel-light">
              {t("profileSwitcher.title")}
            </p>
            <ul className="flex flex-col gap-1">
              {savedProfiles.map((p) => {
                const m = getMascot(p.mascotId);
                const isActive = sameProfile(p, profile);
                return (
                  <li key={p.name}>
                    <button
                      type="button"
                      onClick={() => handleSelect(p)}
                      className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors ${
                        isActive ? "bg-feather-50" : "hover:bg-cloud"
                      }`}
                    >
                      <span className="relative block h-8 w-8 shrink-0">
                        <Image src={m.image} alt={m.name} fill sizes="32px" className="object-contain" />
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span className="font-heading text-sm font-bold text-eel">{p.name}</span>
                        {isActive && (
                          <span className="text-xs font-bold text-feather">
                            {t("profileSwitcher.current")}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={handleAddChild}
              className="mt-1 w-full rounded-xl px-2 py-2 text-left font-heading text-sm font-bold text-macaw hover:bg-cloud"
            >
              {t("profileSwitcher.addChild")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
