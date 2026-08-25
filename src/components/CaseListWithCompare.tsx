"use client";

import { AffiliateBadge } from "@/components/AffiliateBadge";
import { ProductImage } from "@/components/ProductImage";
import { caseToComparable, type ComparableItem } from "@/lib/comparable";
import type { Case } from "@/types/database";

function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

type CaseListWithCompareProps = {
  cases: Case[];
  selectedIds: Set<string>;
  isMaxSelected: boolean;
  onToggle: (item: ComparableItem) => void;
};

export function CaseListWithCompare({
  cases,
  selectedIds,
  isMaxSelected,
  onToggle,
}: CaseListWithCompareProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cases.map((caseItem) => {
        const item = caseToComparable(caseItem);
        const isSelected = selectedIds.has(item.id);
        const isDisabled = !isSelected && isMaxSelected;

        return (
          <li key={caseItem.id}>
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
                className="absolute right-4 top-4 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`${caseItem.name}を比較に追加`}
              />

              {caseItem.image_url ? (
                <ProductImage
                  src={caseItem.image_url}
                  alt={caseItem.name}
                  aspectClassName="aspect-square mx-auto w-3/4"
                  objectFit="contain"
                />
              ) : null}
              <h3 className="mb-2 pr-8 text-lg font-medium tracking-tight text-gray-900">
                {caseItem.name}
              </h3>
              <dl className="mb-4 space-y-1 text-sm text-gray-600">
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-500">ブランド</dt>
                  <dd>{caseItem.brand}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-gray-500">価格</dt>
                  <dd className="font-medium tracking-tight">
                    {formatPrice(caseItem.price)}
                  </dd>
                </div>
              </dl>
              <div className="flex items-center gap-2">
                <AffiliateBadge />
                <a
                  href={caseItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block text-sm font-medium text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline"
                >
                  購入先を見る →
                </a>
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
