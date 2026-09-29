/**
 * 診断おすすめの件数・予算減点・緩和優先度の設定。
 * 調整はこのファイルを中心に行う。
 */

/** 予算帯の順序（インデックス差がティア距離） */
export const BUDGET_TIER_ORDER = [
  "under_1500",
  "range_1500_3000",
  "range_3000_5000",
  "over_5000",
] as const;

export type OrderedBudgetId = (typeof BUDGET_TIER_ORDER)[number];

export const DIAGNOSE_RECOMMEND_CONFIG = {
  /** 返却する上位件数 */
  targetCount: 5,
  /** この件数未満なら次の緩和ステップへ */
  minAcceptable: 3,
  /**
   * 通常時に候補へ残す最大予算ティア距離。
   * 0=予算内のみ、1=上下1段階まで、null=制限なし（緩和用）
   */
  budgetMaxTierDistance: 1 as number | null,
  /** 予算内一致の加点 */
  budgetExactBonus: 25,
  /**
   * 上下1段階の減点幅（exact bonus から差し引く）。
   * near の実質加点 = budgetExactBonus - budgetNearPenalty
   */
  budgetNearPenalty: 15,
  /**
   * 緩和の優先順位（低いものから先に緩める）。
   * phone（端末）は常に必須。予算の±1は通常候補のためここでは扱わない。
   */
  relaxOrder: ["caseTypes", "budget"] as const,
} as const;

export type RelaxFilterId =
  | (typeof DIAGNOSE_RECOMMEND_CONFIG.relaxOrder)[number]
  | "budgetNear";
