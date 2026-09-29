/**
 * 商品名からケースのタイプ・特徴を推定するユーティリティ。
 * cases / marketplace_offers にタイプ列がないため、キーワードマッチで判定する。
 * 将来 description / category が取れる場合は extras に渡す。
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
    "ハイブリット",
    "衝撃",
    "2重構造",
    "二重構造",
    "ハードケース",
    "ハードカバー",
    "全面保護",
    "ポリカーボネート",
    "polycarbonate",
  ],
  folio: ["手帳", "フリップ", "財布型", "FOLIO", "folio", "フラップ"],
  clear: [
    "クリア",
    "透明",
    "クリスタル",
    "オールクリア",
    "スケルトン",
    "半透明",
    "フロスト",
    "アクリル",
  ],
  silicone: [
    "シリコン",
    "Silicone",
    "ソフト",
    "ソフトカバー",
    "ソフトケース",
    "TPU",
    "tpu",
    "ラバー",
    "rubber",
    "柔軟",
    "iFace",
    "iface",
  ],
  leather: ["レザー", "本革", "PUレザー", "leather", "革製", "キルティング"],
  strap: [
    "ストラップ",
    "ハンドストラップ",
    "ストラップホール",
    "ショルダー",
    "スマホショルダー",
  ],
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
    "全面保護",
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
    "おしゃれ",
    "かわいい",
    "可愛い",
    "韓国",
    "ウェーブ",
    "グラデーション",
    "メッキ",
    "メタリック",
  ],
  utility: [
    "スタンド",
    "カード",
    "財布",
    "ポケット",
    "リング",
    "キックスタンド",
    "収納",
    "リング付き",
    "リング付",
    "スライド式",
    "冷却",
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
    "磁気充電",
    "マグネット式",
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
 * 商品名・ブランド・追加テキストからタイプと特徴を推定する。
 * extras には marketplace の説明文・カテゴリ・別名などを渡せる。
 */
export function inferCaseTraits(
  name: string,
  brand?: string | null,
  extras?: string | null,
): CaseTraits {
  const corpus = [name, brand, extras]
    .filter((part): part is string => Boolean(part && part.trim()))
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
