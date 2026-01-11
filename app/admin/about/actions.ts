// app/admin/about/actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { toStoredPath } from "@/app/lib/uploads";
import type { AboutSectionDTO, AboutPersonDTO } from "./types";

type SessionLike = { user?: { role?: string | null } | null } | null | undefined;

function mustBeAdmin(session: SessionLike) {
  if (session?.user?.role !== "ADMIN") redirect("/login");
}
async function adminGuard() {
  const session = (await auth()) as SessionLike;
  mustBeAdmin(session);
}

export type SectionType =
  | "HERO"
  | "VALUES"
  | "STATS"
  | "TIMELINE"
  | "TEAM"
  | "GALLERY"
  | "FAQ"
  | "CTA"
  | "CUSTOM_TEXT";

const SINGLETON_TYPES: SectionType[] = [
  "HERO",
  "TEAM",
  "VALUES",
  "STATS",
  "TIMELINE",
  "GALLERY",
  "FAQ",
  "CTA",
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function autoSlug(type: SectionType, title?: string | null) {
  const base = title?.trim() ? slugify(title) : type.toLowerCase();
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

async function assertSingletonCreatable(type: SectionType) {
  if (!SINGLETON_TYPES.includes(type)) return;
  const existing = await prisma.aboutSection.findFirst({ where: { type } });
  if (existing) {
    throw new Error(`${type} ist nur 1× erlaubt.`);
  }
}

export async function getSectionById(id: string): Promise<AboutSectionDTO> {
  await adminGuard();
  const sec = await prisma.aboutSection.findUnique({
    where: { id },
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      values: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      gallery: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!sec) throw new Error("Section nicht gefunden");
  return sec as AboutSectionDTO;
}

export async function updateHero(input: {
  id: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  sortOrder: number;
}): Promise<AboutSectionDTO> {
  await adminGuard();

  const updated = await prisma.aboutSection.update({
    where: { id: input.id },
    data: {
      title: input.title?.trim() || null,
      subtitle: input.subtitle?.trim() || null,
      body: input.body?.trim() || null,
      imageUrl: toStoredPath(input.imageUrl) ?? null,
      isActive: true,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : -1000,
    },
    include: { stats: true, values: true, timeline: true, faqs: true, gallery: true },
  });

  return updated as AboutSectionDTO;
}

export async function createSection(input: {
  type: SectionType;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<AboutSectionDTO> {
  await adminGuard();

  const type = String(input.type).toUpperCase().trim() as SectionType;
  await assertSingletonCreatable(type);

  const created = await prisma.aboutSection.create({
    data: {
      type,
      slug: autoSlug(type, input.title ?? null),
      title: input.title?.trim() || null,
      subtitle: input.subtitle?.trim() || null,
      body: input.body?.trim() || null,
      imageUrl: toStoredPath(input.imageUrl) ?? null,
      isActive: input.isActive ?? true,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      values: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      gallery: { orderBy: { sortOrder: "asc" } },
    },
  });

  return created as AboutSectionDTO;
}

export async function updateSection(input: {
  id: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}): Promise<AboutSectionDTO> {
  await adminGuard();

  const existing = await prisma.aboutSection.findUnique({
    where: { id: input.id },
    select: { type: true },
  });
  if (!existing) throw new Error("Section nicht gefunden");

  // HERO soll nur über updateHero laufen
  if (existing.type === "HERO") {
    throw new Error("Hero kann nur über den Hero-Editor gespeichert werden.");
  }

  const TEAM_FIXED_SORT_ORDER = 9999;

  const nextSortOrder =
    existing.type === "TEAM"
      ? TEAM_FIXED_SORT_ORDER
      : Number.isFinite(input.sortOrder)
      ? input.sortOrder
      : 0;

  const updated = await prisma.aboutSection.update({
    where: { id: input.id },
    data: {
      title: input.title?.trim() || null,
      subtitle: input.subtitle?.trim() || null,
      body: input.body?.trim() || null,
      imageUrl: toStoredPath(input.imageUrl) ?? null,
      isActive: !!input.isActive,
      sortOrder: nextSortOrder,
    },
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      values: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      gallery: { orderBy: { sortOrder: "asc" } },
    },
  });

  return updated as AboutSectionDTO;
}

export async function deleteSection(id: string) {
  await adminGuard();

  const sec = await prisma.aboutSection.findUnique({
    where: { id },
    select: { type: true },
  });
  if (!sec) return { ok: true };

  if (SINGLETON_TYPES.includes(sec.type as SectionType)) {
    throw new Error(`${sec.type} ist ein „Einmal-Bereich“ und kann nicht gelöscht werden.`);
  }

  await prisma.aboutSection.delete({ where: { id } });
  return { ok: true };
}

/* ---------------- ITEMS: unverändert (wie vorher) ---------------- */
export async function createStat(input: { sectionId: string; label: string; value: string; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutStatItem.create({ data: { sectionId: input.sectionId, label: input.label.trim(), value: input.value.trim(), sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function updateStat(input: { id: string; label: string; value: string; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutStatItem.update({ where: { id: input.id }, data: { label: input.label.trim(), value: input.value.trim(), sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function deleteStat(id: string) { await adminGuard(); await prisma.aboutStatItem.delete({ where: { id } }); return { ok: true }; }

export async function createValue(input: { sectionId: string; title: string; description: string | null; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutValueItem.create({ data: { sectionId: input.sectionId, title: input.title.trim(), description: input.description?.trim() || null, sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function updateValue(input: { id: string; title: string; description: string | null; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutValueItem.update({ where: { id: input.id }, data: { title: input.title.trim(), description: input.description?.trim() || null, sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function deleteValue(id: string) { await adminGuard(); await prisma.aboutValueItem.delete({ where: { id } }); return { ok: true }; }

export async function createTimeline(input: { sectionId: string; year: string; title: string; description: string | null; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutTimelineItem.create({ data: { sectionId: input.sectionId, year: input.year.trim(), title: input.title.trim(), description: input.description?.trim() || null, sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function updateTimeline(input: { id: string; year: string; title: string; description: string | null; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutTimelineItem.update({ where: { id: input.id }, data: { year: input.year.trim(), title: input.title.trim(), description: input.description?.trim() || null, sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function deleteTimeline(id: string) { await adminGuard(); await prisma.aboutTimelineItem.delete({ where: { id } }); return { ok: true }; }

export async function createFaq(input: { sectionId: string; question: string; answer: string; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutFaqItem.create({ data: { sectionId: input.sectionId, question: input.question.trim(), answer: input.answer.trim(), sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function updateFaq(input: { id: string; question: string; answer: string; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutFaqItem.update({ where: { id: input.id }, data: { question: input.question.trim(), answer: input.answer.trim(), sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function deleteFaq(id: string) { await adminGuard(); await prisma.aboutFaqItem.delete({ where: { id } }); return { ok: true }; }

export async function createGallery(input: { sectionId: string; imageUrl: string; alt: string | null; sortOrder: number }) {
  await adminGuard();
  const stored = toStoredPath(input.imageUrl);
  if (!stored) throw new Error("Bild fehlt");
  await prisma.aboutGalleryItem.create({ data: { sectionId: input.sectionId, imageUrl: stored, alt: input.alt?.trim() || null, sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function updateGallery(input: { id: string; imageUrl: string; alt: string | null; sortOrder: number }) {
  await adminGuard();
  const stored = toStoredPath(input.imageUrl);
  if (!stored) throw new Error("Bild fehlt");
  await prisma.aboutGalleryItem.update({ where: { id: input.id }, data: { imageUrl: stored, alt: input.alt?.trim() || null, sortOrder: input.sortOrder ?? 0 } });
  return { ok: true };
}
export async function deleteGallery(id: string) { await adminGuard(); await prisma.aboutGalleryItem.delete({ where: { id } }); return { ok: true }; }

/* ---------------- PEOPLE: isShownInHero fliegt raus ---------------- */
type PersonKind = AboutPersonDTO["kind"];

export async function createPerson(input: {
  kind: string;
  name: string;
  roleLabel: string | null;
  shortBio: string | null;
  longBio: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  instagramHandle: string | null;
  isShownOnAbout: boolean;
  sortOrder: number;
}): Promise<AboutPersonDTO> {
  await adminGuard();

  const kind = (input.kind as PersonKind) || "TEAM_MEMBER";

  const created = await prisma.aboutPerson.create({
    data: {
      kind,
      name: input.name.trim(),
      roleLabel: input.roleLabel?.trim() || null,
      shortBio: input.shortBio?.trim() || null,
      longBio: input.longBio?.trim() || null,
      avatarUrl: toStoredPath(input.avatarUrl) ?? null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      instagramHandle: input.instagramHandle?.trim() || null,
      isShownOnAbout: !!input.isShownOnAbout,
      isShownInHero: false, // ✅ dauerhaft aus
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });

  return created as AboutPersonDTO;
}

export async function updatePerson(input: {
  id: string;
  kind: string;
  name: string;
  roleLabel: string | null;
  shortBio: string | null;
  longBio: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  instagramHandle: string | null;
  isShownOnAbout: boolean;
  sortOrder: number;
}): Promise<AboutPersonDTO> {
  await adminGuard();

  const kind = (input.kind as PersonKind) || "TEAM_MEMBER";

  const updated = await prisma.aboutPerson.update({
    where: { id: input.id },
    data: {
      kind,
      name: input.name.trim(),
      roleLabel: input.roleLabel?.trim() || null,
      shortBio: input.shortBio?.trim() || null,
      longBio: input.longBio?.trim() || null,
      avatarUrl: toStoredPath(input.avatarUrl) ?? null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      instagramHandle: input.instagramHandle?.trim() || null,
      isShownOnAbout: !!input.isShownOnAbout,
      isShownInHero: false, // ✅ dauerhaft aus
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });

  return updated as AboutPersonDTO;
}

export async function deletePerson(id: string) {
  await adminGuard();
  await prisma.aboutPerson.delete({ where: { id } });
  return { ok: true };
}

export async function reorderMiddleSections(input: { idsInOrder: string[] }) {
  await adminGuard();

  const ids = Array.from(new Set(input.idsInOrder)).filter(Boolean);
  if (ids.length === 0) return { ok: true };

  // Nur "mittlere" Bereiche dürfen reorderbar sein
  const rows = await prisma.aboutSection.findMany({
    where: { id: { in: ids } },
    select: { id: true, type: true },
  });

  const forbidden = rows.filter((r) => r.type === "HERO" || r.type === "TEAM");
  if (forbidden.length) {
    throw new Error("HERO/TEAM dürfen nicht umsortiert werden.");
  }

  // Sicherstellen, dass alle IDs wirklich existieren
  const foundIds = new Set(rows.map((r) => r.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length) {
    throw new Error("Mindestens ein Bereich existiert nicht (mehr).");
  }

  // Stabil neu nummerieren: 0, 10, 20, ...
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx.aboutSection.update({
        where: { id: ids[i] },
        data: { sortOrder: i * 10 },
      });
    }
  });

  // Aktualisierte Sections inkl. Items zurückgeben (damit Client State sauber wird)
  const updated = await prisma.aboutSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      values: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      gallery: { orderBy: { sortOrder: "asc" } },
    },
  });

  return { ok: true, sections: updated as AboutSectionDTO[] };
}
