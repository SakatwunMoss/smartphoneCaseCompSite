import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ | Phone Case Compare",
  description: "Phone Case Compareへのお問い合わせ",
};

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-400 transition-colors hover:text-cyan-400"
        >
          ← 一覧に戻る
        </Link>

        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-zinc-100">
          お問い合わせ
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-zinc-400">
          ご質問・ご意見などがございましたら、以下のフォームよりお問い合わせください。
        </p>

        <ContactForm />
      </main>
    </div>
  );
}
