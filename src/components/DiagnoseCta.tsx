import Link from "next/link";

export const DIAGNOSE_PATH = "/diagnose";

type DiagnoseCtaVariant = "hero" | "banner" | "nav" | "floating";

type DiagnoseCtaProps = {
  variant?: DiagnoseCtaVariant;
  label?: string;
  className?: string;
  onClick?: () => void;
  "aria-current"?: "page" | undefined;
};

const VARIANT_CLASS: Record<DiagnoseCtaVariant, string> = {
  hero:
    "diagnose-cta-pulse inline-flex min-h-14 w-full max-w-md items-center justify-center rounded-full bg-orange-500 px-6 text-base font-semibold text-white shadow-lg shadow-orange-500/35 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:w-auto sm:px-8 sm:text-lg",
  banner:
    "inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-orange-600 shadow-md transition-transform duration-200 hover:-translate-y-0.5 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base",
  nav: "inline-flex items-center justify-center rounded-full bg-orange-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600",
  floating:
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/40 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600",
};

const DEFAULT_LABEL: Record<DiagnoseCtaVariant, string> = {
  hero: "🎯 30秒で見つかる！好み診断をはじめる",
  banner: "診断スタート →",
  nav: "好み診断",
  floating: "好み診断",
};

export function DiagnoseCta({
  variant = "hero",
  label,
  className = "",
  onClick,
  "aria-current": ariaCurrent,
}: DiagnoseCtaProps) {
  return (
    <Link
      href={DIAGNOSE_PATH}
      onClick={onClick}
      aria-current={ariaCurrent}
      className={`${VARIANT_CLASS[variant]} ${className}`.trim()}
    >
      {label ?? DEFAULT_LABEL[variant]}
    </Link>
  );
}
