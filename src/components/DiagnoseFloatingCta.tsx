"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { DiagnoseCta, DIAGNOSE_PATH } from "@/components/DiagnoseCta";

export function DiagnoseFloatingCta() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  if (
    dismissed ||
    pathname === DIAGNOSE_PATH ||
    pathname.startsWith(`${DIAGNOSE_PATH}/`)
  ) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-center gap-2">
        <DiagnoseCta variant="floating" />
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          aria-label="好み診断の案内を閉じる"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
