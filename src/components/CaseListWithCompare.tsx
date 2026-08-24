"use client";

import { useEffect, useRef, useState } from "react";

import { ProductImage } from "@/components/ProductImage";
import type { Case } from "@/types/database";

const MAX_SELECTION = 3;

type CaseListWithCompareProps = {
  cases: Case[];
};

function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

function CompareTableImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function CaseListWithCompare({ cases }: CaseListWithCompareProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const compareTableRef = useRef<HTMLElement>(null);

  const selectedCount = selectedIds.size;
  const isMaxSelected = selectedCount >= MAX_SELECTION;
  const selectedCases = cases.filter((c) => selectedIds.has(c.id));
  const canCompare = selectedCount >= 2;

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SELECTION) {
        next.add(id);
      }
      return next;
    });
    setShowCompare(false);
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setShowCompare(false);
  }

  function handleCompare() {
    if (canCompare) {
      setShowCompare(true);
    }
  }

  useEffect(() => {
    if (showCompare) {
      compareTableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showCompare]);

  return (
    <>
      {showCompare && canCompare ? (
        <section
          ref={compareTableRef}
          aria-labelledby="compare-heading"
          className="mb-6 scroll-mt-24 rounded-xl border border-orange-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3
              id="compare-heading"
              className="text-lg font-medium text-gray-900"
            >
              ケース比較
            </h3>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
            >
              選択解除
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="w-24 border-b border-gray-200 pb-3 pr-4 text-left font-medium text-gray-500"
                  >
                    項目
                  </th>
                  {selectedCases.map((caseItem) => (
                    <th
                      key={caseItem.id}
                      scope="col"
                      className="min-w-[10rem] border-b border-gray-200 px-3 pb-3 text-left font-medium text-gray-900"
                    >
                      {caseItem.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th
                    scope="row"
                    className="border-b border-gray-100 py-4 pr-4 align-top font-medium text-gray-500"
                  >
                    画像
                  </th>
                  {selectedCases.map((caseItem) => (
                    <td
                      key={caseItem.id}
                      className="border-b border-gray-100 px-3 py-4 align-top"
                    >
                      {caseItem.image_url ? (
                        <CompareTableImage
                          src={caseItem.image_url}
                          alt={caseItem.name}
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="border-b border-gray-100 py-4 pr-4 align-top font-medium text-gray-500"
                  >
                    ケース名
                  </th>
                  {selectedCases.map((caseItem) => (
                    <td
                      key={caseItem.id}
                      className="border-b border-gray-100 px-3 py-4 align-top font-medium text-gray-900"
                    >
                      {caseItem.name}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="border-b border-gray-100 py-4 pr-4 align-top font-medium text-gray-500"
                  >
                    ブランド
                  </th>
                  {selectedCases.map((caseItem) => (
                    <td
                      key={caseItem.id}
                      className="border-b border-gray-100 px-3 py-4 align-top text-gray-700"
                    >
                      {caseItem.brand}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="border-b border-gray-100 py-4 pr-4 align-top font-medium text-gray-500"
                  >
                    価格
                  </th>
                  {selectedCases.map((caseItem) => (
                    <td
                      key={caseItem.id}
                      className="border-b border-gray-100 px-3 py-4 align-top font-medium tracking-tight text-gray-900"
                    >
                      {formatPrice(caseItem.price)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th
                    scope="row"
                    className="py-4 pr-4 align-top font-medium text-gray-500"
                  >
                    購入先
                  </th>
                  {selectedCases.map((caseItem) => (
                    <td key={caseItem.id} className="px-3 py-4 align-top">
                      <a
                        href={caseItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block font-medium text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline"
                      >
                        購入先を見る →
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((caseItem) => {
          const isSelected = selectedIds.has(caseItem.id);
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
                  onChange={() => toggleSelection(caseItem.id)}
                  className="absolute right-4 top-4 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`${caseItem.name}を比較に追加`}
                />

                {caseItem.image_url ? (
                  <ProductImage
                    src={caseItem.image_url}
                    alt={caseItem.name}
                    aspectClassName="aspect-square"
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
                <a
                  href={caseItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block text-sm font-medium text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline"
                >
                  購入先を見る →
                </a>
              </label>
            </li>
          );
        })}
      </ul>

      {selectedCount > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              {selectedCount}件選択中
              {!canCompare ? (
                <span className="ml-2 text-orange-600">
                  （あと1件以上選択してください）
                </span>
              ) : null}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
              >
                選択解除
              </button>
              {canCompare ? (
                <button
                  type="button"
                  onClick={handleCompare}
                  className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  比較する
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {selectedCount > 0 ? <div className="h-16" aria-hidden="true" /> : null}
    </>
  );
}
