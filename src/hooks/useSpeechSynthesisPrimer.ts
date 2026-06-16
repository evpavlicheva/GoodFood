"use client";

import { useEffect } from "react";
import { primeYummyAudio } from "@/lib/sound";

/**
 * On the first user interaction (touch or click), unlocks both:
 *  - SpeechSynthesis (speak a silent utterance)
 *  - HTML Audio (play→pause the jingle MP3)
 * After this, both APIs work without a direct user gesture — needed because
 * the reminder overlay appears automatically on push and has no gesture.
 */
export function useSpeechSynthesisPrimer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function prime() {
      // Unlock Audio
      primeYummyAudio();

      // Unlock SpeechSynthesis
      if ("speechSynthesis" in window) {
        try {
          const utt = new SpeechSynthesisUtterance(" ");
          utt.volume = 0;
          utt.rate = 10;
          window.speechSynthesis.speak(utt);
        } catch { /* ignore */ }
      }
    }

    window.addEventListener("touchstart", prime, { passive: true, once: true });
    window.addEventListener("click", prime, { passive: true, once: true });

    return () => {
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("click", prime);
    };
  }, []);
}
