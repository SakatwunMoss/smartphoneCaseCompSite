import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "運営者情報 | Phone Case Compare",
  description: "Phone Case Compareの運営者情報",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "運営者情報", href: "/about" },
          ]}
        />

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
            <h2 className="mb-3 text-lg font-medium text-gray-900">
              運営方針
            </h2>
            <p>
              当サイトは、楽天・Yahoo!ショッピング等の公開APIおよび各メーカー公式情報をもとに、対応ケースの価格・スペックを定期的に更新しています。特定のメーカーや商品を優先的に掲載することはなく、利用者が複数の選択肢を比較できることを重視しています。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">
              情報の更新頻度
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>ケース価格・在庫情報：週1回（自動同期）</li>
              <li>機種解説文・コラム記事：月1〜2回</li>
              <li>新機種追加：主要機種の発売時期に合わせて随時</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">運営者</h2>
            <p>当サイトは個人により運営されています（当サイト運営者）。</p>
            <p className="mt-3">
              当サイト運営者は、スマートフォンアクセサリー比較サイトの企画・運用経験を持ち、実際に複数機種・複数ブランドのケースを使用してきた経験に基づき、選び方のポイントを解説しています。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">
              情報源とアフィリエイトについて
            </h2>
            <p>
              商品情報は各ECサイトのAPIおよびメーカー公式サイトを参照しています。当サイトはAmazonアソシエイト・楽天アフィリエイト等のプログラムに参加しており、リンク経由の購入により報酬を得る場合があります。掲載順位や評価は報酬の有無に左右されません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">
              免責・正確性について
            </h2>
            <p>
              価格・在庫・スペックは更新タイミングにより実際と異なる場合があります。購入前に各販売元の最新情報をご確認ください。商品に関するお問い合わせは各販売元へ直接お願いします。
            </p>
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

          <section>
            <h2 className="mb-3 text-lg font-medium text-gray-900">
              サイト公開・最終更新
            </h2>
            <dl className="space-y-1">
              <div className="flex gap-2">
                <dt className="font-medium text-gray-500">サイト公開</dt>
                <dd>2026年8月</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-gray-500">本ページ最終更新</dt>
                <dd>2026年9月</dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
    </div>
  );
}
