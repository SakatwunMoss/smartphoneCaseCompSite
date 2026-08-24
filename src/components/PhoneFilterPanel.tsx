"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import {
  buildPhoneFilterQueryString,
  parsePhoneFilters,
  type PhoneFilters,
  type PhoneSort,
} from "@/lib/phone-filters";

type PhoneFilterPanelProps = {
  makers: string[];
  years: number[];
  initialFilters: PhoneFilters;
};

export function PhoneFilterPanel({
  makers,
  years,
  initialFilters,
}: PhoneFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const currentFilters = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return parsePhoneFilters(params);
  }, [searchParams]);

  const applyFilters = useCallback(
    (nextFilters: PhoneFilters) => {
      startTransition(() => {
        router.replace(`/${buildPhoneFilterQueryString(nextFilters)}`, {
          scroll: false,
        });
      });
    },
    [router],
  );

  const toggleMaker = (maker: string) => {
    const nextMakers = currentFilters.makers.includes(maker)
      ? currentFilters.makers.filter((item) => item !== maker)
      : [...currentFilters.makers, maker];

    applyFilters({ ...currentFilters, makers: nextMakers });
  };

  const setYear = (year: string) => {
    applyFilters({ ...currentFilters, year });
  };

  const setSort = (sort: PhoneSort) => {
    applyFilters({ ...currentFilters, sort });
  };

  const resetFilters = () => {
    applyFilters(initialFilters);
  };

  const hasActiveFilters =
    currentFilters.makers.length > 0 ||
    currentFilters.year !== "" ||
    currentFilters.sort !== "year_desc";

  const filterControls = (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">
          メーカー
        </legend>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {makers.map((maker) => (
            <li key={maker}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-orange-300">
                <input
                  type="checkbox"
                  checked={currentFilters.makers.includes(maker)}
                  onChange={() => toggleMaker(maker)}
                  className="accent-orange-500"
                />
                <span>{maker}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            発売年
          </span>
          <select
            value={currentFilters.year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="">すべて</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}年
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            並び替え
          </span>
          <select
            value={currentFilters.sort}
            onChange={(event) => setSort(event.target.value as PhoneSort)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="year_desc">発売年（新しい順）</option>
            <option value="year_asc">発売年（古い順）</option>
            <option value="name_asc">機種名（五十音順）</option>
          </select>
        </label>
      </div>

      {hasActiveFilters ? (
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
      aria-labelledby="phone-filter-heading"
      className={`mb-6 rounded-xl border border-gray-200 bg-white shadow-sm ${isPending ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:hidden">
        <h2
          id="phone-filter-heading"
          className="text-sm font-medium text-gray-900"
        >
          絞り込み・並び替え
        </h2>
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
        <h2
          id="phone-filter-heading-desktop"
          className="mb-4 text-sm font-medium text-gray-900"
        >
          絞り込み・並び替え
        </h2>
        {filterControls}
      </div>

      {isOpen ? <div className="p-4 sm:hidden">{filterControls}</div> : null}
    </section>
  );
}
