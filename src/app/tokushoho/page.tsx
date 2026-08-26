import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "特定商取引法に基づく表記 | Phone Case Compare",
  description: "Phone Case Compareの特定商取引法に基づく表記",
  path: "/tokushoho",
});

const SECTIONS = [
  {
    title: "運営者名",
    content: "【運営者名を入力してください】",
  },
  {
    title: "運営責任者",
    content: "【運営責任者名を入力してください】",
  },
  {
    title: "所在地",
    content: "【所在地を入力してください】",
  },
  {
    title: "連絡先",
    content: (
      <>
        <p>メールアドレス: 【メールアドレスを入力してください】</p>
        <p className="mt-2 text-gray-500">
          ※お問い合わせは
          <Link
            href="/contact"
            className="text-orange-500 underline-offset-2 hover:text-orange-600 hover:underline"
          >
            お問い合わせフォーム
          </Link>
          からも受け付けています。
        </p>
      </>
    ),
  },
  {
    title: "提供するサービス内容",
    content: (
      <>
        <p>
          当サイト「Phone Case
          Compare」は、スマートフォンケースの比較情報を提供するウェブサイトです。
        </p>
        <p className="mt-2">
          商品情報の紹介にあたり、楽天市場・Yahoo!ショッピング等のアフィリエイトプログラムを利用しています。当サイトは商品の直接販売は行っておらず、各販売元のサイトへリンクを通じてご案内しています。
        </p>
      </>
    ),
  },
  {
    title: "免責事項",
    content: (
      <>
        <p>
          当サイトに掲載している商品名・価格・在庫・画像等の情報は、各販売元の情報をもとに表示しており、予告なく変更される場合があります。掲載内容の正確性・完全性を保証するものではありません。
        </p>
        <p className="mt-2">
          商品の購入を検討される際は、必ず各販売元の最新情報（価格・在庫・送料・返品条件等）をご確認ください。当サイトからリンク先サイトへの移動後に生じたトラブルについて、当サイトは一切の責任を負いかねます。
        </p>
      </>
    ),
  },
] as const;

export default function TokushohoPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "特定商取引法に基づく表記", href: "/tokushoho" },
          ]}
        />

        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-gray-900">
          特定商取引法に基づく表記
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-gray-600">
          {SECTIONS.map(({ title, content }) => (
            <section key={title}>
              <h2 className="mb-3 text-lg font-medium text-gray-900">
                {title}
              </h2>
              {typeof content === "string" ? <p>{content}</p> : content}
            </section>
          ))}

          <p className="pt-4 text-gray-500">最終更新日: 2026年8月25日</p>
        </div>
      </main>
    </div>
  );
}
