"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  BilingualButtonLabel,
  BilingualText,
} from "@/components/BilingualText";
import { DiagnoseResults } from "@/components/diagnose/DiagnoseResults";
import { diagnoseCopy, type BilingualCopy } from "@/lib/diagnose/copy";
import {
  clearDiagnoseState,
  isMeaningfulPersistedState,
  loadDiagnoseState,
  saveDiagnoseState,
} from "@/lib/diagnose/persist";
import {
  BUDGET_OPTIONS,
  CASE_TYPE_OPTIONS,
  createInitialDraft,
  isStepComplete,
  PRIORITY_OPTIONS,
  QUIZ_STEPS,
  toQuizAnswers,
  type CaseTypeId,
  type DraftAnswers,
  type QuizStepId,
} from "@/lib/diagnose/questions";
import { recommendCases } from "@/lib/diagnose/scoring";
import { normalizeSearchText } from "@/lib/normalize-search";
import type { Case, Phone } from "@/types/database";

const QUIZ_SCROLL_MARGIN_CLASS = "scroll-mt-20";

const { quiz: quizCopy, results: resultsCopy, resume: resumeCopy } =
  diagnoseCopy;

export type DiagnosePhoneOption = Pick<Phone, "id" | "name" | "maker">;

type DiagnoseQuizProps = {
  phones: DiagnosePhoneOption[];
  cases: Case[];
};

