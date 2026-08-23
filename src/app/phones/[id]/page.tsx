import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import type { Case, Phone } from "@/types/database";

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
          <p className="my-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            {phone.description}
          </p>
        ) : null}

        <section>
          <h2 className="mb-4 text-xl font-medium text-gray-900">対応ケース</h2>

          {cases.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((caseItem) => (
                <li
                  key={caseItem.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                >
                  <h3 className="mb-2 text-lg font-medium tracking-tight text-gray-900">
                    {caseItem.name}
                  </h3>
                  <dl className="mb-4 space-y-1 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <dt className="font-medium text-gray-500">ブランド</dt>
                      <dd>{caseItem.brand}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-gray-500">価格</dt>
                      <dd className="font-medium tracking-tight">
                        {formatPrice(caseItem.price)}
                      </dd>
                    </div>
                  </dl>
                  <a
                    href={caseItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline"
                  >
                    購入先を見る →
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-600">
              対応ケースがまだ登録されていません
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
