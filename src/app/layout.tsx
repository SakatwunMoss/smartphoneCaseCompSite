import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";

import { Footer } from "@/components/Footer";
import { GoogleAnalyticsPageView } from "@/components/GoogleAnalytics";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_CLIENT = "ca-pub-7938835154204291";

export const metadata: Metadata = {
  // 相対パスの OG / Twitter 画像などを絶対 URL に解決する
  metadataBase: new URL("https://smartphone-case-comp-site.vercel.app"),
  title: "Phone Case Compare",
  description: "スマホケースを比較するサイト",
  openGraph: {
    title: "Phone Case Compare",
    description: "スマホケースを比較するサイト",
    url: "https://smartphone-case-comp-site.vercel.app",
    siteName: "Phone Case Compare",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Phone Case Compare",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phone Case Compare",
    description: "スマホケースを比較するサイト",
    images: ["/images/og-image.png"],
  },
  verification: {
    google: "LXnGM94kDLw16JNHb1gAN7f7R8PM7OV8iyX9kZhh2pw",
  },
  other: {
    "google-adsense-account": ADSENSE_CLIENT,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f97316",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="beforeInteractive"
            />
            <Script id="google-analytics" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Suspense fallback={null}>
          <GoogleAnalyticsPageView />
        </Suspense>
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
