export type PhoneSort = "year_desc" | "year_asc" | "name_asc";

export type PhoneFilters = {
  makers: string[];
  year: string;
  sort: PhoneSort;
};

function parseListParam(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value.split(",").filter(Boolean);
}

export function parsePhoneFilters(
  searchParams: Record<string, string | string[] | undefined>,
): PhoneFilters {
  const makerParam = searchParams.maker;
  const yearParam = searchParams.year;
  const sortParam = searchParams.sort;

  const makerValue = Array.isArray(makerParam) ? makerParam[0] : makerParam;
  const yearValue = Array.isArray(yearParam) ? yearParam[0] : yearParam;
  const sortValue = Array.isArray(sortParam) ? sortParam[0] : sortParam;

  const sort: PhoneSort =
    sortValue === "year_asc" ||
    sortValue === "year_desc" ||
    sortValue === "name_asc"
      ? sortValue
      : "year_desc";

  return {
    makers: parseListParam(makerValue ?? null),
    year: yearValue ?? "",
    sort,
  };
}

export function buildPhoneFilterQueryString(filters: PhoneFilters): string {
  const params = new URLSearchParams();

  if (filters.makers.length > 0) {
    params.set("maker", filters.makers.join(","));
  }

  if (filters.year) {
    params.set("year", filters.year);
  }

  if (filters.sort !== "year_desc") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
