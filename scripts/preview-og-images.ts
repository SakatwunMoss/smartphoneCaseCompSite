import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { unparse } from "papaparse";

type TableName = "phones" | "cases";

type RowToFetch = {
  id: string;
  name: string;
  url: string | null;
  image_url: string | null;
};

type PreviewRow = {
  table: TableName;
  id: string;
  name: string;
  current_image_url: string;
  fetched_image_url: string;
  source_url: string;
};

const OUTPUT_PATH = join(
  process.cwd(),
  "scripts",
  "output",
  "og-image-preview.csv",
);

const fetchAll = process.argv.includes("--all");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY が設定されていません。.env.local に追記してください。",
  );
  process.exit(1);
}

if (!supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL が設定されていません。");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchOgImage(
  url: string,
): Promise<{ imageUrl: string | null; reason?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PhoneCaseCompareBot/1.0; +https://smartphone-case-comp-site.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return { imageUrl: null, reason: `HTTP ${response.status}` };
    }

    const html = await response.text();
    const imageUrl = extractOgImage(html);

    if (!imageUrl) {
      return { imageUrl: null, reason: "og:image タグが見つかりません" };
    }

    return { imageUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch エラー";
    return { imageUrl: null, reason: message };
  }
}

async function fetchRows(
  table: TableName,
  all: boolean,
): Promise<RowToFetch[]> {
  let query = supabase.from(table).select("id, name, url, image_url");

  if (!all) {
    query = query.is("image_url", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`${table} の取得に失敗:`, error.message);
    return [];
  }

  return (data ?? []) as RowToFetch[];
}

async function processTable(
  table: TableName,
): Promise<{ rows: PreviewRow[]; successCount: number; failureCount: number }> {
  const dbRows = await fetchRows(table, fetchAll);
  const previewRows: PreviewRow[] = [];
  let successCount = 0;
  let failureCount = 0;

  console.log(`\n${table}: ${dbRows.length} 件を処理します`);

  for (const row of dbRows) {
    const sourceUrl = row.url?.trim() ?? "";

    if (!sourceUrl) {
      previewRows.push({
        table,
        id: row.id,
        name: row.name,
        current_image_url: row.image_url ?? "",
        fetched_image_url: "",
        source_url: "",
      });
      failureCount += 1;
      continue;
    }

    const { imageUrl, reason } = await fetchOgImage(sourceUrl);

    if (!imageUrl) {
      console.log(
        `[fail] ${table}/${row.id} (${row.name}): ${sourceUrl} — ${reason}`,
      );
      previewRows.push({
        table,
        id: row.id,
        name: row.name,
        current_image_url: row.image_url ?? "",
        fetched_image_url: "",
        source_url: sourceUrl,
      });
      failureCount += 1;
    } else {
      console.log(`[ok] ${table}/${row.id} (${row.name}): ${imageUrl}`);
      previewRows.push({
        table,
        id: row.id,
        name: row.name,
        current_image_url: row.image_url ?? "",
        fetched_image_url: imageUrl,
        source_url: sourceUrl,
      });
      successCount += 1;
    }

    await sleep(500);
  }

  return { rows: previewRows, successCount, failureCount };
}

function writePreviewCsv(rows: PreviewRow[]): void {
  mkdirSync(join(process.cwd(), "scripts", "output"), { recursive: true });

  const csv = unparse(rows, {
    columns: [
      "table",
      "id",
      "name",
      "current_image_url",
      "fetched_image_url",
      "source_url",
    ],
    header: true,
  });

  writeFileSync(OUTPUT_PATH, csv, "utf8");
}

async function main(): Promise<void> {
  console.log(
    fetchAll
      ? "OGP 画像のプレビューを開始します（全件対象）..."
      : "OGP 画像のプレビューを開始します（image_url 未設定のみ）...",
  );

  const phonesResult = await processTable("phones");
  const casesResult = await processTable("cases");

  const allRows = [...phonesResult.rows, ...casesResult.rows];
  writePreviewCsv(allRows);

  const targetCount = allRows.length;
  const successCount = phonesResult.successCount + casesResult.successCount;
  const failureCount = phonesResult.failureCount + casesResult.failureCount;

  console.log("\n--- サマリー ---");
  console.log(`対象件数: ${targetCount}`);
  console.log(`取得成功件数: ${successCount}`);
  console.log(`取得失敗件数: ${failureCount}`);
  console.log(`\nCSV を出力しました: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
