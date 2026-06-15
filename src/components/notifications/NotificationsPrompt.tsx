"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { usePushSubscription } from "@/hooks/usePushSubscription";

const DISMISS_KEY = "goodfood:push-prompt-dismissed";

/**
 * Small bottom banner offering to turn on push notifications.
 * - For children: "Time to order!" reminders.
 * - For parents: "your child placed an order" alerts.
 *
 * Stays out of the way once the user subscribes, dismisses it, or if the
 * browser denied permission outright.
 */
export default function NotificationsPrompt({
  role,
  profileName,
}: {
  role: "child" | "parent";
  profileName?: string;
}) {
  const { t } = useLanguage();
  const { status, busy, enable } = usePushSubscription(role, profileName);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage errors
    }
  }

  const show = !dismissed && status === "unsubscribed";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-20 left-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 rounded-3xl bg-white p-4 shadow-card sm:bottom-6"
        >
          <p className="font-heading text-base font-extrabold text-eel">{t("notifications.enable.title")}</p>
          <p className="mt-1 text-sm font-bold text-eel-light">{t("notifications.enable.body")}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full px-4 py-2 text-sm font-heading font-bold text-eel-light hover:text-eel"
            >
              {t("notifications.enable.dismiss")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const ok = await enable();
                if (ok) handleDismiss();
              }}
              className="rounded-full bg-feather px-4 py-2 text-sm font-heading font-extrabold text-white disabled:opacity-60"
            >
              {t("notifications.enable.enable")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
