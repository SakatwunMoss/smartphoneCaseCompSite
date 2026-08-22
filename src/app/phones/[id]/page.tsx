import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import type { Case, Phone } from "@/types/database";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getPhone(id: string): Promise<Phone | null> {
  const { data, error } = await supabase
    .from("phones")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch phone:", error);
    return null;
  }

  return data;
}

async function getCases(phoneId: string): Promise<Case[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("phone_id", phoneId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch cases:", error);
    return [];
  }

  return data ?? [];
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

export default async function PhoneDetailPage({ params }: PageProps) {
  const { id } = await params;
  const phone = await getPhone(id);

  if (!phone) {
    notFound();
  }

  const cases = await getCases(id);

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-400 transition-colors hover:text-cyan-400"
        >
          ← 一覧に戻る
        </Link>

        <header className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            {phone.name}
          </h1>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">
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
        </header>

        <section>
          <h2 className="mb-4 text-xl font-medium text-zinc-100">対応ケース</h2>

          {cases.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((caseItem) => (
                <li
                  key={caseItem.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                >
                  <h3 className="mb-2 text-lg font-medium tracking-tight text-zinc-100">
                    {caseItem.name}
                  </h3>
                  <dl className="mb-4 space-y-1 text-sm text-zinc-400">
                    <div className="flex gap-2">
                      <dt className="font-medium text-zinc-500">ブランド</dt>
                      <dd>{caseItem.brand}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-zinc-500">価格</dt>
                      <dd className="font-medium tracking-tight">
                        {formatPrice(caseItem.price)}
                      </dd>
                    </div>
                  </dl>
                  <a
                    href={caseItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-cyan-400 underline-offset-2 transition-colors hover:text-cyan-300 hover:underline"
                  >
                    購入先を見る →
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-8 text-center text-zinc-400">
              対応ケースがまだ登録されていません
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
