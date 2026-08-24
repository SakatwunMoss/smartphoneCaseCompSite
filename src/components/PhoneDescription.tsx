import {
  parsePhoneDescription,
  type ParsedPhoneDescription,
} from "@/lib/parse-phone-description";

type PhoneDescriptionProps = {
  description: string;
};

function StructuredDescription({ intro, sections }: ParsedPhoneDescription) {
  return (
    <div className="mb-8 max-w-2xl space-y-5 text-sm leading-relaxed text-gray-600">
      {intro ? <p>{intro}</p> : null}
      {sections.map((section) => (
        <section key={section.heading}>
          <h3 className="mb-2 text-base font-medium text-gray-900">
            {section.heading}
          </h3>
          <p>{section.body}</p>
        </section>
      ))}
    </div>
  );
}

function PlainDescription({ plainParagraphs }: ParsedPhoneDescription) {
  return (
    <div className="mb-8 max-w-2xl space-y-5 text-sm leading-relaxed text-gray-600">
      {plainParagraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

export function PhoneDescription({ description }: PhoneDescriptionProps) {
  const parsed = parsePhoneDescription(description);

  if (parsed.sections.length > 0) {
    return <StructuredDescription {...parsed} />;
  }

  if (parsed.plainParagraphs.length > 0) {
    return <PlainDescription {...parsed} />;
  }

  return null;
}
