// app/api/about/stats/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminOr401 } from "../_auth";

export async function GET(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const sectionId = (searchParams.get("sectionId") || "").trim();

  const items = await getPrisma().aboutStatItem.findMany({
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
    label: string;
    value: string;
    sortOrder?: number;
  };

  if (!b.sectionId || !b.label?.trim() || !b.value?.trim()) {
    return NextResponse.json({ error: "sectionId, label, value required" }, { status: 400 });
  }

  const created = await getPrisma().aboutStatItem.create({
    data: {
      sectionId: b.sectionId,
      label: b.label.trim(),
      value: b.value.trim(),
      sortOrder: Number.isFinite(b.sortOrder) ? (b.sortOrder as number) : 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
