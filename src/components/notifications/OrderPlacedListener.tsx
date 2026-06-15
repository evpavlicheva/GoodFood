"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push/client";
import { playOrderPlacedChime } from "@/lib/sound";

/**
 * Lives in the parent dashboard layout. Registers the service worker and
 * plays a short chime whenever an "order placed" push arrives while the
 * dashboard is open (the OS notification shows too, including when the
 * tab is closed).
 */
export default function OrderPlacedListener() {
  useEffect(() => {
    registerServiceWorker();

    if (!("serviceWorker" in navigator)) return;

    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (data?.type === "goodfood-push" && data.payload?.kind === "order_placed") {
        playOrderPlacedChime();
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
