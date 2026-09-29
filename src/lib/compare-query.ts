/**
 * /phones/{id}?compare=id1,id2,id3 のパースと初期選択解決。
 */

import {
  caseToComparable,
  MAX_COMPARE_SELECTION,
  offerToComparable,
  type ComparableItem,
  type ComparableSource,
} from "@/lib/comparable";
import type { Case, MarketplaceOffer } from "@/types/database";

/** クエリ文字列から raw ID を取り出す。上限超過・空・重複は先頭優先で安全に落とす。 */
export function parseCompareQuery(raw: string | null | undefined): string[] {
  if (raw == null || raw.trim() === "") {
    return [];
  }

  const seen = new Set<string>();
  const ids: string[] = [];

  for (const part of raw.split(",")) {
    const id = part.trim();
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
    if (ids.length >= MAX_COMPARE_SELECTION) {
      break;
    }
  }

  return ids;
}

export function resolveComparableByRawId(
  rawId: string,
  otherCases: readonly Case[],
  rakutenOffers: readonly MarketplaceOffer[],
  yahooOffers: readonly MarketplaceOffer[],
): ComparableItem | null {
  const rakuten = rakutenOffers.find((offer) => offer.id === rawId);
  if (rakuten) {
    return offerToComparable(rakuten);
  }

  const yahoo = yahooOffers.find((offer) => offer.id === rawId);
  if (yahoo) {
    return offerToComparable(yahoo);
  }

  const other = otherCases.find((caseItem) => caseItem.id === rawId);
  if (other) {
    return caseToComparable(other);
  }

  return null;
}

export type InitialCompareSelection = {
  map: Map<string, ComparableItem>;
  /** 先頭で解決できた候補のタブ。無ければ null */
  preferredSource: ComparableSource | null;
};

/**
 * 不正ID・他端末（一覧に無い）・上限超過は無視する。
 * 渡される cases/offers は当該端末のものだけを想定。
 */
export function buildInitialCompareSelection(
  rawIds: readonly string[],
  otherCases: readonly Case[],
  rakutenOffers: readonly MarketplaceOffer[],
  yahooOffers: readonly MarketplaceOffer[],
): InitialCompareSelection {
  const map = new Map<string, ComparableItem>();
  let preferredSource: ComparableSource | null = null;

  for (const rawId of rawIds) {
    if (map.size >= MAX_COMPARE_SELECTION) {
      break;
    }
    const item = resolveComparableByRawId(
      rawId,
      otherCases,
      rakutenOffers,
      yahooOffers,
    );
    if (!item || map.has(item.id)) {
      continue;
    }
    map.set(item.id, item);
    if (preferredSource == null) {
      preferredSource = item.source;
    }
  }

  return { map, preferredSource };
}

/** 診断結果などから端末比較ページへの href を組み立てる */
export function buildPhoneCompareHref(
  phoneId: string,
  caseIds: readonly string[],
): string {
  if (caseIds.length < 2) {
    return `/phones/${phoneId}`;
  }
  const limited = caseIds.slice(0, MAX_COMPARE_SELECTION);
  return `/phones/${phoneId}?compare=${limited.join(",")}`;
}
