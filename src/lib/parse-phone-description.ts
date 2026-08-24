export type PhoneDescriptionSection = {
  heading: string;
  body: string;
};

export type ParsedPhoneDescription = {
  intro: string | null;
  sections: PhoneDescriptionSection[];
  plainParagraphs: string[];
};

const SECTION_HEADING_PATTERN = /^###\s+(.+)$/;

/**
 * Parses phone description text from the database.
 * Supports optional markdown-style sections (`### Heading`) for structured content,
 * and falls back to plain paragraphs for phones without section markers.
 */
export function parsePhoneDescription(text: string): ParsedPhoneDescription {
  const trimmed = text.trim();
  if (!trimmed) {
    return { intro: null, sections: [], plainParagraphs: [] };
  }

  const lines = trimmed.split("\n");
  const hasSectionHeadings = lines.some((line) => SECTION_HEADING_PATTERN.test(line));

  if (!hasSectionHeadings) {
    return {
      intro: null,
      sections: [],
      plainParagraphs: trimmed
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    };
  }

  const introLines: string[] = [];
  const sections: PhoneDescriptionSection[] = [];
  let currentHeading: string | null = null;
  let currentBodyLines: string[] = [];

  function flushSection() {
    if (!currentHeading) {
      return;
    }

    const body = currentBodyLines.join("\n").trim();
    if (body) {
      sections.push({ heading: currentHeading, body });
    }

    currentHeading = null;
    currentBodyLines = [];
  }

  for (const line of lines) {
    const headingMatch = line.match(SECTION_HEADING_PATTERN);
    if (headingMatch) {
      flushSection();
      currentHeading = headingMatch[1].trim();
      continue;
    }

    if (currentHeading) {
      currentBodyLines.push(line);
    } else {
      introLines.push(line);
    }
  }

  flushSection();

  const intro = introLines.join("\n").trim();

  return {
    intro: intro || null,
    sections,
    plainParagraphs: [],
  };
}
