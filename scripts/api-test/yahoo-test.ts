import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/** 機種名を変えるときはここを編集 */
const QUERY = "iPhone 17 ケース";

const ENDPOINT =
  "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";

const OUTPUT_DIR = path.join(import.meta.dirname, "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "yahoo-response.json");

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
  const clientId = process.env.YAHOO_CLIENT_ID;
  if (!clientId) {
    console.error(
      "エラー: YAHOO_CLIENT_ID が設定されていません。.env.local に追記してください。",
    );
    process.exit(1);
  }

  const params = new URLSearchParams({
    appid: clientId,
    query: QUERY,
    results: "30",
  });

  const url = `${ENDPOINT}?${params.toString()}`;
  console.log(`検索クエリ: ${QUERY}`);
  console.log(`リクエスト: ${ENDPOINT}`);

  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    console.error(
      "エラー: Yahoo!ショッピングAPIへのリクエストに失敗しました。",
      err,
    );
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

  // Yahoo API はエラー時に Error / error オブジェクトを返すことがある
  if (
    !response.ok ||
    data.Error ||
    data.error ||
    data["Error/Message"] ||
    (typeof data.Message === "string" && !data.hits)
  ) {
    const desc =
      data.Error?.Message ||
      data.error?.message ||
      data["Error/Message"] ||
      data.Message ||
      JSON.stringify(data, null, 2);
    console.error(
      `エラー: Yahoo!ショッピングAPIがエラーを返しました (HTTP ${response.status})`,
    );
    console.error(desc);
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(`レスポンスを保存しました: ${OUTPUT_FILE}`);

  const count = data.totalResultsAvailable ?? data.hits?.length ?? 0;
  console.log(`\nヒット件数: ${count}`);

  const hits: any[] = Array.isArray(data.hits) ? data.hits : [];
  const sample = hits.slice(0, 3);

  if (sample.length === 0) {
    console.log("該当商品がありません。");
    return;
  }

  console.log("\n--- 最初の3件 ---");
  let anyHasJanCodeField = false;
  let anyHasJanCodeValue = false;

  for (let i = 0; i < sample.length; i++) {
    const item = sample[i] ?? {};
    const hasJanField = hasField(item, "janCode");
    const janValue = item.janCode;
    if (hasJanField) anyHasJanCodeField = true;
    if (janValue) anyHasJanCodeValue = true;

    const storeName =
      item.seller?.name ?? item.store?.name ?? item.storeName ?? "(なし)";
    const storeId =
      item.seller?.sellerId ?? item.store?.id ?? item.storeId ?? "(なし)";

    console.log(`\n[${i + 1}]`);
    console.log(`  商品名: ${item.name ?? "(なし)"}`);
    console.log(`  価格: ${item.price ?? "(なし)"}`);
    console.log(`  URL: ${item.url ?? "(なし)"}`);
    console.log(`  ストア名: ${storeName}`);
    console.log(`  ストアID: ${storeId}`);
    console.log(`  janCode: ${formatPresence(item, "janCode")}`);
  }

  console.log("\n--- JANコードフィールドのチェック ---");
  if (!anyHasJanCodeField) {
    console.warn(
      "警告: 最初の3件のいずれにも janCode フィールドが存在しません。",
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
