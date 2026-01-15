// app/api/admin/tgtg-cta/faqs/route.ts
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
  const body = (await req.json()) as { question?: string; answer?: string };

  const cta = await prisma.tgtgCta.findUnique({
    where: { slug: "default" },
    select: { id: true },
  });

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

  const last = await prisma.tgtgCtaFaqItem.findFirst({
    where: { ctaId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const nextOrder = (last?.sortOrder ?? -1) + 1;

  const created = await prisma.tgtgCtaFaqItem.create({
    data: {
      ctaId,
      sortOrder: nextOrder,
      question: String(body.question ?? "Neue Frage").trim(),
      answer: String(body.answer ?? "").trim(),
    },
    select: { id: true, sortOrder: true, question: true, answer: true },
  });

  return NextResponse.json(created);
}
