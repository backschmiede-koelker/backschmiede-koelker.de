import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, OfferKind, Weekday, Location } from "@prisma/client";

const TZ = "Europe/Berlin";
const toBerlin = (d: Date) => new Date(new Date(d.toLocaleString("en-US", { timeZone: TZ })).getTime());
const startOfDay = (d: Date) => { const z = toBerlin(d); z.setHours(0,0,0,0); return z; };
const endOfDay   = (d: Date) => { const z = toBerlin(d); z.setHours(23,59,59,999); return z; };

function slugify(s: string) {
  return s
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue")
    .replace(/Ä/g,"ae").replace(/Ö/g,"oe").replace(/Ü/g,"ue")
    .replace(/ß/g,"ss")
    .normalize("NFKD").replace(/[^\w\s-]/g,"")
    .toLowerCase().trim().replace(/\s+/g,"-").replace(/-+/g,"-");
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await prisma.offer.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const b = await req.json() as Partial<{
      title: string; slug: string; description: string | null; priceCents: number | null; unit: string | null;
      imageUrl: string | null; tags: string[]; isActive: boolean; kind: OfferKind; weekday: Weekday | null;
      date: string | null; startDate: string | null; endDate: string | null; locations: Location[]; priority: number; productId: string | null;
    }>;

    const data: Prisma.OfferUpdateInput = {};

    if (typeof b.title === "string") data.title = b.title.trim();
    if (typeof b.slug === "string")  data.slug  = b.slug.trim();

    if (b.description !== undefined) data.description = b.description;
    if (typeof b.priceCents === "number") data.priceCents = b.priceCents;
    if (b.unit !== undefined) data.unit = b.unit;
    if (b.imageUrl !== undefined) data.imageUrl = b.imageUrl;
    if (Array.isArray(b.tags)) data.tags = b.tags;
    if (typeof b.isActive === "boolean") data.isActive = b.isActive;

    if (b.kind) data.kind = b.kind;
    if (b.weekday !== undefined) data.weekday = b.weekday;
    if (b.date !== undefined) data.date = b.date ? startOfDay(new Date(`${b.date}T00:00:00.000Z`)) : null;
    if (b.startDate !== undefined) data.startDate = b.startDate ? startOfDay(new Date(`${b.startDate}T00:00:00.000Z`)) : null;
    if (b.endDate !== undefined) data.endDate = b.endDate ? endOfDay(new Date(`${b.endDate}T00:00:00.000Z`)) : null;

    if (Array.isArray(b.locations)) data.locations = b.locations;

    if (b.priority !== undefined) data.priority = b.priority;
    if (b.productId !== undefined) {
      data.product = b.productId ? { connect: { id: b.productId } } : { disconnect: true };
    }

    try {
      const updated = await prisma.offer.update({ where: { id: params.id }, data });
      return NextResponse.json(updated);
    } catch (e: any) {
      if (e?.code === "P2002" && typeof (data as any).slug === "string") {
        const alt = `${(data as any).slug}-${Math.random().toString(36).slice(2,5)}`;
        const updated = await prisma.offer.update({ where: { id: params.id }, data: { ...data, slug: alt } });
        return NextResponse.json(updated);
      }
      throw e;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.offer.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
