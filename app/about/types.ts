// app/about/types.ts
import type { Prisma } from "@/generated/prisma/client";

export type AboutSection = Prisma.AboutSectionGetPayload<{
  include: {
    stats: true;
    values: true;
    timeline: true;
    faqs: true;
    gallery: true;
  };
}>;

export type AboutPerson = Prisma.AboutPersonGetPayload<{}>;
