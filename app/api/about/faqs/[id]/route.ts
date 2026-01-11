// app/api/about/faqs/[id]/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminOr401 } from "../../_auth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;
  const b = (await req.json()) as Partial<{
    question: string;
    answer: string;
    sortOrder: number;
  }>;

  const data: Partial<{ question: string; answer: string; sortOrder: number }> = {};
  if (typeof b.question === "string") data.question = b.question.trim();
  if (typeof b.answer === "string") data.answer = b.answer.trim();
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) data.sortOrder = b.sortOrder;

  const updated = await getPrisma().aboutFaqItem.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;

  try {
    await getPrisma().aboutFaqItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
