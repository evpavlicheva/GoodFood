"use client";

import { useState } from "react";
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
 *
 * The panel renders as a small floating card anchored under the avatar
 * (top-right corner, near the icon that opened it) via fixed positioning —
 * so it's never clipped by the nav bar's horizontal scroll. An invisible
 * full-screen backdrop closes it on any outside tap.
 */
export default function ProfileSwitcher() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, savedProfiles, switchProfile, clearProfile, removeProfile } = useChildProfile();
  const [open, setOpen] = useState(false);

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

  function handleRemove(target: ChildProfile) {
    if (!window.confirm(t("profileSwitcher.removeConfirm", { name: target.name }))) return;
    removeProfile(target.name);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("nav.switchProfile")}
        className="btn-press relative block h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-cloud transition-colors hover:ring-feather sm:h-10 sm:w-10"
      >
        <Image src={mascot.image} alt={mascot.name} fill sizes="40px" className="object-contain" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Invisible full-screen backdrop: tapping anywhere outside the
                card closes the panel. */}
            <div className="fixed inset-0 z-[45]" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed right-3 top-16 z-50 max-h-[70vh] w-64 overflow-y-auto rounded-2xl bg-white p-3 shadow-card sm:right-6 sm:top-20 sm:w-72"
            >
              <p className="mb-2 px-1 font-heading text-xs font-extrabold uppercase tracking-wide text-eel-light">
                {t("profileSwitcher.title")}
              </p>
              <ul className="flex flex-col gap-2">
                {savedProfiles.map((p) => {
                  const m = getMascot(p.mascotId);
                  const isActive = sameProfile(p, profile);
                  return (
                    <li key={p.name} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelect(p)}
                        className={`btn-press flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                          isActive ? "bg-feather-50 ring-2 ring-feather" : "bg-cloud hover:bg-cloud/70"
                        }`}
                      >
                        <span className="relative block h-10 w-10 shrink-0">
                          <Image src={m.image} alt={m.name} fill sizes="40px" className="object-contain" />
                        </span>
                        <span className="flex min-w-0 flex-col leading-tight">
                          <span className="truncate font-heading text-sm font-bold text-eel">{p.name}</span>
                          {isActive && (
                            <span className="text-xs font-bold text-feather">
                              {t("profileSwitcher.current")}
                            </span>
                          )}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(p)}
                        aria-label={t("profileSwitcher.removeLabel", { name: p.name })}
                        className="btn-press flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cloud text-lg text-eel-light transition-colors hover:bg-cardinal-50 hover:text-cardinal"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={handleAddChild}
                className="btn-press mt-2 w-full rounded-2xl bg-macaw-50 px-3 py-2.5 text-center font-heading text-sm font-bold text-macaw"
              >
                {t("profileSwitcher.addChild")}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
