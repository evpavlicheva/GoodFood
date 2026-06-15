"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Mascot from "@/components/mascot/Mascot";
import Button from "@/components/ui/Button";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { MASCOTS, getMascot, type MascotId, type MascotEmotion } from "@/components/mascot/mascotData";
import { useChildProfile } from "@/hooks/useChildProfile";
import { consumeNewProfileSetupFlag, type ChildProfile } from "@/lib/childProfile";
import { useLanguage } from "@/context/LanguageContext";

function sameProfile(a: ChildProfile, b: ChildProfile) {
  return a.name.trim().toLowerCase() === b.name.trim().toLowerCase();
}

export default function SetupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, savedProfiles, setProfile, switchProfile } = useChildProfile();

  // Returning players (saved profiles exist on this device) see a
  // "Who is here?" picker pre-filled with the last active profile instead
  // of retyping their name every time. First-time players (no saved
  // profiles) go straight to the name/mascot form. The profile switcher's
  // "+ Add a child" sets a one-shot flag (consumed below) so it can force
  // the form even when saved profiles exist.
  const [mode, setMode] = useState<"pick" | "new">(savedProfiles.length > 0 ? "pick" : "new");
  const [picked, setPicked] = useState<ChildProfile | null>(savedProfiles[0] ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (consumeNewProfileSetupFlag()) setMode("new");
  }, []);

  const [name, setName] = useState("");
  // Default to the currently active mascot (or the most recently used
  // saved profile's, or the first one) so the picker always shows a mascot
  // pre-selected — the child just needs to type their name (or tap a
  // different buddy) to continue.
  const [selected, setSelected] = useState<MascotId | null>(
    profile?.mascotId ?? savedProfiles[0]?.mascotId ?? MASCOTS[0]?.id ?? null
  );

  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0 && selected !== null;
  const previewMascot = selected ?? "broccoli";

  const emotion: MascotEmotion = !trimmedName ? "thinking" : !selected ? "happy" : "cheering";
  const message = !trimmedName
    ? t("setup.mascotAskName")
    : !selected
      ? t("setup.mascotPickBuddy", { name: trimmedName })
      : t("setup.mascotReady", { name: trimmedName });

  function handleContinue() {
    if (!selected || !canContinue) return;
    setProfile({ name: trimmedName, mascotId: selected });
    router.push("/home");
  }

  function handlePickContinue() {
    if (!picked) return;
    switchProfile(picked);
    router.push("/home");
  }

  if (mode === "pick" && picked) {
    const mascot = getMascot(picked.mascotId);

    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-10 text-center">
        <LanguageSwitcher className="absolute right-4 top-4" />

        <h1 className="font-heading text-2xl font-extrabold text-eel sm:text-3xl">
          {t("setup.whoIsHere")}
        </h1>

        <div className="relative w-full max-w-sm">
          <div className={`flex flex-col items-center gap-3 rounded-2xl p-6 shadow-card ${mascot.bgClass}`}>
            <span className="relative block h-28 w-28">
              <Image src={mascot.image} alt={mascot.name} fill sizes="112px" className="object-contain" />
            </span>
            <span className="font-heading text-xl font-extrabold text-eel">{picked.name}</span>
          </div>

          {savedProfiles.length > 1 && (
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              aria-label={t("setup.choosePlayer")}
              className="btn-press absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-eel-light shadow-card transition-colors hover:text-feather"
            >
              <motion.span animate={{ rotate: pickerOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
                ▾
              </motion.span>
            </button>
          )}

          <AnimatePresence>
            {pickerOpen && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setPickerOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-white p-3 shadow-card"
                >
                  <ul className="flex flex-col gap-2">
                    {savedProfiles.map((p) => {
                      const m = getMascot(p.mascotId);
                      const isPicked = sameProfile(p, picked);
                      return (
                        <li key={p.name}>
                          <button
                            type="button"
                            onClick={() => {
                              setPicked(p);
                              setPickerOpen(false);
                            }}
                            className={`btn-press flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                              isPicked ? "bg-feather-50 ring-2 ring-feather" : "bg-cloud hover:bg-cloud/70"
                            }`}
                          >
                            <span className="relative block h-10 w-10 shrink-0">
                              <Image src={m.image} alt={m.name} fill sizes="40px" className="object-contain" />
                            </span>
                            <span className="font-heading text-sm font-bold text-eel">{p.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <Button onClick={handlePickContinue} color="feather" size="lg" className="w-full max-w-sm">
          {t("setup.cta")}
        </Button>

        <button
          type="button"
          onClick={() => {
            setPickerOpen(false);
            setMode("new");
          }}
          className="font-heading text-sm font-bold text-macaw hover:underline"
        >
          {t("setup.addNew")}
        </button>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center gap-8 px-6 py-10 text-center">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <Mascot mascotId={previewMascot} emotion={emotion} message={message} size="xl" />

      <div className="w-full max-w-sm">
        <label htmlFor="child-name" className="mb-2 block font-heading text-xl font-extrabold text-eel">
          {t("setup.nameLabel")}
        </label>
        <input
          id="child-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("setup.namePlaceholder")}
          maxLength={20}
          autoComplete="off"
          className="w-full rounded-2xl border-2 border-cloud bg-white px-5 py-4 text-center text-xl font-bold text-eel shadow-card outline-none transition-colors focus:border-macaw"
        />
      </div>

      <div className="w-full max-w-md">
        <p className="mb-4 font-heading text-xl font-extrabold text-eel">{t("setup.chooseBuddy")}</p>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {MASCOTS.map((m) => (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              whileTap={{ scale: 0.92 }}
              className={`flex flex-col items-center gap-1 rounded-2xl p-3 shadow-card transition-all ${
                selected === m.id ? `${m.bgClass} ring-4 ring-feather` : "bg-white"
              }`}
            >
              <span className="relative block h-12 w-12">
                <Image src={m.image} alt={m.name} fill sizes="48px" className="object-contain" />
              </span>
              <span className="font-heading text-xs font-bold text-eel-light">{m.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!canContinue}
        color="feather"
        size="lg"
        className="w-full max-w-sm"
      >
        {t("setup.cta")}
      </Button>
    </main>
  );
}
