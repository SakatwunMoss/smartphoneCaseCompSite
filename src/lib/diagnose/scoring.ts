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
import type { Case } from "@/types/database";

export type HardFilterFlags = {
  /** 予算条件を適用するか */
  budget: boolean;
  /** ケースタイプ条件を適用するか */
  caseTypes: boolean;
};

export type ScoreBreakdown = {
  typeScore: number;
  priorityScore: number;
  priceFit: number;
  typeHits: InferredCaseType[];
  priorityHits: PriorityId[];
  matchedBudget: boolean;
  matchedTypes: boolean;
};

export type ScoredCase = {
  caseItem: Case;
  score: number;
  breakdown: ScoreBreakdown;
  /** UI 表示用の「合う理由」1行 */
  reasonLine: BilingualCopy;
};

export type RecommendResult = {
  items: ScoredCase[];
  relaxed: boolean;
  relaxedFilters: BilingualCopy[];
};

const TYPE_SCORE_PER_HIT = 20;
const TYPE_SCORE_MAX = 40;
const PRIORITY_PER_AXIS = 15;
const PRIORITY_SCORE_MAX = 45;
const PRICE_PRIORITY_MAX = 20;
const PRICE_FIT_MAX = 5;
const TARGET_COUNT = 5;
const MIN_ACCEPTABLE = 3;

/** 採点対象の Case（price が null の可能性を許容） */
export type ScoreableCase = Omit<Case, "price"> & {
  price: number | null;
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

export function matchesBudget(
  price: number | null | undefined,
  budget: BudgetId,
): boolean {
  const range = budgetRange(budget);
  if (range == null) {
    return true;
  }
  // 予算指定時は価格不明を除外
  if (price == null) {
    return false;
  }
  if (range.min != null && price < range.min) {
    return false;
  }
  if (range.max != null && price > range.max) {
    return false;
  }
  return true;
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

export function matchesHardFilters(
  caseItem: ScoreableCase,
  answers: QuizAnswers,
  flags: HardFilterFlags = { budget: true, caseTypes: true },
): boolean {
  if (caseItem.phone_id !== answers.phoneId) {
    return false;
  }

  const traits = inferCaseTraits(caseItem.name, caseItem.brand);

  if (flags.budget && !matchesBudget(caseItem.price, answers.budget)) {
    return false;
  }

  if (flags.caseTypes) {
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
  // 安いほど高得点（〜1500で満点、5000超で0付近）
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
  if (!matchesBudget(price, budget)) {
    return 0;
  }
  // レンジ内ならわずかに加点（同点崩し）。上限がある場合は上限に近いほど加点
  if (range.max != null) {
    const ratio = Math.min(1, price / range.max);
    return Math.round(PRICE_FIT_MAX * ratio);
  }
  // 5000円〜 は下限付近を優遇
  if (range.min != null) {
    const over = price - range.min;
    const ratio = Math.max(0, 1 - over / 5000);
    return Math.round(PRICE_FIT_MAX * ratio);
  }
  return 0;
}

export function scoreCase(
  caseItem: ScoreableCase,
  answers: QuizAnswers,
): { score: number; breakdown: ScoreBreakdown } {
  const traits = inferCaseTraits(caseItem.name, caseItem.brand);
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

  const breakdown: ScoreBreakdown = {
    typeScore,
    priorityScore,
    priceFit,
    typeHits,
    priorityHits,
    matchedBudget: matchesBudget(caseItem.price, answers.budget),
    matchedTypes: matchesCaseTypes(traits, wantedTypes),
  };

  return {
    score: typeScore + priorityScore + priceFit,
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

type RelaxStep = {
  flags: HardFilterFlags;
  newlyRelaxed: Array<"caseTypes" | "budget">;
};

function buildRelaxationSteps(answers: QuizAnswers): RelaxStep[] {
  const steps: RelaxStep[] = [
    { flags: { budget: true, caseTypes: true }, newlyRelaxed: [] },
  ];

  const canRelaxTypes = effectiveCaseTypes(answers.caseTypes).length > 0;
  const canRelaxBudget = answers.budget !== "any";

  let flags: HardFilterFlags = { budget: true, caseTypes: true };

  // 優先度: タイプ → 予算（端末は緩和しない）
  if (canRelaxTypes) {
    flags = { ...flags, caseTypes: false };
    steps.push({ flags, newlyRelaxed: ["caseTypes"] });
  }
  if (canRelaxBudget) {
    flags = { ...flags, budget: false };
    steps.push({ flags, newlyRelaxed: ["budget"] });
  }

  return steps;
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
    const { score, breakdown } = scoreCase(caseItem, answers);
    scored.push({
      caseItem: caseItem as Case,
      score,
      breakdown,
      reasonLine: formatMatchReason(breakdown, answers),
    });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const pa = a.caseItem.price;
    const pb = b.caseItem.price;
    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pa - pb;
  });

  return scored.slice(0, limit);
}

/**
 * 選択端末のケースから上位を推薦する。
 * 完全一致が MIN_ACCEPTABLE 未満なら条件を段階緩和する。
 */
export function recommendCases(
  cases: ScoreableCase[],
  answers: QuizAnswers,
  limit = TARGET_COUNT,
): RecommendResult {
  const phoneCases = cases.filter((c) => c.phone_id === answers.phoneId);
  const steps = buildRelaxationSteps(answers);
  const accumulatedRelaxed: Array<"caseTypes" | "budget"> = [];

  let lastItems: ScoredCase[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (i > 0) {
      accumulatedRelaxed.push(...step.newlyRelaxed);
    }

    const items = rankCandidates(phoneCases, answers, step.flags, limit);
    lastItems = items;

    if (items.length >= MIN_ACCEPTABLE) {
      return {
        items,
        relaxed: i > 0,
        relaxedFilters:
          i > 0
            ? accumulatedRelaxed.map((id) => diagnoseCopy.relaxedFilters[id])
            : [],
      };
    }
  }

  // 緩和しても件数不足 → 最後の結果を返す（0件なら空）
  if (lastItems.length > 0) {
    return {
      items: lastItems,
      relaxed: true,
      relaxedFilters: accumulatedRelaxed.map(
        (id) => diagnoseCopy.relaxedFilters[id],
      ),
    };
  }

  // 最終手段: ハード条件なしでスコア順
  const fallback = rankCandidates(
    phoneCases,
    answers,
    { budget: false, caseTypes: false },
    limit,
  );

  return {
    items: fallback,
    relaxed: true,
    relaxedFilters: accumulatedRelaxed.map(
      (id) => diagnoseCopy.relaxedFilters[id],
    ),
  };
}
