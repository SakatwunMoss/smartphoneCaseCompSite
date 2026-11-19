import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CaseSourceTabs } from "@/components/CaseSourceTabs";
import { JsonLd } from "@/components/JsonLd";
import { PhoneDescription } from "@/components/PhoneDescription";
import { PhoneFaqSection } from "@/components/PhoneFaqSection";
import { PhoneRelatedColumns } from "@/components/PhoneRelatedColumns";
import {
  getMarketplaceOffers,
  getOtherCases,
  getPhone,
  getStaticPhoneParams,
} from "@/lib/catalog";
import { parseCaseSource } from "@/lib/case-source";
import { parseCompareQuery } from "@/lib/compare-query";
import {
  buildFaqPageJsonLd,
  buildPhoneCasesItemListJsonLd,
} from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getPhonePageContent,
  getPublishableFaqs,
  mergePhoneDescription,
} from "@/lib/phone-page-content";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstQuery(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export function generateStaticParams() {
  return getStaticPhoneParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const phone = getPhone(id);

  if (!phone) {
    return buildPageMetadata({
      title: "機種が見つかりません",
      description: "指定された機種は見つかりませんでした。",
    });
  }

  const pageContent = getPhonePageContent(id);

  return buildPageMetadata({
    title: pageContent?.seoTitle ?? `${phone.name}対応ケースまとめ`,
    description:
      pageContent?.seoDescription ??
      `${phone.name}に対応するスマホケースを比較。耐衝撃・手帳型などタイプ別に厳選したおすすめケースを紹介します。`,
    path: `/phones/${id}`,
  });
}

export default async function PhoneDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const phone = getPhone(id);

  if (!phone) {
    notFound();
  }

  const pageContent = getPhonePageContent(id);
  const query = await searchParams;
  const compareRaw = firstQuery(query.compare);
  const requestedSource = parseCaseSource(firstQuery(query.source));
  const initialSelectedIds = parseCompareQuery(compareRaw);
  const initialCompareQuery =
    compareRaw && compareRaw.trim() !== "" ? compareRaw.trim() : null;

  const otherCases = getOtherCases(id);
  const rakutenOffers = getMarketplaceOffers(id, "rakuten");
  const yahooOffers = getMarketplaceOffers(id, "yahoo");

  // 空の「その他」を初期タブにしない
  const initialSource =
    requestedSource === "other" && otherCases.length === 0
      ? "rakuten"
      : requestedSource;

  const mergedDescription = mergePhoneDescription(
    phone.description,
    pageContent?.extraDescriptionSections,
  );

  const casesItemListJsonLd = buildPhoneCasesItemListJsonLd(
    phone,
    otherCases,
    [...rakutenOffers, ...yahooOffers],
  );
  const faqPageJsonLd = buildFaqPageJsonLd(
    getPublishableFaqs(pageContent?.faqs),
  );

  const jsonLdPayloads = [
    casesItemListJsonLd,
    ...(faqPageJsonLd ? [faqPageJsonLd] : []),
  ];

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-6xl">
        <JsonLd data={jsonLdPayloads} />
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: phone.name, href: `/phones/${phone.id}` },
          ]}
        />

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

        {mergedDescription ? (
          <PhoneDescription description={mergedDescription} />
        ) : null}

        <section>
          <h2 className="mb-2 text-xl font-medium text-gray-900">対応ケース</h2>
          <p className="mb-3 text-xs text-gray-400">
            ※表示価格は変動する場合があります。購入の際は各販売元の最新価格をご確認ください。
          </p>

          <CaseSourceTabs
            otherCases={otherCases}
            rakutenOffers={rakutenOffers}
            yahooOffers={yahooOffers}
            initialSource={initialSource}
            initialSelectedIds={initialSelectedIds}
            initialCompareQuery={initialCompareQuery}
          />
        </section>

        {pageContent?.faqs?.length ? (
          <PhoneFaqSection faqs={pageContent.faqs} />
        ) : null}

        {pageContent?.relatedColumnSlugs?.length ? (
          <PhoneRelatedColumns columnSlugs={pageContent.relatedColumnSlugs} />
        ) : null}
      </main>
    </div>
  );
}
