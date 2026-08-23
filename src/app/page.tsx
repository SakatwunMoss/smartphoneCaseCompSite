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
        className="relative isolate h-[45vh] w-full overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover blur-[3px]"
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/70 to-zinc-950"
          aria-hidden
        />
        <div className="relative z-20 flex h-full items-center justify-center px-6 text-center">
          <div>
            <h1
              id="hero-heading"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              ケース比較
            </h1>
            <p className="mt-3 text-sm text-zinc-200 sm:text-base">
              気になる端末のケースを比較しよう
            </p>
          </div>
        </div>
      </section>

      <div className="px-6 py-10">
        <main className="mx-auto w-full max-w-6xl">
          {error ? (
            <p className="rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-red-300">
              データの取得に失敗しました。しばらくしてから再度お試しください。
            </p>
          ) : phones && phones.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {phones.map((phone) => (
                <li key={phone.id}>
                  <Link
                    href={`/phones/${phone.id}`}
                    className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  >
                    <h2 className="mb-2 text-lg font-medium tracking-tight text-zinc-100">
                      {phone.name}
                    </h2>
                    <dl className="space-y-1 text-sm text-zinc-400">
                      <div className="flex gap-2">
                        <dt className="font-medium text-zinc-500">メーカー</dt>
                        <dd>{phone.maker}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="font-medium text-zinc-500">発売年</dt>
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
            <p className="text-zinc-400">データがありません</p>
          )}

          <section aria-labelledby="columns-heading" className="mt-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2
                  id="columns-heading"
                  className="text-xl font-semibold tracking-tight text-zinc-100"
                >
                  コラム
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  ケース選びに役立つ記事をピックアップ
                </p>
              </div>
              <Link
                href="/columns"
                className="shrink-0 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
              >
                すべて見る →
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredColumns.map((column) => (
                <li key={column.slug}>
                  <Link
                    href={`/columns/${column.slug}`}
                    className="block h-full rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  >
                    <h3 className="mb-2 text-base font-medium tracking-tight text-zinc-100">
                      {column.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
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
