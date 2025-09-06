// /app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Kompatibilitäts-Flags
  const active = searchParams.get("active");
  const isActiveParam = searchParams.get("isActive");
  const onlyActive =
    active === "1" || active?.toLowerCase() === "true" ||
    isActiveParam === "1" || isActiveParam?.toLowerCase() === "true";

  // Optionale Suche
  const query = (searchParams.get("query") || "").trim();
  const limitParam = parseInt(searchParams.get("limit") || "", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : undefined;

  const where: Prisma.ProductWhereInput = {};
  if (onlyActive) where.isActive = true;
  if (query) {
    where.name = {
      contains: query,
      mode: Prisma.QueryMode.insensitive,
    };
  }

  const products = await prisma.product.findMany({
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
      isActive: true,
      createdAt: true,
      updatedAt: true, // <- wichtig für product-grid
    },
  });

  // Rückwärtskompatible Antwortform
  if (query.length > 0) {
    return NextResponse.json({ items: products });
  }
  return NextResponse.json(products);
}

function slugify(s: string) {
  return s
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/Ä/g, "ae")
    .replace(/Ö/g, "oe")
    .replace(/Ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const b = (await req.json()) as {
    name: string;
    priceCents: number;
    unit: string;
    imageUrl?: string | null;
    tags?: string[];
    isActive?: boolean;
  };

  const slug = slugify(b.name);
  try {
    const created = await prisma.product.create({
      data: {
        name: b.name.trim(),
        slug,
        priceCents: b.priceCents,
        unit: b.unit.trim(),
        imageUrl: b.imageUrl ?? null,
        tags: b.tags ?? [],
        isActive: b.isActive ?? true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      const alt = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
      const created = await prisma.product.create({
        data: { ...b, name: b.name.trim(), slug: alt },
      });
      return NextResponse.json(created, { status: 201 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
