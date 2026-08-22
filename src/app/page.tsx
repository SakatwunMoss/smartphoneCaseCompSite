import { supabase } from "@/lib/supabase";
import type { Phone } from "@/types/database";

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
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black">
      <main className="mx-auto w-full max-w-6xl">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          スマホケース比較
        </h1>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            データの取得に失敗しました。しばらくしてから再度お試しください。
          </p>
        ) : phones && phones.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {phones.map((phone) => (
              <li
                key={phone.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h2 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {phone.name}
                </h2>
                <dl className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
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
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">
            データがありません
          </p>
        )}
      </main>
    </div>
  );
}
