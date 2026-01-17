// app/admin/legal/actions.ts
"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { LegalBlockType, LegalDocType } from "@/generated/prisma/client";
import {
  createLegalBlock,
  createLegalSection,
  deleteLegalBlock,
  deleteLegalSection,
  reorderBlocks,
  reorderSections,
  updateLegal,
  updateLegalBlock,
  updateLegalSection,
  updateLegalSettings,
} from "@/app/lib/legal.server";

type SessionLike = { user?: { role?: string | null } | null } | null | undefined;

function mustBeAdmin(session: SessionLike) {
  if (session?.user?.role !== "ADMIN") redirect("/login");
}

async function adminGuard() {
  const session = (await auth()) as SessionLike;
  console.log("[admin/legal] session", {
    hasSession: !!session,
    role: session?.user?.role ?? null,
  });
  mustBeAdmin(session);
}

export async function saveLegalTitle(input: { type: LegalDocType; title: string }) {
  await adminGuard();
  return updateLegal(input);
}

export async function saveLegalSettings(input: {
  contactEmail: string;
  phoneRecke: string;
  phoneMettingen: string;
}) {
  await adminGuard();
  return updateLegalSettings(input);
}

export async function addSection(input: {
  documentId: string;
  heading: string;
  sortOrder: number;
}) {
  await adminGuard();
  return createLegalSection(input);
}

export async function saveSection(input: { id: string; heading: string }) {
  await adminGuard();
  return updateLegalSection(input);
}

export async function removeSection(id: string) {
  await adminGuard();
  return deleteLegalSection(id);
}

export async function addBlock(input: {
  sectionId: string;
  type: LegalBlockType;
  sortOrder: number;
  text?: string | null;
  items?: string[];
}) {
  await adminGuard();
  return createLegalBlock(input);
}

export async function saveBlock(input: {
  id: string;
  type: LegalBlockType;
  text?: string | null;
  items?: string[];
}) {
  const started = Date.now();
  try {
    await adminGuard();
    console.log("saveBlock:start", { id: input.id, type: input.type, textLen: input.text?.length, itemsLen: input.items?.length });

    const res = await updateLegalBlock(input);

    console.log("saveBlock:ok", { id: input.id, ms: Date.now() - started });
    return res;
  } catch (err) {
    console.error("[admin/legal] saveBlock:err", err);
    throw err;
  }
}

export async function removeBlock(id: string) {
  await adminGuard();
  return deleteLegalBlock(id);
}

export async function persistSectionsOrder(input: {
  documentId: string;
  order: { id: string; sortOrder: number }[];
}) {
  await adminGuard();
  return reorderSections(input.documentId, input.order);
}

export async function persistBlocksOrder(input: {
  sectionId: string;
  order: { id: string; sortOrder: number }[];
}) {
  await adminGuard();
  return reorderBlocks(input.sectionId, input.order);
}
