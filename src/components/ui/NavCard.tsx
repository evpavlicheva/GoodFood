"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface NavCardProps {
  href: string;
  emoji: string;
  label: string;
  /** Tailwind background + text color classes, e.g. "bg-macaw-50 text-macaw-700" */
  colorClass: string;
}

export default function NavCard({ href, emoji, label, colorClass }: NavCardProps) {
  return (
    <Link href={href} className="block">
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -4 }}
        className={`flex flex-col items-center justify-center gap-2 rounded-3xl p-6 text-center shadow-card ${colorClass}`}
      >
        <span className="text-4xl">{emoji}</span>
        <span className="font-heading text-lg font-extrabold">{label}</span>
      </motion.div>
    </Link>
  );
}
