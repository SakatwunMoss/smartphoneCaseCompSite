import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

import { SearchBox } from "@/components/SearchBox";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Phone Case Compare",
  description: "スマホケースを比較するサイト",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex shrink-0 items-center gap-5">
              <Link
                href="/"
                className="text-sm font-semibold tracking-tight text-zinc-100 transition-colors hover:text-cyan-300 sm:text-base"
              >
                Phone Case Compare
              </Link>
              <Link
                href="/columns"
                className="text-sm text-zinc-400 transition-colors hover:text-cyan-400"
              >
                コラム
              </Link>
            </div>
            <SearchBox />
          </div>
        </header>
        {children}
        <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              © Phone Case Compare
            </p>
            <nav
              aria-label="フッターナビゲーション"
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400"
            >
              <Link
                href="/columns"
                className="transition-colors hover:text-cyan-400"
              >
                コラム
              </Link>
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-cyan-400"
              >
                プライバシーポリシー
              </Link>
              <Link
                href="/about"
                className="transition-colors hover:text-cyan-400"
              >
                運営者情報
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-cyan-400"
              >
                お問い合わせ
              </Link>
            </nav>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
