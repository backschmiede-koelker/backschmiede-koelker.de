import type { ReactNode } from "react";
import type { LegalDocumentDTO, LegalSettingsDTO } from "../types/legal";
import { LEGAL_CONTACT_TOKENS } from "../lib/legal-defaults";

function toTelHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function renderTextWithContacts(
  text: string,
  settings: LegalSettingsDTO,
): ReactNode[] {
  const tokens = [
    {
      token: LEGAL_CONTACT_TOKENS.email,
      label: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    },
    {
      token: LEGAL_CONTACT_TOKENS.phoneRecke,
      label: settings.phoneRecke,
      href: toTelHref(settings.phoneRecke),
    },
    {
      token: LEGAL_CONTACT_TOKENS.phoneMettingen,
      label: settings.phoneMettingen,
      href: toTelHref(settings.phoneMettingen),
    },
  ];

  const out: ReactNode[] = [];
  let remaining = text;

  while (remaining) {
    let nextToken: (typeof tokens)[number] | null = null;
    let nextIndex = -1;

    for (const token of tokens) {
      const idx = remaining.indexOf(token.token);
      if (idx >= 0 && (nextIndex === -1 || idx < nextIndex)) {
        nextIndex = idx;
        nextToken = token;
      }
    }

    if (nextIndex === -1 || !nextToken) {
      out.push(remaining);
      break;
    }

    if (nextIndex > 0) {
      out.push(remaining.slice(0, nextIndex));
    }

    out.push(
      <a
        key={`${nextToken.token}-${out.length}`}
        href={nextToken.href}
        className="break-all underline underline-offset-2"
      >
        {nextToken.label}
      </a>,
    );

    remaining = remaining.slice(nextIndex + nextToken.token.length);
  }

  return out;
}

function Paragraph({
  text,
  settings,
}: {
  text: string;
  settings: LegalSettingsDTO;
}) {
  const lines = text.split("\n");
  return (
    <p>
      {lines.map((line, idx) => (
        <span key={`${idx}-${line}`}>
          {renderTextWithContacts(line, settings)}
          {idx < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

export default function LegalDocument({
  document,
  settings,
}: {
  document: LegalDocumentDTO;
  settings: LegalSettingsDTO;
}) {
  return (
    <>
      <h1>{document.title}</h1>
      {document.sections.map((section) => (
        <section key={section.id}>
          <h2>{section.heading}</h2>
          {section.blocks.map((block) => {
            if (block.type === "LIST") {
              if (!block.items.length) return null;
              return (
                <ul key={block.id}>
                  {block.items.map((item, idx) => (
                    <li key={`${block.id}-${idx}`}>
                      {renderTextWithContacts(item, settings)}
                    </li>
                  ))}
                </ul>
              );
            }

            if (!block.text) return null;
            return (
              <Paragraph
                key={block.id}
                text={block.text}
                settings={settings}
              />
            );
          })}
        </section>
      ))}
    </>
  );
}