export function DiagnoseQuiz({ phones, cases }: DiagnoseQuizProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<DraftAnswers>(createInitialDraft);
  const [finished, setFinished] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const questionTopRef = useRef<HTMLDivElement>(null);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  const phoneIds = useMemo(
    () => new Set(phones.map((phone) => phone.id)),
    [phones],
  );

  useEffect(() => {
    // sessionStorage はクライアント専用。同期 setState を避けるため次ティックで復元する。
    const timer = window.setTimeout(() => {
      const loaded = loadDiagnoseState(phoneIds);
      if (loaded && isMeaningfulPersistedState(loaded)) {
        setDraft(loaded.draft);
        setStepIndex(loaded.stepIndex);
        setFinished(loaded.finished);
        setShowResumeBanner(true);
      } else if (loaded) {
        clearDiagnoseState();
      }
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [phoneIds]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    saveDiagnoseState({ draft, stepIndex, finished });
  }, [draft, stepIndex, finished, storageReady]);

  const step = QUIZ_STEPS[stepIndex];
  const progress = finished
    ? 100
    : Math.round(((stepIndex + 1) / QUIZ_STEPS.length) * 100);

  const selectedPhone = useMemo(
    () => phones.find((phone) => phone.id === draft.phoneId) ?? null,
    [draft.phoneId, phones],
  );

  const result = useMemo(() => {
    if (!finished) {
      return null;
    }
    const answers = toQuizAnswers(draft);
    if (!answers) {
      return null;
    }
    return recommendCases(cases, answers, 5);
  }, [cases, draft, finished]);

  function scrollTo(target: HTMLElement | null) {
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }

  function restart() {
    clearDiagnoseState();
    setDraft(createInitialDraft());
    setStepIndex(0);
    setFinished(false);
    setShowResumeBanner(false);
    requestAnimationFrame(() => scrollTo(questionTopRef.current));
  }

  /** draft を保持したまま最後の質問へ戻る（restart とは別） */
  function editAnswers() {
    setFinished(false);
    setStepIndex(QUIZ_STEPS.length - 1);
    setShowResumeBanner(false);
    requestAnimationFrame(() => scrollTo(questionTopRef.current));
  }

  function goNext() {
    if (stepIndex >= QUIZ_STEPS.length - 1) {
      setFinished(true);
      requestAnimationFrame(() => scrollTo(resultsTopRef.current));
      return;
    }
    setStepIndex((i) => i + 1);
    requestAnimationFrame(() => scrollTo(questionTopRef.current));
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
    requestAnimationFrame(() => scrollTo(questionTopRef.current));
  }

  const canProceed = isStepComplete(step, draft);

  if (!storageReady) {
    return (
      <div
        className="min-h-[12rem]"
        aria-busy="true"
        aria-label="Loading"
      />
    );
  }

  const resumeBanner = showResumeBanner ? (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <BilingualText
        copy={resumeCopy.banner}
        size="sm"
        enClassName="text-orange-950"
        jaClassName="!text-orange-900/80"
      />
      <button
        type="button"
        onClick={restart}
        className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2 text-orange-800 transition-colors hover:border-orange-300 hover:bg-orange-50"
      >
        <BilingualButtonLabel copy={resumeCopy.startOver} />
      </button>
    </div>
  ) : null;

  if (finished && result && selectedPhone) {
    return (
      <div ref={resultsTopRef} className={QUIZ_SCROLL_MARGIN_CLASS}>
        {resumeBanner}
        <header className="mb-8">
          <BilingualText
            as="h1"
            copy={resultsCopy.title}
            size="3xl"
            enClassName="text-gray-900"
            jaClassName="!text-gray-600"
          />
          <BilingualText
            as="p"
            copy={resultsCopy.intro}
            size="sm"
            className="mt-3 max-w-xl"
            enClassName="text-gray-600"
          />
        </header>
        <DiagnoseResults
          result={result}
          phoneId={selectedPhone.id}
          phoneName={selectedPhone.name}
          onRestart={restart}
          onEditAnswers={editAnswers}
        />
      </div>
    );
  }

  return (
    <div>
      {resumeBanner}
      <header className="mb-8">
        <BilingualText
          as="h1"
          copy={quizCopy.title}
          size="3xl"
          enClassName="text-gray-900"
          jaClassName="!text-gray-600"
        />
        <BilingualText
          as="p"
          copy={quizCopy.intro}
          size="sm"
          className="mt-3 max-w-xl"
          enClassName="text-gray-600"
        />
      </header>

      <div
        ref={questionTopRef}
        className={`mb-6 ${QUIZ_SCROLL_MARGIN_CLASS}`}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-gray-500">
          <BilingualText
            copy={quizCopy.questionProgress(stepIndex + 1, QUIZ_STEPS.length)}
            size="xs"
            enClassName="text-gray-500"
          />
          <span className="shrink-0 text-xs">{progress}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-orange-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress}%`}
        >
          <div
            className="h-full rounded-full bg-orange-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-5 sm:p-6">
        <StepContent
          step={step}
          draft={draft}
          setDraft={setDraft}
          phones={phones}
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {stepIndex === 0 ? (
            <span
              className="invisible inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-gray-200 px-4 py-2"
              aria-hidden
            >
              <BilingualButtonLabel copy={quizCopy.back} />
            </span>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-colors hover:border-gray-300"
            >
              <BilingualButtonLabel copy={quizCopy.back} />
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed}
            className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-orange-500 px-5 py-2 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <BilingualButtonLabel
              inverted
              copy={
                stepIndex >= QUIZ_STEPS.length - 1
                  ? quizCopy.seeResults
                  : quizCopy.next
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function StepContent({
  step,
  draft,
  setDraft,
  phones,
}: {
  step: QuizStepId;
  draft: DraftAnswers;
  setDraft: Dispatch<SetStateAction<DraftAnswers>>;
  phones: DiagnosePhoneOption[];
}) {
  const { questions } = quizCopy;

  switch (step) {
    case "phone":
      return (
        <PhoneStep
          title={questions.phone}
          phones={phones}
          value={draft.phoneId}
          onChange={(phoneId) => setDraft((d) => ({ ...d, phoneId }))}
        />
      );
    case "priorities":
      return (
        <MultiChoiceStep
          title={questions.priorities}
          options={[...PRIORITY_OPTIONS]}
          values={draft.priorities}
          onChange={(priorities) => setDraft((d) => ({ ...d, priorities }))}
        />
      );
    case "caseTypes":
      return (
        <CaseTypeStep
          title={questions.caseTypes}
          values={draft.caseTypes}
          onChange={(caseTypes) => setDraft((d) => ({ ...d, caseTypes }))}
        />
      );
    case "budget":
      return (
        <ChoiceStep
          title={questions.budget}
          options={[...BUDGET_OPTIONS]}
          value={draft.budget}
          onChange={(budget) => setDraft((d) => ({ ...d, budget }))}
        />
      );
  }
}

function PhoneStep({
  title,
  phones,
  value,
  onChange,
}: {
  title: BilingualCopy;
  phones: DiagnosePhoneOption[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [makerFilter, setMakerFilter] = useState<string>("");

  const makers = useMemo(() => {
    return [...new Set(phones.map((p) => p.maker))].sort((a, b) =>
      a.localeCompare(b, "ja"),
    );
  }, [phones]);

  const filtered = useMemo(() => {
    const needle = normalizeSearchText(query.trim());
    return phones
      .filter((phone) => {
        if (makerFilter && phone.maker !== makerFilter) {
          return false;
        }
        if (!needle) {
          return true;
        }
        return (
          normalizeSearchText(phone.name).includes(needle) ||
          normalizeSearchText(phone.maker).includes(needle)
        );
      })
      .sort(
        (a, b) =>
          a.maker.localeCompare(b.maker, "ja") ||
          a.name.localeCompare(b.name, "ja"),
      );
  }, [makerFilter, phones, query]);

  return (
    <fieldset>
      <BilingualText
        as="legend"
        copy={title}
        size="lg"
        enClassName="font-medium text-gray-900"
        jaClassName="!text-gray-600"
      />

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-gray-600">
            {quizCopy.phoneSearchPlaceholder.ja}
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={quizCopy.phoneSearchPlaceholder.en}
            className="min-h-12 w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-base text-gray-900 outline-none ring-orange-500 placeholder:text-gray-400 focus:ring-2"
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-gray-600">
            {quizCopy.phoneMakerLabel.ja} / {quizCopy.phoneMakerLabel.en}
          </span>
          <select
            value={makerFilter}
            onChange={(e) => setMakerFilter(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-base text-gray-900 outline-none ring-orange-500 focus:ring-2"
          >
            <option value="">すべて / All</option>
            {makers.map((maker) => (
              <option key={maker} value={maker}>
                {maker}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="mt-4 flex max-h-[min(50vh,22rem)] flex-col gap-2 overflow-y-auto"
        role="listbox"
        aria-label={title.ja}
      >
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 bg-white/80 px-4 py-6 text-center text-sm text-gray-500">
            {quizCopy.phoneEmpty.ja}
          </p>
        ) : (
          filtered.map((phone) => {
            const selected = value === phone.id;
            return (
              <button
                key={phone.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onChange(phone.id)}
                className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  selected
                    ? "border-orange-500 bg-white ring-1 ring-orange-500"
                    : "border-orange-100/80 bg-white/80 hover:border-orange-300"
                }`}
              >
                <span
                  className={`block text-sm font-medium ${
                    selected ? "text-orange-900" : "text-gray-800"
                  }`}
                >
                  {phone.name}
                </span>
                <span
                  className={`mt-0.5 block text-xs ${
                    selected ? "text-orange-700/80" : "text-gray-500"
                  }`}
                >
                  {phone.maker}
                </span>
              </button>
            );
          })
        )}
      </div>
    </fieldset>
  );
}

