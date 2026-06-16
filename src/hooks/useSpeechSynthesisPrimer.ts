"use client";

import { useEffect } from "react";

/**
 * Warms up SpeechSynthesis on the first user interaction so that subsequent
 * calls to speechSynthesis.speak() work without a direct user gesture.
 * Mobile browsers (iOS Safari, Chrome) require at least one speak() call
 * inside a user-event handler before allowing background calls.
 */
export function useSpeechSynthesisPrimer() {
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    let primed = false;

    function prime() {
      if (primed) return;
      primed = true;
      try {
        const utt = new SpeechSynthesisUtterance(" ");
        utt.volume = 0;
        utt.rate = 10; // finish instantly
        window.speechSynthesis.speak(utt);
      } catch {
        // ignore
      }
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("click", prime);
    }

    window.addEventListener("touchstart", prime, { passive: true, once: true });
    window.addEventListener("click", prime, { passive: true, once: true });

    return () => {
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("click", prime);
    };
  }, []);
}
