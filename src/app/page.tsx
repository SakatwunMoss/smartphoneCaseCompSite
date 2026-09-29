import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

import {
  BilingualButtonLabel,
  BilingualText,
} from "@/components/BilingualText";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiagnoseCta } from "@/components/DiagnoseCta";
import { DiagnosePromoBanner } from "@/components/DiagnosePromoBanner";
import { JsonLd } from "@/components/JsonLd";
import { PhoneFilterPanel } from "@/components/PhoneFilterPanel";
import { ProductImage } from "@/components/ProductImage";
import { columns } from "@/lib/columns";
import { getPhoneFilterOptions, getPhones } from "@/lib/catalog";
import { diagnoseCopy } from "@/lib/diagnose/copy";
import { buildPhonesItemListJsonLd } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/metadata";
import { parsePhoneFilters } from "@/lib/phone-filters";

const featuredColumns = columns.slice(0, 3);
const { home: homeCopy } = diagnoseCopy;

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** 絞り込み・並び替えのクエリがあっても canonical は常にベース URL */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Phone Case Compare",
    description: "スマホケースを比較するサイト",
    path: "/",
  });
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const filters = parsePhoneFilters(params);
  const { phones, error } = getPhones(filters);
  const { makers, years } = getPhoneFilterOptions();

  const itemListJsonLd =
    phones && phones.length > 0 ? buildPhonesItemListJsonLd(phones) : null;

  return (
    <div className="flex flex-1 flex-col">
      {itemListJsonLd ? <JsonLd data={itemListJsonLd} /> : null}
      <section aria-labelledby="hero-heading" className="w-full bg-orange-50">
        <Image
          src="/images/hero-main.png"
          alt="Phone Case Compare ヒーローイメージ"
          width={1584}
          height={672}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
        <div className="bg-white px-6 py-5 text-center sm:py-6">
          <h1 id="hero-heading" className="sr-only">
            PHONE CASE COMPARE
          </h1>
          <p className="text-sm text-gray-700 sm:text-base">
            気になる端末のケースを比較しよう
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <DiagnoseCta variant="hero" />
            <p className="text-xs text-gray-500 sm:text-sm">
              質問に答えるだけ・登録不要
            </p>
          </div>
        </div>
      </section>

      <DiagnosePromoBanner />

      <div className="px-6 py-10">
        <main className="mx-auto w-full max-w-6xl">
          <Breadcrumbs items={[{ label: "ホーム", href: "/" }]} />
          <Suspense
            fallback={
              <div className="mb-6 h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
            }
          >
            <PhoneFilterPanel
              makers={makers}
              years={years}
              initialFilters={{ makers: [], year: "", sort: "year_desc" }}
            />
          </Suspense>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              データの取得に失敗しました。しばらくしてから再度お試しください。
            </p>
          ) : phones && phones.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {phones.map((phone) => (
                <li key={phone.id}>
                  <Link
                    href={`/phones/${phone.id}`}
                    className="flex min-h-[11rem] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                  >
                    {phone.image_url ? (
                      <ProductImage
                        src={phone.image_url}
                        alt={`${phone.name} イメージ画像`}
                      />
                    ) : null}
                    <h2 className="mb-2 text-lg font-medium tracking-tight text-gray-900">
                      {phone.name}
                    </h2>
                    <dl className="space-y-1 text-sm text-gray-600">
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
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
              条件に一致する端末がありません
            </p>
          )}

          <section
            aria-labelledby="diagnose-promo-heading"
            className="mt-14 rounded-xl border border-orange-200 bg-orange-50 px-5 py-8 sm:px-8 sm:py-10"
          >
            <BilingualText
              copy={homeCopy.promoEyebrow}
              size="xs"
              enClassName="font-medium tracking-wide text-orange-700"
              jaClassName="!text-orange-700/75"
            />
            <BilingualText
              as="h2"
              id="diagnose-promo-heading"
              copy={homeCopy.promoTitle}
              size="2xl"
              className="mt-2"
              enClassName="text-gray-900"
              jaClassName="!text-gray-600"
            />
            <BilingualText
              as="p"
              copy={homeCopy.promoBody}
              size="sm"
              className="mt-3 max-w-2xl"
              enClassName="text-gray-600 sm:text-base"
              jaClassName="!text-gray-500"
            />
            <Link
              href="/diagnose"
              className="mt-6 inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-2.5 text-white transition-colors hover:bg-orange-600 sm:w-auto"
            >
              <BilingualButtonLabel inverted copy={homeCopy.promoCta} />
            </Link>
          </section>

          <section
            aria-labelledby="columns-heading"
            className="mt-14 rounded-xl bg-orange-50/60 px-5 py-8 sm:px-8"
          >
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2
                  id="columns-heading"
                  className="text-xl font-semibold tracking-tight text-gray-900"
                >
                  コラム
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  ケース選びに役立つ記事をピックアップ
                </p>
              </div>
              <Link
                href="/columns"
                className="shrink-0 text-sm text-orange-500 transition-colors hover:text-orange-600"
              >
                すべて見る →
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredColumns.map((column) => (
                <li key={column.slug}>
                  <Link
                    href={`/columns/${column.slug}`}
                    className="block h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                  >
                    <h3 className="mb-2 text-base font-medium tracking-tight text-gray-900">
                      {column.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {column.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
