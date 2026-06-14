"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export type ButtonColor = "feather" | "macaw" | "bee" | "cardinal" | "beetle" | "fox";
export type ButtonSize = "md" | "lg";

const COLOR_CLASSES: Record<ButtonColor, string> = {
  feather: "bg-feather text-white shadow-feather-700",
  macaw: "bg-macaw text-white shadow-macaw-700",
  bee: "bg-bee text-eel shadow-bee-700",
  cardinal: "bg-cardinal text-white shadow-cardinal-700",
  beetle: "bg-beetle text-white shadow-beetle-700",
  fox: "bg-fox text-white shadow-fox-600",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

interface ButtonClassOptions {
  color?: ButtonColor;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
}

/** Shared chunky, "pressable" Duolingo-style button classes. */
export function buttonClasses({
  color = "feather",
  size = "lg",
  disabled = false,
  className = "",
}: ButtonClassOptions = {}) {
  return [
    "btn-press inline-flex items-center justify-center gap-2 rounded-2xl font-heading font-extrabold uppercase tracking-wide shadow-duo transition-colors",
    SIZE_CLASSES[size],
    disabled
      ? "bg-wolf text-white shadow-none opacity-70 cursor-not-allowed"
      : COLOR_CLASSES[color],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  color?: ButtonColor;
  size?: ButtonSize;
}

export default function Button({
  color = "feather",
  size = "lg",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      disabled={disabled}
      className={buttonClasses({ color, size, disabled, className })}
      {...props}
    />
  );
}
