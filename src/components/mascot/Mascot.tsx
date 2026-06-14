"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import SpeechBubble from "./SpeechBubble";
import { getEmotionPhrases, getMascot, type MascotEmotion, type MascotId } from "./mascotData";
import { useLanguage } from "@/context/LanguageContext";

export interface MascotProps {
  /** Which character to show */
  mascotId?: MascotId;
  /** Current emotion / animation state */
  emotion?: MascotEmotion;
  /**
   * Speech bubble text. Pass `null` to hide the bubble entirely, or leave
   * undefined to fall back to a default phrase for the current emotion.
   */
  message?: string | null;
  /** Overall size of the mascot avatar */
  size?: "sm" | "md" | "lg" | "xl";
  /** Extra classes for the wrapping container */
  className?: string;
  /** Disable the playful "tap to react" interaction */
  interactive?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<MascotProps["size"]>, string> = {
  sm: "h-20 w-20 text-5xl",
  md: "h-32 w-32 text-7xl",
  lg: "h-44 w-44 text-8xl",
  xl: "h-56 w-56 text-[5.5rem]",
};

// Per-emotion body animations. Each loops so the mascot always feels alive —
// kept gentle (small offsets, slower easing) for a soft bounce rather than a
// busy wiggle.
const bodyVariants: Variants = {
  idle: {
    y: [0, -6, 0],
    rotate: 0,
    scale: 1,
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    y: [0, -9, 0],
    scale: [1, 1.03, 1],
    rotate: 0,
    transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
  },
  excited: {
    rotate: [-3, 3, -3],
    scale: [1, 1.04, 1],
    y: [0, -4, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
  surprised: {
    scale: [1, 1.08, 0.98, 1.02, 1],
    rotate: [0, -2, 2, 0],
    y: [0, -4, 0],
    transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.8, ease: "easeOut" },
  },
  thinking: {
    rotate: [0, -4, 0, 4, 0],
    y: [0, -2, 0],
    scale: 1,
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
  cheering: {
    y: [0, -16, 0],
    rotate: [-5, 5, -5],
    scale: [1, 1.05, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
};

// Soft glow behind the mascot, pulsing gently faster for higher-energy emotions.
const GLOW_DURATION: Record<MascotEmotion, number> = {
  idle: 3.2,
  happy: 1.6,
  excited: 1,
  surprised: 1.3,
  thinking: 2.8,
  cheering: 0.9,
};

/**
 * The GoodFood mascot: a big, friendly, animated character with a gentle
 * idle bounce and an optional speech bubble. Tap it for a quick playful
 * reaction!
 */
export default function Mascot({
  mascotId = "broccoli",
  emotion = "idle",
  message,
  size = "lg",
  className = "",
  interactive = true,
}: MascotProps) {
  const { lang } = useLanguage();
  const mascot = getMascot(mascotId);

  const [reacting, setReacting] = useState(false);
  const [reactionText, setReactionText] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const activeEmotion: MascotEmotion = reacting ? "cheering" : emotion;

  // Resolve what (if anything) the speech bubble should say.
  const defaultPhrase = getEmotionPhrases(activeEmotion, lang)[0] ?? null;
  const bubbleText = reacting
    ? reactionText ?? defaultPhrase
    : message === null
      ? null
      : message ?? defaultPhrase;

  function handleTap() {
    if (!interactive) return;
    const phrases = getEmotionPhrases("cheering", lang);
    setReactionText(phrases.length > 0 ? phrases[Math.floor(Math.random() * phrases.length)] : null);
    setReacting(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setReacting(false);
      setReactionText(null);
    }, 900);
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex min-h-[2.75rem] items-end">
        <AnimatePresence mode="wait">
          {bubbleText && (
            <SpeechBubble key={`${activeEmotion}-${bubbleText}`} text={bubbleText} />
          )}
        </AnimatePresence>
      </div>

      <div className={`relative ${SIZE_CLASSES[size]}`}>
        {/* Soft glow that pulses faster for higher-energy emotions */}
        <motion.div
          aria-hidden
          className={`absolute inset-0 rounded-full ${mascot.bgClass} blur-xl`}
          animate={{
            scale: activeEmotion === "idle" ? [0.85, 1, 0.85] : [0.92, 1.18, 0.92],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: GLOW_DURATION[activeEmotion],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          role={interactive ? "button" : undefined}
          aria-label={interactive ? `${mascot.name} — tap to react` : mascot.name}
          tabIndex={interactive ? 0 : undefined}
          onClick={handleTap}
          onKeyDown={(e) => {
            if (interactive && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              handleTap();
            }
          }}
          className={`relative flex h-full w-full items-center justify-center rounded-full ${mascot.bgClass} shadow-duo-lg ${mascot.shadowClass} ${
            interactive ? "cursor-pointer" : ""
          }`}
          variants={bodyVariants}
          animate={activeEmotion}
          initial="idle"
          whileHover={interactive ? { scale: 1.05 } : undefined}
          whileTap={interactive ? { scale: 0.94 } : undefined}
        >
          <Image
            src={mascot.image}
            alt={mascot.name}
            fill
            sizes="224px"
            className="select-none object-contain p-2"
            priority
            draggable={false}
          />
        </motion.div>
      </div>
    </div>
  );
}
