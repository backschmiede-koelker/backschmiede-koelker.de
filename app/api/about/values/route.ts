// app/api/about/values/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOr401 } from "../_auth";

export async function GET(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const sectionId = (searchParams.get("sectionId") || "").trim();

  const items = await prisma.aboutValueItem.findMany({
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
    title: string;
    description?: string | null;
    sortOrder?: number;
  };

  if (!b.sectionId || !b.title?.trim()) {
    return NextResponse.json({ error: "sectionId, title required" }, { status: 400 });
  }

  const created = await prisma.aboutValueItem.create({
    data: {
      sectionId: b.sectionId,
      title: b.title.trim(),
      description: b.description ?? null,
      sortOrder: Number.isFinite(b.sortOrder) ? (b.sortOrder as number) : 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
