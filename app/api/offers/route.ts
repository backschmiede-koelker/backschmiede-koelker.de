import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, OfferKind, Weekday, Location } from "@prisma/client";

const TZ = "Europe/Berlin";

function toBerlinDate(d: Date) {
  return new Date(new Date(d.toLocaleString("en-US", { timeZone: TZ })).getTime());
}
function startOfDayBerlin(d: Date) { const z = toBerlinDate(d); z.setHours(0,0,0,0); return z; }
function endOfDayBerlin(d: Date)   { const z = toBerlinDate(d); z.setHours(23,59,59,999); return z; }
function startOfWeekBerlin(d: Date) {
  const z = toBerlinDate(d); const js = z.getDay(); const moOffset = (js + 6) % 7;
  z.setDate(z.getDate() - moOffset); z.setHours(0,0,0,0); return z;
}
function endOfWeekBerlin(d: Date) { const s = startOfWeekBerlin(d); const e = new Date(s); e.setDate(e.getDate()+6); e.setHours(23,59,59,999); return e; }
function parseDateParam(s: string | null) { if(!s) return null; if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; return new Date(`${s}T00:00:00.000Z`); }
function weekdayEnumBerlin(d: Date): Weekday {
  const js = toBerlinDate(d).getDay(); const idx = (js + 6) % 7;
  return [Weekday.MONDAY,Weekday.TUESDAY,Weekday.WEDNESDAY,Weekday.THURSDAY,Weekday.FRIDAY,Weekday.SATURDAY,Weekday.SUNDAY][idx]!;
}
function slugify(s: string) {
  return s
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue")
    .replace(/Ä/g,"ae").replace(/Ö/g,"oe").replace(/Ü/g,"ue")
    .replace(/ß/g,"ss")
    .normalize("NFKD").replace(/[^\w\s-]/g,"")
    .toLowerCase().trim().replace(/\s+/g,"-").replace(/-+/g,"-");
}

// GET /api/offers?type=daily|weekly|all&date=YYYY-MM-DD&week=YYYY-MM-DD&location=RECKE&locations=RECKE,METTINGEN
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const t = (url.searchParams.get("type") || "weekly").toLowerCase();
    const type: "daily" | "weekly" | "all" = t === "daily" ? "daily" : t === "all" ? "all" : "weekly";
    const dateParam = parseDateParam(url.searchParams.get("date"));
    const weekParam = parseDateParam(url.searchParams.get("week"));

    const locSingle = url.searchParams.get("location");
    const locMulti = url.searchParams.get("locations");
    const locations: Location[] = locMulti
      ? (locMulti.split(",").map(s => s.trim()).filter(Boolean) as Location[])
      : locSingle ? ([locSingle] as Location[]) : [];

    const baseDate = dateParam ?? weekParam ?? new Date();
    const dayStart = startOfDayBerlin(baseDate);
    const dayEnd   = endOfDayBerlin(baseDate);
    const weekStart = startOfWeekBerlin(weekParam ?? baseDate);
    const weekEnd   = endOfWeekBerlin(weekParam ?? baseDate);
    const weekdayToday = weekdayEnumBerlin(baseDate);

    const locationWhere: Prisma.OfferWhereInput =
      locations.length > 0 ? { locations: { hasSome: locations } } : {};

    const dailyWhere: Prisma.OfferWhereInput = {
      isActive: true,
      OR: [
        { kind: OfferKind.ONE_DAY,           date: { gte: dayStart, lte: dayEnd } },
        { kind: OfferKind.RECURRING_WEEKDAY, weekday: weekdayToday },
        { kind: OfferKind.DATE_RANGE, AND: [{ startDate: { lte: dayEnd } }, { endDate: { gte: dayStart } }] },
      ],
      ...locationWhere,
    };

    const weeklyWhere: Prisma.OfferWhereInput = {
      isActive: true,
      kind: OfferKind.DATE_RANGE,
      startDate: { lte: weekEnd },
      endDate:   { gte: weekStart },
      ...locationWhere,
    };

    const allWhere: Prisma.OfferWhereInput = {
      isActive: true,
      OR: [
        { kind: OfferKind.ONE_DAY,           date: { gte: dayStart, lte: dayEnd } },
        { kind: OfferKind.RECURRING_WEEKDAY, weekday: weekdayToday },
        { kind: OfferKind.DATE_RANGE, AND: [{ startDate: { lte: weekEnd } }, { endDate: { gte: weekStart } }] },
      ],
      ...locationWhere,
    };

    const where = type === "daily" ? dailyWhere : type === "weekly" ? weeklyWhere : allWhere;

    const items = await prisma.offer.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      type,
      from: (type === "weekly" ? weekStart : dayStart).toISOString(),
      to:   (type === "weekly" ? weekEnd   : dayEnd).toISOString(),
      items,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// POST /api/offers
export async function POST(req: Request) {
  try {
    const b = await req.json() as {
      title: string; description?: string | null; priceCents?: number | null; unit?: string | null;
      imageUrl?: string | null; tags?: string[]; isActive?: boolean;
      kind: OfferKind; weekday?: Weekday | null; date?: string | null; startDate?: string | null; endDate?: string | null;
      locations?: Location[]; priority?: number; productId?: string | null;
    };

    const slug = slugify(b.title);
    const data: Prisma.OfferCreateInput = {
      slug,
      title: b.title.trim(),
      description: b.description ?? null,
      priceCents: typeof b.priceCents === "number" ? b.priceCents : null,
      unit: b.unit ?? null,
      imageUrl: b.imageUrl ?? null,
      tags: b.tags ?? [],
      isActive: b.isActive ?? true,
      kind: b.kind,
      weekday: b.weekday ?? null,
      date: b.date ? startOfDayBerlin(new Date(`${b.date}T00:00:00.000Z`)) : null,
      startDate: b.startDate ? startOfDayBerlin(new Date(`${b.startDate}T00:00:00.000Z`)) : null,
      endDate: b.endDate ? endOfDayBerlin(new Date(`${b.endDate}T00:00:00.000Z`)) : null,
      locations: b.locations?.length ? b.locations : [],
      priority: b.priority ?? 0,
      product: b.productId ? { connect: { id: b.productId } } : undefined,
    };

    const created = await prisma.offer.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      // unique slug fallback
      const body = await req.json();
      const alt = `${slugify(body.title)}-${Math.random().toString(36).slice(2,5)}`;
      const created = await prisma.offer.create({ data: { ...body, slug: alt } as any });
      return NextResponse.json(created, { status: 201 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
