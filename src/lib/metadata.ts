import type { Metadata } from "next";

export const SITE_NAME = "Phone Case Compare";
export const SITE_URL = "https://smartphone-case-comp-site.vercel.app";

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = path ? `${SITE_URL}${path}` : undefined;

  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title,
      description,
      ...(url ? { url } : {}),
      siteName: SITE_NAME,
      locale: "ja_JP",
      type: "website",
      images: [
        {
          url: "/images/og-image.png",
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-image.png"],
    },
  };
}
