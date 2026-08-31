"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { AffiliateBadge } from "@/components/AffiliateBadge";
import {
  CompareModal,
  CompareSelectionBar,
} from "@/components/ProductCompare";
import { ProductImage } from "@/components/ProductImage";
import { CASE_SEARCH_SOURCE_LABEL } from "@/lib/case-search-filters";
import type { CaseSearchItem } from "@/lib/case-search-filters";
import {
  caseSearchItemToComparable,
  MAX_COMPARE_SELECTION,
  type ComparableItem,
} from "@/lib/comparable";

type SearchResultsWithCompareProps = {
  items: CaseSearchItem[];
};

function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

function CaseCardContent({ item }: { item: CaseSearchItem }) {
  const imageAlt = item.brand
    ? `${item.brand} ${item.name} 商品画像`
    : `${item.name} 商品画像`;

  return (
    <div className="grid min-h-[22rem] grid-rows-2">
      <div className="flex h-full min-h-0 items-center justify-center border-b border-gray-100 px-4 py-3">
        {item.image_url ? (
          <ProductImage
            src={item.image_url}
            alt={imageAlt}
            aspectClassName="mb-0 aspect-square h-full w-auto max-w-[85%]"
            objectFit="contain"
          />
        ) : (
          <span className="text-sm text-gray-400">画像なし</span>
        )}
      </div>
      <div className="flex min-h-0 flex-col px-4 py-3">
        <div className="mb-2 flex items-start justify-between gap-2 pr-6">
          <h3 className="line-clamp-2 text-lg font-medium tracking-tight text-gray-900">
            {item.name}
          </h3>
          {item.url ? <AffiliateBadge /> : null}
        </div>
        <dl className="mt-auto space-y-1 text-sm text-gray-600">
          {item.brand ? (
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-gray-500">ブランド</dt>
              <dd className="truncate">{item.brand}</dd>
            </div>
          ) : null}
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium text-gray-500">価格</dt>
            <dd className="font-medium tracking-tight">
              {formatPrice(item.price)}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium text-gray-500">端末</dt>
            <dd className="truncate">{item.phone_name ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium text-gray-500">店舗</dt>
            <dd className="truncate">
              {CASE_SEARCH_SOURCE_LABEL[item.source]}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function getPhonePageHref(item: CaseSearchItem): string {
  return `/phones/${item.phone_id}${
    item.source === "rakuten" ? "" : `?source=${item.source}`
  }`;
}

export function SearchResultsWithCompare({
  items,
}: SearchResultsWithCompareProps) {
  const [selectedMap, setSelectedMap] = useState<Map<string, ComparableItem>>(
    () => new Map(),
  );
  const [showCompareModal, setShowCompareModal] = useState(false);

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

  const toggleSelection = useCallback((item: CaseSearchItem) => {
    const comparable = caseSearchItemToComparable(item);
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(comparable.id)) {
        next.delete(comparable.id);
      } else if (next.size < MAX_COMPARE_SELECTION) {
        next.set(comparable.id, comparable);
      }
      return next;
    });
    setShowCompareModal(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMap(new Map());
    setShowCompareModal(false);
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedCount >= 2) {
      setShowCompareModal(true);
    }
  }, [selectedCount]);

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((caseItem) => {
          const comparableId = `${caseItem.source}:${caseItem.id}`;
          const isSelected = selectedIds.has(comparableId);
          const isDisabled = !isSelected && isMaxSelected;

          return (
            <li key={comparableId}>
              <div
                className={`relative rounded-xl border bg-white shadow-sm transition-all ${
                  isSelected
                    ? "border-orange-500 ring-2 ring-orange-500/20"
                    : isDisabled
                      ? "border-gray-200 opacity-60"
                      : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => toggleSelection(caseItem)}
                  className="absolute right-4 top-4 z-10 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`${caseItem.name}を比較に追加`}
                />
                {caseItem.url ? (
                  <a
                    href={caseItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <CaseCardContent item={caseItem} />
                  </a>
                ) : (
                  <Link
                    href={getPhonePageHref(caseItem)}
                    className="block h-full"
                  >
                    <CaseCardContent item={caseItem} />
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <CompareSelectionBar
        selectedCount={selectedCount}
        canCompare={canCompare}
        onClear={clearSelection}
        onCompare={handleCompare}
      />

      {showCompareModal && canCompare ? (
        <CompareModal
          items={selectedItems}
          onClear={clearSelection}
          onClose={() => setShowCompareModal(false)}
        />
      ) : null}
    </>
  );
}
