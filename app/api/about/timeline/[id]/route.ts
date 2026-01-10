// app/api/about/timeline/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOr401 } from "../../_auth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;
  const b = (await req.json()) as Partial<{
    year: string;
    title: string;
    description: string | null;
    sortOrder: number;
  }>;

  const data: any = {};
  if (typeof b.year === "string") data.year = b.year.trim();
  if (typeof b.title === "string") data.title = b.title.trim();
  if (b.description === null || typeof b.description === "string") data.description = b.description;
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) data.sortOrder = b.sortOrder;

  const updated = await prisma.aboutTimelineItem.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;

  try {
    await prisma.aboutTimelineItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
