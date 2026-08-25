import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/columns", label: "コラム" },
  { href: "/about", label: "サイトについて" },
  { href: "/privacy-policy", label: "プライバシーポリシー" },
  { href: "/tokushoho", label: "特定商取引法に基づく表記" },
  { href: "/contact", label: "お問い合わせ" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold tracking-tight text-gray-900">
              Phone Case Compare
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              スマホケースを比較するサイト
            </p>
          </div>

          <nav
            aria-label="フッターナビゲーション"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600"
          >
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-orange-600"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-2 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">
            本サイトはアフィリエイト広告を利用しています
          </p>
          <p className="text-xs text-gray-500">© 2026 Phone Case Compare</p>
        </div>
      </div>
    </footer>
  );
}
