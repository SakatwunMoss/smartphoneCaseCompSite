/**
 * 診断用カタログ組み立て・購入URL優先（楽天 > Yahoo > その他）。
 * 採点ロジック自体は変更しない。入力となる Case 配列の URL 優先度だけを整える。
 */

import type { CatalogPhone } from "@/lib/catalog";
import type { Case, MarketplaceOffer } from "@/types/database";

function normalizeProductKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export type PurchaseUrlSource = "rakuten" | "yahoo" | "other";

export function classifyPurchaseUrl(url: string): PurchaseUrlSource {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (
      host === "item.rakuten.co.jp" ||
      host === "hb.afl.rakuten.co.jp" ||
      host.endsWith(".rakuten.co.jp") ||
      host.includes("rakuten")
    ) {
      return "rakuten";
    }

    if (
      host === "store.shopping.yahoo.co.jp" ||
      host.endsWith(".yahoo.co.jp") ||
      host.includes("yahoo")
    ) {
      return "yahoo";
    }

    // Yahoo!ショッピングの ValueCommerce アフィリエイト
    if (host === "ck.jp.ap.valuecommerce.com" || host.includes("valuecommerce")) {
      const vcUrl = parsed.searchParams.get("vc_url") ?? "";
      let decoded = vcUrl;
      try {
        decoded = decodeURIComponent(vcUrl);
      } catch {
        // keep raw
      }
      if (
        decoded.includes("yahoo") ||
        decoded.includes("shopping.yahoo") ||
        vcUrl.length > 0
      ) {
        return "yahoo";
      }
    }
  } catch {
    // ignore invalid URL
  }
  return "other";
}

function sourceRank(source: PurchaseUrlSource): number {
  switch (source) {
    case "rakuten":
      return 3;
    case "yahoo":
      return 2;
    case "other":
      return 1;
  }
}

function offerToCase(offer: MarketplaceOffer): Case {
  return {
    id: offer.id,
    phone_id: offer.phone_id,
    name: offer.name,
    brand: offer.brand?.trim() ? offer.brand : "—",
    price: offer.price,
    url: offer.url,
    created_at: offer.fetched_at,
    image_url: offer.image_url,
  };
}

/**
 * 同一商品名の候補から購入URLを選ぶ。優先: 楽天 > Yahoo > その他。
 */
export function preferPurchaseUrl(
  primaryUrl: string,
  alternatives: readonly { source: PurchaseUrlSource; url: string }[],
): string {
  let bestUrl = primaryUrl;
  let bestRank = sourceRank(classifyPurchaseUrl(primaryUrl));

  for (const alt of alternatives) {
    const rank = sourceRank(alt.source);
    if (rank > bestRank) {
      bestRank = rank;
      bestUrl = alt.url;
    }
  }

  return bestUrl;
}

/**
 * 診断候補を組み立てる。
 * - marketplace_offers を主とし、同名は楽天 > Yahoo
 * - curated cases と同名なら見た目は curated、購入URLは楽天/Yahoo優先
 * - 端末に楽天/Yahooオファーがある場合は、購入URLが other の候補を除外
 * - オファーが無い端末のみ curated cases にフォールバック
 */
export function buildDiagnoseCases(phones: CatalogPhone[]): Case[] {
  const result: Case[] = [];

  for (const phone of phones) {
    const byName = new Map<string, { caseItem: Case; rank: number }>();

    for (const offer of phone.marketplace_offers) {
      const key = normalizeProductKey(offer.name);
      const rank = sourceRank(offer.source);
      const existing = byName.get(key);
      if (!existing || rank > existing.rank) {
        byName.set(key, { caseItem: offerToCase(offer), rank });
      }
    }

    const hasMarketplace = byName.size > 0;

    for (const caseItem of phone.cases) {
      const key = normalizeProductKey(caseItem.name);
      const existing = byName.get(key);
      if (existing) {
        const preferredUrl = preferPurchaseUrl(caseItem.url, [
          {
            source: classifyPurchaseUrl(existing.caseItem.url),
            url: existing.caseItem.url,
          },
        ]);
        byName.set(key, {
          caseItem: {
            ...caseItem,
            url: preferredUrl,
            image_url: caseItem.image_url || existing.caseItem.image_url,
          },
          rank: Math.max(
            existing.rank,
            sourceRank(classifyPurchaseUrl(preferredUrl)),
          ),
        });
        continue;
      }

      if (hasMarketplace) {
        // 楽天/Yahoo がある端末では other 導線の curated は候補に入れない
        continue;
      }

      byName.set(key, {
        caseItem,
        rank: sourceRank(classifyPurchaseUrl(caseItem.url)),
      });
    }

    if (hasMarketplace) {
      for (const entry of byName.values()) {
        if (entry.rank >= 2) {
          result.push(entry.caseItem);
        }
      }
      continue;
    }

    result.push(...[...byName.values()].map((entry) => entry.caseItem));
  }

  return result;
}

/**
 * 結果カード用: ケース URL と端末オファーから楽天/Yahoo を優先した購入先を返す。
 */
export function resolvePreferredPurchaseUrl(
  caseItem: Pick<Case, "name" | "url" | "phone_id">,
  offers: readonly MarketplaceOffer[],
): string {
  const key = normalizeProductKey(caseItem.name);
  const alternatives: { source: PurchaseUrlSource; url: string }[] = [];

  for (const offer of offers) {
    if (offer.phone_id !== caseItem.phone_id) {
      continue;
    }
    if (normalizeProductKey(offer.name) !== key) {
      continue;
    }
    alternatives.push({ source: offer.source, url: offer.url });
  }

  return preferPurchaseUrl(caseItem.url, alternatives);
}
