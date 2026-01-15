// app/api/admin/tgtg-cta/steps/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return unauthorized();

  const prisma = getPrisma();
  const body = (await req.json()) as { title?: string; description?: string };

  const cta = await prisma.tgtgCta.findUnique({
    where: { slug: "default" },
    select: { id: true },
  });

  // falls noch nicht existiert, erstellen wir minimal
  const ctaId =
    cta?.id ??
    (
      await prisma.tgtgCta.create({
        data: {
          slug: "default",
          title: "Too Good To Go - Überraschungstüten",
          subtitle: null,
          description: null,
          reckeSubtitle: null,
          mettingenSubtitle: null,
          tgtgAppLinkRecke: "",
          tgtgAppLinkMettingen: "",
          reckeHinweis: null,
          mettingenHinweis: null,
          allgemeinerHinweis: null,
        },
        select: { id: true },
      })
    ).id;

  const last = await prisma.tgtgCtaStep.findFirst({
    where: { ctaId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const nextOrder = (last?.sortOrder ?? -1) + 1;

  const created = await prisma.tgtgCtaStep.create({
    data: {
      ctaId,
      sortOrder: nextOrder,
      title: String(body.title ?? "Neuer Schritt").trim(),
      description: String(body.description ?? "").trim(),
    },
    select: { id: true, sortOrder: true, title: true, description: true },
  });

  return NextResponse.json(created);
}
