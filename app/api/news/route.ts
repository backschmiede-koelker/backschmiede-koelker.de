// app/api/news/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import { toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";

function slugify(s: string) {
  return s
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue")
    .replace(/Ä/g,"ae").replace(/Ö/g,"oe").replace(/Ü/g,"ue")
    .replace(/ß/g,"ss")
    .normalize("NFKD").replace(/[^\w\s-]/g,"")
    .toLowerCase().trim().replace(/\s+/g,"-").replace(/-+/g,"-");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const onlyActive =
    ["1","true"].includes((searchParams.get("active") ?? "").toLowerCase()) ||
    ["1","true"].includes((searchParams.get("isActive") ?? "").toLowerCase());

  const limitParam = parseInt(searchParams.get("limit") || "", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : undefined;

  const q = (searchParams.get("query") || "").trim();

  const where: Prisma.NewsWhereInput = {};
  if (onlyActive) where.isActive = true;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { body:  { contains: q, mode: "insensitive" } },
      { tag:   { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await getPrisma().news.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  return NextResponse.json(items.map(i => ({
    ...i,
    imageUrl: toAbsoluteAssetUrlServer(i.imageUrl),
  })));
}

export async function POST(req: Request) {
  const b = await req.json() as Partial<{
    title: string;
    body: string;
    imageUrl?: string | null;
    tag?: string | null;
    ctaLabel?: string | null;
    ctaHref?: string | null;
    publishedAt?: string;
    isActive?: boolean;
  }>;

  const title = (b.title || "").trim();
  if (!title || !b.body) return NextResponse.json({ error: "title & body required" }, { status: 400 });

  const publishedAt = b.publishedAt ? new Date(b.publishedAt) : new Date();
  const baseData: Prisma.NewsCreateInput = {
    title,
    body: b.body,
    imageUrl: toStoredPath(b.imageUrl),
    tag: (b.tag || null)?.trim() || null,
    ctaLabel: (b.ctaLabel || null)?.trim() || null,
    ctaHref: (b.ctaHref || null)?.trim() || null,
    publishedAt,
    isActive: b.isActive ?? true,
    slug: "",
  };

  const slugBase = slugify(title);
  try {
    const created = await getPrisma().news.create({
      data: {
        ...baseData,
        slug: slugBase,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
      const alt = `${slugBase}-${Math.random().toString(36).slice(2,5)}`;
      const created = await getPrisma().news.create({
        data: { ...baseData, slug: alt }
      });
      return NextResponse.json(created, { status: 201 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
