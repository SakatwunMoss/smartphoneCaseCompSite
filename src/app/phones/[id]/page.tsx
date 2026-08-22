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
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black">
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {phone.name}
          </h1>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex gap-2">
              <dt className="font-medium text-zinc-500 dark:text-zinc-500">
                メーカー
              </dt>
              <dd>{phone.maker}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-zinc-500 dark:text-zinc-500">
                発売年
              </dt>
              <dd>{phone.released_year}年</dd>
            </div>
          </dl>
        </header>

        <section>
          <h2 className="mb-4 text-xl font-medium text-zinc-900 dark:text-zinc-50">
            対応ケース
          </h2>

          {cases.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((caseItem) => (
                <li
                  key={caseItem.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    {caseItem.name}
                  </h3>
                  <dl className="mb-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex gap-2">
                      <dt className="font-medium text-zinc-500 dark:text-zinc-500">
                        ブランド
                      </dt>
                      <dd>{caseItem.brand}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium text-zinc-500 dark:text-zinc-500">
                        価格
                      </dt>
                      <dd>{formatPrice(caseItem.price)}</dd>
                    </div>
                  </dl>
                  <a
                    href={caseItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-zinc-900 underline-offset-2 transition-colors hover:text-zinc-600 hover:underline dark:text-zinc-50 dark:hover:text-zinc-300"
                  >
                    購入先を見る →
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              対応ケースがまだ登録されていません
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
