import catalogData from "@/data/catalog.json";
import type { CaseSearchItem } from "@/lib/case-search-filters";
import type { PhoneFilters } from "@/lib/phone-filters";
import type {
  Case,
  MarketplaceOffer,
  MarketplaceSource,
  Phone,
} from "@/types/database";

export type CatalogPhone = Phone & {
  cases: Case[];
  marketplace_offers: MarketplaceOffer[];
};

export type Catalog = {
  generated_at: string;
  count: {
    phones: number;
    cases: number;
    marketplace_offers: number;
  };
  phones: CatalogPhone[];
};

const catalog = catalogData as Catalog;

/**
 * 検索用正規化:
 * - NFKC（全角英数→半角など）
 * - ASCII 大小無視
 * - ひらがな→カタカナ（読みのゆれを吸収）
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[\u3041-\u3096]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60),
    );
}

function matchesNormalizedField(
  field: string | null | undefined,
  needle: string,
): boolean {
  if (field == null || field === "") {
    return false;
  }
  return normalizeSearchText(field).includes(needle);
}

export function getCatalogGeneratedAt(): string {
  return catalog.generated_at;
}

export function getCatalogCounts(): Catalog["count"] {
  return catalog.count;
}

export function getAllCatalogPhones(): CatalogPhone[] {
  return catalog.phones;
}

function toPhone(row: CatalogPhone): Phone {
  const { cases: _cases, marketplace_offers: _offers, ...phone } = row;
  return phone;
}

export function getPhoneFilterOptions(): {
  makers: string[];
  years: number[];
} {
  const makers = [
    ...new Set(catalog.phones.map((phone) => phone.maker)),
  ].sort((a, b) => a.localeCompare(b, "ja"));
  const years = [
    ...new Set(catalog.phones.map((phone) => phone.released_year)),
  ].sort((a, b) => b - a);

  return { makers, years };
}

export function getPhones(filters: PhoneFilters): {
  phones: Phone[];
  error: string | null;
} {
  let phones = catalog.phones.map(toPhone);

  if (filters.makers.length > 0) {
    const makerSet = new Set(filters.makers);
    phones = phones.filter((phone) => makerSet.has(phone.maker));
  }

  if (filters.year) {
    const year = Number(filters.year);
    phones = phones.filter((phone) => phone.released_year === year);
  }

  switch (filters.sort) {
    case "year_asc":
      phones = [...phones].sort(
        (a, b) =>
          a.released_year - b.released_year ||
          a.name.localeCompare(b.name, "ja"),
      );
      break;
    case "name_asc":
      phones = [...phones].sort((a, b) => a.name.localeCompare(b.name, "ja"));
      break;
    default:
      phones = [...phones].sort(
        (a, b) =>
          b.released_year - a.released_year ||
          a.name.localeCompare(b.name, "ja"),
      );
  }

  return { phones, error: null };
}

export function getPhone(id: string): CatalogPhone | null {
  return catalog.phones.find((phone) => phone.id === id) ?? null;
}

export function getOtherCases(phoneId: string): Case[] {
  const phone = getPhone(phoneId);
  if (!phone) {
    return [];
  }
  return [...phone.cases].sort(
    (a, b) => a.price - b.price || a.name.localeCompare(b.name, "ja"),
  );
}

export function getMarketplaceOffers(
  phoneId: string,
  source: MarketplaceSource,
): MarketplaceOffer[] {
  const phone = getPhone(phoneId);
  if (!phone) {
    return [];
  }
  return phone.marketplace_offers
    .filter((offer) => offer.source === source)
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "ja"));
}

export function getStaticPhoneParams(): { id: string }[] {
  return catalog.phones.map((phone) => ({ id: phone.id }));
}

export function searchPhones(keyword: string): Phone[] {
  const needle = normalizeSearchText(keyword.trim());
  if (!needle) {
    return [];
  }

  return catalog.phones
    .filter((phone) => matchesNormalizedField(phone.name, needle))
    .map(toPhone);
}

export function searchCases(keyword: string): CaseSearchItem[] {
  const needle = normalizeSearchText(keyword.trim());
  if (!needle) {
    return [];
  }

  const results: CaseSearchItem[] = [];

  for (const phone of catalog.phones) {
    for (const row of phone.cases) {
      if (
        matchesNormalizedField(row.name, needle) ||
        matchesNormalizedField(row.brand, needle)
      ) {
        results.push({
          id: row.id,
          name: row.name,
          brand: row.brand,
          price: row.price,
          phone_id: row.phone_id,
          phone_name: phone.name,
          source: "other",
          url: row.url?.trim() || null,
          image_url: row.image_url?.trim() || null,
          review_rate: null,
        });
      }
    }

    for (const row of phone.marketplace_offers) {
      if (
        matchesNormalizedField(row.name, needle) ||
        matchesNormalizedField(row.brand, needle)
      ) {
        results.push({
          id: row.id,
          name: row.name,
          brand: row.brand,
          price: row.price,
          phone_id: row.phone_id,
          phone_name: phone.name,
          source: row.source,
          url: row.url?.trim() || null,
          image_url: row.image_url?.trim() || null,
          review_rate: row.review_rate,
        });
      }
    }
  }

  return results;
}
