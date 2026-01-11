// app/api/news/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import { pathFromStoredPath, safeUnlink, toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";

async function deleteAssetIfUnused(stored?: string | null) {
  const s = toStoredPath(stored);
  if (!s) return;
  const [p, n, o] = await prisma.$transaction([
    prisma.product.count({ where: { imageUrl: s } }),
    prisma.news.count({ where: { imageUrl: s } }),
    prisma.offer.count({ where: { imageUrl: s } }),
  ]);
  if (p + n + o === 0) await safeUnlink(pathFromStoredPath(s));
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = await prisma.news.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...item, imageUrl: toAbsoluteAssetUrlServer(item.imageUrl) });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json() as Partial<{
    title: string; body: string; imageUrl: string | null; tag: string | null;
    ctaLabel: string | null; ctaHref: string | null; isActive: boolean; publishedAt: string;
  }>;

  const prev = await prisma.news.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Partial<{
    title: string;
    body: string;
    imageUrl: string | null;
    tag: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    isActive: boolean;
    publishedAt: Date;
  }> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.body === "string") data.body = body.body;
  if (typeof body.imageUrl === "string" || body.imageUrl === null) data.imageUrl = toStoredPath(body.imageUrl);
  if (typeof body.tag === "string" || body.tag === null) data.tag = (body.tag || null)?.trim() || null;
  if (typeof body.ctaLabel === "string" || body.ctaLabel === null) data.ctaLabel = (body.ctaLabel || null)?.trim() || null;
  if (typeof body.ctaHref === "string" || body.ctaHref === null) data.ctaHref = (body.ctaHref || null)?.trim() || null;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.publishedAt === "string") data.publishedAt = new Date(body.publishedAt);

  const updated = await prisma.news.update({ where: { id }, data });

  if (body.imageUrl !== undefined && prev.imageUrl && prev.imageUrl !== updated.imageUrl) {
    await deleteAssetIfUnused(prev.imageUrl);
  }
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const prev = await prisma.news.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.news.delete({ where: { id } });

  if (prev.imageUrl) await deleteAssetIfUnused(prev.imageUrl);
  return NextResponse.json({ ok: true });
}
