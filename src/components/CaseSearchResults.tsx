"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { CaseSearchFilterPanel } from "@/components/CaseSearchFilterPanel";
import { SearchResultsWithCompare } from "@/components/SearchResultsWithCompare";
import {
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
        <SearchResultsWithCompare items={filteredCases} />
      )}
    </section>
  );
}
