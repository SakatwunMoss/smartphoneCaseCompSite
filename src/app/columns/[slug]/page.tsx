import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { columns, getColumnBySlug } from "@/lib/columns";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return columns.map((column) => ({ slug: column.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const column = getColumnBySlug(slug);

  if (!column) {
    return { title: "記事が見つかりません | Phone Case Compare" };
  }

  return {
    title: `${column.title} | Phone Case Compare`,
    description: column.excerpt,
  };
}

export default async function ColumnDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const column = getColumnBySlug(slug);

  if (!column) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-3xl">
        <Link
          href="/columns"
          className="mb-6 inline-block text-sm text-zinc-400 transition-colors hover:text-cyan-400"
        >
          ← コラム一覧に戻る
        </Link>

        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-zinc-100">
          {column.title}
        </h1>

        <div className="space-y-5 text-sm leading-relaxed text-zinc-400">
          {column.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </main>
    </div>
  );
}
