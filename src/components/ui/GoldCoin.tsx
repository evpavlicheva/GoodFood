import Image from "next/image";

export default function GoldCoin({ size = 23 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", flexShrink: 0, width: size, height: size }}
    >
      <Image src="/icons/coin1.png" alt="" width={size} height={size} style={{ objectFit: "contain" }} />
    </span>
  );
}
