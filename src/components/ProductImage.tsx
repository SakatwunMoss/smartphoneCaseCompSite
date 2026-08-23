"use client";

import { useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  aspectClassName?: string;
};

export function ProductImage({
  src,
  alt,
  aspectClassName = "aspect-video",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <div
      className={`mb-3 overflow-hidden rounded-lg bg-gray-100 ${aspectClassName}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
