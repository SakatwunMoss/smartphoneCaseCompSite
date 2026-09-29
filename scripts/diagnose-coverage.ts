/**
 * 診断おすすめの組み合わせ網羅調査。
 * 実行: npx tsx scripts/diagnose-coverage.ts
 *
 * - 均等集計: 端末 × ケースタイプ × 予算（priorities は件数に影響しないため固定）
 * - 重み付け: 機種ごとの登録ケース数で加重
 */

import { getAllCatalogPhones } from "../src/lib/catalog";
import {
  CASE_TRAIT_KEYWORDS,
  inferCaseTraits,
} from "../src/lib/diagnose/inferCaseTraits";
import {
  BUDGET_OPTIONS,
  SELECTABLE_CASE_TYPES,
  type BudgetId,
  type CaseTypeId,
  type QuizAnswers,
} from "../src/lib/diagnose/questions";
import { buildDiagnoseCases } from "../src/lib/diagnose/purchaseUrl";
import {
  matchesHardFilters,
  recommendCases,
  type ScoreableCase,
} from "../src/lib/diagnose/scoring";

function subsets<T>(items: readonly T[]): T[][] {
  const result: T[][] = [];
  const n = items.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    const subset: T[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(items[i]!);
      }
    }
    result.push(subset);
  }
  return result;
}

type Bucket = "0" | "1-2" | "3+";

function bucket(n: number): Bucket {
  if (n <= 0) return "0";
  if (n <= 2) return "1-2";
  return "3+";
}

function typeKeyOf(caseTypes: CaseTypeId[]): string {
  return caseTypes.includes("any") ? "any" : [...caseTypes].sort().join("+");
}

