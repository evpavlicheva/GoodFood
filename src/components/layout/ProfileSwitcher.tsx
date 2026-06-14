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
 * The panel renders as a full-screen overlay (centered card on larger
 * screens, bottom sheet on phones) so it's never cramped inside the
 * scrollable nav bar — tapping anywhere outside the card closes it.
 */
export default function ProfileSwitcher() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, savedProfiles, switchProfile, clearProfile } = useChildProfile();
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-eel/40 sm:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-3xl bg-white p-4 shadow-card sm:rounded-3xl sm:p-5"
            >
              <p className="mb-2 px-1 text-center font-heading text-lg font-extrabold text-eel">
                {t("profileSwitcher.title")}
              </p>
              <ul className="flex flex-col gap-2">
                {savedProfiles.map((p) => {
                  const m = getMascot(p.mascotId);
                  const isActive = sameProfile(p, profile);
                  return (
                    <li key={p.name}>
                      <button
                        type="button"
                        onClick={() => handleSelect(p)}
                        className={`btn-press flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                          isActive ? "bg-feather-50 ring-2 ring-feather" : "bg-cloud hover:bg-cloud/70"
                        }`}
                      >
                        <span className="relative block h-12 w-12 shrink-0">
                          <Image src={m.image} alt={m.name} fill sizes="48px" className="object-contain" />
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="font-heading text-base font-bold text-eel">{p.name}</span>
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
                className="btn-press mt-3 w-full rounded-2xl bg-macaw-50 px-3 py-3 text-center font-heading text-base font-bold text-macaw"
              >
                {t("profileSwitcher.addChild")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
