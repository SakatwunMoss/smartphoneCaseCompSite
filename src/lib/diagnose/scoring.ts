import { diagnoseCopy, type BilingualCopy } from "@/lib/diagnose/copy";
import {
  inferCaseTraits,
  type InferredCaseType,
} from "@/lib/diagnose/inferCaseTraits";
import type {
  BudgetId,
  CaseTypeId,
  PriorityId,
  QuizAnswers,
} from "@/lib/diagnose/questions";
import {
  BUDGET_TIER_ORDER,
  DIAGNOSE_RECOMMEND_CONFIG,
  type OrderedBudgetId,
  type RelaxFilterId,
} from "@/lib/diagnose/recommendConfig";
import type { Case } from "@/types/database";

export type HardFilterFlags = {
  /**
   * 許容する予算ティア距離の上限。
   * null は予算条件オフ（距離無制限）。
   */
  budgetMaxDistance: number | null;
  /** ケースタイプ条件を適用するか */
  caseTypes: boolean;
};

/** 予算との関係（UI表示・採点用） */
export type BudgetDeviation = "none" | "higher" | "lower";

export type BudgetFit = {
  /** 選択予算とのティア距離（any / 価格不明は null） */
  distance: number | null;
  deviation: BudgetDeviation;
  /** 指定 maxDistance 内か（any は常に true） */
  allowed: boolean;
};

export type ScoreBreakdown = {
  typeScore: number;
  priorityScore: number;
  priceFit: number;
  budgetScore: number;
  typeHits: InferredCaseType[];
  priorityHits: PriorityId[];
  matchedBudget: boolean;
  matchedTypes: boolean;
  budgetFit: BudgetFit;
};

export type ScoredCase = {
  caseItem: Case;
  score: number;
  breakdown: ScoreBreakdown;
  /** タイプ一致かつ予算距離0（または予算any） */
  isExactMatch: boolean;
  /** UI: 予算より少し高め/安め */
  budgetDeviation: BudgetDeviation;
  /** UI 表示用の「合う理由」1行 */
  reasonLine: BilingualCopy;
};

export type RecommendResult = {
  items: ScoredCase[];
  exactItems: ScoredCase[];
  nearItems: ScoredCase[];
  /** near 表示またはフィルタ緩和がある（UIバナー用） */
  relaxed: boolean;
  /** ケースタイプ/予算ハード条件を段階緩和したか */
  filterRelaxed: boolean;
  relaxedFilters: BilingualCopy[];
  relaxedFilterIds: RelaxFilterId[];
};

const TYPE_SCORE_PER_HIT = 20;
const TYPE_SCORE_MAX = 40;
const PRIORITY_PER_AXIS = 15;
const PRIORITY_SCORE_MAX = 45;
const PRICE_PRIORITY_MAX = 20;
const PRICE_FIT_MAX = 5;
const TYPE_MATCH_BONUS = 30;

const {
  targetCount: TARGET_COUNT,
  minAcceptable: MIN_ACCEPTABLE,
  budgetMaxTierDistance: DEFAULT_BUDGET_MAX_DISTANCE,
  budgetExactBonus: BUDGET_EXACT_BONUS,
  budgetNearPenalty: BUDGET_NEAR_PENALTY,
} = DIAGNOSE_RECOMMEND_CONFIG;

/** 採点対象の Case（price が null の可能性を許容） */
export type ScoreableCase = Omit<Case, "price"> & {
  price: number | null;
  /** タイプ推定用の追加テキスト（説明文・カテゴリ・別名など） */
  traitExtras?: string | null;
};

function budgetRange(
  budget: BudgetId,
): { min: number | null; max: number | null } | null {
  switch (budget) {
    case "under_1500":
      return { min: null, max: 1500 };
    case "range_1500_3000":
      return { min: 1500, max: 3000 };
    case "range_3000_5000":
      return { min: 3000, max: 5000 };
    case "over_5000":
      return { min: 5000, max: null };
    case "any":
      return null;
  }
}

/** 選択予算のティア index（any は null） */
export function budgetTierIndex(budget: BudgetId): number | null {
  if (budget === "any") {
    return null;
  }
  return BUDGET_TIER_ORDER.indexOf(budget as OrderedBudgetId);
}

/**
 * 価格が属する予算ティア（0=〜1500 … 3=5000〜）。
 * 境界は「上限を含む下位帯」優先（1500→0, 3000→1, 5000→2）。
 */
export function priceBudgetTier(price: number): number {
  if (price <= 1500) return 0;
  if (price <= 3000) return 1;
  if (price <= 5000) return 2;
  return 3;
}

