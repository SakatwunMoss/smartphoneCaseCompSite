/**
 * phones テーブルの各機種について、楽天・Yahoo からケース商品を検索し
 * marketplace_offers に upsert するバッチ。
 *
 * 事前に以下のユニーク制約が必要（未追加なら実行すること）:
 *
 *   alter table marketplace_offers
 *     add constraint marketplace_offers_unique
 *     unique (phone_id, source, item_code);
 *
 * 使い方:
 *   npm run sync:offers
 *   npm run sync:offers -- --phone="iPhone 17"
 */

import { createClient } from "@supabase/supabase-js";
import { fetchRakutenOffers } from "./rakuten";
import { fetchYahooOffers } from "./yahoo";

interface PhoneRow {
  id: string;
  name: string;
}

interface OfferRow {
  phone_id: string;
  source: "rakuten" | "yahoo";
  item_code: string;
  name: string;
  brand: string | null;
  price: number;
  url: string;
  image_url: string | null;
  review_count: number | null;
  review_rate: number | null;
  fetched_at: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `エラー: ${name} が設定されていません。.env.local を確認してください。`,
    );
    process.exit(1);
  }
  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** --phone="iPhone 17" または --phone=iPhone\ 17 をパース */
function parsePhoneFilter(argv: string[]): string | null {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--phone=")) {
      return arg.slice("--phone=".length).replace(/^["']|["']$/g, "");
    }
    if (arg === "--phone" && argv[i + 1]) {
      return argv[i + 1].replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

async function main() {
  // 起動時に必須環境変数を検証（楽天 accessKey も新APIでは必須）
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  requireEnv("RAKUTEN_APP_ID");
  requireEnv("RAKUTEN_ACCESS_KEY");
  requireEnv("YAHOO_CLIENT_ID");

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const phoneFilter = parsePhoneFilter(process.argv.slice(2));

  let query = supabase.from("phones").select("id, name").order("name");

  if (phoneFilter) {
    // 部分一致でデバッグ用に絞り込み（例: --phone="iPhone 17"）
    query = query.ilike("name", `%${phoneFilter}%`);
    console.log(`機種フィルタ: "${phoneFilter}"`);
  }

  const { data: phones, error: phonesError } = await query;

  if (phonesError) {
    console.error("phones の取得に失敗しました:", phonesError.message);
    process.exit(1);
  }

  if (!phones || phones.length === 0) {
    console.log("処理対象の機種がありません。");
    return;
  }

  console.log(`処理対象: ${phones.length} 機種\n`);

  let totalRakuten = 0;
  let totalYahoo = 0;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < phones.length; i++) {
    const phone = phones[i] as PhoneRow;
    const keyword = `${phone.name} ケース`;

    try {
      // 片方のAPIが失敗しても、もう片方の結果は保存する
      const [rakutenResult, yahooResult] = await Promise.allSettled([
        fetchRakutenOffers(keyword),
        fetchYahooOffers(keyword),
      ]);

      const rakutenOffers =
        rakutenResult.status === "fulfilled" ? rakutenResult.value : [];
      const yahooOffers =
        yahooResult.status === "fulfilled" ? yahooResult.value : [];

      if (rakutenResult.status === "rejected") {
        const msg =
          rakutenResult.reason instanceof Error
            ? rakutenResult.reason.message
            : String(rakutenResult.reason);
        console.error(`${phone.name}: 楽天エラー — ${msg}`);
      }
      if (yahooResult.status === "rejected") {
        const msg =
          yahooResult.reason instanceof Error
            ? yahooResult.reason.message
            : String(yahooResult.reason);
        console.error(`${phone.name}: Yahooエラー — ${msg}`);
      }

      const fetchedAt = new Date().toISOString();
      const rows: OfferRow[] = [
        ...rakutenOffers.map((o) => ({
          phone_id: phone.id,
          ...o,
          fetched_at: fetchedAt,
        })),
        ...yahooOffers.map((o) => ({
          phone_id: phone.id,
          ...o,
          fetched_at: fetchedAt,
        })),
      ];

      if (rows.length > 0) {
        const { error: upsertError } = await supabase
          .from("marketplace_offers")
          .upsert(rows, {
            onConflict: "phone_id,source,item_code",
          });

        if (upsertError) {
          throw new Error(`upsert失敗: ${upsertError.message}`);
        }
      }

      // 両方のAPIが失敗した場合のみ機種単位の失敗とする
      if (
        rakutenResult.status === "rejected" &&
        yahooResult.status === "rejected"
      ) {
        errorCount += 1;
      } else {
        successCount += 1;
        totalRakuten += rakutenOffers.length;
        totalYahoo += yahooOffers.length;
      }

      console.log(
        `${phone.name}: 楽天${rakutenOffers.length}件、Yahoo${yahooOffers.length}件 保存`,
      );
    } catch (err) {
      errorCount += 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`${phone.name}: エラー — ${message}`);
    }

    // レート制限対策: 最後の機種以外は1秒待機
    if (i < phones.length - 1) {
      await sleep(1000);
    }
  }

  console.log("\n--- サマリー ---");
  console.log(`成功: ${successCount} 機種 / 失敗: ${errorCount} 機種`);
  console.log(`合計: 楽天 ${totalRakuten} 件、Yahoo ${totalYahoo} 件`);
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
