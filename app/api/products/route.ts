// app/api/products/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { Prisma, Allergen } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import { toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const active = searchParams.get("active");
  const isActiveParam = searchParams.get("isActive");
  const onlyActive =
    active === "1" || active?.toLowerCase() === "true" ||
    isActiveParam === "1" || isActiveParam?.toLowerCase() === "true";

  const query = (searchParams.get("query") || "").trim();
  const limitParam = parseInt(searchParams.get("limit") || "", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : undefined;

  const where: Prisma.ProductWhereInput = {};
  if (onlyActive) where.isActive = true;
  if (query) {
    where.name = { contains: query, mode: Prisma.QueryMode.insensitive };
  }

  const products = await getPrisma().product.findMany({
    where,
    orderBy: query ? { name: "asc" } : { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      unit: true,
      imageUrl: true,
      tags: true,
      allergens: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const mapped = products.map(p => ({ ...p, imageUrl: toAbsoluteAssetUrlServer(p.imageUrl) }));
  return query ? NextResponse.json({ items: mapped }) : NextResponse.json(mapped);
}

function slugify(s: string) {
  return s
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "ae").replace(/Ö/g, "oe").replace(/Ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[^\w\s-]/g, "")
    .toLowerCase().trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const b = (await req.json()) as {
    name: string;
    priceCents: number;
    unit: string;
    imageUrl?: string | null;
    tags?: string[];
    allergens?: Allergen[];
    isActive?: boolean;
  };

  const slug = slugify(b.name);
  try {
    const created = await getPrisma().product.create({
      data: {
        name: b.name.trim(),
        slug,
        priceCents: b.priceCents,
        unit: b.unit.trim(),
        imageUrl: toStoredPath(b.imageUrl),
        tags: b.tags ?? [],
        allergens: b.allergens ?? [],
        isActive: b.isActive ?? true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
      const alt = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
      const created = await getPrisma().product.create({
        data: { ...b, name: b.name.trim(), slug: alt, imageUrl: toStoredPath(b.imageUrl) },
      });
      return NextResponse.json(created, { status: 201 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
