// app/lib/legal.server.ts
import "server-only";

import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  DEFAULT_LEGAL_DOCUMENTS,
  DEFAULT_LEGAL_SETTINGS,
  type LegalDocSeed,
} from "./legal-defaults";
import { fallbackLegalDocument, fallbackLegalSettings } from "./legal-fallback";
import type { LegalBlockType, LegalDocType } from "@/generated/prisma/client";

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

function normalizeItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toBlockDTO(block: {
  id: string;
  type: LegalBlockType;
  sortOrder: number;
  text: string | null;
  items: unknown;
}): LegalBlockDTO {
  return {
    id: block.id,
    type: block.type,
    sortOrder: block.sortOrder,
    text: block.text ?? null,
    items: normalizeItems(block.items),
  };
}

function toDocumentDTO(doc: {
  id: string;
  type: LegalDocType;
  title: string;
  sections: Array<{
    id: string;
    heading: string;
    sortOrder: number;
    blocks: Array<{
      id: string;
      type: LegalBlockType;
      sortOrder: number;
      text: string | null;
      items: unknown;
    }>;
  }>;
}): LegalDocumentDTO {
  return {
    id: doc.id,
    type: doc.type,
    title: doc.title,
    sections: doc.sections
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((section) => ({
        id: section.id,
        heading: section.heading,
        sortOrder: section.sortOrder,
        blocks: section.blocks
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(toBlockDTO),
      })),
  };
}

async function ensureLegalDefaults() {
  const prisma = getPrisma();

  // 1) Settings: 100% idempotent & race-sicher
  await prisma.legalSettings.upsert({
    where: { id: "singleton" },
    update: {}, // oder: { ...DEFAULT_LEGAL_SETTINGS } wenn du Defaults "erzwingen" willst
    create: { id: "singleton", ...DEFAULT_LEGAL_SETTINGS },
  });

  // 2) Docs: ebenfalls idempotent & race-sicher
  // Variante A (einfach + robust): upsert für alle Default-Dokumente
  for (const doc of DEFAULT_LEGAL_DOCUMENTS) {
    await prisma.legalDocument.upsert({
      where: { type: doc.type },
      update: {}, // oder: { title: doc.title } wenn du mind. Titel aktualisieren willst
      create: seedToCreate(doc),
    });
  }
}

function seedToCreate(seed: LegalDocSeed) {
  return {
    type: seed.type,
    title: seed.title,
    sections: {
      create: seed.sections.map((section, sectionIdx) => ({
        heading: section.heading,
        sortOrder: sectionIdx,
        blocks: {
          create: section.blocks.map((block, blockIdx) => ({
            type: block.type,
            sortOrder: blockIdx,
            text: block.type === "PARAGRAPH" ? block.text : null,
            items: block.type === "LIST" ? block.items : undefined,
          })),
        },
      })),
    },
  };
}

