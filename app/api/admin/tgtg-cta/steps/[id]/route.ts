// app/api/admin/tgtg-cta/steps/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return unauthorized();

  const prisma = getPrisma();
  const { id } = ctx.params;

  const body = (await req.json()) as { title?: string; description?: string };

  const updated = await prisma.tgtgCtaStep.update({
    where: { id },
    data: {
      title: String(body.title ?? "").trim(),
      description: String(body.description ?? "").trim(),
    },
    select: { id: true, sortOrder: true, title: true, description: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return unauthorized();

  const prisma = getPrisma();
  const { id } = ctx.params;

  // ctaId holen, danach löschen, danach sortOrder normalisieren
  const step = await prisma.tgtgCtaStep.findUnique({
    where: { id },
    select: { id: true, ctaId: true },
  });
  if (!step) return NextResponse.json({ ok: true });

  await prisma.tgtgCtaStep.delete({ where: { id } });

  const rest = await prisma.tgtgCtaStep.findMany({
    where: { ctaId: step.ctaId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  await prisma.$transaction(
    rest.map((s, idx) =>
      prisma.tgtgCtaStep.update({
        where: { id: s.id },
        data: { sortOrder: idx },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
