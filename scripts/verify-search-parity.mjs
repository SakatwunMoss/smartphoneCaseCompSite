/**
 * Supabase ilike（現行相当 / 全件ページネーション）と
 * JS 正規化検索（catalog）のパリティ比較。
 *
 * 実行: node --import tsx scripts/verify-search-parity.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import {
  normalizeSearchText,
  searchCases,
  searchPhones,
} from "../src/lib/catalog.ts";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const PAGE_SIZE = 1000;

async function fetchAll(table, buildQuery) {
  const rows = [];
  let from = 0;
  for (;;) {
    const to = from + PAGE_SIZE - 1;
    let query = buildQuery(supabase.from(table)).range(from, to);
    const { data, error } = await query;
    if (error) throw new Error(`${table}: ${error.message}`);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

/** 旧実装相当: ページネーションなし（最大1000件） */
async function searchIlikeLegacy(keyword) {
  const pattern = `%${keyword}%`;
  const [phones, cases, offers] = await Promise.all([
    supabase.from("phones").select("id").ilike("name", pattern),
    supabase
      .from("cases")
      .select("id")
      .or(`name.ilike.${pattern},brand.ilike.${pattern}`),
    supabase
      .from("marketplace_offers")
      .select("id")
      .or(`name.ilike.${pattern},brand.ilike.${pattern}`),
  ]);
  if (phones.error) throw phones.error;
  if (cases.error) throw cases.error;
  if (offers.error) throw offers.error;
  return {
    phones: (phones.data ?? []).map((r) => r.id),
    cases: (cases.data ?? []).map((r) => r.id),
    offers: (offers.data ?? []).map((r) => r.id),
  };
}

/** 全件ページネーション付き ilike */
async function searchIlikeFull(keyword) {
  const pattern = `%${keyword}%`;
  const [phones, cases, offers] = await Promise.all([
    fetchAll("phones", (q) => q.select("id").ilike("name", pattern)),
    fetchAll("cases", (q) =>
      q.select("id").or(`name.ilike.${pattern},brand.ilike.${pattern}`),
    ),
    fetchAll("marketplace_offers", (q) =>
      q.select("id").or(`name.ilike.${pattern},brand.ilike.${pattern}`),
    ),
  ]);
  return {
    phones: phones.map((r) => r.id),
    cases: cases.map((r) => r.id),
    offers: offers.map((r) => r.id),
  };
}

function jsSearch(keyword) {
  const phones = searchPhones(keyword).map((p) => p.id);
  const items = searchCases(keyword);
  return {
    phones,
    cases: items.filter((i) => i.source === "other").map((i) => i.id),
    offers: items
      .filter((i) => i.source === "rakuten" || i.source === "yahoo")
      .map((i) => i.id),
  };
}

function diffIds(label, a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const onlyA = [...setA].filter((id) => !setB.has(id));
  const onlyB = [...setB].filter((id) => !setA.has(id));
  return {
    label,
    a: setA.size,
    b: setB.size,
    onlyA: onlyA.length,
    onlyB: onlyB.length,
    match: onlyA.length === 0 && onlyB.length === 0,
  };
}

const KEYWORDS = [
  { label: "半角英字", q: "Apple" },
  { label: "全角英字", q: "Ａｐｐｌｅ" },
  { label: "大文字", q: "SPIGEN" },
  { label: "小文字", q: "spigen" },
  { label: "ひらがな", q: "あいふぇいす" },
  { label: "カタカナ", q: "アイフェイス" },
  { label: "ブランド部分一致", q: "iFace" },
  { label: "機種名部分一致", q: "iPhone 17" },
  { label: "機種短縮", q: "Pixel" },
  { label: "汎用ケース語", q: "クリア" },
  { label: "耐衝撃", q: "耐衝撃" },
];

async function main() {
  console.log("normalize sample:", {
    Apple: normalizeSearchText("Apple"),
    fullwidth: normalizeSearchText("Ａｐｐｌｅ"),
    hira: normalizeSearchText("あいふぇいす"),
    kata: normalizeSearchText("アイフェイス"),
  });

  const rows = [];
  for (const { label, q } of KEYWORDS) {
    const js = jsSearch(q);
    const legacy = await searchIlikeLegacy(q);
    const full = await searchIlikeFull(q);

    const jsCaseTotal = js.cases.length + js.offers.length;
    const legacyCaseTotal = legacy.cases.length + legacy.offers.length;
    const fullCaseTotal = full.cases.length + full.offers.length;

    rows.push({
      label,
      q,
      js: {
        phones: js.phones.length,
        cases: js.cases.length,
        offers: js.offers.length,
        caseTotal: jsCaseTotal,
      },
      ilike_legacy_max1000: {
        phones: legacy.phones.length,
        cases: legacy.cases.length,
        offers: legacy.offers.length,
        caseTotal: legacyCaseTotal,
      },
      ilike_full: {
        phones: full.phones.length,
        cases: full.cases.length,
        offers: full.offers.length,
        caseTotal: fullCaseTotal,
      },
      vs_full_phones: diffIds("phones", js.phones, full.phones),
      vs_full_cases: diffIds("cases", js.cases, full.cases),
      vs_full_offers: diffIds("offers", js.offers, full.offers),
      newly_visible_vs_legacy: {
        offers_js_minus_legacy: js.offers.filter(
          (id) => !new Set(legacy.offers).has(id),
        ).length,
        offers_full_minus_legacy: full.offers.filter(
          (id) => !new Set(legacy.offers).has(id),
        ).length,
      },
    });
  }

  console.log(JSON.stringify(rows, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
