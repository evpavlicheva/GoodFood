"use client";

import { useId } from "react";

/**
 * Gold coin with a broccoli silhouette stamped on it.
 * Uses useId() so each instance has a unique gradient ID — no conflicts
 * when multiple coins are rendered on the same page.
 */
export default function GoldCoin({ size = 20 }: { size?: number }) {
  const id = useId().replace(/:/g, "_");
  const gradId = `coin_${id}`;
  const rimId = `rim_${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradId} cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFF0A0" />
          <stop offset="45%" stopColor="#FFD000" />
          <stop offset="100%" stopColor="#C87000" />
        </radialGradient>
        <radialGradient id={rimId} cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="transparent" />
          <stop offset="100%" stopColor="#A85800" stopOpacity="0.4" />
        </radialGradient>
      </defs>

      {/* Coin body */}
      <circle cx="16" cy="16" r="15" fill={`url(#${gradId})`} />
      {/* Rim shadow */}
      <circle cx="16" cy="16" r="15" fill={`url(#${rimId})`} />
      {/* Inner ring */}
      <circle cx="16" cy="16" r="11.5" fill="none" stroke="#A85800" strokeWidth="0.8" strokeOpacity="0.4" />

      {/* Broccoli silhouette — golden amber on gold coin */}
      {/* Stem */}
      <rect x="14.5" y="20" width="3" height="5" rx="1.5" fill="#8B5000" opacity="0.75" />
      {/* Main head puffs */}
      <circle cx="16" cy="17" r="4.5" fill="#8B5000" opacity="0.75" />
      <circle cx="12.5" cy="19" r="3" fill="#8B5000" opacity="0.70" />
      <circle cx="19.5" cy="19" r="3" fill="#8B5000" opacity="0.70" />
      <circle cx="16" cy="14.5" r="3.5" fill="#A86000" opacity="0.75" />
      <circle cx="13" cy="16" r="2.5" fill="#A86000" opacity="0.65" />
      <circle cx="19" cy="16" r="2.5" fill="#A86000" opacity="0.65" />
    </svg>
  );
}
