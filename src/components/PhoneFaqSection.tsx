type FaqItem = {
  question: string;
  answer: string;
};

type PhoneFaqSectionProps = {
  faqs: FaqItem[];
};

export function PhoneFaqSection({ faqs }: PhoneFaqSectionProps) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-medium text-gray-900">よくある質問</h2>
      <dl className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <dt className="text-sm font-medium text-gray-900">
              Q. {faq.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-gray-600">
              A. {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