function cleanRequired(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} darf nicht leer sein.`);
  return trimmed;
}

function cleanOptional(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
}

export async function getOrCreateLegalSettings(): Promise<LegalSettingsDTO> {
  if (!isDatabaseConfigured()) {
    return fallbackLegalSettings();
  }
  await ensureLegalDefaults();
  const settings = await getPrisma().legalSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) throw new Error("LegalSettings nicht gefunden.");
  return {
    id: settings.id,
    contactEmail: settings.contactEmail,
    phoneRecke: settings.phoneRecke,
    phoneMettingen: settings.phoneMettingen,
  };
}

export async function updateLegalSettings(input: {
  contactEmail: string;
  phoneRecke: string;
  phoneMettingen: string;
}): Promise<LegalSettingsDTO> {
  await ensureLegalDefaults();
  const updated = await getPrisma().legalSettings.update({
    where: { id: "singleton" },
    data: {
      contactEmail: cleanRequired(input.contactEmail, "E-Mail"),
      phoneRecke: cleanRequired(input.phoneRecke, "Telefon Recke"),
      phoneMettingen: cleanRequired(input.phoneMettingen, "Telefon Mettingen"),
    },
  });

  return {
    id: updated.id,
    contactEmail: updated.contactEmail,
    phoneRecke: updated.phoneRecke,
    phoneMettingen: updated.phoneMettingen,
  };
}

export async function getOrCreateLegal(type: LegalDocType): Promise<LegalDocumentDTO> {
  console.log("[legal] read", { type, hasDbUrl: !!process.env.DATABASE_URL, skipBuild: process.env.SKIP_DB_DURING_BUILD });

  if (!isDatabaseConfigured()) {
    return fallbackLegalDocument(type);
  }
  await ensureLegalDefaults();
  const doc = await getPrisma().legalDocument.findUnique({
    where: { type },
    include: {
      sections: {
        include: { blocks: true },
      },
    },
  });
  if (!doc) throw new Error("Dokument nicht gefunden.");
  return toDocumentDTO(doc);
}

export async function updateLegal(input: {
  type: LegalDocType;
  title: string;
}): Promise<LegalDocumentDTO> {
  await ensureLegalDefaults();
  await getPrisma().legalDocument.update({
    where: { type: input.type },
    data: { title: cleanRequired(input.title, "Titel") },
  });
  return getOrCreateLegal(input.type);
}

export async function createLegalSection(input: {
  documentId: string;
  heading: string;
  sortOrder: number;
}): Promise<LegalSectionDTO> {
  const created = await getPrisma().legalSection.create({
    data: {
      documentId: input.documentId,
      heading: cleanRequired(input.heading, "Überschrift"),
      sortOrder: input.sortOrder,
    },
    include: { blocks: true },
  });

  return {
    id: created.id,
    heading: created.heading,
    sortOrder: created.sortOrder,
    blocks: created.blocks.map(toBlockDTO),
  };
}

export async function updateLegalSection(input: {
  id: string;
  heading: string;
}): Promise<LegalSectionDTO> {
  const updated = await getPrisma().legalSection.update({
    where: { id: input.id },
    data: { heading: cleanRequired(input.heading, "Überschrift") },
    include: { blocks: true },
  });

  return {
    id: updated.id,
    heading: updated.heading,
    sortOrder: updated.sortOrder,
    blocks: updated.blocks.map(toBlockDTO),
  };
}

export async function deleteLegalSection(id: string) {
  await getPrisma().legalSection.delete({ where: { id } });
  return { ok: true };
}

export async function createLegalBlock(input: {
  sectionId: string;
  type: LegalBlockType;
  sortOrder: number;
  text?: string | null;
  items?: string[];
}): Promise<LegalBlockDTO> {
  const created = await getPrisma().legalBlock.create({
    data: {
      sectionId: input.sectionId,
      type: input.type,
      sortOrder: input.sortOrder,
      text: input.type === "PARAGRAPH" ? cleanOptional(input.text) : null,
      items: input.type === "LIST" ? input.items ?? [] : undefined,
    },
  });
  return toBlockDTO({
    id: created.id,
    type: created.type,
    sortOrder: created.sortOrder,
    text: created.text,
    items: created.items,
  });
}

export async function updateLegalBlock(input: {
  id: string;
  type: LegalBlockType;
  text?: string | null;
  items?: string[];
}): Promise<LegalBlockDTO> {
  const prisma = getPrisma();

  console.log("[legal] updateLegalBlock input", {
    id: input.id,
    type: input.type,
    text: input.text,
    items: input.items,
  });

  const before = await prisma.legalBlock.findUnique({ where: { id: input.id } });
  console.log("[legal] before", { id: input.id, text: before?.text });

  const updated = await prisma.legalBlock.update({
    where: { id: input.id },
    data: {
      text: input.type === "PARAGRAPH" ? cleanOptional(input.text) : null,
      items: input.type === "LIST" ? input.items ?? [] : [],
    },
  });

  console.log("[legal] after", { id: updated.id, text: updated.text });

  return toBlockDTO({
    id: updated.id,
    type: updated.type,
    sortOrder: updated.sortOrder,
    text: updated.text,
    items: updated.items,
  });
}

export async function deleteLegalBlock(id: string) {
  await getPrisma().legalBlock.delete({ where: { id } });
  return { ok: true };
}

export async function reorderSections(
  documentId: string,
  order: { id: string; sortOrder: number }[],
) {
  const ids = Array.from(new Set(order.map((item) => item.id))).filter(Boolean);
  if (!ids.length) return { ok: true };

  const rows = await getPrisma().legalSection.findMany({
    where: { id: { in: ids }, documentId },
    select: { id: true },
  });
  if (rows.length !== ids.length) {
    throw new Error("Mindestens eine Sektion existiert nicht (mehr).");
  }

  await getPrisma().$transaction(async (tx) => {
    for (const item of order) {
      await tx.legalSection.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }
  });

  return { ok: true };
}

export async function reorderBlocks(
  sectionId: string,
  order: { id: string; sortOrder: number }[],
) {
  const ids = Array.from(new Set(order.map((item) => item.id))).filter(Boolean);
  if (!ids.length) return { ok: true };

  const rows = await getPrisma().legalBlock.findMany({
    where: { id: { in: ids }, sectionId },
    select: { id: true },
  });
  if (rows.length !== ids.length) {
    throw new Error("Mindestens ein Block existiert nicht (mehr).");
  }

  await getPrisma().$transaction(async (tx) => {
    for (const item of order) {
      await tx.legalBlock.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }
  });

  return { ok: true };
}
