// app/api/news/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pathFromAssetUrl, safeUnlink } from "@/app/lib/uploads"; // <- dein Pfad ggf. anpassen

async function deleteAssetIfUnused(url: string) {
  if (!url) return;
  const [p, n, o] = await prisma.$transaction([
    prisma.product.count({ where: { imageUrl: url } }),
    prisma.news.count({ where: { imageUrl: url } }),
    prisma.offer.count({ where: { imageUrl: url } }),
  ]);
  if (p + n + o === 0) await safeUnlink(pathFromAssetUrl(url));
}

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const item = await prisma.news.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string }}) {
  const body = await req.json() as Partial<{
    title: string; body: string; imageUrl: string | null; tag: string | null;
    ctaLabel: string | null; ctaHref: string | null; isActive: boolean; publishedAt: string;
  }>;

  const prev = await prisma.news.findUnique({ where: { id: params.id }, select: { imageUrl: true } });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: any = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.body === "string") data.body = body.body;
  if (typeof body.imageUrl === "string" || body.imageUrl === null) data.imageUrl = body.imageUrl ?? null;
  if (typeof body.tag === "string" || body.tag === null) data.tag = (body.tag || null)?.trim() || null;
  if (typeof body.ctaLabel === "string" || body.ctaLabel === null) data.ctaLabel = (body.ctaLabel || null)?.trim() || null;
  if (typeof body.ctaHref === "string" || body.ctaHref === null) data.ctaHref = (body.ctaHref || null)?.trim() || null;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.publishedAt === "string") data.publishedAt = new Date(body.publishedAt);

  const updated = await prisma.news.update({ where: { id: params.id }, data });

  // altes Bild ggf. entsorgen (tabellenübergreifend)
  if (body.imageUrl !== undefined && prev.imageUrl && prev.imageUrl !== updated.imageUrl) {
    await deleteAssetIfUnused(prev.imageUrl);
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  const prev = await prisma.news.findUnique({ where: { id: params.id }, select: { imageUrl: true } });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.news.delete({ where: { id: params.id } });

  if (prev.imageUrl) await deleteAssetIfUnused(prev.imageUrl);
  return NextResponse.json({ ok: true });
}
