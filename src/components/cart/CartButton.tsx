"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

/** Floating cart icon with a bouncy item-count badge. */
export default function CartButton() {
  const { totalCount } = useCart();

  return (
    <Link href="/cart" aria-label="View cart">
      <motion.div
        whileTap={{ scale: 0.92 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl shadow-duo shadow-wolf"
      >
        🛒
        <AnimatePresence>
          {totalCount > 0 && (
            <motion.span
              key={totalCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-cardinal px-1 text-xs font-extrabold text-white"
            >
              {totalCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}
