"use client";

import { useEffect, useRef, useState } from "react";

import { AffiliateBadge } from "@/components/AffiliateBadge";
import type { ComparableItem } from "@/lib/comparable";

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

function SourceBadge({ label }: { label: string }) {
  return (
    <span className="mb-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
      {label}
    </span>
  );
}

function formatReview(item: ComparableItem): string {
  const parts: string[] = [];
  if (item.review_rate != null) {
    parts.push(`${item.review_rate.toFixed(1)}`);
  }
  if (item.review_count != null) {
    parts.push(`（${item.review_count.toLocaleString("ja-JP")}件）`);
  }
  return parts.length > 0 ? parts.join(" ") : "—";
}

type CompareTableProps = {
  items: ComparableItem[];
  onClear: () => void;
};

export function CompareTable({ items, onClear }: CompareTableProps) {
  const compareTableRef = useRef<HTMLElement>(null);
  const showReviews = items.some(
    (item) => item.review_rate != null || item.review_count != null,
  );

  useEffect(() => {
    compareTableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [items]);

  return (
    <section
      ref={compareTableRef}
      aria-labelledby="compare-heading"
      className="mb-6 scroll-mt-24 rounded-xl border border-orange-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 id="compare-heading" className="text-lg font-medium text-gray-900">
          ケース比較
        </h3>
        <button
          type="button"
          onClick={onClear}
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
              {items.map((item) => (
                <th
                  key={item.id}
                  scope="col"
                  className="min-w-[10rem] border-b border-gray-200 px-3 pb-3 text-left font-medium text-gray-900"
                >
                  <div className="flex flex-col items-start">
                    <SourceBadge label={item.sourceLabel} />
                    <span>{item.name}</span>
                  </div>
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
              {items.map((item) => (
                <td
                  key={item.id}
                  className="border-b border-gray-100 px-3 py-4 align-top"
                >
                  {item.image_url ? (
                    <CompareTableImage src={item.image_url} alt={item.name} />
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
              {items.map((item) => (
                <td
                  key={item.id}
                  className="border-b border-gray-100 px-3 py-4 align-top font-medium text-gray-900"
                >
                  {item.name}
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
              {items.map((item) => (
                <td
                  key={item.id}
                  className="border-b border-gray-100 px-3 py-4 align-top text-gray-700"
                >
                  {item.brand ?? "—"}
                </td>
              ))}
            </tr>
            <tr>
              <th
                scope="row"
                className={`py-4 pr-4 align-top font-medium text-gray-500 ${showReviews ? "border-b border-gray-100" : ""}`}
              >
                価格
              </th>
              {items.map((item) => (
                <td
                  key={item.id}
                  className={`px-3 py-4 align-top font-medium tracking-tight text-gray-900 ${showReviews ? "border-b border-gray-100" : ""}`}
                >
                  {formatPrice(item.price)}
                </td>
              ))}
            </tr>
            {showReviews ? (
              <tr>
                <th
                  scope="row"
                  className="border-b border-gray-100 py-4 pr-4 align-top font-medium text-gray-500"
                >
                  レビュー
                </th>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className="border-b border-gray-100 px-3 py-4 align-top text-gray-700"
                  >
                    {formatReview(item)}
                  </td>
                ))}
              </tr>
            ) : null}
            <tr>
              <th
                scope="row"
                className="py-4 pr-4 align-top font-medium text-gray-500"
              >
                購入先
              </th>
              {items.map((item) => (
                <td key={item.id} className="px-3 py-4 align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <AffiliateBadge />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block font-medium text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline"
                    >
                      購入先を見る →
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

type CompareSelectionBarProps = {
  selectedCount: number;
  canCompare: boolean;
  onClear: () => void;
  onCompare: () => void;
};

export function CompareSelectionBar({
  selectedCount,
  canCompare,
  onClear,
  onCompare,
}: CompareSelectionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
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
              onClick={onClear}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
            >
              選択解除
            </button>
            {canCompare ? (
              <button
                type="button"
                onClick={onCompare}
                className="rounded-lg bg-orange-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                比較する
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
