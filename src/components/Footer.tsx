import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/columns", label: "コラム" },
  { href: "/about", label: "について" },
  { href: "/privacy-policy", label: "プライバシーポリシー" },
  { href: "/contact", label: "お問い合わせ" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold tracking-tight text-zinc-100">
              Phone Case Compare
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              スマホケースを比較するサイト
            </p>
          </div>

          <nav
            aria-label="フッターナビゲーション"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400"
          >
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-cyan-400"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="border-t border-zinc-800/60 pt-4 text-xs text-zinc-500">
          © 2026 Phone Case Compare
        </p>
      </div>
    </footer>
  );
}
