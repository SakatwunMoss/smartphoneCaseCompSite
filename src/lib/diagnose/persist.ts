/**
 * 診断クイズの sessionStorage 永続化。
 * 保存するのは draft / stepIndex / finished のみ（URL 等は保存しない）。
 */

import {
  BUDGET_OPTIONS,
  CASE_TYPE_OPTIONS,
  createInitialDraft,
  PRIORITY_OPTIONS,
  QUIZ_STEPS,
  toQuizAnswers,
  type BudgetId,
  type CaseTypeId,
  type DraftAnswers,
  type PriorityId,
} from "@/lib/diagnose/questions";

export const DIAGNOSE_STORAGE_KEY = "phone-case-diagnose:v1";
export const DIAGNOSE_STORAGE_VERSION = 1;

export type PersistedDiagnoseState = {
  version: number;
  draft: DraftAnswers;
  stepIndex: number;
  finished: boolean;
};

const PRIORITY_IDS = new Set<string>(PRIORITY_OPTIONS.map((o) => o.id));
const CASE_TYPE_IDS = new Set<string>(CASE_TYPE_OPTIONS.map((o) => o.id));
const BUDGET_IDS = new Set<string>(BUDGET_OPTIONS.map((o) => o.id));

export function serializePersistedState(
  state: Omit<PersistedDiagnoseState, "version">,
): string {
  const payload: PersistedDiagnoseState = {
    version: DIAGNOSE_STORAGE_VERSION,
    draft: state.draft,
    stepIndex: state.stepIndex,
    finished: state.finished,
  };
  return JSON.stringify(payload);
}

export function deserializePersistedState(
  raw: string,
): unknown {
  return JSON.parse(raw) as unknown;
}

function isPriorityId(value: unknown): value is PriorityId {
  return typeof value === "string" && PRIORITY_IDS.has(value);
}

function isCaseTypeId(value: unknown): value is CaseTypeId {
  return typeof value === "string" && CASE_TYPE_IDS.has(value);
}

function isBudgetId(value: unknown): value is BudgetId {
  return typeof value === "string" && BUDGET_IDS.has(value);
}

function validateDraft(
  draft: unknown,
  phoneIds: ReadonlySet<string>,
): DraftAnswers | null {
  if (draft == null || typeof draft !== "object") {
    return null;
  }

  const d = draft as Record<string, unknown>;
  const { phoneId, priorities, caseTypes, budget } = d;

  if (phoneId !== null && typeof phoneId !== "string") {
    return null;
  }
  if (phoneId != null && !phoneIds.has(phoneId)) {
    return null;
  }

  if (!Array.isArray(priorities) || !priorities.every(isPriorityId)) {
    return null;
  }
  if (!Array.isArray(caseTypes) || !caseTypes.every(isCaseTypeId)) {
    return null;
  }
  if (budget !== null && !isBudgetId(budget)) {
    return null;
  }

  return {
    phoneId,
    priorities,
    caseTypes,
    budget,
  };
}

/**
 * 読み込みデータの検証。失敗時は null（呼び出し側で破棄して最初から）。
 */
export function validatePersistedState(
  data: unknown,
  phoneIds: ReadonlySet<string>,
): PersistedDiagnoseState | null {
  if (data == null || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  if (record.version !== DIAGNOSE_STORAGE_VERSION) {
    return null;
  }

  if (typeof record.stepIndex !== "number" || !Number.isInteger(record.stepIndex)) {
    return null;
  }
  if (record.stepIndex < 0 || record.stepIndex >= QUIZ_STEPS.length) {
    return null;
  }

  if (typeof record.finished !== "boolean") {
    return null;
  }

  const draft = validateDraft(record.draft, phoneIds);
  if (!draft) {
    return null;
  }

  if (record.finished && toQuizAnswers(draft) == null) {
    return null;
  }

  return {
    version: DIAGNOSE_STORAGE_VERSION,
    draft,
    stepIndex: record.stepIndex,
    finished: record.finished,
  };
}

/** 未回答の初期状態は「続きから」扱いにしない */
export function isMeaningfulPersistedState(
  state: PersistedDiagnoseState,
): boolean {
  if (state.finished || state.stepIndex > 0) {
    return true;
  }
  const { draft } = state;
  return (
    draft.phoneId != null ||
    draft.priorities.length > 0 ||
    draft.caseTypes.length > 0 ||
    draft.budget != null
  );
}

export function loadDiagnoseState(
  phoneIds: ReadonlySet<string>,
): PersistedDiagnoseState | null {
  try {
    if (typeof sessionStorage === "undefined") {
      return null;
    }
    const raw = sessionStorage.getItem(DIAGNOSE_STORAGE_KEY);
    if (raw == null) {
      return null;
    }
    let parsed: unknown;
    try {
      parsed = deserializePersistedState(raw);
    } catch {
      sessionStorage.removeItem(DIAGNOSE_STORAGE_KEY);
      return null;
    }
    const validated = validatePersistedState(parsed, phoneIds);
    if (!validated) {
      sessionStorage.removeItem(DIAGNOSE_STORAGE_KEY);
      return null;
    }
    return validated;
  } catch {
    return null;
  }
}

export function saveDiagnoseState(
  state: Omit<PersistedDiagnoseState, "version">,
): void {
  try {
    if (typeof sessionStorage === "undefined") {
      return;
    }
    sessionStorage.setItem(
      DIAGNOSE_STORAGE_KEY,
      serializePersistedState(state),
    );
  } catch {
    // プライベートモード等でもクイズ自体は動かす
  }
}

export function clearDiagnoseState(): void {
  try {
    if (typeof sessionStorage === "undefined") {
      return;
    }
    sessionStorage.removeItem(DIAGNOSE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** テスト・デバッグ用の空状態 */
export function emptyPersistedDraft(): DraftAnswers {
  return createInitialDraft();
}
