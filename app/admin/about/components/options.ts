// app/admin/about/components/options.ts
import type { AboutSectionDTO, AboutPersonDTO } from "../types";

export const SECTION_TYPE_OPTIONS = [
  { value: "HERO", label: "Hero (Startbereich)" },
  { value: "CUSTOM_TEXT", label: "Text (frei)" },
  { value: "VALUES", label: "Unsere Werte" },
  { value: "STATS", label: "Zahlen / Stats" },
  { value: "TIMELINE", label: "Timeline / Meilensteine" },
  { value: "TEAM", label: "Team" },
  { value: "GALLERY", label: "Galerie" },
  { value: "FAQ", label: "FAQ" },
  { value: "CTA", label: "Call-to-Action" },
] as const satisfies readonly { value: AboutSectionDTO["type"]; label: string }[];

export const PERSON_KIND_OPTIONS = [
  { value: "OWNER", label: "Inhaber:in" },
  { value: "MANAGER", label: "Leitung" },
  { value: "TEAM_MEMBER", label: "Teammitglied" },
] as const satisfies readonly { value: AboutPersonDTO["kind"]; label: string }[];
