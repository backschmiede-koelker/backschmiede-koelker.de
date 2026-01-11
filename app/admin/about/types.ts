// app/admin/about/types.ts
import type { Prisma, AboutPerson } from "@/generated/prisma/client";

export type AboutSectionType =
  | "HERO"
  | "VALUES"
  | "STATS"
  | "TIMELINE"
  | "TEAM"
  | "GALLERY"
  | "FAQ"
  | "CTA"
  | "CUSTOM_TEXT";

export type AboutSectionDTO = Prisma.AboutSectionGetPayload<{
  include: {
    stats: true;
    values: true;
    timeline: true;
    faqs: true;
    gallery: true;
  };
}> & { type: AboutSectionType };

export type AboutPersonDTO = AboutPerson;
