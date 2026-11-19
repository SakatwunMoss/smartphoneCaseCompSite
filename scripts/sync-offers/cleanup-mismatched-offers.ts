/**
 * 既存 marketplace_offers を新 matcher で再判定し、不一致分を削除する。
 *
 * デフォルトは dry-run（削除しない）:
 *   npx tsx scripts/sync-offers/cleanup-mismatched-offers.ts
 *   npm run cleanup:offers
 *
 * 削除を実行する場合:
 *   npx tsx --env-file=.env.local scripts/sync-offers/cleanup-mismatched-offers.ts --apply
 *   npm run cleanup:offers -- --apply
 *
 * dry-run は src/data/catalog.json を読む（ネットワーク不要）。
 * --apply 時は catalog で特定した id を Supabase から削除する。
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import {
  isMatchingPhoneModel,
  looksLikeStandalonePhoneMention,
} from "./matcher";

type OfferRow = {
  id: string;
  name: string;
  source: string;
  price: number;
};

type PhoneRow = {
  id: string;
  name: string;
  marketplace_offers: OfferRow[];
};

type Catalog = {
  phones: PhoneRow[];
};

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseApplyFlag(argv: string[]): boolean {
  return argv.includes("--apply");
}

function loadCatalog(): Catalog {
  const path = resolve(process.cwd(), "src/data/catalog.json");
  if (!existsSync(path)) {
    console.error(`catalog.json が見つかりません: ${path}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, "utf-8")) as Catalog;
}

function truncateName(name: string, max = 120): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

async function deleteOfferIds(ids: string[]): Promise<void> {
  loadEnvLocal();
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error(
      "エラー: --apply には SUPABASE_URL（または NEXT_PUBLIC_SUPABASE_URL）と SUPABASE_SERVICE_ROLE_KEY が必要です",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const chunkSize = 200;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("marketplace_offers")
      .delete()
      .in("id", chunk);
    if (error) {
      throw new Error(`削除失敗 (${chunk.length}件): ${error.message}`);
    }
    console.log(`削除済み: ${Math.min(i + chunk.length, ids.length)} / ${ids.length}`);
  }
}

async function main() {
  const apply = parseApplyFlag(process.argv.slice(2));
  const mode = apply ? "APPLY（削除実行）" : "DRY-RUN（削除しない）";
  console.log(`=== marketplace_offers 再判定クリーンアップ: ${mode} ===\n`);

  const catalog = loadCatalog();
  const allDeleteIds: string[] = [];

  type PhoneReport = {
    name: string;
    current: number;
    keep: number;
    remove: number;
    samples: string[];
    suspicious: string[];
  };

  const reports: PhoneReport[] = [];
  let totalCurrent = 0;
  let totalKeep = 0;
  let totalRemove = 0;
  let totalSuspicious = 0;

  for (const phone of catalog.phones) {
    const offers = phone.marketplace_offers ?? [];
    const toRemove: OfferRow[] = [];
    const toKeep: OfferRow[] = [];
    const suspicious: OfferRow[] = [];

    for (const offer of offers) {
      if (isMatchingPhoneModel(phone.name, offer.name)) {
        toKeep.push(offer);
      } else {
        toRemove.push(offer);
        if (looksLikeStandalonePhoneMention(phone.name, offer.name)) {
          suspicious.push(offer);
        }
      }
    }

    totalCurrent += offers.length;
    totalKeep += toKeep.length;
    totalRemove += toRemove.length;
    totalSuspicious += suspicious.length;
    allDeleteIds.push(...toRemove.map((o) => o.id));

    reports.push({
      name: phone.name,
      current: offers.length,
      keep: toKeep.length,
      remove: toRemove.length,
      samples: toRemove.slice(0, 10).map((o) => truncateName(o.name)),
      suspicious: suspicious.slice(0, 10).map((o) => truncateName(o.name)),
    });
  }

  for (const r of reports) {
    console.log(
      `【${r.name}】 ${r.current} → 残る ${r.keep} / 削除 ${r.remove}` +
        (r.suspicious.length > 0
          ? ` （うち誤削除候補 ${r.suspicious.length}件+）`
          : ""),
    );
    if (r.remove > 0) {
      console.log("  削除サンプル:");
      for (const name of r.samples) {
        console.log(`    - ${name}`);
      }
    }
    if (r.suspicious.length > 0) {
      console.log(
        "  ⚠ 誤削除の候補（機種名・世代番号が単体で現れていそう）:",
      );
      for (const name of r.suspicious) {
        console.log(`    - ${name}`);
      }
    }
    console.log("");
  }

  console.log("--- サマリー ---");
  console.log(`機種数: ${reports.length}`);
  console.log(
    `offers: 現在 ${totalCurrent} → 残る ${totalKeep} / 削除 ${totalRemove}`,
  );
  console.log(`誤削除候補（単体出現に見える削除）: ${totalSuspicious}`);

  if (!apply) {
    console.log(
      "\n削除は実行していません。問題なければ --apply を付けて再実行してください。",
    );
    return;
  }

  if (allDeleteIds.length === 0) {
    console.log("\n削除対象はありません。");
    return;
  }

  console.log(`\nSupabase から ${allDeleteIds.length} 件を削除します…`);
  await deleteOfferIds(allDeleteIds);
  console.log("削除完了。続けて npm run export:catalog を実行してください。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