export function evaluateBudgetFit(
  price: number | null | undefined,
  budget: BudgetId,
  maxDistance: number | null = DEFAULT_BUDGET_MAX_DISTANCE,
): BudgetFit {
  if (budget === "any") {
    return { distance: 0, deviation: "none", allowed: true };
  }
  if (price == null) {
    return { distance: null, deviation: "none", allowed: false };
  }

  const selected = budgetTierIndex(budget);
  if (selected == null) {
    return { distance: 0, deviation: "none", allowed: true };
  }

  const actual = priceBudgetTier(price);
  const distance = Math.abs(actual - selected);
  const deviation: BudgetDeviation =
    actual === selected ? "none" : actual > selected ? "higher" : "lower";
  const allowed = maxDistance == null ? true : distance <= maxDistance;

  return { distance, deviation, allowed };
}

/** @deprecated 互換: strict=距離0 / expanded=距離≤1 / off=無制限 */
export type BudgetFilterMode = "strict" | "expanded" | "off";

export function matchesBudget(
  price: number | null | undefined,
  budget: BudgetId,
  mode: BudgetFilterMode = "strict",
): boolean {
  const maxDistance =
    mode === "off" ? null : mode === "expanded" ? 1 : 0;
  return evaluateBudgetFit(price, budget, maxDistance).allowed;
}

/** 希望タイプのうち「こだわらない」以外 */
export function effectiveCaseTypes(
  caseTypes: CaseTypeId[],
): InferredCaseType[] {
  if (caseTypes.includes("any")) {
    return [];
  }
  return caseTypes.filter((t): t is InferredCaseType => t !== "any");
}

export function matchesCaseTypes(
  traits: ReturnType<typeof inferCaseTraits>,
  wanted: InferredCaseType[],
): boolean {
  if (wanted.length === 0) {
    return true;
  }
  return wanted.some((type) => traits.types.includes(type));
}

function traitsFor(caseItem: ScoreableCase) {
  return inferCaseTraits(caseItem.name, caseItem.brand, caseItem.traitExtras);
}

export function matchesHardFilters(
  caseItem: ScoreableCase,
  answers: QuizAnswers,
  flags: HardFilterFlags = {
    budgetMaxDistance: DEFAULT_BUDGET_MAX_DISTANCE,
    caseTypes: true,
  },
): boolean {
  if (caseItem.phone_id !== answers.phoneId) {
    return false;
  }

  const fit = evaluateBudgetFit(
    caseItem.price,
    answers.budget,
    flags.budgetMaxDistance,
  );
  if (!fit.allowed) {
    return false;
  }

  if (flags.caseTypes) {
    const traits = traitsFor(caseItem);
    const wanted = effectiveCaseTypes(answers.caseTypes);
    if (!matchesCaseTypes(traits, wanted)) {
      return false;
    }
  }

  return true;
}

function pricePriorityScore(price: number | null | undefined): number {
  if (price == null) {
    return 0;
  }
  if (price <= 1500) {
    return PRICE_PRIORITY_MAX;
  }
  if (price >= 5000) {
    return 0;
  }
  const ratio = (5000 - price) / (5000 - 1500);
  return Math.round(PRICE_PRIORITY_MAX * ratio);
}

function priceFitScore(
  price: number | null | undefined,
  budget: BudgetId,
): number {
  const range = budgetRange(budget);
  if (range == null || price == null) {
    return 0;
  }
  if (!evaluateBudgetFit(price, budget, 0).allowed) {
    return 0;
  }
  if (range.max != null) {
    const ratio = Math.min(1, price / range.max);
    return Math.round(PRICE_FIT_MAX * ratio);
  }
  if (range.min != null) {
    const over = price - range.min;
    const ratio = Math.max(0, 1 - over / 5000);
    return Math.round(PRICE_FIT_MAX * ratio);
  }
  return 0;
}

function budgetScoreFromFit(fit: BudgetFit, budget: BudgetId): number {
  if (budget === "any" || fit.distance == null) {
    return 0;
  }
  if (fit.distance === 0) {
    return BUDGET_EXACT_BONUS;
  }
  if (fit.distance === 1) {
    return Math.max(0, BUDGET_EXACT_BONUS - BUDGET_NEAR_PENALTY);
  }
  return 0;
}

