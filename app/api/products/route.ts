import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function slugify(s: string) {
  return s
    .replace(/ä/g,"ae")
    .replace(/ö/g,"oe")
    .replace(/ü/g,"ue")
    .replace(/Ä/g,"ae")
    .replace(/Ö/g,"oe")
    .replace(/Ü/g,"ue")
    .replace(/ß/g,"ss")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g,"")
    .toLowerCase()
    .trim()
    .replace(/\s+/g,"-")
    .replace(/-+/g,"-");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const active = searchParams.get("active")
  const isActiveParam = searchParams.get("isActive")
  const all = searchParams.get("all")

  const onlyActive =
    (active === "1" || active?.toLowerCase() === "true" ||
     isActiveParam === "1" || isActiveParam?.toLowerCase() === "true")

  const products = await prisma.product.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const b = await req.json() as {
    name: string; priceCents: number; unit: string;
    imageUrl?: string | null; tags?: string[]; isActive?: boolean;
  }

  const slug = slugify(b.name)
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
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e?.code === "P2002") {
      const alt = `${slug}-${Math.random().toString(36).slice(2,5)}`
      const created = await prisma.product.create({
        data: { ...b, slug: alt }
      })
      return NextResponse.json(created, { status: 201 })
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
