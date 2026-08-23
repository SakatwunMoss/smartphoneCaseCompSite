import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { parse } from "papaparse";

type TableName = "phones" | "cases";

type PreviewRow = {
  table: TableName;
  id: string;
  name: string;
  current_image_url: string;
  fetched_image_url: string;
  source_url: string;
};

const INPUT_PATH = join(
  process.cwd(),
  "scripts",
  "output",
  "og-image-preview.csv",
);

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

function isTableName(value: string): value is TableName {
  return value === "phones" || value === "cases";
}

function readPreviewCsv(): PreviewRow[] {
  let content: string;

  try {
    content = readFileSync(INPUT_PATH, "utf8");
  } catch {
    console.error(`CSV が見つかりません: ${INPUT_PATH}`);
    console.error("先に npm run preview-images を実行してください。");
    process.exit(1);
  }

  const parsed = parse<PreviewRow>(content, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("CSV の読み込みに失敗しました:", parsed.errors[0]?.message);
    process.exit(1);
  }

  return parsed.data;
}

async function updateImageUrl(
  table: TableName,
  id: string,
  imageUrl: string,
): Promise<boolean> {
  const { error } = await supabase
    .from(table)
    .update({ image_url: imageUrl })
    .eq("id", id);

  if (error) {
    console.error(`${table}/${id} の更新に失敗:`, error.message);
    return false;
  }

  return true;
}

async function main(): Promise<void> {
  const rows = readPreviewCsv();
  const rowsToApply = rows.filter((row) => row.fetched_image_url?.trim());

  console.log(`反映対象: ${rowsToApply.length} 件`);

  let appliedCount = 0;

  for (const row of rowsToApply) {
    if (!isTableName(row.table)) {
      console.error(`[skip] 不明な table 値: ${row.table} (id: ${row.id})`);
      continue;
    }

    const updated = await updateImageUrl(
      row.table,
      row.id,
      row.fetched_image_url.trim(),
    );

    if (updated) {
      console.log(`[ok] ${row.table}/${row.id} (${row.name})`);
      appliedCount += 1;
    }
  }

  console.log(`\n反映件数: ${appliedCount}`);
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
