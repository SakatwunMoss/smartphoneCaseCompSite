import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { CaseSourceTabs } from "@/components/CaseSourceTabs";
import { PhoneDescription } from "@/components/PhoneDescription";
import { buildPageMetadata } from "@/lib/metadata";
import { supabase } from "@/lib/supabase";
import type { Case, MarketplaceOffer, Phone } from "@/types/database";

type PageProps = {
  params: Promise<{ id: string }>;
};

type PhoneDetail = Phone & {
  description: string | null;
};

async function getPhone(id: string): Promise<PhoneDetail | null> {
  const { data, error } = await supabase
    .from("phones")
    .select("id, name, maker, released_year, description")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch phone:", error);
    return null;
  }

  return data as PhoneDetail | null;
}

async function getOtherCases(phoneId: string): Promise<Case[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("phone_id", phoneId)
    .order("price", { ascending: true });

  if (error) {
    console.error("Failed to fetch cases:", error);
    return [];
  }

  return data ?? [];
}

async function getMarketplaceOffers(
  phoneId: string,
  source: "rakuten" | "yahoo",
): Promise<MarketplaceOffer[]> {
  const { data, error } = await supabase
    .from("marketplace_offers")
    .select("*")
    .eq("phone_id", phoneId)
    .eq("source", source)
    .order("price", { ascending: true });

  if (error) {
    console.error(`Failed to fetch ${source} offers:`, error);
    return [];
  }

  return (data ?? []) as MarketplaceOffer[];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const phone = await getPhone(id);

  if (!phone) {
    return buildPageMetadata({
      title: "機種が見つかりません | Phone Case Compare",
      description: "指定された機種は見つかりませんでした。",
    });
  }

  return buildPageMetadata({
    title: `${phone.name}対応ケースまとめ | Phone Case Compare`,
    description: `${phone.name}に対応するスマホケースを比較。耐衝撃・手帳型などタイプ別に厳選したおすすめケースを紹介します。`,
    path: `/phones/${id}`,
  });
}

function CaseSourceTabsFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <div className="h-9 w-28 rounded bg-gray-100" />
        <div className="h-9 w-32 rounded bg-gray-100" />
        <div className="h-9 w-40 rounded bg-gray-100" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-56 rounded-xl bg-gray-100" />
        <div className="h-56 rounded-xl bg-gray-100" />
        <div className="h-56 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

export default async function PhoneDetailPage({ params }: PageProps) {
  const { id } = await params;
  const phone = await getPhone(id);

  if (!phone) {
    notFound();
  }

  const [otherCases, rakutenOffers, yahooOffers] = await Promise.all([
    getOtherCases(id),
    getMarketplaceOffers(id, "rakuten"),
    getMarketplaceOffers(id, "yahoo"),
  ]);

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-gray-600 transition-colors hover:text-orange-600"
        >
          ← 一覧に戻る
        </Link>

        <header className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            {phone.name}
          </h1>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-500">メーカー</dt>
              <dd>{phone.maker}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-500">発売年</dt>
              <dd className="font-medium tracking-tight">
                {phone.released_year}年
              </dd>
            </div>
          </dl>
        </header>

        {phone.description?.trim() ? (
          <PhoneDescription description={phone.description} />
        ) : null}

        <section>
          <h2 className="mb-2 text-xl font-medium text-gray-900">対応ケース</h2>
          <p className="mb-3 text-xs text-gray-400">
            ※表示価格は変動する場合があります。購入の際は各販売元の最新価格をご確認ください。
          </p>

          <Suspense fallback={<CaseSourceTabsFallback />}>
            <CaseSourceTabs
              otherCases={otherCases}
              rakutenOffers={rakutenOffers}
              yahooOffers={yahooOffers}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
