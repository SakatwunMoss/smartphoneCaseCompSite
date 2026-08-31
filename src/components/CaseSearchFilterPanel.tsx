"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  ALL_CASE_SEARCH_SOURCES,
  buildCaseSearchQueryString,
  CASE_SEARCH_SOURCE_LABEL,
  countActiveCaseSearchFilters,
  EMPTY_CASE_SEARCH_FILTERS,
  MAX_BRAND_FILTER_OPTIONS,
  type CaseSearchFilters,
  type CaseSearchSort,
  type CaseSearchSource,
} from "@/lib/case-search-filters";

type CaseSearchFilterPanelProps = {
  keyword: string;
  filters: CaseSearchFilters;
  phoneOptions: { id: string; name: string }[];
  brandOptions: string[];
  priceRange: { min: number | null; max: number | null };
  totalCount: number;
  filteredCount: number;
};

export function CaseSearchFilterPanel({
  keyword,
  filters,
  phoneOptions,
  brandOptions,
  priceRange,
  totalCount,
  filteredCount,
}: CaseSearchFilterPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [minPriceDraft, setMinPriceDraft] = useState(filters.minPrice);
  const [maxPriceDraft, setMaxPriceDraft] = useState(filters.maxPrice);

  useEffect(() => {
    setMinPriceDraft(filters.minPrice);
    setMaxPriceDraft(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const showBrandFilter =
    brandOptions.length > 0 && brandOptions.length < MAX_BRAND_FILTER_OPTIONS;

  const activeFilterCount = useMemo(
    () => countActiveCaseSearchFilters(filters),
    [filters],
  );

  const applyFilters = useCallback(
    (nextFilters: CaseSearchFilters) => {
      startTransition(() => {
        router.replace(buildCaseSearchQueryString(keyword, nextFilters), {
          scroll: false,
        });
      });
    },
    [keyword, router],
  );

  const toggleSource = (source: CaseSearchSource) => {
    const nextSources = filters.sources.includes(source)
      ? filters.sources.filter((item) => item !== source)
      : [...filters.sources, source];

    // 全解除は絞り込みなし（全選択）に戻す
    applyFilters({
      ...filters,
      sources:
        nextSources.length === 0
          ? [...ALL_CASE_SEARCH_SOURCES]
          : nextSources,
    });
  };

  const togglePhone = (phoneId: string) => {
    const nextPhoneIds = filters.phoneIds.includes(phoneId)
      ? filters.phoneIds.filter((item) => item !== phoneId)
      : [...filters.phoneIds, phoneId];
    applyFilters({ ...filters, phoneIds: nextPhoneIds });
  };

  const toggleBrand = (brand: string) => {
    const nextBrands = filters.brands.includes(brand)
      ? filters.brands.filter((item) => item !== brand)
      : [...filters.brands, brand];
    applyFilters({ ...filters, brands: nextBrands });
  };

  const setSort = (sort: CaseSearchSort) => {
    applyFilters({ ...filters, sort });
  };

  const commitPriceFilters = () => {
    if (
      minPriceDraft === filters.minPrice &&
      maxPriceDraft === filters.maxPrice
    ) {
      return;
    }
    applyFilters({
      ...filters,
      minPrice: minPriceDraft.trim(),
      maxPrice: maxPriceDraft.trim(),
    });
  };

  const resetFilters = () => {
    setMinPriceDraft("");
    setMaxPriceDraft("");
    applyFilters(EMPTY_CASE_SEARCH_FILTERS);
  };

  const minPlaceholder =
    priceRange.min != null
      ? `最小（例: ${priceRange.min.toLocaleString("ja-JP")}）`
      : "最小価格";
  const maxPlaceholder =
    priceRange.max != null
      ? `最大（例: ${priceRange.max.toLocaleString("ja-JP")}）`
      : "最大価格";

  const filterControls = (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        {totalCount.toLocaleString("ja-JP")}件中
        {filteredCount.toLocaleString("ja-JP")}件を表示
        {activeFilterCount > 0
          ? `（絞り込み ${activeFilterCount}件適用中）`
          : null}
      </p>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">店舗</legend>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ALL_CASE_SEARCH_SOURCES.map((source) => (
            <li key={source}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-orange-300">
                <input
                  type="checkbox"
                  checked={filters.sources.includes(source)}
                  onChange={() => toggleSource(source)}
                  className="accent-orange-500"
                />
                <span>{CASE_SEARCH_SOURCE_LABEL[source]}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div>
        <span className="mb-2 block text-sm font-medium text-gray-700">
          価格帯（円）
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={minPriceDraft}
            onChange={(event) => setMinPriceDraft(event.target.value)}
            onBlur={commitPriceFilters}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            placeholder={minPlaceholder}
            className="w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none sm:max-w-[12rem]"
            aria-label="最小価格"
          />
          <span className="text-sm text-gray-500">〜</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={maxPriceDraft}
            onChange={(event) => setMaxPriceDraft(event.target.value)}
            onBlur={commitPriceFilters}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            placeholder={maxPlaceholder}
            className="w-full min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none sm:max-w-[12rem]"
            aria-label="最大価格"
          />
        </div>
      </div>

      {phoneOptions.length > 1 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">
            対応機種
          </legend>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {phoneOptions.map((phone) => (
              <li key={phone.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-orange-300">
                  <input
                    type="checkbox"
                    checked={filters.phoneIds.includes(phone.id)}
                    onChange={() => togglePhone(phone.id)}
                    className="accent-orange-500"
                  />
                  <span className="truncate">{phone.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      {showBrandFilter ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">
            ブランド
          </legend>
          <ul className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {brandOptions.map((brand) => (
              <li key={brand}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-orange-300">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="accent-orange-500"
                  />
                  <span className="truncate">{brand}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      <label className="block sm:max-w-xs">
        <span className="mb-2 block text-sm font-medium text-gray-700">
          並び替え
        </span>
        <select
          value={filters.sort}
          onChange={(event) => setSort(event.target.value as CaseSearchSort)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
        >
          <option value="default">おすすめ順</option>
          <option value="price_asc">価格が安い順</option>
          <option value="price_desc">価格が高い順</option>
          <option value="review_desc">レビュー評価が高い順</option>
        </select>
      </label>

      {activeFilterCount > 0 ? (
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm text-orange-500 transition-colors hover:text-orange-600"
        >
          絞り込みをリセット
        </button>
      ) : null}
    </div>
  );

  return (
    <section
      aria-labelledby="case-search-filter-heading"
      className={`mb-6 rounded-xl border border-gray-200 bg-white shadow-sm ${isPending ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:hidden">
        <h3
          id="case-search-filter-heading"
          className="text-sm font-medium text-gray-900"
        >
          絞り込み・並び替え
          {activeFilterCount > 0 ? `（${activeFilterCount}）` : ""}
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-orange-300"
        >
          {isOpen ? "閉じる" : "開く"}
        </button>
      </div>

      <div className="hidden p-4 sm:block">
        <h3
          id="case-search-filter-heading-desktop"
          className="mb-4 text-sm font-medium text-gray-900"
        >
          絞り込み・並び替え
        </h3>
        {filterControls}
      </div>

      {isOpen ? <div className="p-4 sm:hidden">{filterControls}</div> : null}
    </section>
  );
}
