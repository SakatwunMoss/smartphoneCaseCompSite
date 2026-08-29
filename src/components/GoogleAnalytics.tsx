"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * App Router のクライアント遷移では gtag('config') が自動再発火しないため、
 * pathname / searchParams の変化ごとに page_path を送る。
 * 初回の Script 側は send_page_view: false にし、二重計測を防ぐ。
 */
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") {
      return;
    }

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("config", GA_ID, {
      page_path: pagePath,
    });
  }, [pathname, searchParams]);

  return null;
}
