/**
 * Gold coin badge — renders a small golden circle with a star,
 * replacing the cross-platform-inconsistent 🪙 emoji.
 */
export default function GoldCoin({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="coinGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="60%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#E08800" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#coinGrad)" />
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#E08800" strokeWidth="1" strokeOpacity="0.5" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#9A5E00"
        fontFamily="sans-serif"
      >
        ★
      </text>
    </svg>
  );
}
