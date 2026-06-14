"use client";

import { motion } from "framer-motion";

interface SpeechBubbleProps {
  text: string;
  className?: string;
}

/**
 * A small pop-in speech bubble with a triangular "tail" pointing down at
 * the mascot. Pass a new `text` value (and re-key the parent) to trigger
 * a fresh pop-in animation.
 */
export default function SpeechBubble({ text, className = "" }: SpeechBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 12 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={`relative whitespace-nowrap rounded-2xl bg-white px-4 py-2 font-heading text-base font-extrabold text-eel shadow-card ${className}`}
    >
      {text}
      {/* tail */}
      <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-sm bg-white" />
    </motion.div>
  );
}