function CaseTypeStep({
  title,
  values,
  onChange,
}: {
  title: BilingualCopy;
  values: CaseTypeId[];
  onChange: (ids: CaseTypeId[]) => void;
}) {
  function toggle(id: CaseTypeId) {
    if (id === "any") {
      onChange(values.includes("any") ? [] : ["any"]);
      return;
    }
    const withoutAny = values.filter((v) => v !== "any");
    if (withoutAny.includes(id)) {
      onChange(withoutAny.filter((v) => v !== id));
    } else {
      onChange([...withoutAny, id]);
    }
  }

  return (
    <fieldset>
      <BilingualText
        as="legend"
        copy={title}
        size="lg"
        enClassName="font-medium text-gray-900"
        jaClassName="!text-gray-600"
      />
      <div className="mt-4 flex flex-col gap-2">
        {CASE_TYPE_OPTIONS.map((option) => {
          const selected = values.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
                selected
                  ? "border-orange-500 bg-white ring-1 ring-orange-500"
                  : "border-orange-100/80 bg-white/80 hover:border-orange-300"
              }`}
              aria-pressed={selected}
            >
              <BilingualText
                copy={option.label}
                size="sm"
                enClassName={
                  selected
                    ? "font-medium text-orange-900"
                    : "font-medium text-gray-800"
                }
                jaClassName={selected ? "!text-orange-700/80" : ""}
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ChoiceStep<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: BilingualCopy;
  options: { id: T; label: BilingualCopy }[];
  value: T | null;
  onChange: (id: T) => void;
}) {
  return (
    <fieldset>
      <BilingualText
        as="legend"
        copy={title}
        size="lg"
        enClassName="font-medium text-gray-900"
        jaClassName="!text-gray-600"
      />
      <div className="mt-4 flex flex-col gap-2">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
                selected
                  ? "border-orange-500 bg-white ring-1 ring-orange-500"
                  : "border-orange-100/80 bg-white/80 hover:border-orange-300"
              }`}
              aria-pressed={selected}
            >
              <BilingualText
                copy={option.label}
                size="sm"
                enClassName={
                  selected
                    ? "font-medium text-orange-900"
                    : "font-medium text-gray-800"
                }
                jaClassName={selected ? "!text-orange-700/80" : ""}
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function MultiChoiceStep<T extends string>({
  title,
  options,
  values,
  onChange,
}: {
  title: BilingualCopy;
  options: { id: T; label: BilingualCopy }[];
  values: T[];
  onChange: (ids: T[]) => void;
}) {
  function toggle(id: T) {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id));
    } else {
      onChange([...values, id]);
    }
  }

  return (
    <fieldset>
      <BilingualText
        as="legend"
        copy={title}
        size="lg"
        enClassName="font-medium text-gray-900"
        jaClassName="!text-gray-600"
      />
      <div className="mt-4 flex flex-col gap-2">
        {options.map((option) => {
          const selected = values.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
                selected
                  ? "border-orange-500 bg-white ring-1 ring-orange-500"
                  : "border-orange-100/80 bg-white/80 hover:border-orange-300"
              }`}
              aria-pressed={selected}
            >
              <BilingualText
                copy={option.label}
                size="sm"
                enClassName={
                  selected
                    ? "font-medium text-orange-900"
                    : "font-medium text-gray-800"
                }
                jaClassName={selected ? "!text-orange-700/80" : ""}
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
