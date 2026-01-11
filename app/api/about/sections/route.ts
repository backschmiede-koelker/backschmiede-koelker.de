// app/api/about/sections/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import { requireAdminOr401 } from "../_auth";

type SectionType =
  | "HERO"
  | "VALUES"
  | "STATS"
  | "TIMELINE"
  | "TEAM"
  | "GALLERY"
  | "FAQ"
  | "CTA"
  | "CUSTOM_TEXT";

export async function GET(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "").trim();
  const includeItems = searchParams.get("includeItems") === "1";

  const typeFilter = type ? (type as SectionType) : undefined;
  const items = await prisma.aboutSection.findMany({
    ...(typeFilter ? { where: { type: typeFilter } } : {}),
    orderBy: { sortOrder: "asc" },
    ...(includeItems
      ? {
          include: {
            stats: { orderBy: { sortOrder: "asc" } },
            values: { orderBy: { sortOrder: "asc" } },
            timeline: { orderBy: { sortOrder: "asc" } },
            faqs: { orderBy: { sortOrder: "asc" } },
            gallery: { orderBy: { sortOrder: "asc" } },
          },
        }
      : {}),
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const b = (await req.json()) as {
    type: string;
    slug?: string;
    title?: string | null;
    subtitle?: string | null;
    body?: string | null;
    imageUrl?: string | null; // can be absolute, we store relative
    isActive?: boolean;
    sortOrder?: number;
  };

  const created = await prisma.aboutSection.create({
    data: {
      type: b.type as SectionType,
      slug: (b.slug || "").trim() || `${String(b.type).toLowerCase()}-${Date.now()}`,
      title: b.title ?? null,
      subtitle: b.subtitle ?? null,
      body: b.body ?? null,
      imageUrl: toStoredPath(b.imageUrl) ?? null,
      isActive: b.isActive ?? true,
      sortOrder: Number.isFinite(b.sortOrder) ? b.sortOrder : 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
