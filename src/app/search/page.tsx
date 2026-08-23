export const dynamic = "force-dynamic";

import Link from "next/link";

import { supabase } from "@/lib/supabase";
import type { Case, Phone } from "@/types/database";

type CaseWithPhone = Case & {
  phones: Pick<Phone, "name"> | null;
};

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function getQuery(q: string | string[] | undefined): string {
  if (Array.isArray(q)) {
    return q[0]?.trim() ?? "";
  }
  return q?.trim() ?? "";
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

async function searchPhones(keyword: string): Promise<Phone[]> {
  const { data, error } = await supabase
    .from("phones")
    .select("*")
    .ilike("name", `%${keyword}%`);

  if (error) {
    console.error("Failed to search phones:", error);
    return [];
  }

  return data ?? [];
}

async function searchCases(keyword: string): Promise<CaseWithPhone[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*, phones(name)")
    .or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%`);

  if (error) {
    console.error("Failed to search cases:", error);
    return [];
  }

  return (data as CaseWithPhone[] | null) ?? [];
}

export default async function SearchPage({ searchParams }: PageProps) {
  const keyword = getQuery((await searchParams).q);

  if (!keyword) {
    return (
      <div className="flex flex-1 flex-col px-6 py-10">
        <main className="mx-auto w-full max-w-6xl">
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
            検索キーワードを入力してください
          </p>
        </main>
      </div>
    );
  }

  const [phones, cases] = await Promise.all([
    searchPhones(keyword),
    searchCases(keyword),
  ]);

  const hasResults = phones.length > 0 || cases.length > 0;

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-6xl">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          「{keyword}」の検索結果
        </h1>

        {!hasResults ? (
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
            一致する結果が見つかりませんでした
          </p>
        ) : (
          <div className="space-y-10">
            {phones.length > 0 && (
              <section aria-labelledby="phones-heading">
                <h2
                  id="phones-heading"
                  className="mb-4 text-xl font-medium text-gray-900"
                >
                  対応機種
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {phones.map((phone) => (
                    <li key={phone.id}>
                      <Link
                        href={`/phones/${phone.id}`}
                        className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                      >
                        <h3 className="mb-2 text-lg font-medium tracking-tight text-gray-900">
                          {phone.name}
                        </h3>
                        <dl className="space-y-1 text-sm text-gray-600">
                          <div className="flex gap-2">
                            <dt className="font-medium text-gray-500">
                              メーカー
                            </dt>
                            <dd>{phone.maker}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="font-medium text-gray-500">発売年</dt>
                            <dd className="font-medium tracking-tight">
                              {phone.released_year}年
                            </dd>
                          </div>
                        </dl>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {cases.length > 0 && (
              <section aria-labelledby="cases-heading">
                <h2
                  id="cases-heading"
                  className="mb-4 text-xl font-medium text-gray-900"
                >
                  ケース
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cases.map((caseItem) => (
                    <li key={caseItem.id}>
                      <Link
                        href={`/phones/${caseItem.phone_id}`}
                        className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                      >
                        <h3 className="mb-2 text-lg font-medium tracking-tight text-gray-900">
                          {caseItem.name}
                        </h3>
                        <dl className="space-y-1 text-sm text-gray-600">
                          <div className="flex gap-2">
                            <dt className="font-medium text-gray-500">
                              ブランド
                            </dt>
                            <dd>{caseItem.brand}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="font-medium text-gray-500">価格</dt>
                            <dd className="font-medium tracking-tight">
                              {formatPrice(caseItem.price)}
                            </dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="font-medium text-gray-500">端末</dt>
                            <dd>{caseItem.phones?.name ?? "—"}</dd>
                          </div>
                        </dl>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