function suggestKeywords(names: string[]): string[] {
  const known = new Set(
    [
      ...Object.values(CASE_TRAIT_KEYWORDS.types).flat(),
      ...Object.values(CASE_TRAIT_KEYWORDS.features).flat(),
    ].map((k) => k.toLowerCase()),
  );
  const counts = new Map<string, number>();
  for (const name of names) {
    const tokens = name
      .split(/[\s/|,、。【】[\]（）()・+\-]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && t.length <= 16);
    for (const token of tokens) {
      const key = token.toLowerCase();
      if (known.has(key)) continue;
      if (
        /iphone|galaxy|pixel|aquos|sense|wish|pro|max|ultra|case|ケース|カバー|スマホ|film|フィルム|クーポン|off|公式|対応|google|アイフォン/.test(
          key,
        )
      ) {
        continue;
      }
      if (/^\d+$/.test(key)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 8)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([token, n]) => `${token} (${n})`);
}

function main() {
  const phones = getAllCatalogPhones();
  const cases = buildDiagnoseCases(phones) as ScoreableCase[];

  const caseTypeCombos: CaseTypeId[][] = [
    ["any"],
    ...subsets(SELECTABLE_CASE_TYPES),
  ];
  const budgets = BUDGET_OPTIONS.map((o) => o.id) as BudgetId[];
  const fixedPriorities = ["protection"] as const;
  const totalCombos = phones.length * caseTypeCombos.length * budgets.length;

  console.log("=== Diagnose coverage ===");
  console.log(`phones: ${phones.length}`);
  console.log(`diagnose cases: ${cases.length}`);
  console.log(`caseType combos: ${caseTypeCombos.length}`);
  console.log(`budgets: ${budgets.length}`);
  console.log(
    `total combos (phone × type × budget, priorities fixed): ${totalCombos.toLocaleString()}`,
  );
  console.log("");

  const casesByPhone = new Map<string, ScoreableCase[]>();
  for (const c of cases) {
    const list = casesByPhone.get(c.phone_id);
    if (list) list.push(c);
    else casesByPhone.set(c.phone_id, [c]);
  }

  // タイプ推定不能
  const untypedByPhone = new Map<string, string[]>();
  let noType = 0;
  for (const c of cases) {
    if (inferCaseTraits(c.name, c.brand, c.traitExtras).types.length === 0) {
      noType++;
      const phone = phones.find((p) => p.id === c.phone_id);
      const key = phone?.name ?? c.phone_id;
      const list = untypedByPhone.get(key) ?? [];
      list.push(c.name);
      untypedByPhone.set(key, list);
    }
  }
  console.log(
    `cases with no inferred type: ${noType} (${((noType / cases.length) * 100).toFixed(1)}%)`,
  );
  console.log("untyped cases by phone:");
  for (const [phoneName, names] of [...untypedByPhone.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    console.log(`  ${phoneName}: ${names.length}`);
  }
  const allUntypedNames = [...untypedByPhone.values()].flat();
  console.log("keyword candidates from untyped names:");
  for (const suggestion of suggestKeywords(allUntypedNames)) {
    console.log(`  - ${suggestion}`);
  }
  console.log("");
  console.log(
    "NOTE: marketplace_offers に description/category 列は現状なし。スキーマ追加案のみ（変更なし）。",
  );
  console.log("");

  const exactDist: Record<Bucket, number> = { "0": 0, "1-2": 0, "3+": 0 };
  const softDist: Record<Bucket, number> = { "0": 0, "1-2": 0, "3+": 0 };
  const finalDist: Record<Bucket, number> = { "0": 0, "1-2": 0, "3+": 0 };
  let relaxedCount = 0;
  let belowMinFinal = 0;
  let nearShownCount = 0;

  let weightedTotal = 0;
  let weightedRelaxed = 0;
  let weightedNearShown = 0;

  const relaxPattern = new Map<string, number>();
  const exactZeroList: {
    phone: string;
    budget: BudgetId;
    types: string;
    softCount: number;
  }[] = [];

  const started = Date.now();

  for (const phone of phones) {
    const phoneCases = casesByPhone.get(phone.id) ?? [];
    const weight = Math.max(1, phoneCases.length);

    for (const caseTypes of caseTypeCombos) {
      for (const budget of budgets) {
        const answers: QuizAnswers = {
          phoneId: phone.id,
          priorities: [...fixedPriorities],
          caseTypes,
          budget,
        };

        // 厳密: タイプ + 予算距離0
        let exact = 0;
        let soft = 0;
        for (const c of phoneCases) {
          if (
            matchesHardFilters(c, answers, {
              budgetMaxDistance: 0,
              caseTypes: true,
            })
          ) {
            exact++;
          }
          if (
            matchesHardFilters(c, answers, {
              budgetMaxDistance: 1,
              caseTypes: true,
            })
          ) {
            soft++;
          }
        }
        exactDist[bucket(exact)]++;
        softDist[bucket(soft)]++;

        if (exact === 0) {
          exactZeroList.push({
            phone: phone.name,
            budget,
            types: typeKeyOf(caseTypes),
            softCount: soft,
          });
        }

        const result = recommendCases(phoneCases, answers);
        finalDist[bucket(result.items.length)]++;
        weightedTotal += weight;
        if (result.filterRelaxed) {
          relaxedCount++;
          weightedRelaxed += weight;
          const pattern = `${phone.name} | ${budget} | ${typeKeyOf(caseTypes)}`;
          relaxPattern.set(pattern, (relaxPattern.get(pattern) ?? 0) + 1);
        }
        if (result.relaxed) {
          nearShownCount++;
          weightedNearShown += weight;
        }
        if (result.items.length < 3) belowMinFinal++;
      }
    }
  }

  const pct = (n: number) => ((n / totalCombos) * 100).toFixed(2);
  const wpct = (n: number) =>
    weightedTotal === 0 ? "0.00" : ((n / weightedTotal) * 100).toFixed(2);

  console.log(`elapsed: ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log("");
  console.log("--- Exact match (type + budget distance 0) ---");
  console.log(
    `0件: ${exactDist["0"].toLocaleString()} (${pct(exactDist["0"])}%)`,
  );
  console.log(
    `1-2件: ${exactDist["1-2"].toLocaleString()} (${pct(exactDist["1-2"])}%)`,
  );
  console.log(
    `3件以上: ${exactDist["3+"].toLocaleString()} (${pct(exactDist["3+"])}%)`,
  );
  console.log("");
  console.log("--- Soft pool (type + budget distance ≤1) ---");
  console.log(
    `0件: ${softDist["0"].toLocaleString()} (${pct(softDist["0"])}%)`,
  );
  console.log(
    `1-2件: ${softDist["1-2"].toLocaleString()} (${pct(softDist["1-2"])}%)`,
  );
  console.log(
    `3件以上: ${softDist["3+"].toLocaleString()} (${pct(softDist["3+"])}%)`,
  );
  console.log("");
  console.log("--- recommendCases 最終結果 ---");
  console.log(
    `0件: ${finalDist["0"].toLocaleString()} (${pct(finalDist["0"])}%)`,
  );
  console.log(
    `1-2件: ${finalDist["1-2"].toLocaleString()} (${pct(finalDist["1-2"])}%)`,
  );
  console.log(
    `3件以上: ${finalDist["3+"].toLocaleString()} (${pct(finalDist["3+"])}%)`,
  );
  console.log(
    `フィルタ緩和発生: ${relaxedCount.toLocaleString()} (${pct(relaxedCount)}%)`,
  );
  console.log(
    `フィルタ緩和(ケース数重み付け): ${wpct(weightedRelaxed)}%`,
  );
  console.log(
    `near表示(UIバナー相当): ${nearShownCount.toLocaleString()} (${pct(nearShownCount)}%)`,
  );
  console.log(
    `near表示(ケース数重み付け): ${wpct(weightedNearShown)}%`,
  );
  console.log(
    `最終が最低3件未満: ${belowMinFinal.toLocaleString()} (${pct(belowMinFinal)}%)`,
  );
  console.log("");

  console.log("--- フィルタ緩和パターン Top15 (phone × budget × types) ---");
  for (const [pattern, count] of [...relaxPattern.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)) {
    console.log(`  ${count}× ${pattern}`);
  }
  console.log("");

  console.log("--- 厳密0件 Top20 ---");
  for (const row of exactZeroList
    .sort((a, b) => a.softCount - b.softCount)
    .slice(0, 20)) {
    console.log(
      `  ${row.phone} | ${row.budget} | ${row.types} | soft≤1=${row.softCount}`,
    );
  }
}

main();