export function scoreCase(
  caseItem: ScoreableCase,
  answers: QuizAnswers,
): { score: number; breakdown: ScoreBreakdown } {
  const traits = traitsFor(caseItem);
  const wantedTypes = effectiveCaseTypes(answers.caseTypes);

  const typeHits = wantedTypes.filter((t) => traits.types.includes(t));
  const typeScore = Math.min(
    TYPE_SCORE_MAX,
    typeHits.length * TYPE_SCORE_PER_HIT,
  );

  let priorityRaw = 0;
  const priorityHits: PriorityId[] = [];
  for (const priority of answers.priorities) {
    if (priority === "price") {
      const pts = pricePriorityScore(caseItem.price);
      if (pts > 0) {
        priorityRaw += pts;
        priorityHits.push("price");
      }
      continue;
    }
    if (traits.features.includes(priority)) {
      priorityRaw += PRIORITY_PER_AXIS;
      priorityHits.push(priority);
    }
  }
  const priorityScore = Math.min(PRIORITY_SCORE_MAX, priorityRaw);
  const priceFit = priceFitScore(caseItem.price, answers.budget);
  const budgetFit = evaluateBudgetFit(
    caseItem.price,
    answers.budget,
    null,
  );
  const matchedBudget = budgetFit.distance === 0;
  const matchedTypes = matchesCaseTypes(traits, wantedTypes);
  const budgetScore = budgetScoreFromFit(budgetFit, answers.budget);

  const breakdown: ScoreBreakdown = {
    typeScore,
    priorityScore,
    priceFit,
    budgetScore,
    typeHits,
    priorityHits,
    matchedBudget,
    matchedTypes,
    budgetFit,
  };

  const typeBonus =
    matchedTypes && wantedTypes.length > 0 ? TYPE_MATCH_BONUS : 0;

  return {
    score: typeScore + priorityScore + priceFit + budgetScore + typeBonus,
    breakdown,
  };
}

/** breakdown から UI 表示用のマッチ理由（1行）を生成 */
export function formatMatchReason(
  breakdown: ScoreBreakdown,
  answers: QuizAnswers,
): BilingualCopy {
  const { reasons, quiz } = diagnoseCopy;
  const partsJa: string[] = [];
  const partsEn: string[] = [];

  if (breakdown.typeHits.length > 0) {
    const labels = breakdown.typeHits.map(
      (id) => quiz.options.caseTypes[id],
    );
    const typeReason = reasons.typeMatch(labels);
    partsEn.push(typeReason.en);
    partsJa.push(typeReason.ja);
  }

  if (breakdown.priorityHits.length > 0) {
    const labels = breakdown.priorityHits.map(
      (id) => quiz.options.priorities[id],
    );
    const priorityReason = reasons.priorityMatch(labels);
    partsEn.push(priorityReason.en);
    partsJa.push(priorityReason.ja);
  }

  if (breakdown.matchedBudget && answers.budget !== "any") {
    partsEn.push(reasons.inBudget.en);
    partsJa.push(reasons.inBudget.ja);
  }

  if (partsJa.length === 0) {
    return reasons.closeMatch;
  }

  return {
    en: partsEn.join(" · "),
    ja: partsJa.join(" / "),
  };
}

export function isExactScoredMatch(
  breakdown: ScoreBreakdown,
  answers: QuizAnswers,
): boolean {
  const wanted = effectiveCaseTypes(answers.caseTypes);
  const typesOk = wanted.length === 0 || breakdown.matchedTypes;
  const budgetOk =
    answers.budget === "any" || breakdown.budgetFit.distance === 0;
  return typesOk && budgetOk;
}

export function splitRecommendSections(items: ScoredCase[]): {
  exactItems: ScoredCase[];
  nearItems: ScoredCase[];
} {
  const exactItems: ScoredCase[] = [];
  const nearItems: ScoredCase[] = [];
  for (const item of items) {
    if (item.isExactMatch) {
      exactItems.push(item);
    } else {
      nearItems.push(item);
    }
  }
  return { exactItems, nearItems };
}

type RelaxStep = {
  flags: HardFilterFlags;
  newlyRelaxed: RelaxFilterId[];
};

function buildRelaxationSteps(answers: QuizAnswers): RelaxStep[] {
  const canRelaxTypes = effectiveCaseTypes(answers.caseTypes).length > 0;
  const canRelaxBudget = answers.budget !== "any";

  const steps: RelaxStep[] = [
    {
      flags: {
        budgetMaxDistance: DEFAULT_BUDGET_MAX_DISTANCE,
        caseTypes: true,
      },
      newlyRelaxed: [],
    },
  ];

  let flags: HardFilterFlags = {
    budgetMaxDistance: DEFAULT_BUDGET_MAX_DISTANCE,
    caseTypes: true,
  };

  for (const id of DIAGNOSE_RECOMMEND_CONFIG.relaxOrder) {
    if (id === "caseTypes") {
      if (!canRelaxTypes || !flags.caseTypes) continue;
      flags = { ...flags, caseTypes: false };
      steps.push({ flags, newlyRelaxed: ["caseTypes"] });
      continue;
    }
    if (id === "budget") {
      if (!canRelaxBudget || flags.budgetMaxDistance == null) continue;
      flags = { ...flags, budgetMaxDistance: null };
      steps.push({ flags, newlyRelaxed: ["budget"] });
    }
  }

  return steps;
}

