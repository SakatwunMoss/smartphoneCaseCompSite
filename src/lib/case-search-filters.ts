export type CaseSearchSource = "other" | "rakuten" | "yahoo";

export type CaseSearchSort =
  | "default"
  | "price_asc"
  | "price_desc"
  | "review_desc";

export type CaseSearchFilters = {
  sources: CaseSearchSource[];
  minPrice: string;
  maxPrice: string;
  phoneIds: string[];
  brands: string[];
  sort: CaseSearchSort;
};

export type CaseSearchItem = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  phone_id: string;
  phone_name: string | null;
  source: CaseSearchSource;
  url: string | null;
  image_url: string | null;
  review_rate: number | null;
};

export const ALL_CASE_SEARCH_SOURCES: CaseSearchSource[] = [
  "other",
  "rakuten",
  "yahoo",
];

export const CASE_SEARCH_SOURCE_LABEL: Record<CaseSearchSource, string> = {
  other: "その他",
  rakuten: "楽天市場",
  yahoo: "Yahoo!ショッピング",
};

/** ブランド選択肢がこの件数以上ならブランド絞り込みUIは出さない */
export const MAX_BRAND_FILTER_OPTIONS = 30;

const VALID_SOURCES = new Set<string>(ALL_CASE_SEARCH_SOURCES);

function parseListParam(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseCaseSearchFilters(
  searchParams: Record<string, string | string[] | undefined>,
): CaseSearchFilters {
  const sourceParam = getParam(searchParams, "source");
  const parsedSources = parseListParam(sourceParam).filter(
    (value): value is CaseSearchSource => VALID_SOURCES.has(value),
  );

  const sortParam = getParam(searchParams, "sort");
  const sort: CaseSearchSort =
    sortParam === "price_asc" ||
    sortParam === "price_desc" ||
    sortParam === "review_desc"
      ? sortParam
      : "default";

  return {
    // 未指定または空 = 全店舗（絞り込みなし）
    sources:
      parsedSources.length > 0 ? parsedSources : [...ALL_CASE_SEARCH_SOURCES],
    minPrice: getParam(searchParams, "minPrice")?.trim() ?? "",
    maxPrice: getParam(searchParams, "maxPrice")?.trim() ?? "",
    phoneIds: parseListParam(getParam(searchParams, "phone")),
    brands: parseListParam(getParam(searchParams, "brand")),
    sort,
  };
}

export function buildCaseSearchQueryString(
  keyword: string,
  filters: CaseSearchFilters,
): string {
  const params = new URLSearchParams();
  params.set("q", keyword);

  const allSourcesSelected =
    ALL_CASE_SEARCH_SOURCES.every((source) =>
      filters.sources.includes(source),
    ) && filters.sources.length === ALL_CASE_SEARCH_SOURCES.length;

  if (!allSourcesSelected && filters.sources.length > 0) {
    params.set("source", filters.sources.join(","));
  }

  if (filters.minPrice) {
    params.set("minPrice", filters.minPrice);
  }

  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }

  if (filters.phoneIds.length > 0) {
    params.set("phone", filters.phoneIds.join(","));
  }

  if (filters.brands.length > 0) {
    params.set("brand", filters.brands.join(","));
  }

  if (filters.sort !== "default") {
    params.set("sort", filters.sort);
  }

  return `?${params.toString()}`;
}

export function countActiveCaseSearchFilters(
  filters: CaseSearchFilters,
): number {
  let count = 0;

  const allSourcesSelected =
    ALL_CASE_SEARCH_SOURCES.every((source) =>
      filters.sources.includes(source),
    ) && filters.sources.length === ALL_CASE_SEARCH_SOURCES.length;

  if (!allSourcesSelected) {
    count += 1;
  }
  if (filters.minPrice || filters.maxPrice) {
    count += 1;
  }
  if (filters.phoneIds.length > 0) {
    count += 1;
  }
  if (filters.brands.length > 0) {
    count += 1;
  }
  if (filters.sort !== "default") {
    count += 1;
  }

  return count;
}

function parseOptionalPrice(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function filterAndSortCaseSearchResults(
  items: CaseSearchItem[],
  filters: CaseSearchFilters,
): CaseSearchItem[] {
  const minPrice = parseOptionalPrice(filters.minPrice);
  const maxPrice = parseOptionalPrice(filters.maxPrice);
  const sourceSet = new Set(filters.sources);
  const phoneSet = new Set(filters.phoneIds);
  const brandSet = new Set(filters.brands);

  const filtered = items.filter((item) => {
    if (!sourceSet.has(item.source)) {
      return false;
    }

    if (minPrice != null && item.price < minPrice) {
      return false;
    }

    if (maxPrice != null && item.price > maxPrice) {
      return false;
    }

    if (phoneSet.size > 0 && !phoneSet.has(item.phone_id)) {
      return false;
    }

    if (brandSet.size > 0) {
      if (!item.brand || !brandSet.has(item.brand)) {
        return false;
      }
    }

    return true;
  });

  if (filters.sort === "default") {
    return filtered;
  }

  const sorted = [...filtered];

  if (filters.sort === "price_asc") {
    sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "ja"));
  } else if (filters.sort === "price_desc") {
    sorted.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, "ja"));
  } else if (filters.sort === "review_desc") {
    sorted.sort((a, b) => {
      const aRate = a.review_rate;
      const bRate = b.review_rate;
      if (aRate == null && bRate == null) {
        return a.name.localeCompare(b.name, "ja");
      }
      if (aRate == null) {
        return 1;
      }
      if (bRate == null) {
        return -1;
      }
      if (bRate !== aRate) {
        return bRate - aRate;
      }
      return a.name.localeCompare(b.name, "ja");
    });
  }

  return sorted;
}

export function getCaseSearchPriceRange(items: CaseSearchItem[]): {
  min: number | null;
  max: number | null;
} {
  if (items.length === 0) {
    return { min: null, max: null };
  }

  let min = items[0].price;
  let max = items[0].price;
  for (const item of items) {
    if (item.price < min) min = item.price;
    if (item.price > max) max = item.price;
  }
  return { min, max };
}

export function getCaseSearchPhoneOptions(
  items: CaseSearchItem[],
): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const item of items) {
    if (!map.has(item.phone_id)) {
      map.set(item.phone_id, item.phone_name ?? "不明な機種");
    }
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

export function getCaseSearchBrandOptions(items: CaseSearchItem[]): string[] {
  const brands = new Set<string>();
  for (const item of items) {
    if (item.brand) {
      brands.add(item.brand);
    }
  }
  return [...brands].sort((a, b) => a.localeCompare(b, "ja"));
}

export const EMPTY_CASE_SEARCH_FILTERS: CaseSearchFilters = {
  sources: [...ALL_CASE_SEARCH_SOURCES],
  minPrice: "",
  maxPrice: "",
  phoneIds: [],
  brands: [],
  sort: "default",
};
