/**
 * 商品名からケースのタイプ・特徴を推定するユーティリティ。
 * cases テーブルにタイプ列がないため、キーワードマッチで判定する（案A）。
 */

import type { CaseTypeId, PriorityId } from "@/lib/diagnose/questions";

/** 「こだわらない」以外のタイプ ID */
export type InferredCaseType = Exclude<CaseTypeId, "any">;

/** スコアリング対象の特徴（価格の安さは別ロジック） */
export type InferredFeature = Exclude<PriorityId, "price">;

export type CaseTraits = {
  types: InferredCaseType[];
  features: InferredFeature[];
};

const TYPE_KEYWORDS: Record<InferredCaseType, readonly string[]> = {
  rugged: [
    "耐衝撃",
    "衝撃吸収",
    "ZEROSHOCK",
    "ZEROSAFE",
    "TOUGH",
    "タフ",
    "ハイブリッド",
    "衝撃",
  ],
  folio: ["手帳", "フリップ", "財布型", "FOLIO", "folio", "フラップ"],
  clear: ["クリア", "透明", "クリスタル", "オールクリア"],
  silicone: ["シリコン", "Silicone", "ソフト", "ソフトカバー"],
  leather: ["レザー", "本革", "PUレザー", "leather"],
  strap: ["ストラップ", "ハンドストラップ", "ストラップホール"],
};

const FEATURE_KEYWORDS: Record<InferredFeature, readonly string[]> = {
  protection: [
    "耐衝撃",
    "衝撃吸収",
    "ZEROSHOCK",
    "ZEROSAFE",
    "TOUGH",
    "タフ",
    "保護",
    "落下",
    "衝撃",
  ],
  thin_light: ["薄型", "薄さ", "軽量", "ULTRASLIM", "スリム", "lite", "Lite"],
  design: [
    "デザイン",
    "カーボン",
    "プレミアム",
    "カラー",
    "柄",
    "マット",
    "グロス",
    "ファッション",
  ],
  utility: [
    "スタンド",
    "カード",
    "財布",
    "ポケット",
    "リング",
    "キックスタンド",
    "収納",
  ],
  magsafe: [
    "MagSafe",
    "magsafe",
    "マグセーフ",
    "マグフィット",
    "マグネット充電",
    "磁力充電",
    "Pixelsnap",
    "PixelSnap",
    "ワイヤレス充電",
    "磁力",
  ],
};

function collectHits<T extends string>(
  text: string,
  dictionary: Record<T, readonly string[]>,
): T[] {
  if (!text) {
    return [];
  }
  const hits: T[] = [];
  for (const [id, keywords] of Object.entries(dictionary) as [
    T,
    readonly string[],
  ][]) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      hits.push(id);
    }
  }
  return hits;
}

/**
 * 商品名・ブランドからタイプと特徴を推定する。
 * brand も結合して MagSafe 表記漏れなどを拾う。
 */
export function inferCaseTraits(
  name: string,
  brand?: string | null,
): CaseTraits {
  const corpus = [name, brand]
    .filter((part): part is string => Boolean(part))
    .join(" ");
  return {
    types: collectHits(corpus, TYPE_KEYWORDS),
    features: collectHits(corpus, FEATURE_KEYWORDS),
  };
}

/** テスト・デバッグ用にキーワード辞書を公開 */
export const CASE_TRAIT_KEYWORDS = {
  types: TYPE_KEYWORDS,
  features: FEATURE_KEYWORDS,
} as const;
