// phones / cases / marketplace_offers をネストした
// src/data/catalog.json に静的出力する。
// 日次同期バッチの後に実行し、Vercel ビルド用のソースにする。
//
// 実行方法:
//   node scripts/export-catalog-json.mjs
//
// 環境変数:
//   SUPABASE_URL               Supabaseプロジェクトの URL
//                              （未設定時は NEXT_PUBLIC_SUPABASE_URL を利用）
//   SUPABASE_SERVICE_ROLE_KEY  全件取得用（未設定時は NEXT_PUBLIC_SUPABASE_ANON_KEY）

import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
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

const SUPABASE_URL =
  process.env.SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const OUTPUT_PATH = resolve(process.cwd(), "src/data/catalog.json");
const PAGE_SIZE = 1000;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "環境変数 SUPABASE_URL（または NEXT_PUBLIC_SUPABASE_URL）と、" +
      "SUPABASE_SERVICE_ROLE_KEY（または NEXT_PUBLIC_SUPABASE_ANON_KEY）が必要です",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchAll(table, orderColumns = []) {
  const rows = [];
  let from = 0;

  for (;;) {
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from(table).select("*").range(from, to);
    for (const col of orderColumns) {
      query = query.order(col.column, {
        ascending: col.ascending !== false,
      });
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`${table} fetch failed: ${error.message}`);
    }

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }
    from += PAGE_SIZE;
  }

  return rows;
}

function byPriceAsc(a, b) {
  return a.price - b.price || String(a.name).localeCompare(String(b.name), "ja");
}

async function main() {
  console.log("Exporting catalog →", OUTPUT_PATH);

  const [phones, cases, offers] = await Promise.all([
    fetchAll("phones", [{ column: "name", ascending: true }]),
    fetchAll("cases", [{ column: "price", ascending: true }]),
    fetchAll("marketplace_offers", [{ column: "price", ascending: true }]),
  ]);

  const casesByPhone = new Map();
  for (const row of cases) {
    const list = casesByPhone.get(row.phone_id) ?? [];
    list.push(row);
    casesByPhone.set(row.phone_id, list);
  }

  const offersByPhone = new Map();
  for (const row of offers) {
    const list = offersByPhone.get(row.phone_id) ?? [];
    list.push(row);
    offersByPhone.set(row.phone_id, list);
  }

  const nestedPhones = phones.map((phone) => ({
    ...phone,
    cases: (casesByPhone.get(phone.id) ?? []).slice().sort(byPriceAsc),
    marketplace_offers: (offersByPhone.get(phone.id) ?? [])
      .slice()
      .sort(byPriceAsc),
  }));

  const payload = {
    generated_at: new Date().toISOString(),
    count: {
      phones: phones.length,
      cases: cases.length,
      marketplace_offers: offers.length,
    },
    phones: nestedPhones,
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

  console.log(
    `Wrote catalog: phones=${payload.count.phones}, cases=${payload.count.cases}, marketplace_offers=${payload.count.marketplace_offers} (generated_at=${payload.generated_at})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
