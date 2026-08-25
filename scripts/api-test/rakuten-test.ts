import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/** 機種名を変えるときはここを編集 */
const KEYWORD = "iPhone 17 ケース";

// 20220601 は新基盤で "API Configuration not found" になるため最新版を使用
const ENDPOINT =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";

/** 楽天アプリの「許可されたWebサイト」と一致させる（未設定時のデフォルト） */
const DEFAULT_REFERER = "https://smartphone-case-comp-site.vercel.app/";

const OUTPUT_DIR = path.join(import.meta.dirname, "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "rakuten-response.json");

function hasField(obj: any, field: string): boolean {
  return obj != null && Object.prototype.hasOwnProperty.call(obj, field);
}

function formatPresence(obj: any, field: string): string {
  if (!hasField(obj, field)) return "なし（フィールド欠落）";
  const value = obj[field];
  if (value == null || value === "") return "あり（値は空）";
  return `あり（値: ${value}）`;
}

async function main() {
  const applicationId = process.env.RAKUTEN_APP_ID;
  if (!applicationId) {
    console.error(
      "エラー: RAKUTEN_APP_ID が設定されていません。.env.local に追記してください。",
    );
    process.exit(1);
  }

  // 新エンドポイント（UUID形式のアプリID）では accessKey が必須
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  if (!accessKey) {
    console.error(
      "エラー: RAKUTEN_ACCESS_KEY が設定されていません。.env.local に追記してください。",
    );
    console.error(
      "（Rakuten Developers で発行した accessKey / pk_ で始まるキー）",
    );
    process.exit(1);
  }

  // 新APIは Referer + Origin 必須。許可ドメインはアプリ設定と一致させる
  const referer = (process.env.RAKUTEN_REFERER || DEFAULT_REFERER).replace(
    /\/?$/,
    "/",
  );
  const origin = referer.replace(/\/$/, "");

  const params = new URLSearchParams({
    applicationId,
    accessKey,
    keyword: KEYWORD,
    hits: "30",
    format: "json",
  });

  const url = `${ENDPOINT}?${params.toString()}`;
  console.log(`検索キーワード: ${KEYWORD}`);
  console.log(`リクエスト: ${ENDPOINT}`);
  console.log(`Referer: ${referer}`);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Referer: referer,
        Origin: origin,
        "User-Agent": "phone-case-compare/0.1",
      },
    });
  } catch (err) {
    console.error("エラー: 楽天APIへのリクエストに失敗しました。", err);
    process.exit(1);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    console.error(
      `エラー: JSONのパースに失敗しました (HTTP ${response.status})`,
    );
    process.exit(1);
  }

  if (!response.ok || data.error || data.errors) {
    const desc =
      data.errors?.errorMessage ||
      data.error_description ||
      data.error ||
      JSON.stringify(data, null, 2);
    console.error(
      `エラー: 楽天APIがエラーを返しました (HTTP ${response.status})`,
    );
    console.error(desc);
    if (
      String(desc).includes("REFERRER_NOT_ALLOWED") ||
      String(desc).includes("REFERRER_MISSING")
    ) {
      console.error(
        "ヒント: Rakuten Developers のアプリ設定で「許可されたWebサイト」に登録したURLを、",
      );
      console.error(
        "      .env.local の RAKUTEN_REFERER に設定してください（例: https://your-site.example/）。",
      );
    }
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(`レスポンスを保存しました: ${OUTPUT_FILE}`);

  const count = data.count ?? data.Items?.length ?? 0;
  console.log(`\nヒット件数: ${count}`);

  const items: any[] = Array.isArray(data.Items) ? data.Items : [];
  const sample = items.slice(0, 3);

  if (sample.length === 0) {
    console.log("該当商品がありません。");
    return;
  }

  console.log("\n--- 最初の3件 ---");
  let anyHasJanCodeField = false;
  let anyHasJanCodeValue = false;

  for (let i = 0; i < sample.length; i++) {
    const item = sample[i]?.Item ?? sample[i] ?? {};
    const hasJanField = hasField(item, "janCode");
    const janValue = item.janCode;
    if (hasJanField) anyHasJanCodeField = true;
    if (janValue) anyHasJanCodeValue = true;

    console.log(`\n[${i + 1}]`);
    console.log(`  商品名: ${item.itemName ?? "(なし)"}`);
    console.log(`  価格: ${item.itemPrice ?? "(なし)"}`);
    console.log(`  URL: ${item.itemUrl ?? "(なし)"}`);
    console.log(`  ショップ名: ${item.shopName ?? "(なし)"}`);
    console.log(`  itemCode: ${formatPresence(item, "itemCode")}`);
    console.log(`  janCode: ${formatPresence(item, "janCode")}`);
  }

  console.log("\n--- JANコードフィールドのチェック ---");
  if (!anyHasJanCodeField) {
    console.warn(
      "警告: 最初の3件のいずれにも janCode フィールドが存在しません。",
    );
    console.warn(
      "      楽天市場商品検索APIでは janCode が返らない（または商品によって欠落する）可能性があります。",
    );
  } else if (!anyHasJanCodeValue) {
    console.warn(
      "警告: janCode フィールドはあるが、最初の3件すべてで値が空です。",
    );
  } else {
    console.log("情報: 最初の3件のうち、少なくとも1件に janCode の値があります。");
  }
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
