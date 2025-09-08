// /app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pathFromAssetUrl, safeUnlink } from "../../../lib/uploads";

function slugify(s: string) {
  return s
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue")
    .replace(/Ä/g,"ae").replace(/Ö/g,"oe").replace(/Ü/g,"ue")
    .replace(/ß/g,"ss")
    .normalize("NFKD").replace(/[^\w\s-]/g,"")
    .toLowerCase().trim().replace(/\s+/g,"-").replace(/-+/g,"-");
}

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
  const item = await prisma.product.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string }}) {
  const body = await req.json() as Partial<{
    name: string;
    slug: string;
    priceCents: number;
    unit: string;
    imageUrl: string | null;
    tags: string[];
    isActive: boolean;
  }>;

  const prev = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true, imageUrl: true },
  });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: any = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.slug === "string") data.slug = body.slug.trim();
  if (!body.slug && typeof body.name === "string") data.slug = slugify(body.name);

  if (typeof body.priceCents === "number" && Number.isFinite(body.priceCents)) data.priceCents = body.priceCents;
  if (typeof body.unit === "string") data.unit = body.unit.trim();
  if (typeof body.imageUrl === "string" || body.imageUrl === null) data.imageUrl = body.imageUrl ?? null;
  if (Array.isArray(body.tags)) data.tags = body.tags.map(t => String(t));
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  try {
    const updated = await prisma.product.update({ where: { id: params.id }, data });

    // altes Bild ggf. löschen, wenn niemand es mehr nutzt
    if (body.imageUrl !== undefined && prev.imageUrl && prev.imageUrl !== updated.imageUrl) {
      await deleteAssetIfUnused(prev.imageUrl);
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2002") {
      if (data.slug) {
        const alt = `${data.slug}-${Math.random().toString(36).slice(2,5)}`;
        const updated = await prisma.product.update({
          where: { id: params.id },
          data: { ...data, slug: alt },
        });
        return NextResponse.json(updated);
      }
      return NextResponse.json({ error: "Slug bereits vergeben" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  try {
    const prev = await prisma.product.findUnique({
      where: { id: params.id },
      select: { imageUrl: true },
    });
    if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.product.delete({ where: { id: params.id } });

    if (prev.imageUrl) {
      await deleteAssetIfUnused(prev.imageUrl);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
