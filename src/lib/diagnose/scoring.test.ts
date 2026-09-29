/**
 * 診断採点ロジックの簡易ユニットテスト。
 * 実行: npx tsx src/lib/diagnose/scoring.test.ts
 */

import assert from "node:assert/strict";

import { inferCaseTraits } from "@/lib/diagnose/inferCaseTraits";
import type { QuizAnswers } from "@/lib/diagnose/questions";
import {
  matchesBudget,
  matchesHardFilters,
  recommendCases,
  scoreCase,
  type ScoreableCase,
} from "@/lib/diagnose/scoring";

function makeCase(
  overrides: Partial<ScoreableCase> & Pick<ScoreableCase, "id" | "name">,
): ScoreableCase {
  return {
    phone_id: "phone-a",
    brand: "TestBrand",
    price: 2000,
    url: "https://example.com",
    created_at: "2026-01-01T00:00:00Z",
    image_url: null,
    ...overrides,
  };
}

const baseAnswers: QuizAnswers = {
  phoneId: "phone-a",
  priorities: ["protection"],
  caseTypes: ["clear"],
  budget: "range_1500_3000",
};

// --- inferCaseTraits ---
{
  const folio = inferCaseTraits("手帳型ケース 耐衝撃 ハンドストラップ付");
  assert.ok(folio.types.includes("folio"));
  assert.ok(folio.types.includes("rugged"));
  assert.ok(folio.types.includes("strap"));
  assert.ok(folio.features.includes("protection"));

  const magsafe = inferCaseTraits("Ringke ONYX MagSafe対応ケース");
  assert.ok(magsafe.features.includes("magsafe"));

  const clear = inferCaseTraits("ハイブリッド クリア");
  assert.ok(clear.types.includes("clear"));
  assert.ok(clear.types.includes("rugged"));
}

// --- matchesBudget ---
{
  assert.equal(matchesBudget(1200, "under_1500"), true);
  assert.equal(matchesBudget(1501, "under_1500"), false);
  assert.equal(matchesBudget(2000, "range_1500_3000"), true);
  assert.equal(matchesBudget(null, "range_1500_3000"), false);
  assert.equal(matchesBudget(null, "any"), true);
  assert.equal(matchesBudget(6000, "over_5000"), true);
  assert.equal(matchesBudget(4000, "over_5000"), false);
}

// --- scoreCase: タイプ・特徴ヒットで加点 ---
{
  const clearRugged = makeCase({
    id: "1",
    name: "クリア 耐衝撃 薄型ケース",
    price: 2200,
  });
  const softOnly = makeCase({
    id: "2",
    name: "シリコンケース",
    price: 1800,
  });

  const scoredClear = scoreCase(clearRugged, {
    ...baseAnswers,
    priorities: ["protection", "thin_light"],
    caseTypes: ["clear"],
  });
  const scoredSoft = scoreCase(softOnly, {
    ...baseAnswers,
    priorities: ["protection", "thin_light"],
    caseTypes: ["clear"],
  });

  assert.ok(scoredClear.score > scoredSoft.score);
  assert.ok(scoredClear.breakdown.typeHits.includes("clear"));
  assert.ok(scoredClear.breakdown.priorityHits.includes("protection"));
  assert.ok(scoredClear.breakdown.priorityHits.includes("thin_light"));
}

// --- hard filter: 端末・予算 ---
{
  const item = makeCase({
    id: "3",
    name: "クリアケース",
    phone_id: "phone-a",
    price: 8000,
  });
  assert.equal(
    matchesHardFilters(item, { ...baseAnswers, budget: "under_1500" }),
    false,
  );
  assert.equal(
    matchesHardFilters(item, { ...baseAnswers, budget: "any" }),
    true,
  );
  assert.equal(
    matchesHardFilters(item, { ...baseAnswers, phoneId: "other" }),
    false,
  );
}

// --- recommendCases: 上位件数・緩和 ---
{
  const cases: ScoreableCase[] = [
    makeCase({
      id: "a",
      name: "クリア 耐衝撃",
      price: 2000,
    }),
    makeCase({
      id: "b",
      name: "クリア 薄型",
      price: 1800,
    }),
    makeCase({
      id: "c",
      name: "手帳型レザー",
      price: 2500,
    }),
    makeCase({
      id: "d",
      name: "シリコン ソフト",
      price: 900,
      phone_id: "phone-b",
    }),
    makeCase({
      id: "e",
      name: "MagSafe クリア",
      price: 4500,
    }),
  ];

  const result = recommendCases(cases, {
    phoneId: "phone-a",
    priorities: ["protection"],
    caseTypes: ["clear"],
    budget: "range_1500_3000",
  });

  assert.ok(result.items.length >= 1);
  assert.ok(result.items.every((item) => item.caseItem.phone_id === "phone-a"));
  // クリア＋予算内が優先
  assert.equal(result.items[0].caseItem.id, "a");

  // 超厳格条件 → 緩和される
  const strict = recommendCases(cases, {
    phoneId: "phone-a",
    priorities: ["magsafe"],
    caseTypes: ["leather"],
    budget: "under_1500",
  });
  assert.equal(strict.relaxed, true);
  assert.ok(strict.items.length > 0);
}

console.log("diagnose scoring tests: all passed");
