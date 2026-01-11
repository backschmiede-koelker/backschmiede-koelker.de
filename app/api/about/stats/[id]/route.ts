// app/api/about/stats/[id]/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminOr401 } from "../../_auth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;
  const b = (await req.json()) as Partial<{
    label: string;
    value: string;
    sortOrder: number;
  }>;

  const data: Partial<{ label: string; value: string; sortOrder: number }> = {};
  if (typeof b.label === "string") data.label = b.label.trim();
  if (typeof b.value === "string") data.value = b.value.trim();
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) data.sortOrder = b.sortOrder;

  const updated = await getPrisma().aboutStatItem.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;

  try {
    await getPrisma().aboutStatItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
