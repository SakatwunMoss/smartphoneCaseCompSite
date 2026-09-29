/**
 * 診断採点ロジックの簡易ユニットテスト。
 * 実行: npx tsx src/lib/diagnose/scoring.test.ts
 */

import assert from "node:assert/strict";

import { inferCaseTraits } from "@/lib/diagnose/inferCaseTraits";
import type { QuizAnswers } from "@/lib/diagnose/questions";
import { DIAGNOSE_RECOMMEND_CONFIG } from "@/lib/diagnose/recommendConfig";
import {
  evaluateBudgetFit,
  matchesBudget,
  matchesHardFilters,
  recommendCases,
  scoreCase,
  splitRecommendSections,
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

  const tpu = inferCaseTraits("スケルトン TPU スマホケース");
  assert.ok(tpu.types.includes("silicone"));
  assert.ok(tpu.types.includes("clear"));

  const hard = inferCaseTraits("シンプル ハードケース リング付き");
  assert.ok(hard.types.includes("rugged"));
  assert.ok(hard.features.includes("utility"));

  const withExtras = inferCaseTraits("汎用ケース", "Brand", "クリア 透明カバー");
  assert.ok(withExtras.types.includes("clear"));
}

// --- evaluateBudgetFit / matchesBudget ---
{
  assert.equal(matchesBudget(1200, "under_1500"), true);
  assert.equal(matchesBudget(1501, "under_1500"), false);
  assert.equal(matchesBudget(2000, "range_1500_3000"), true);
  assert.equal(matchesBudget(null, "range_1500_3000"), false);
  assert.equal(matchesBudget(null, "any"), true);
  assert.equal(matchesBudget(6000, "over_5000"), true);
  assert.equal(matchesBudget(4000, "over_5000"), false);

  const exact = evaluateBudgetFit(2000, "range_1500_3000", 1);
  assert.equal(exact.distance, 0);
  assert.equal(exact.deviation, "none");
  assert.equal(exact.allowed, true);

  const nearHigh = evaluateBudgetFit(4000, "range_1500_3000", 1);
  assert.equal(nearHigh.distance, 1);
  assert.equal(nearHigh.deviation, "higher");
  assert.equal(nearHigh.allowed, true);

  const nearLow = evaluateBudgetFit(1000, "range_1500_3000", 1);
  assert.equal(nearLow.distance, 1);
  assert.equal(nearLow.deviation, "lower");
  assert.equal(nearLow.allowed, true);

  const far = evaluateBudgetFit(8000, "range_1500_3000", 1);
  assert.equal(far.distance, 2);
  assert.equal(far.allowed, false);

  assert.equal(evaluateBudgetFit(8000, "range_1500_3000", null).allowed, true);
}

// --- scoreCase: 予算減点 ---
{
  const inBudget = makeCase({
    id: "in",
    name: "クリアケース",
    price: 2000,
  });
  const nearBudget = makeCase({
    id: "near",
    name: "クリアケース",
    price: 4000,
  });
  const scoredIn = scoreCase(inBudget, baseAnswers);
  const scoredNear = scoreCase(nearBudget, baseAnswers);
  assert.ok(scoredIn.score > scoredNear.score);
  assert.equal(
    scoredIn.breakdown.budgetScore,
    DIAGNOSE_RECOMMEND_CONFIG.budgetExactBonus,
  );
  assert.equal(
    scoredNear.breakdown.budgetScore,
    DIAGNOSE_RECOMMEND_CONFIG.budgetExactBonus -
      DIAGNOSE_RECOMMEND_CONFIG.budgetNearPenalty,
  );
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

// --- hard filter: 端末・予算距離 ---
{
  const item = makeCase({
    id: "3",
    name: "クリアケース",
    phone_id: "phone-a",
    price: 8000,
  });
  // 距離2 → 通常は除外
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
  // ±1 は候補
  const near = makeCase({
    id: "3b",
    name: "クリアケース",
    price: 4000,
  });
  assert.equal(matchesHardFilters(near, baseAnswers), true);
}

// --- recommendCases: セクション分け・予算減点・緩和 ---
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
  assert.equal(result.items[0]!.caseItem.id, "a");
  assert.ok(result.exactItems.every((item) => item.isExactMatch));
  assert.ok(result.nearItems.every((item) => !item.isExactMatch));

  const split = splitRecommendSections(result.items);
  assert.equal(split.exactItems.length, result.exactItems.length);
  assert.equal(split.nearItems.length, result.nearItems.length);

  // 厳密は a,b の2件 < minAcceptable → near (e: 4500) が補充される
  assert.ok(result.exactItems.length < DIAGNOSE_RECOMMEND_CONFIG.minAcceptable);
  const nearItem = result.nearItems.find((item) => item.caseItem.id === "e");
  assert.ok(nearItem);
  assert.equal(nearItem!.budgetDeviation, "higher");
  assert.equal(result.relaxed, true);
  assert.equal(result.filterRelaxed, false);

  // 厳密が3件以上あるケース: near を混ぜない
  const richCases: ScoreableCase[] = [
    ...cases,
    makeCase({ id: "f", name: "クリア 保護", price: 2200 }),
    makeCase({ id: "g", name: "クリア スリム", price: 2100 }),
  ];
  const rich = recommendCases(richCases, {
    phoneId: "phone-a",
    priorities: ["protection"],
    caseTypes: ["clear"],
    budget: "range_1500_3000",
  });
  assert.ok(rich.exactItems.length >= DIAGNOSE_RECOMMEND_CONFIG.minAcceptable);
  assert.equal(rich.nearItems.length, 0);
  assert.equal(rich.relaxed, false);

  // 超厳格: leather + under_1500 → フィルタ緩和の可能性
  const strict = recommendCases(cases, {
    phoneId: "phone-a",
    priorities: ["magsafe"],
    caseTypes: ["leather"],
    budget: "under_1500",
  });
  assert.ok(strict.items.length > 0);
  assert.ok(
    strict.items.length >=
      Math.min(DIAGNOSE_RECOMMEND_CONFIG.minAcceptable, 4),
  );
}

console.log("diagnose scoring tests: all passed");
