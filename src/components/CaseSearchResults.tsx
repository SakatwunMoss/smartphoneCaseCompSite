"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { AffiliateBadge } from "@/components/AffiliateBadge";
import { CaseSearchFilterPanel } from "@/components/CaseSearchFilterPanel";
import { ProductImage } from "@/components/ProductImage";
import {
  CASE_SEARCH_SOURCE_LABEL,
  filterAndSortCaseSearchResults,
  getCaseSearchBrandOptions,
  getCaseSearchPhoneOptions,
  getCaseSearchPriceRange,
  parseCaseSearchFilters,
  type CaseSearchItem,
} from "@/lib/case-search-filters";

type CaseSearchResultsProps = {
  keyword: string;
  cases: CaseSearchItem[];
};

function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

function caseCardClassName(): string {
  return "block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md";
}

function CaseCardContent({ item }: { item: CaseSearchItem }) {
  const imageAlt = item.brand
    ? `${item.brand} ${item.name} 商品画像`
    : `${item.name} 商品画像`;

  return (
    <div className="flex gap-3">
      {item.image_url ? (
        <ProductImage
          src={item.image_url}
          alt={imageAlt}
          aspectClassName="mb-0 aspect-square w-20 shrink-0"
          objectFit="contain"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-lg font-medium tracking-tight text-gray-900">
            {item.name}
          </h3>
          {item.url ? <AffiliateBadge /> : null}
        </div>
        <dl className="space-y-1 text-sm text-gray-600">
          {item.brand ? (
            <div className="flex gap-2">
              <dt className="font-medium text-gray-500">ブランド</dt>
              <dd>{item.brand}</dd>
            </div>
          ) : null}
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500">価格</dt>
            <dd className="font-medium tracking-tight">
              {formatPrice(item.price)}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500">端末</dt>
            <dd>{item.phone_name ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-500">店舗</dt>
            <dd>{CASE_SEARCH_SOURCE_LABEL[item.source]}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function CaseSearchResults({ keyword, cases }: CaseSearchResultsProps) {
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return parseCaseSearchFilters(params);
  }, [searchParams]);

  const phoneOptions = useMemo(() => getCaseSearchPhoneOptions(cases), [cases]);
  const brandOptions = useMemo(() => getCaseSearchBrandOptions(cases), [cases]);
  const priceRange = useMemo(() => getCaseSearchPriceRange(cases), [cases]);

  const filteredCases = useMemo(
    () => filterAndSortCaseSearchResults(cases, filters),
    [cases, filters],
  );

  return (
    <section aria-labelledby="cases-heading">
      <div className="mb-4">
        <h2 id="cases-heading" className="text-xl font-medium text-gray-900">
          ケース
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          商品をクリックすると、各ショップの販売ページへ移動します
        </p>
      </div>

      <CaseSearchFilterPanel
        keyword={keyword}
        filters={filters}
        phoneOptions={phoneOptions}
        brandOptions={brandOptions}
        priceRange={priceRange}
        totalCount={cases.length}
        filteredCount={filteredCases.length}
      />

      {filteredCases.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
          条件に一致するケースが見つかりませんでした
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((caseItem) => (
            <li key={`${caseItem.source}-${caseItem.id}`}>
              {caseItem.url ? (
                <a
                  href={caseItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={caseCardClassName()}
                >
                  <CaseCardContent item={caseItem} />
                </a>
              ) : (
                <Link
                  href={`/phones/${caseItem.phone_id}${
                    caseItem.source === "rakuten"
                      ? ""
                      : `?source=${caseItem.source}`
                  }`}
                  className={caseCardClassName()}
                >
                  <CaseCardContent item={caseItem} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
