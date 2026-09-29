import { diagnoseCopy, type BilingualCopy } from "@/lib/diagnose/copy";

/** 重視するポイント（複数選択） */
export type PriorityId =
  | "protection"
  | "thin_light"
  | "design"
  | "utility"
  | "magsafe"
  | "price";

/** ケースタイプ（複数選択。「こだわらない」あり） */
export type CaseTypeId =
  | "rugged"
  | "folio"
  | "clear"
  | "silicone"
  | "leather"
  | "strap"
  | "any";

/** 予算（単一選択） */
export type BudgetId =
  | "under_1500"
  | "range_1500_3000"
  | "range_3000_5000"
  | "over_5000"
  | "any";

export type QuizStepId = "phone" | "priorities" | "caseTypes" | "budget";

export const QUIZ_STEPS: readonly QuizStepId[] = [
  "phone",
  "priorities",
  "caseTypes",
  "budget",
] as const;

/** 「こだわらない」以外のケースタイプ */
export const SELECTABLE_CASE_TYPES: readonly Exclude<CaseTypeId, "any">[] = [
  "rugged",
  "folio",
  "clear",
  "silicone",
  "leather",
  "strap",
] as const;

export const PRIORITY_OPTIONS: readonly {
  id: PriorityId;
  label: BilingualCopy;
}[] = (
  Object.entries(diagnoseCopy.quiz.options.priorities) as [
    PriorityId,
    BilingualCopy,
  ][]
).map(([id, label]) => ({ id, label }));

export const CASE_TYPE_OPTIONS: readonly {
  id: CaseTypeId;
  label: BilingualCopy;
}[] = (
  Object.entries(diagnoseCopy.quiz.options.caseTypes) as [
    CaseTypeId,
    BilingualCopy,
  ][]
).map(([id, label]) => ({ id, label }));

export const BUDGET_OPTIONS: readonly {
  id: BudgetId;
  label: BilingualCopy;
}[] = (
  Object.entries(diagnoseCopy.quiz.options.budget) as [BudgetId, BilingualCopy][]
).map(([id, label]) => ({ id, label }));

export type QuizAnswers = {
  phoneId: string;
  priorities: PriorityId[];
  caseTypes: CaseTypeId[];
  budget: BudgetId;
};

export type DraftAnswers = {
  phoneId: string | null;
  priorities: PriorityId[];
  caseTypes: CaseTypeId[];
  budget: BudgetId | null;
};

export function createInitialDraft(): DraftAnswers {
  return {
    phoneId: null,
    priorities: [],
    caseTypes: [],
    budget: null,
  };
}

export function toQuizAnswers(draft: DraftAnswers): QuizAnswers | null {
  if (draft.phoneId == null || draft.budget == null) {
    return null;
  }
  if (draft.priorities.length === 0 || draft.caseTypes.length === 0) {
    return null;
  }
  return {
    phoneId: draft.phoneId,
    priorities: draft.priorities,
    caseTypes: draft.caseTypes,
    budget: draft.budget,
  };
}

export function isStepComplete(
  step: QuizStepId,
  draft: DraftAnswers,
): boolean {
  switch (step) {
    case "phone":
      return draft.phoneId != null;
    case "priorities":
      return draft.priorities.length > 0;
    case "caseTypes":
      return draft.caseTypes.length > 0;
    case "budget":
      return draft.budget != null;
  }
}
