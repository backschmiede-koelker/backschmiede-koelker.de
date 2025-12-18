// app/admin/about/actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { toStoredPath } from "@/app/lib/uploads";

type SessionLike = { user?: { role?: string | null } | null } | null | undefined;

function mustBeAdmin(session: SessionLike) {
  if (session?.user?.role !== "ADMIN") redirect("/login");
}

async function adminGuard() {
  const session = (await auth()) as SessionLike;
  mustBeAdmin(session);
}

export async function updateHero(input: {
  id: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null; // kann absolut sein -> wird toStoredPath
  isActive: boolean;
  sortOrder: number;
}) {
  await adminGuard();

  const updated = await prisma.aboutSection.update({
    where: { id: input.id },
    data: {
      title: input.title?.trim() || null,
      subtitle: input.subtitle?.trim() || null,
      body: input.body?.trim() || null,
      imageUrl: toStoredPath(input.imageUrl) ?? null,
      isActive: !!input.isActive,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
    include: {
      stats: true,
      values: true,
      timeline: true,
      faqs: true,
      gallery: true,
    },
  });

  return updated as any;
}

export async function createSection(input: {
  type: string;
  slug?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}) {
  await adminGuard();
  if (String(input.type).toUpperCase() === "HERO") {
    throw new Error("HERO kann nicht erstellt werden (immer genau 1).");
  }

  const type = String(input.type).toUpperCase().trim();

  const created = await prisma.aboutSection.create({
    data: {
      type: type as any,
      slug:
        (input.slug || "").trim() ||
        `${type.toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title?.trim() || null,
      subtitle: input.subtitle?.trim() || null,
      body: input.body?.trim() || null,
      imageUrl: toStoredPath(input.imageUrl) ?? null,
      isActive: input.isActive ?? true,
      sortOrder: Number.isFinite(input.sortOrder as any) ? (input.sortOrder as any) : 0,
    },
    include: {
      stats: true,
      values: true,
      timeline: true,
      faqs: true,
      gallery: true,
    },
  });

  return created as any;
}

export async function updateSection(input: {
  id: string;
  type: string;
  slug: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}) {
  await adminGuard();
  if (String(input.type).toUpperCase() === "HERO") {
    throw new Error("HERO kann nur über den Hero-Editor geändert werden.");
  }

  const updated = await prisma.aboutSection.update({
    where: { id: input.id },
    data: {
      type: String(input.type).toUpperCase().trim() as any,
      slug: String(input.slug || "").trim(),
      title: input.title?.trim() || null,
      subtitle: input.subtitle?.trim() || null,
      body: input.body?.trim() || null,
      imageUrl: toStoredPath(input.imageUrl) ?? null,
      isActive: !!input.isActive,
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

  return updated as any;
}

export async function deleteSection(id: string) {
  await adminGuard();

  const sec = await prisma.aboutSection.findUnique({
    where: { id },
    select: { type: true },
  });
  if (!sec) return { ok: true };

  if ((sec.type as any) === "HERO") {
    throw new Error("HERO kann nicht gelöscht werden.");
  }

  await prisma.aboutSection.delete({ where: { id } });
  return { ok: true };
}

/* ---------------- ITEMS ---------------- */

export async function createStat(input: { sectionId: string; label: string; value: string; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutStatItem.create({
    data: {
      sectionId: input.sectionId,
      label: input.label.trim(),
      value: input.value.trim(),
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function updateStat(input: { id: string; label: string; value: string; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutStatItem.update({
    where: { id: input.id },
    data: {
      label: input.label.trim(),
      value: input.value.trim(),
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function deleteStat(id: string) {
  await adminGuard();
  await prisma.aboutStatItem.delete({ where: { id } });
  return { ok: true };
}

export async function createValue(input: { sectionId: string; title: string; description: string | null; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutValueItem.create({
    data: {
      sectionId: input.sectionId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function updateValue(input: { id: string; title: string; description: string | null; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutValueItem.update({
    where: { id: input.id },
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function deleteValue(id: string) {
  await adminGuard();
  await prisma.aboutValueItem.delete({ where: { id } });
  return { ok: true };
}

export async function createTimeline(input: { sectionId: string; year: string; title: string; description: string | null; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutTimelineItem.create({
    data: {
      sectionId: input.sectionId,
      year: input.year.trim(),
      title: input.title.trim(),
      description: input.description?.trim() || null,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function updateTimeline(input: { id: string; year: string; title: string; description: string | null; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutTimelineItem.update({
    where: { id: input.id },
    data: {
      year: input.year.trim(),
      title: input.title.trim(),
      description: input.description?.trim() || null,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function deleteTimeline(id: string) {
  await adminGuard();
  await prisma.aboutTimelineItem.delete({ where: { id } });
  return { ok: true };
}

export async function createFaq(input: { sectionId: string; question: string; answer: string; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutFaqItem.create({
    data: {
      sectionId: input.sectionId,
      question: input.question.trim(),
      answer: input.answer.trim(),
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function updateFaq(input: { id: string; question: string; answer: string; sortOrder: number }) {
  await adminGuard();
  await prisma.aboutFaqItem.update({
    where: { id: input.id },
    data: {
      question: input.question.trim(),
      answer: input.answer.trim(),
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function deleteFaq(id: string) {
  await adminGuard();
  await prisma.aboutFaqItem.delete({ where: { id } });
  return { ok: true };
}

export async function createGallery(input: { sectionId: string; imageUrl: string; alt: string | null; sortOrder: number }) {
  await adminGuard();
  const stored = toStoredPath(input.imageUrl);
  if (!stored) throw new Error("Bild fehlt");
  await prisma.aboutGalleryItem.create({
    data: {
      sectionId: input.sectionId,
      imageUrl: stored,
      alt: input.alt?.trim() || null,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function updateGallery(input: { id: string; imageUrl: string; alt: string | null; sortOrder: number }) {
  await adminGuard();
  const stored = toStoredPath(input.imageUrl);
  if (!stored) throw new Error("Bild fehlt");
  await prisma.aboutGalleryItem.update({
    where: { id: input.id },
    data: {
      imageUrl: stored,
      alt: input.alt?.trim() || null,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });
  return { ok: true };
}
export async function deleteGallery(id: string) {
  await adminGuard();
  await prisma.aboutGalleryItem.delete({ where: { id } });
  return { ok: true };
}

/* ---------------- PEOPLE ---------------- */

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
  isShownInHero: boolean;
  sortOrder: number;
}) {
  await adminGuard();

  const created = await prisma.aboutPerson.create({
    data: {
      kind: (input.kind as any) || ("TEAM_MEMBER" as any),
      name: input.name.trim(),
      roleLabel: input.roleLabel?.trim() || null,
      shortBio: input.shortBio?.trim() || null,
      longBio: input.longBio?.trim() || null,
      avatarUrl: toStoredPath(input.avatarUrl) ?? null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      instagramHandle: input.instagramHandle?.trim() || null,
      isShownOnAbout: !!input.isShownOnAbout,
      isShownInHero: !!input.isShownInHero,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });

  return created as any;
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
  isShownInHero: boolean;
  sortOrder: number;
}) {
  await adminGuard();

  const updated = await prisma.aboutPerson.update({
    where: { id: input.id },
    data: {
      kind: (input.kind as any) || ("TEAM_MEMBER" as any),
      name: input.name.trim(),
      roleLabel: input.roleLabel?.trim() || null,
      shortBio: input.shortBio?.trim() || null,
      longBio: input.longBio?.trim() || null,
      avatarUrl: toStoredPath(input.avatarUrl) ?? null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      instagramHandle: input.instagramHandle?.trim() || null,
      isShownOnAbout: !!input.isShownOnAbout,
      isShownInHero: !!input.isShownInHero,
      sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    },
  });

  return updated as any;
}

export async function deletePerson(id: string) {
  await adminGuard();
  await prisma.aboutPerson.delete({ where: { id } });
  return { ok: true };
}
