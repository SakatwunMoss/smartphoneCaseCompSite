import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { columns, getColumnBySlug } from "@/lib/columns";
import { buildPageMetadata } from "@/lib/metadata";

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
    return buildPageMetadata({
      title: "記事が見つかりません | Phone Case Compare",
      description: "指定された記事は見つかりませんでした。",
    });
  }

  return buildPageMetadata({
    title: `${column.title} | Phone Case Compare`,
    description: column.excerpt,
    path: `/columns/${slug}`,
  });
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
          className="mb-6 inline-block text-sm text-gray-600 transition-colors hover:text-orange-600"
        >
          ← コラム一覧に戻る
        </Link>

        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-gray-900">
          {column.title}
        </h1>

        <div className="space-y-5 text-sm leading-relaxed text-gray-600">
          {column.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </main>
    </div>
  );
}
