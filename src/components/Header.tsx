"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SearchBox } from "@/components/SearchBox";

const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/columns", label: "コラム" },
  { href: "/about", label: "について" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-3">
        <Link
          href="/"
          onClick={closeMenu}
          className="shrink-0 text-sm font-semibold tracking-tight text-zinc-100 transition-colors hover:text-cyan-300 sm:text-base"
        >
          Phone Case Compare
        </Link>

        <nav
          aria-label="メインナビゲーション"
          className="hidden items-center gap-5 md:flex"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors ${
                  active
                    ? "font-medium text-cyan-400"
                    : "text-zinc-400 hover:text-cyan-400"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden min-w-0 w-full max-w-md md:block">
          <SearchBox />
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">
            {menuOpen ? "メニューを閉じる" : "メニューを開く"}
          </span>
          {menuOpen ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      <div className="border-t border-zinc-800/60 px-6 py-3 md:hidden">
        <SearchBox />
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="モバイルナビゲーション"
          className="border-t border-zinc-800/60 px-6 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActivePath(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-cyan-500/10 font-medium text-cyan-400"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-cyan-400"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
