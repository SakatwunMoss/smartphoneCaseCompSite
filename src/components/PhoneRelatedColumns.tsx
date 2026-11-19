import Link from "next/link";

import { getColumnBySlug } from "@/lib/columns";

type PhoneRelatedColumnsProps = {
  columnSlugs: string[];
};

export function PhoneRelatedColumns({
  columnSlugs,
}: PhoneRelatedColumnsProps) {
  const columns = columnSlugs
    .map((slug) => getColumnBySlug(slug))
    .filter((column): column is NonNullable<typeof column> => column != null);

  if (columns.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-medium text-gray-900">関連コラム</h2>
      <ul className="space-y-3">
        {columns.map((column) => (
          <li key={column.slug}>
            <Link
              href={`/columns/${column.slug}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-300"
            >
              <span className="text-sm font-medium text-orange-600">
                {column.title}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {column.excerpt}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
