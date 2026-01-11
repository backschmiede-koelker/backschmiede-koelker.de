// app/api/about/timeline/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminOr401 } from "../_auth";

export async function GET(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const sectionId = (searchParams.get("sectionId") || "").trim();

  const items = await getPrisma().aboutTimelineItem.findMany({
    ...(sectionId ? { where: { sectionId } } : {}),
    orderBy: [{ sectionId: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const b = (await req.json()) as {
    sectionId: string;
    year: string;
    title: string;
    description?: string | null;
    sortOrder?: number;
  };

  if (!b.sectionId || !b.year?.trim() || !b.title?.trim()) {
    return NextResponse.json({ error: "sectionId, year, title required" }, { status: 400 });
  }

  const created = await getPrisma().aboutTimelineItem.create({
    data: {
      sectionId: b.sectionId,
      year: b.year.trim(),
      title: b.title.trim(),
      description: b.description ?? null,
      sortOrder: Number.isFinite(b.sortOrder) ? (b.sortOrder as number) : 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
