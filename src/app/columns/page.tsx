import Link from "next/link";
import type { Metadata } from "next";

import { columns } from "@/lib/columns";

export const metadata: Metadata = {
  title: "コラム | Phone Case Compare",
  description: "スマホケース選びに関するコラム記事一覧",
};

export default function ColumnsPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-gray-600 transition-colors hover:text-orange-600"
        >
          ← 一覧に戻る
        </Link>

        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-gray-900">
          コラム
        </h1>
        <p className="mb-8 text-sm text-gray-600">
          スマホケース選びに役立つ記事をまとめています。
        </p>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <li key={column.slug}>
              <Link
                href={`/columns/${column.slug}`}
                className="block h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
              >
                <h2 className="mb-2 text-lg font-medium tracking-tight text-gray-900">
                  {column.title}
                </h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  {column.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
