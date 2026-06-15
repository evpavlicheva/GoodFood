"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Mascot from "@/components/mascot/Mascot";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";
import { playYummyJingle } from "@/lib/sound";

/**
 * Full-screen "Пора сделать заказ!" takeover, shown when the child receives
 * a "reminder" push while the app is open (the service worker forwards the
 * push payload to every open tab via `postMessage`). Plays the cheerful
 * "Yummy Yummy!" jingle at the same time.
 */
export default function ReminderOverlay() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile } = useChildProfile();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (data?.type === "goodfood-push" && data.payload?.kind === "reminder") {
        playYummyJingle();
        setVisible(true);
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  function handleGo() {
    setVisible(false);
    router.push("/menu");
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-eel/80 px-6 text-center backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <Mascot mascotId={profile?.mascotId} emotion="excited" message={null} size="xl" />
          </motion.div>

          <h2 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            {t("notifications.overlay.title")}
          </h2>
          <p className="max-w-sm font-heading text-lg font-bold text-white/90">
            {t("notifications.overlay.subtitle")}
          </p>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleGo}
            className="rounded-full bg-bee px-8 py-4 font-heading text-xl font-extrabold text-eel shadow-card"
          >
            {t("notifications.overlay.cta")}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
