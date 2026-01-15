import { DEFAULT_LEGAL_DOCUMENTS, DEFAULT_LEGAL_SETTINGS } from "./legal-defaults";
import type { LegalDocumentDTO, LegalSettingsDTO } from "../types/legal";

export function fallbackLegalSettings(): LegalSettingsDTO {
  return {
    id: "fallback",
    contactEmail: DEFAULT_LEGAL_SETTINGS.contactEmail,
    phoneRecke: DEFAULT_LEGAL_SETTINGS.phoneRecke,
    phoneMettingen: DEFAULT_LEGAL_SETTINGS.phoneMettingen,
  };
}

export function fallbackLegalDocument(type: "IMPRINT" | "PRIVACY"): LegalDocumentDTO {
  const seed = DEFAULT_LEGAL_DOCUMENTS.find((doc) => doc.type === type);
  if (!seed) {
    return {
      id: `fallback-${type}`,
      type,
      title: type === "IMPRINT" ? "Impressum" : "Datenschutzerklärung",
      sections: [],
    };
  }

  return {
    id: `fallback-${seed.type}`,
    type: seed.type,
    title: seed.title,
    sections: seed.sections.map((section, sectionIdx) => ({
      id: `fallback-${seed.type}-section-${sectionIdx}`,
      heading: section.heading,
      sortOrder: sectionIdx,
      blocks: section.blocks.map((block, blockIdx) => ({
        id: `fallback-${seed.type}-block-${sectionIdx}-${blockIdx}`,
        type: block.type,
        sortOrder: blockIdx,
        text: block.type === "PARAGRAPH" ? block.text : null,
        items: block.type === "LIST" ? block.items : [],
      })),
    })),
  };
}
