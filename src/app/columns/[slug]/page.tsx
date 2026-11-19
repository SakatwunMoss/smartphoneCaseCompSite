import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getPhone } from "@/lib/catalog";
import { columns, getColumnBySlug } from "@/lib/columns";
import { buildArticleJsonLd } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

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
      title: "記事が見つかりません",
      description: "指定された記事は見つかりませんでした。",
    });
  }

  return buildPageMetadata({
    title: column.title,
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

  const relatedPhones = column.relatedPhoneIds
    .map((id) => getPhone(id))
    .filter((phone): phone is NonNullable<typeof phone> => phone != null);

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-3xl">
        <JsonLd data={buildArticleJsonLd(column)} />
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "コラム", href: "/columns" },
            { label: column.title, href: `/columns/${slug}` },
          ]}
        />

        <header className="mb-8">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900">
            {column.title}
          </h1>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-400">著者</dt>
              <dd>{column.author}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-400">公開日</dt>
              <dd>
                <time dateTime={column.publishedAt}>
                  {formatDate(column.publishedAt)}
                </time>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-400">更新日</dt>
              <dd>
                <time dateTime={column.updatedAt}>
                  {formatDate(column.updatedAt)}
                </time>
              </dd>
            </div>
          </dl>
        </header>

        <div className="space-y-5 text-sm leading-relaxed text-gray-600">
          {column.body.map((block, index) => {
            if (block.startsWith("### ")) {
              return (
                <h2
                  key={index}
                  className="pt-2 text-lg font-medium text-gray-900"
                >
                  {block.slice(4)}
                </h2>
              );
            }

            // 簡易 Markdown リンク: [label](/path)
            const linkMatch = block.match(
              /^(.*)\[([^\]]+)\]\(([^)]+)\)(.*)$/,
            );
            if (linkMatch) {
              const [, before, label, href, after] = linkMatch;
              return (
                <p key={index}>
                  {before}
                  <Link
                    href={href}
                    className="font-medium text-orange-600 underline-offset-2 hover:underline"
                  >
                    {label}
                  </Link>
                  {after}
                </p>
              );
            }

            return <p key={index}>{block}</p>;
          })}
        </div>

        {relatedPhones.length > 0 ? (
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="mb-3 text-lg font-medium text-gray-900">
              関連機種のケースを見る
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {relatedPhones.map((phone) => (
                <li key={phone.id}>
                  <Link
                    href={`/phones/${phone.id}`}
                    className="font-medium text-orange-600 underline-offset-2 hover:underline"
                  >
                    {phone.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
