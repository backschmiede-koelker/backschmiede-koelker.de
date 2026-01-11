// app/api/about/sections/[id]/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import { requireAdminOr401 } from "../../_auth";

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

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;

  const item = await getPrisma().aboutSection.findUnique({
    where: { id },
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      values: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      gallery: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;
  const b = (await req.json()) as Partial<{
    type: string;
    slug: string;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
  }>;

  const data: Partial<{
    type: SectionType;
    slug: string;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
  }> = {};
  if (typeof b.type === "string") data.type = b.type as SectionType;
  if (typeof b.slug === "string") data.slug = b.slug.trim();
  if (b.title === null || typeof b.title === "string") data.title = b.title;
  if (b.subtitle === null || typeof b.subtitle === "string") data.subtitle = b.subtitle;
  if (b.body === null || typeof b.body === "string") data.body = b.body;
  if (b.imageUrl === null || typeof b.imageUrl === "string") data.imageUrl = toStoredPath(b.imageUrl);
  if (typeof b.isActive === "boolean") data.isActive = b.isActive;
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) data.sortOrder = b.sortOrder;

  const updated = await getPrisma().aboutSection.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;

  try {
    await getPrisma().aboutSection.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
