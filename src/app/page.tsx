export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";

import { columns } from "@/lib/columns";
import { supabase } from "@/lib/supabase";
import type { Phone } from "@/types/database";

const featuredColumns = columns.slice(0, 3);

async function getPhones(): Promise<{
  phones: Phone[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase.from("phones").select("*");

  if (error) {
    console.error("Failed to fetch phones:", error);
    return { phones: null, error: error.message };
  }

  return { phones: data ?? [], error: null };
}

export default async function Home() {
  const { phones, error } = await getPhones();

  return (
    <div className="flex flex-1 flex-col">
      <section
        aria-labelledby="hero-heading"
        className="relative h-[50vh] min-h-[220px] max-h-[420px] w-full overflow-hidden bg-orange-50 sm:h-[45vh] sm:max-h-[480px]"
      >
        <Image
          src="/images/hero-main.png"
          alt="PHONE CASE COMPARE"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[35%_center] sm:object-center"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/80 to-transparent pt-16">
          <div className="bg-white/90 px-6 py-3 text-center sm:py-3.5">
            <h1 id="hero-heading" className="sr-only">
              PHONE CASE COMPARE
            </h1>
            <p className="text-sm text-gray-700 sm:text-base">
              気になる端末のケースを比較しよう
            </p>
          </div>
        </div>
      </section>

      <div className="px-6 py-10">
        <main className="mx-auto w-full max-w-6xl">
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
                    className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                  >
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
            <p className="text-gray-600">データがありません</p>
          )}

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
