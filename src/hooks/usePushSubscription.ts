"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getExistingSubscription,
  isPushSupported,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push/client";

export type PushStatus = "unsupported" | "checking" | "subscribed" | "unsubscribed" | "denied";

/**
 * Registers the service worker on mount and exposes the current push
 * subscription status plus `enable`/`disable` actions for `role`
 * (and `profileName` for children).
 */
export function usePushSubscription(role: "child" | "parent", profileName?: string) {
  const [status, setStatus] = useState<PushStatus>("checking");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    const subscription = await getExistingSubscription();
    setStatus(subscription ? "subscribed" : "unsubscribed");
  }, []);

  useEffect(() => {
    registerServiceWorker().then(refresh);
  }, [refresh]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const ok = await subscribeToPush({ role, profileName });
      await refresh();
      return ok;
    } finally {
      setBusy(false);
    }
  }, [role, profileName, refresh]);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      await unsubscribeFromPush();
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  return { status, busy, enable, disable };
}
