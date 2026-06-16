import Image from "next/image";

export default function GoldCoin({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", flexShrink: 0, width: size, height: size }}
    >
      <Image src="/icons/coin.png" alt="" width={size} height={size} style={{ objectFit: "contain" }} />
    </span>
  );
}
