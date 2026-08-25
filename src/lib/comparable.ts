import type { Case, MarketplaceOffer } from "@/types/database";

export type ComparableSource = "other" | "rakuten" | "yahoo";

export type ComparableItem = {
  /** タブ横断でも衝突しない一意キー（例: other:uuid） */
  id: string;
  source: ComparableSource;
  sourceLabel: string;
  name: string;
  brand: string | null;
  price: number;
  url: string;
  image_url: string | null;
  review_rate: number | null;
  review_count: number | null;
};

export const MAX_COMPARE_SELECTION = 3;

export const SOURCE_LABELS: Record<ComparableSource, string> = {
  other: "その他",
  rakuten: "楽天市場",
  yahoo: "Yahoo!ショッピング",
};

export function caseToComparable(caseItem: Case): ComparableItem {
  return {
    id: `other:${caseItem.id}`,
    source: "other",
    sourceLabel: SOURCE_LABELS.other,
    name: caseItem.name,
    brand: caseItem.brand,
    price: caseItem.price,
    url: caseItem.url,
    image_url: caseItem.image_url ?? null,
    review_rate: null,
    review_count: null,
  };
}

export function offerToComparable(offer: MarketplaceOffer): ComparableItem {
  const source = offer.source;
  return {
    id: `${source}:${offer.id}`,
    source,
    sourceLabel: SOURCE_LABELS[source],
    name: offer.name,
    brand: offer.brand,
    price: offer.price,
    url: offer.url,
    image_url: offer.image_url,
    review_rate: offer.review_rate,
    review_count: offer.review_count,
  };
}
