// app/api/admin/tgtg-cta/faqs/reorder/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return unauthorized();

  const prisma = getPrisma();
  const body = (await req.json()) as { order: { id: string; sortOrder: number }[] };

  const order = Array.isArray(body.order) ? body.order : [];

  const uniq = new Map<string, number>();
  for (const o of order) {
    if (o?.id) uniq.set(o.id, Number(o.sortOrder ?? 0));
  }

  await prisma.$transaction(
    Array.from(uniq.entries()).map(([id, sortOrder]) =>
      prisma.tgtgCtaFaqItem.update({
        where: { id },
        data: { sortOrder },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
