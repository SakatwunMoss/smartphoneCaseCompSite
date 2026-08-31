export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseSearchResults } from "@/components/CaseSearchResults";
import type { CaseSearchItem } from "@/lib/case-search-filters";
import { buildPageMetadata } from "@/lib/metadata";
import { supabase } from "@/lib/supabase";
import type { Case, MarketplaceOffer, Phone } from "@/types/database";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const keyword = getQuery((await searchParams).q);

  // title/description はキーワードで変えるが、canonical は常にクエリなし
  if (!keyword) {
    return buildPageMetadata({
      title: "検索 | Phone Case Compare",
      description: "端末名・ケース名でスマホケースを検索",
      path: "/search",
    });
  }

  return buildPageMetadata({
    title: `「${keyword}」の検索結果 | Phone Case Compare`,
    description: `「${keyword}」に一致する端末・ケースの検索結果`,
    path: "/search",
  });
}

function getQuery(q: string | string[] | undefined): string {
  if (Array.isArray(q)) {
    return q[0]?.trim() ?? "";
  }
  return q?.trim() ?? "";
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

async function searchOtherCases(keyword: string): Promise<CaseSearchItem[]> {
  type CaseRow = Case & {
    phones: Pick<Phone, "name"> | null;
  };

  const { data, error } = await supabase
    .from("cases")
    .select("*, phones(name)")
    .or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%`);

  if (error) {
    console.error("Failed to search cases:", error);
    return [];
  }

  return ((data as CaseRow[] | null) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: row.price,
    phone_id: row.phone_id,
    phone_name: row.phones?.name ?? null,
    source: "other" as const,
    url: row.url?.trim() || null,
    image_url: row.image_url?.trim() || null,
    review_rate: null,
  }));
}

async function searchMarketplaceOffers(
  keyword: string,
): Promise<CaseSearchItem[]> {
  type OfferRow = MarketplaceOffer & {
    phones: Pick<Phone, "name"> | null;
  };

  const { data, error } = await supabase
    .from("marketplace_offers")
    .select("*, phones(name)")
    .or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%`);

  if (error) {
    console.error("Failed to search marketplace offers:", error);
    return [];
  }

  return ((data as OfferRow[] | null) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: row.price,
    phone_id: row.phone_id,
    phone_name: row.phones?.name ?? null,
    source: row.source,
    url: row.url?.trim() || null,
    image_url: row.image_url?.trim() || null,
    review_rate: row.review_rate,
  }));
}

function caseCardClassName(): string {
  return "block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md";
}

export default async function SearchPage({ searchParams }: PageProps) {
  const keyword = getQuery((await searchParams).q);

  if (!keyword) {
    return (
      <div className="flex flex-1 flex-col px-6 py-10">
        <main className="mx-auto w-full max-w-6xl">
          <Breadcrumbs
            items={[
              { label: "ホーム", href: "/" },
              { label: "検索", href: "/search" },
            ]}
          />
          <h1 className="mb-8 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            検索
          </h1>
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
            検索キーワードを入力してください
          </p>
        </main>
      </div>
    );
  }

  const [phones, otherCases, marketplaceCases] = await Promise.all([
    searchPhones(keyword),
    searchOtherCases(keyword),
    searchMarketplaceOffers(keyword),
  ]);

  const cases = [...otherCases, ...marketplaceCases];
  const hasResults = phones.length > 0 || cases.length > 0;

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "検索", href: "/search" },
          ]}
        />
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
                        className={caseCardClassName()}
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
              <Suspense
                fallback={
                  <div className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
                }
              >
                <CaseSearchResults keyword={keyword} cases={cases} />
              </Suspense>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
