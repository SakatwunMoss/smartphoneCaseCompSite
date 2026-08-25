"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CaseListWithCompare } from "@/components/CaseListWithCompare";
import {
  CompareSelectionBar,
  CompareTable,
} from "@/components/ProductCompare";
import { ProductImage } from "@/components/ProductImage";
import {
  MAX_COMPARE_SELECTION,
  offerToComparable,
  type ComparableItem,
} from "@/lib/comparable";
import type { Case, MarketplaceOffer } from "@/types/database";

// "other" = cases テーブル由来（旧 yodobashi）。複数ショップが混在するため表示名は「その他」。
// 互換: 旧ブックマーク ?source=yodobashi も other として解釈する。
export type CaseSource = "other" | "rakuten" | "yahoo";

type CaseSourceTabsProps = {
  otherCases: Case[];
  rakutenOffers: MarketplaceOffer[];
  yahooOffers: MarketplaceOffer[];
};

const TABS: { id: CaseSource; label: string }[] = [
  { id: "rakuten", label: "楽天市場" },
  { id: "yahoo", label: "Yahoo!ショッピング" },
  { id: "other", label: "その他" },
];

function parseSource(value: string | null): CaseSource {
  if (value === "rakuten" || value === "yahoo" || value === "other") {
    return value;
  }
  // 旧クエリ値の互換（?source=yodobashi → その他）
  if (value === "yodobashi") {
    return "other";
  }
  // クエリ未指定時は楽天市場を初期選択
  return "rakuten";
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 0 0-.75-.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4.5h4a.75.75 0 0 1 0 1.5h-4Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarRating({ rate }: { rate: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, rate)));

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rate}点`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < filled ? "text-amber-500" : "text-gray-300"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-gray-600">{rate.toFixed(1)}</span>
    </span>
  );
}

function EmptyState() {
  return (
    <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
      現在この店舗の商品は見つかりませんでした
    </p>
  );
}

type MarketplaceOfferListProps = {
  offers: MarketplaceOffer[];
  selectedIds: Set<string>;
  isMaxSelected: boolean;
  onToggle: (item: ComparableItem) => void;
};

function MarketplaceOfferList({
  offers,
  selectedIds,
  isMaxSelected,
  onToggle,
}: MarketplaceOfferListProps) {
  if (offers.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {offers.map((offer) => {
        const item = offerToComparable(offer);
        const isSelected = selectedIds.has(item.id);
        const isDisabled = !isSelected && isMaxSelected;
        const showReviews =
          offer.review_rate != null || offer.review_count != null;

        return (
          <li key={offer.id || `${offer.source}-${offer.item_code}`}>
            <label
              className={`relative flex min-h-[14rem] cursor-pointer flex-col rounded-xl border bg-white p-4 shadow-sm transition-all ${
                isSelected
                  ? "border-orange-500 ring-2 ring-orange-500/20"
                  : isDisabled
                    ? "cursor-not-allowed border-gray-200 opacity-60"
                    : "border-gray-200 hover:border-orange-300 hover:shadow-md"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onToggle(item)}
                className="absolute right-4 top-4 z-10 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`${offer.name}を比較に追加`}
              />
              <ExternalLinkIcon className="pointer-events-none absolute right-10 top-4 h-4 w-4 text-gray-400" />

              {offer.image_url ? (
                <ProductImage
                  src={offer.image_url}
                  alt={offer.name}
                  aspectClassName="aspect-square mx-auto w-3/4"
                  objectFit="contain"
                />
              ) : null}

              <h3 className="mb-2 pr-14 text-lg font-medium tracking-tight text-gray-900">
                {offer.name}
              </h3>

              <dl className="mb-1 space-y-1 text-sm text-gray-600">
                {offer.brand ? (
                  <div className="flex gap-2">
                    <dt className="font-medium text-gray-500">ブランド</dt>
                    <dd>{offer.brand}</dd>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-500">価格</dt>
                  <dd className="font-medium tracking-tight">
                    {formatPrice(offer.price)}
                  </dd>
                </div>
                {showReviews ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <dt className="font-medium text-gray-500">レビュー</dt>
                    <dd className="flex flex-wrap items-center gap-2">
                      {offer.review_rate != null ? (
                        <StarRating rate={offer.review_rate} />
                      ) : null}
                      {offer.review_count != null ? (
                        <span className="text-gray-500">
                          （{offer.review_count.toLocaleString("ja-JP")}件）
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <a
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline"
              >
                購入先を見る
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function CaseSourceTabs({
  otherCases,
  rakutenOffers,
  yahooOffers,
}: CaseSourceTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // タブ横断で比較選択を保持（ComparableItem 本体を Map に保持）
  const [selectedMap, setSelectedMap] = useState<Map<string, ComparableItem>>(
    () => new Map(),
  );
  const [showCompare, setShowCompare] = useState(false);

  const activeSource = useMemo(
    () => parseSource(searchParams.get("source")),
    [searchParams],
  );

  const selectedIds = useMemo(
    () => new Set(selectedMap.keys()),
    [selectedMap],
  );
  const selectedItems = useMemo(
    () => Array.from(selectedMap.values()),
    [selectedMap],
  );
  const selectedCount = selectedMap.size;
  const isMaxSelected = selectedCount >= MAX_COMPARE_SELECTION;
  const canCompare = selectedCount >= 2;

  const toggleSelection = useCallback((item: ComparableItem) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else if (next.size < MAX_COMPARE_SELECTION) {
        next.set(item.id, item);
      }
      return next;
    });
    setShowCompare(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMap(new Map());
    setShowCompare(false);
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedCount >= 2) {
      setShowCompare(true);
    }
  }, [selectedCount]);

  const counts: Record<CaseSource, number> = {
    other: otherCases.length,
    rakuten: rakutenOffers.length,
    yahoo: yahooOffers.length,
  };

  const setSource = useCallback(
    (source: CaseSource) => {
      const params = new URLSearchParams(searchParams.toString());
      // 楽天がデフォルトのためクエリは付けない
      if (source === "rakuten") {
        params.delete("source");
      } else {
        params.set("source", source);
      }
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className={isPending ? "opacity-70" : undefined}>
      <div
        role="tablist"
        aria-label="販売元"
        className="mb-6 flex flex-wrap gap-2 border-b border-gray-200"
      >
        {TABS.map((tab) => {
          const isActive = activeSource === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setSource(tab.id)}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors sm:px-4 ${
                isActive
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {tab.label} ({counts[tab.id]})
            </button>
          );
        })}
      </div>

      {showCompare && canCompare ? (
        <CompareTable items={selectedItems} onClear={clearSelection} />
      ) : null}

      <div
        role="tabpanel"
        id={`panel-${activeSource}`}
        aria-labelledby={`tab-${activeSource}`}
      >
        {activeSource === "other" ? (
          otherCases.length > 0 ? (
            <CaseListWithCompare
              cases={otherCases}
              selectedIds={selectedIds}
              isMaxSelected={isMaxSelected}
              onToggle={toggleSelection}
            />
          ) : (
            <EmptyState />
          )
        ) : null}

        {activeSource === "rakuten" ? (
          <MarketplaceOfferList
            offers={rakutenOffers}
            selectedIds={selectedIds}
            isMaxSelected={isMaxSelected}
            onToggle={toggleSelection}
          />
        ) : null}

        {activeSource === "yahoo" ? (
          <MarketplaceOfferList
            offers={yahooOffers}
            selectedIds={selectedIds}
            isMaxSelected={isMaxSelected}
            onToggle={toggleSelection}
          />
        ) : null}
      </div>

      <CompareSelectionBar
        selectedCount={selectedCount}
        canCompare={canCompare}
        onClear={clearSelection}
        onCompare={handleCompare}
      />
    </div>
  );
}
