export type LegalDocType = "IMPRINT" | "PRIVACY";
export type LegalBlockType = "PARAGRAPH" | "LIST";

export type LegalBlockDTO = {
  id: string;
  type: LegalBlockType;
  sortOrder: number;
  text: string | null;
  items: string[];
};

export type LegalSectionDTO = {
  id: string;
  heading: string;
  sortOrder: number;
  blocks: LegalBlockDTO[];
};

export type LegalDocumentDTO = {
  id: string;
  type: LegalDocType;
  title: string;
  sections: LegalSectionDTO[];
};

export type LegalSettingsDTO = {
  id: string;
  contactEmail: string;
  phoneRecke: string;
  phoneMettingen: string;
};
