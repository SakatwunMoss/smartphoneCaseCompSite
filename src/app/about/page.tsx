import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "運営者情報 | Phone Case Compare",
  description: "Phone Case Compareの運営者情報",
};

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-gray-600 transition-colors hover:text-orange-600"
        >
          ← 一覧に戻る
        </Link>

        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-gray-900">
          運営者情報
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">
              サイト名
            </h2>
            <p>Phone Case Compare</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">
              サイトの目的
            </h2>
            <p>
              当サイトは、スマートフォンケースの比較・選び方に関する情報を提供することを目的としています。端末ごとに対応するケースを一覧で確認し、購入の参考にしていただくための情報サイトです。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">運営者</h2>
            <p>当サイトは個人により運営されています（当サイト運営者）。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">連絡先</h2>
            <p>
              ご連絡は{" "}
              <Link
                href="/contact"
                className="text-orange-500 underline-offset-2 transition-colors hover:text-orange-600 hover:underline"
              >
                お問い合わせページ
              </Link>
              {" "}
              よりお願いいたします。
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
