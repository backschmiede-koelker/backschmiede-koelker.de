// app/api/admin/tgtg-cta/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { ensureTgtgCta } from "@/app/lib/tgtg-cta.server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return unauthorized();

  const dto = await ensureTgtgCta();
  return NextResponse.json(dto);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return unauthorized();

  const b = (await req.json()) as {
    title: string;
    subtitle?: string | null;
    description?: string | null;

    reckeSubtitle?: string | null;
    mettingenSubtitle?: string | null;

    tgtgAppLinkRecke: string;
    tgtgAppLinkMettingen: string;

    reckeHinweis?: string | null;
    mettingenHinweis?: string | null;
    allgemeinerHinweis?: string | null;

    // ✅ optional
    steps?: { sortOrder: number; title: string; description: string }[];
    faqItems?: { sortOrder: number; question: string; answer: string }[];
  };

  const prisma = getPrisma();

  const existing = await prisma.tgtgCta.findUnique({
    where: { slug: "default" },
    select: { id: true },
  });

  const cta = existing
    ? await prisma.tgtgCta.update({
        where: { slug: "default" },
        data: {
          title: String(b.title || "").trim(),
          subtitle: b.subtitle ?? null,
          description: b.description ?? null,

          reckeSubtitle: b.reckeSubtitle ?? null,
          mettingenSubtitle: b.mettingenSubtitle ?? null,

          tgtgAppLinkRecke: String(b.tgtgAppLinkRecke || "").trim(),
          tgtgAppLinkMettingen: String(b.tgtgAppLinkMettingen || "").trim(),

          reckeHinweis: b.reckeHinweis ?? null,
          mettingenHinweis: b.mettingenHinweis ?? null,
          allgemeinerHinweis: b.allgemeinerHinweis ?? null,
        },
        select: { id: true, slug: true },
      })
    : await prisma.tgtgCta.create({
        data: {
          slug: "default",
          title: String(b.title || "").trim(),
          subtitle: b.subtitle ?? null,
          description: b.description ?? null,

          reckeSubtitle: b.reckeSubtitle ?? null,
          mettingenSubtitle: b.mettingenSubtitle ?? null,

          tgtgAppLinkRecke: String(b.tgtgAppLinkRecke || "").trim(),
          tgtgAppLinkMettingen: String(b.tgtgAppLinkMettingen || "").trim(),

          reckeHinweis: b.reckeHinweis ?? null,
          mettingenHinweis: b.mettingenHinweis ?? null,
          allgemeinerHinweis: b.allgemeinerHinweis ?? null,
        },
        select: { id: true, slug: true },
      });

  // ✅ nur "replace all", wenn steps/faq wirklich gesendet wurden
  const hasSteps = Array.isArray(b.steps);
  const hasFaqs = Array.isArray(b.faqItems);

  if (hasSteps || hasFaqs) {
    await prisma.$transaction(async (tx) => {
      if (hasSteps) {
        await tx.tgtgCtaStep.deleteMany({ where: { ctaId: cta.id } });
        const steps = b.steps ?? [];
        if (steps.length) {
          await tx.tgtgCtaStep.createMany({
            data: steps
              .slice()
              .sort((a, z) => a.sortOrder - z.sortOrder)
              .map((s, idx) => ({
                ctaId: cta.id,
                sortOrder: idx,
                title: String(s.title || "").trim(),
                description: String(s.description || "").trim(),
              })),
          });
        }
      }

      if (hasFaqs) {
        await tx.tgtgCtaFaqItem.deleteMany({ where: { ctaId: cta.id } });
        const faqs = b.faqItems ?? [];
        if (faqs.length) {
          await tx.tgtgCtaFaqItem.createMany({
            data: faqs
              .slice()
              .sort((a, z) => a.sortOrder - z.sortOrder)
              .map((f, idx) => ({
                ctaId: cta.id,
                sortOrder: idx,
                question: String(f.question || "").trim(),
                answer: String(f.answer || "").trim(),
              })),
          });
        }
      }
    });
  }

  const dto = await ensureTgtgCta();
  return NextResponse.json(dto);
}