function toScoredCase(
  caseItem: ScoreableCase,
  answers: QuizAnswers,
): ScoredCase {
  const { score, breakdown } = scoreCase(caseItem, answers);
  return {
    caseItem: caseItem as Case,
    score,
    breakdown,
    isExactMatch: isExactScoredMatch(breakdown, answers),
    budgetDeviation: breakdown.budgetFit.deviation,
    reasonLine: formatMatchReason(breakdown, answers),
  };
}

function rankCandidates(
  cases: ScoreableCase[],
  answers: QuizAnswers,
  flags: HardFilterFlags,
  limit: number,
): ScoredCase[] {
  const scored: ScoredCase[] = [];

  for (const caseItem of cases) {
    if (!matchesHardFilters(caseItem, answers, flags)) {
      continue;
    }
    scored.push(toScoredCase(caseItem, answers));
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.isExactMatch !== b.isExactMatch) {
      return a.isExactMatch ? -1 : 1;
    }
    const pa = a.caseItem.price;
    const pb = b.caseItem.price;
    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pa - pb;
  });

  const exact = scored.filter((item) => item.isExactMatch);
  const near = scored.filter((item) => !item.isExactMatch);

  // 厳密一致が最低件数以上あれば near は混ぜない（緩和表示を抑える）
  if (exact.length >= MIN_ACCEPTABLE) {
    return exact.slice(0, limit);
  }

  return [...exact, ...near].slice(0, limit);
}

function collectResultTags(
  items: ScoredCase[],
  filterRelaxations: RelaxFilterId[],
): RelaxFilterId[] {
  const tags: RelaxFilterId[] = [];
  const seen = new Set<RelaxFilterId>();

  function push(id: RelaxFilterId) {
    if (seen.has(id)) return;
    seen.add(id);
    tags.push(id);
  }

  for (const id of filterRelaxations) {
    push(id);
  }
  if (items.some((item) => item.budgetDeviation !== "none")) {
    push("budgetNear");
  }
  return tags;
}

function toRecommendResult(
  items: ScoredCase[],
  filterRelaxations: RelaxFilterId[],
): RecommendResult {
  const { exactItems, nearItems } = splitRecommendSections(items);
  const filterRelaxed = filterRelaxations.length > 0;
  const relaxedFilterIds = collectResultTags(items, filterRelaxations);
  const relaxed = nearItems.length > 0 || filterRelaxed;

  return {
    items,
    exactItems,
    nearItems,
    relaxed,
    filterRelaxed,
    relaxedFilterIds,
    relaxedFilters: relaxedFilterIds.map(
      (id) => diagnoseCopy.relaxedFilters[id],
    ),
  };
}

/**
 * 選択端末のケースから上位を推薦する。
 * 通常候補: 端末 + タイプ + 予算ティア距離≤1。
 * 件数不足時はタイプ→予算制限解除の順で緩和。
 */
export function recommendCases(
  cases: ScoreableCase[],
  answers: QuizAnswers,
  limit = TARGET_COUNT,
): RecommendResult {
  const phoneCases = cases.filter((c) => c.phone_id === answers.phoneId);
  const steps = buildRelaxationSteps(answers);
  const accumulatedRelaxed: RelaxFilterId[] = [];

  let lastItems: ScoredCase[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (i > 0) {
      accumulatedRelaxed.push(...step.newlyRelaxed);
    }

    const items = rankCandidates(phoneCases, answers, step.flags, limit);
    lastItems = items;

    if (items.length >= MIN_ACCEPTABLE) {
      return toRecommendResult(
        items,
        i > 0 ? accumulatedRelaxed : [],
      );
    }
  }

  if (lastItems.length > 0) {
    return toRecommendResult(lastItems, accumulatedRelaxed);
  }

  const fallback = rankCandidates(
    phoneCases,
    answers,
    { budgetMaxDistance: null, caseTypes: false },
    limit,
  );

  const relaxedIds: RelaxFilterId[] =
    accumulatedRelaxed.length > 0
      ? accumulatedRelaxed
      : [...DIAGNOSE_RECOMMEND_CONFIG.relaxOrder];

  return toRecommendResult(fallback, relaxedIds);
}

/** 互換: 旧 expandedBudgetRange（距離1相当のレンジ表現） */
export function expandedBudgetRange(
  budget: BudgetId,
): { min: number | null; max: number | null } | null {
  switch (budget) {
    case "under_1500":
      return { min: null, max: 3000 };
    case "range_1500_3000":
      return { min: null, max: 5000 };
    case "range_3000_5000":
      return { min: 1500, max: null };
    case "over_5000":
      return { min: 3000, max: null };
    case "any":
      return null;
  }
}

/** テスト用に rangeContains 相当の厳密一致を公開 */
export function matchesBudgetStrict(
  price: number | null | undefined,
  budget: BudgetId,
): boolean {
  return evaluateBudgetFit(price, budget, 0).allowed;
}
