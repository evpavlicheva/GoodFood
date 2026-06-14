"use client";

import { useState } from "react";

interface CartItemThumbProps {
  image?: string;
  emoji: string;
  alt: string;
}

/**
 * Small dish thumbnail for the cart. Shows the dish's real photo when
 * available (falling back to its emoji if there's no image or it fails
 * to load — same pattern as DishCard on the menu page).
 */
export default function CartItemThumb({ image, emoji, alt }: CartItemThumbProps) {
  const [imgError, setImgError] = useState(false);
  const hasPhoto = Boolean(image) && !imgError;

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cloud text-3xl">
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image!.startsWith("data:") ? image : encodeURI(image!)}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        emoji
      )}
    </div>
  );
}
