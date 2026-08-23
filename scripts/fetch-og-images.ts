import { createClient } from "@supabase/supabase-js";

type TableName = "phones" | "cases";

type RowToFetch = {
  id: string;
  name: string;
  url: string | null;
};

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

async function fetchRowsWithoutImage(
  table: TableName,
): Promise<RowToFetch[]> {
  const { data, error } = await supabase
    .from(table)
    .select("id, name, url")
    .is("image_url", null);

  if (error) {
    console.error(`${table} の取得に失敗:`, error.message);
    return [];
  }

  return (data ?? []) as RowToFetch[];
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

async function processTable(table: TableName): Promise<void> {
  const rows = await fetchRowsWithoutImage(table);
  console.log(`\n${table}: ${rows.length} 件を処理します`);

  for (const row of rows) {
    if (!row.url?.trim()) {
      console.log(
        `[skip] ${table}/${row.id} (${row.name}): url が未設定`,
      );
      continue;
    }

    const { imageUrl, reason } = await fetchOgImage(row.url);

    if (!imageUrl) {
      console.log(
        `[skip] ${table}/${row.id} (${row.name}): ${row.url} — ${reason}`,
      );
      await sleep(500);
      continue;
    }

    const updated = await updateImageUrl(table, row.id, imageUrl);

    if (updated) {
      console.log(`[ok] ${table}/${row.id} (${row.name}): ${imageUrl}`);
    }

    await sleep(500);
  }
}

async function main(): Promise<void> {
  console.log("OGP 画像の取得を開始します...");
  await processTable("phones");
  await processTable("cases");
  console.log("\n完了しました。");
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
