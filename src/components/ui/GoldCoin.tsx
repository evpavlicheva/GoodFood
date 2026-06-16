/**
 * Gold coin — layered CSS spans for a realistic metallic look.
 * Layers: outer rim → face gradient → specular highlight → broccoli stamp.
 * No SVG IDs, no SSR issues.
 */
export default function GoldCoin({ size = 20 }: { size?: number }) {
  const rim = Math.max(1, Math.round(size * 0.07));

  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
      }}
    >
      {/* Rim — darker gold edge gives depth */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "linear-gradient(145deg, #C8940A 0%, #7A5500 55%, #4A3200 100%)",
          boxShadow:
            "0 2px 6px rgba(0,0,0,0.40), 0 1px 2px rgba(0,0,0,0.25)",
        }}
      />

      {/* Face — radial metallic sweep */}
      <span
        style={{
          position: "absolute",
          inset: rim,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 40% 35%, #FFFBD4 0%, #FFE040 22%, #FFD000 45%, #CFA000 70%, #8B6200 100%)",
          boxShadow:
            "inset 0 -2px 5px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,240,120,0.45)",
        }}
      />

      {/* Specular highlight — the "bling" streak */}
      <span
        style={{
          position: "absolute",
          top: "10%",
          left: "16%",
          width: "38%",
          height: "26%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.92) 0%, rgba(255,255,220,0.5) 45%, transparent 100%)",
          transform: "rotate(-25deg)",
        }}
      />

      {/* Broccoli stamp */}
      <span
        style={{
          position: "relative",
          fontSize: Math.round(size * 0.5),
          lineHeight: 1,
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.35))",
        }}
      >
        🥦
      </span>
    </span>
  );
}
