// app/api/admin/tgtg-cta/faqs/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return unauthorized();

  const { id } = await params;
  const prisma = getPrisma();

  const body = (await req.json()) as { question?: string; answer?: string };

  const updated = await prisma.tgtgCtaFaqItem.update({
    where: { id },
    data: {
      question: String(body.question ?? "").trim(),
      answer: String(body.answer ?? "").trim(),
    },
    select: { id: true, sortOrder: true, question: true, answer: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return unauthorized();

  const { id } = await params;
  const prisma = getPrisma();

  const item = await prisma.tgtgCtaFaqItem.findUnique({
    where: { id },
    select: { id: true, ctaId: true },
  });
  if (!item) return NextResponse.json({ ok: true });

  await prisma.tgtgCtaFaqItem.delete({ where: { id } });

  const rest = await prisma.tgtgCtaFaqItem.findMany({
    where: { ctaId: item.ctaId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  await prisma.$transaction(
    rest.map((f, idx) =>
      prisma.tgtgCtaFaqItem.update({
        where: { id: f.id },
        data: { sortOrder: idx },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
