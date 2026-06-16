/**
 * Gold coin — pure CSS, no SVG gradient IDs, works on SSR + all browsers.
 * Shows a golden circle with a small broccoli emoji stamped on it.
 */
export default function GoldCoin({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 30%, #FFF3A3 0%, #FFD000 50%, #B87000 100%)",
        boxShadow:
          "inset 0 -2px 3px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.18)",
        fontSize: Math.round(size * 0.58),
        lineHeight: 1,
      }}
    >
      🥦
    </span>
  );
}
