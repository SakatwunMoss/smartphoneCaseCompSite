import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildPageMetadata } from "@/lib/metadata";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = buildPageMetadata({
  title: "お問い合わせ | Phone Case Compare",
  description: "Phone Case Compareへのお問い合わせ",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            { label: "お問い合わせ", href: "/contact" },
          ]}
        />

        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-gray-900">
          お問い合わせ
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-600">
          ご質問・ご意見などがございましたら、以下のフォームよりお問い合わせください。
        </p>

        <ContactForm />
      </main>
    </div>
  );
}
