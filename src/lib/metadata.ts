import type { Metadata } from "next";

export const SITE_NAME = "Phone Case Compare";
export const SITE_URL = "https://smartphone-case-comp-site.vercel.app";

/** トップページ用（title.template を使わない絶対タイトル） */
export const HOME_TITLE =
  "スマホケース比較｜機種別に楽天・Yahoo!の対応ケースを探せる | Phone Case Compare";

export const HOME_DESCRIPTION =
  "iPhone 17/18、Pixel、Galaxy、AQUOSなど対応機種別に、楽天市場・Yahoo!ショッピングのスマホケースを価格比較。好み診断であなたに合うケースも探せます。";

export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  /** title.template 用の短いタイトル（absoluteTitle 時はフルタイトル） */
  title: string;
  description: string;
  path?: string;
  /** true のとき template を適用せず title をそのまま使う */
  absoluteTitle?: boolean;
}): Metadata {
  const url = path ? `${SITE_URL}${path}` : undefined;
  const displayTitle = absoluteTitle
    ? title
    : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title: displayTitle,
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
      title: displayTitle,
      description,
      images: ["/images/og-image.png"],
    },
  };
}
