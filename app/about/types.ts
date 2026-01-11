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

export type AboutPerson = Prisma.AboutPersonGetPayload<object>;

type Jsonify<T> =
  T extends Date ? string :
  T extends Array<infer U> ? Array<Jsonify<U>> :
  T extends object ? { [K in keyof T]: Jsonify<T[K]> } :
  T;

export type AboutSectionDTO = Jsonify<AboutSection>;
export type AboutPersonDTO = Jsonify<AboutPerson>;

export type AboutApiResponse = {
  sections: AboutSectionDTO[];
  people: AboutPersonDTO[];
};
