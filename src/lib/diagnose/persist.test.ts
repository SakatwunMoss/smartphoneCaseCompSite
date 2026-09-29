/**
 * 診断 persist のユニットテスト。
 * 実行: npx tsx src/lib/diagnose/persist.test.ts
 */

import assert from "node:assert/strict";

import {
  DIAGNOSE_STORAGE_VERSION,
  deserializePersistedState,
  isMeaningfulPersistedState,
  serializePersistedState,
  validatePersistedState,
} from "@/lib/diagnose/persist";
import { createInitialDraft } from "@/lib/diagnose/questions";

const phoneIds = new Set(["phone-a", "phone-b"]);

{
  const draft = {
    phoneId: "phone-a",
    priorities: ["protection" as const],
    caseTypes: ["clear" as const],
    budget: "range_1500_3000" as const,
  };
  const raw = serializePersistedState({
    draft,
    stepIndex: 2,
    finished: false,
  });
  const parsed = deserializePersistedState(raw);
  const validated = validatePersistedState(parsed, phoneIds);
  assert.ok(validated);
  assert.equal(validated.version, DIAGNOSE_STORAGE_VERSION);
  assert.equal(validated.stepIndex, 2);
  assert.equal(validated.finished, false);
  assert.deepEqual(validated.draft, draft);
}

{
  assert.equal(
    validatePersistedState(null, phoneIds),
    null,
    "null should fail",
  );
  assert.equal(
    validatePersistedState({ version: 999, draft: createInitialDraft(), stepIndex: 0, finished: false }, phoneIds),
    null,
    "version mismatch should fail",
  );
}

{
  let threw = false;
  try {
    deserializePersistedState("{not-json");
  } catch {
    threw = true;
  }
  assert.ok(threw, "invalid JSON should throw from deserialize");
}

{
  const badPhone = serializePersistedState({
    draft: {
      phoneId: "missing-phone",
      priorities: ["design"],
      caseTypes: ["any"],
      budget: "any",
    },
    stepIndex: 0,
    finished: false,
  });
  assert.equal(
    validatePersistedState(deserializePersistedState(badPhone), phoneIds),
    null,
    "unknown phoneId should fail",
  );
}

{
  const badOption = {
    version: DIAGNOSE_STORAGE_VERSION,
    draft: {
      phoneId: "phone-a",
      priorities: ["not-a-priority"],
      caseTypes: ["clear"],
      budget: "any",
    },
    stepIndex: 1,
    finished: false,
  };
  assert.equal(
    validatePersistedState(badOption, phoneIds),
    null,
    "unknown priority should fail",
  );
}

{
  const badStep = serializePersistedState({
    draft: createInitialDraft(),
    stepIndex: 99,
    finished: false,
  });
  assert.equal(
    validatePersistedState(deserializePersistedState(badStep), phoneIds),
    null,
    "out-of-range stepIndex should fail",
  );
}

{
  const nullPhoneOk = serializePersistedState({
    draft: createInitialDraft(),
    stepIndex: 0,
    finished: false,
  });
  const validated = validatePersistedState(
    deserializePersistedState(nullPhoneOk),
    phoneIds,
  );
  assert.ok(validated);
  assert.equal(validated.draft.phoneId, null);
  assert.equal(isMeaningfulPersistedState(validated), false);
}

{
  const finishedIncomplete = {
    version: DIAGNOSE_STORAGE_VERSION,
    draft: createInitialDraft(),
    stepIndex: 3,
    finished: true,
  };
  assert.equal(
    validatePersistedState(finishedIncomplete, phoneIds),
    null,
    "finished with incomplete draft should fail",
  );
}

{
  const midQuiz = validatePersistedState(
    deserializePersistedState(
      serializePersistedState({
        draft: {
          phoneId: "phone-a",
          priorities: ["protection"],
          caseTypes: [],
          budget: null,
        },
        stepIndex: 1,
        finished: false,
      }),
    ),
    phoneIds,
  );
  assert.ok(midQuiz);
  assert.equal(isMeaningfulPersistedState(midQuiz), true);
}

console.log("persist.test.ts: all assertions passed");
