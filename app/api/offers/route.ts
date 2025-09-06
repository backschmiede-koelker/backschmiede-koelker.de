// /app/api/offers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, OfferKind, Weekday, Location, OfferProductRole } from "@prisma/client";

// ====== Zeitzone Berlin ======
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

async function uniqueOfferSlug(base: string) {
  const root = slugify(base) || "angebot";
  let slug = root;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.offer.findUnique({ where: { slug } });
    if (!exists) return slug;
    i += 1;
    slug = `${root}-${i}`;
  }
}

// ==== GET /api/offers?type=daily|weekly|all&date=YYYY-MM-DD&week=YYYY-MM-DD&location=RECKE&locations=RECKE,METTINGEN
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

    // Öffentliche Filter (isActive: true)
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

    // Admin „all“: KEIN isActive-Filter (damit inaktive bearbeitbar bleiben)
    const allWhere: Prisma.OfferWhereInput = {
      OR: [
        { kind: OfferKind.ONE_DAY,           date: { gte: dayStart, lte: dayEnd } },
        { kind: OfferKind.RECURRING_WEEKDAY, weekday: weekdayToday },
        { kind: OfferKind.DATE_RANGE, AND: [{ startDate: { lte: weekEnd } }, { endDate: { gte: weekStart } }] },
      ],
      ...locationWhere,
    };

    if (type === "daily") {
      const items = await prisma.offer.findMany({
        where: dailyWhere,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, title: true, description: true, priceCents: true, originalPriceCents: true, unit: true,
        },
      });
      return NextResponse.json({
        type,
        from: dayStart.toISOString(),
        to:   dayEnd.toISOString(),
        items,
      });
    }

    if (type === "weekly") {
      const items = await prisma.offer.findMany({
        where: weeklyWhere,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, title: true, description: true, priceCents: true, originalPriceCents: true, unit: true, imageUrl: true, tags: true,
        },
      });
      return NextResponse.json({
        type,
        from: weekStart.toISOString(),
        to:   weekEnd.toISOString(),
        items,
      });
    }

    // type === "all" (Admin): komplette Datensätze + Verknüpfungen
    const items = await prisma.offer.findMany({
      where: allWhere,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, priceCents: true, unit: true } },
          },
        },
      },
    });
    return NextResponse.json({
      type,
      from: dayStart.toISOString(), // „all“ mischt Tages- und Wochenfilter; Datum nur informativ
      to:   dayEnd.toISOString(),
      items,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/**
 * POST /api/offers
 * Body:
 * {
 *   title, description?, priceCents?, originalPriceCents?, unit?, imageUrl, tags?, isActive?,
 *   kind, weekday?, date?, startDate?, endDate?, locations?, priority?,
 *   products?: [{ productId, role, quantity?, perItemPriceCents? }, ...]
 * }
 * - Bild (imageUrl) Pflicht (Angebote nutzen kein Produktbild)
 * - Wenn BUNDLE_COMPONENT vorkommt -> priceCents muss gesetzt sein (Set-Preis)
 * - Slug wird automatisch (eindeutig) vergeben
 */
export async function POST(req: Request) {
  try {
    const b = await req.json() as {
      title: string; description?: string | null; priceCents?: number | null; originalPriceCents?: number | null; unit?: string | null;
      imageUrl?: string | null; tags?: string[]; isActive?: boolean;
      kind: OfferKind; weekday?: Weekday | null; date?: string | null; startDate?: string | null; endDate?: string | null;
      locations?: Location[]; priority?: number;
      products?: Array<{ productId: string; role: OfferProductRole; quantity?: number; perItemPriceCents?: number | null; }>;
    };

    if (!b?.title?.trim()) return NextResponse.json({ error: "Titel ist erforderlich." }, { status: 400 });
    if (!b?.imageUrl) return NextResponse.json({ error: "imageUrl ist erforderlich (Angebote haben ein eigenes Bild)." }, { status: 400 });
    if (!b?.kind || !Object.values(OfferKind).includes(b.kind)) {
      return NextResponse.json({ error: "Ungültige Angebots-Art (kind)." }, { status: 400 });
    }
    if (b.kind === "RECURRING_WEEKDAY" && b.weekday == null) {
      return NextResponse.json({ error: "weekday fehlt für wöchentliches Angebot." }, { status: 400 });
    }
    if (b.kind === "ONE_DAY" && !b.date) {
      return NextResponse.json({ error: "date fehlt für Eintages-Angebot." }, { status: 400 });
    }
    if (b.kind === "DATE_RANGE" && (!b.startDate || !b.endDate)) {
      return NextResponse.json({ error: "startDate/endDate fehlen für Zeitraum-Angebot." }, { status: 400 });
    }

    const products = Array.isArray(b.products) ? b.products : [];
    const hasBundle = products.some((p) => p?.role === "BUNDLE_COMPONENT");
    if (hasBundle && (b.priceCents == null || Number.isNaN(Number(b.priceCents)))) {
      return NextResponse.json({ error: "Set-Preis (priceCents) ist erforderlich, wenn BUNDLE_COMPONENT verwendet wird." }, { status: 400 });
    }

    const slug = await uniqueOfferSlug(b.title);

    const dataOffer: any = {
      slug,
      title: b.title.trim(),
      description: b.description ?? null,
      priceCents: b.priceCents == null ? null : Number(b.priceCents),
      originalPriceCents: b.originalPriceCents == null ? null : Number(b.originalPriceCents),
      unit: b.unit ?? null,
      imageUrl: b.imageUrl,
      tags: b.tags ?? [],
      isActive: b.isActive ?? true,
      kind: b.kind,
      weekday: b.kind === "RECURRING_WEEKDAY" ? (b.weekday as Weekday) : null,
      date: b.kind === "ONE_DAY" ? startOfDayBerlin(new Date(`${b.date}T00:00:00.000Z`)) : null,
      startDate: b.kind === "DATE_RANGE" ? startOfDayBerlin(new Date(`${b.startDate}T00:00:00.000Z`)) : null,
      endDate: b.kind === "DATE_RANGE" ? endOfDayBerlin(new Date(`${b.endDate}T00:00:00.000Z`)) : null,
      locations: Array.isArray(b.locations) ? b.locations : [],
      priority: typeof b.priority === "number" ? b.priority : 0,
    };

    const created = await prisma.$transaction(async (tx) => {
      const o = await tx.offer.create({ data: dataOffer });

      if (products.length > 0) {
        await tx.offerProduct.createMany({
          data: products
            .filter(p => p && p.productId && Object.values(OfferProductRole).includes(p.role))
            .map((p) => ({
              offerId: o.id,
              productId: String(p.productId),
              role: p.role as OfferProductRole,
              quantity: Math.max(1, Number(p.quantity ?? 1)),
              perItemPriceCents: p.perItemPriceCents == null ? null : Number(p.perItemPriceCents),
            })),
        });
      }

      return o;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
