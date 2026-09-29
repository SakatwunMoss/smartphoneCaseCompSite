"use client";

import Link from "next/link";

import { AffiliateBadge } from "@/components/AffiliateBadge";
import {
  BilingualButtonLabel,
  BilingualText,
} from "@/components/BilingualText";
import { ProductImage } from "@/components/ProductImage";
import { diagnoseCopy } from "@/lib/diagnose/copy";
import type { RecommendResult, ScoredCase } from "@/lib/diagnose/scoring";

const { results: resultsCopy } = diagnoseCopy;

function formatPrice(price: number | null | undefined): string {
  if (price == null) {
    return "—";
  }
  return `¥${price.toLocaleString("ja-JP")}`;
}

type DiagnoseResultsProps = {
  result: RecommendResult;
  phoneId: string;
  phoneName: string;
  onRestart: () => void;
};

export function DiagnoseResults({
  result,
  phoneId,
  phoneName,
  onRestart,
}: DiagnoseResultsProps) {
  const { items, relaxed, relaxedFilters } = result;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-10 text-center">
        <BilingualText
          as="p"
          copy={resultsCopy.empty}
          size="sm"
          className="items-center"
          enClassName="text-gray-600"
        />
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-orange-500 px-5 py-2 text-white transition-colors hover:bg-orange-600"
        >
          <BilingualButtonLabel inverted copy={resultsCopy.restart} />
        </button>
      </div>
    );
  }

  return (
    <div>
      {relaxed ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
          role="status"
        >
          <BilingualText
            copy={resultsCopy.relaxed}
            size="sm"
            enClassName="text-amber-950"
            jaClassName="!text-amber-900/80"
          />
          {relaxedFilters.length > 0 ? (
            <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
              <span lang="en">
                ({resultsCopy.relaxedPrefix.en}:{" "}
                {relaxedFilters.map((f) => f.en).join(" → ")})
              </span>
              <span className="mx-1.5 text-amber-700/50" aria-hidden>
                /
              </span>
              <span lang="ja">
                （{resultsCopy.relaxedPrefix.ja}:{" "}
                {relaxedFilters.map((f) => f.ja).join(" → ")}）
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <BilingualText
            copy={resultsCopy.count(items.length)}
            size="sm"
            enClassName="text-gray-600"
          />
          <p className="mt-1 text-sm text-gray-500">{phoneName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/phones/${phoneId}`}
            className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600"
          >
            <BilingualButtonLabel inverted copy={resultsCopy.viewPhone} />
          </Link>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2 text-orange-800 transition-colors hover:border-orange-300 hover:bg-orange-50"
          >
            <BilingualButtonLabel copy={resultsCopy.restart} />
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <ResultCard key={item.caseItem.id} item={item} rank={index + 1} />
        ))}
      </ul>
    </div>
  );
}

function ResultCard({ item, rank }: { item: ScoredCase; rank: number }) {
  const { caseItem, score, reasonLine } = item;

  return (
    <li>
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md">
        <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-3">
          <BilingualText
            copy={resultsCopy.score(rank, score)}
            size="xs"
            enClassName="font-medium tracking-wide text-orange-700"
            jaClassName="!text-orange-700/70"
          />
        </div>

        <div className="flex flex-1 flex-col p-4">
          {caseItem.image_url ? (
            <ProductImage
              src={caseItem.image_url}
              alt={
                caseItem.brand
                  ? `${caseItem.brand} ${caseItem.name} 商品画像`
                  : `${caseItem.name} 商品画像`
              }
              aspectClassName="aspect-square mx-auto w-3/4"
              objectFit="contain"
            />
          ) : null}

          <h3 className="mb-2 text-lg font-medium tracking-tight text-gray-900">
            {caseItem.name}
          </h3>

          <dl className="mb-3 space-y-1 text-sm text-gray-600">
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-gray-500">
                <BilingualText
                  copy={resultsCopy.brand}
                  size="xs"
                  enClassName="font-medium text-gray-500"
                />
              </dt>
              <dd>{caseItem.brand}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-gray-500">
                <BilingualText
                  copy={resultsCopy.price}
                  size="xs"
                  enClassName="font-medium text-gray-500"
                />
              </dt>
              <dd className="font-medium tracking-tight text-gray-800">
                {formatPrice(caseItem.price)}
              </dd>
            </div>
          </dl>

          <div className="mb-4 rounded-lg bg-orange-50/70 px-3 py-2">
            <BilingualText
              copy={resultsCopy.whyFit}
              size="xs"
              enClassName="font-medium text-orange-800"
              jaClassName="!text-orange-700/80"
            />
            <BilingualText
              copy={reasonLine}
              size="xs"
              className="mt-1"
              enClassName="text-orange-950"
              jaClassName="!text-orange-900/80"
            />
          </div>

          <div className="mt-auto flex items-center gap-2">
            <AffiliateBadge />
            <a
              href={caseItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline"
            >
              {resultsCopy.buyLink.ja} →
            </a>
          </div>
        </div>
      </article>
    </li>
  );
}
