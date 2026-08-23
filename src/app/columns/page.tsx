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
          className="mb-6 inline-block text-sm text-zinc-400 transition-colors hover:text-cyan-400"
        >
          ← 一覧に戻る
        </Link>

        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-100">
          コラム
        </h1>
        <p className="mb-8 text-sm text-zinc-400">
          スマホケース選びに役立つ記事をまとめています。
        </p>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <li key={column.slug}>
              <Link
                href={`/columns/${column.slug}`}
                className="block h-full rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              >
                <h2 className="mb-2 text-lg font-medium tracking-tight text-zinc-100">
                  {column.title}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-400">
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
