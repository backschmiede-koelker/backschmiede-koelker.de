// app/api/offers/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { Prisma, OfferKind, Weekday, Location, OfferType } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import { toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";

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
  let slug = root; let i = 1;
  while (true) {
    const exists = await getPrisma().offer.findUnique({ where: { slug } });
    if (!exists) return slug;
    i += 1; slug = `${root}-${i}`;
  }
}

// ====== Mapping → DTO (absolute URLs) ======
const offerInclude = {
  generic: true,
  productNew: {
    include: {
      product: { select: { id: true, name: true, priceCents: true, unit: true } },
    },
  },
  productDiscount: {
    include: {
      product: { select: { id: true, name: true, priceCents: true, unit: true } },
    },
  },
  multibuyPrice: {
    include: {
      product: { select: { id: true, name: true, priceCents: true, unit: true } },
    },
  },
} as const;

type OfferWithDetails = Prisma.OfferGetPayload<{ include: typeof offerInclude }>;

function toDTO(item: OfferWithDetails) {
  const common = {
    id: item.id,
    type: item.type,
    title: item.title,
    subtitle: item.subtitle,
    imageUrl: toAbsoluteAssetUrlServer(item.imageUrl),
    tags: item.tags,
    isActive: item.isActive,
    kind: item.kind,
    weekday: item.weekday,
    date: item.date?.toISOString?.() ?? null,
    startDate: item.startDate?.toISOString?.() ?? null,
    endDate: item.endDate?.toISOString?.() ?? null,
    locations: item.locations,
    priority: item.priority,
    minBasketCents: item.minBasketCents ?? null,

    // Basis-Preisfelder aus Offer - für GENERIC & Co als Fallback nutzbar
    priceCents: item.priceCents ?? null,
    originalPriceCents: item.originalPriceCents ?? null,
    unit: item.unit ?? null,
  };

  if (item.type === "GENERIC") {
    return {
      ...common,
      generic: {
        body: item.generic?.body ?? null,
        ctaLabel: item.generic?.ctaLabel ?? null,
        ctaHref: item.generic?.ctaHref ?? null,
      },
    };
  }
  if (item.type === "PRODUCT_NEW") {
    return {
      ...common,
      productNew: item.productNew
        ? {
            product: item.productNew.product,
            highlightLabel: item.productNew.highlightLabel ?? null,
          }
        : undefined,
    };
  }
  if (item.type === "PRODUCT_DISCOUNT") {
    return {
      ...common,
      productDiscount: item.productDiscount
        ? {
            product: item.productDiscount.product,
            priceCents: item.productDiscount.priceCents,
            originalPriceCents: item.productDiscount.originalPriceCents ?? null,
            unit: item.productDiscount.unit ?? null,
          }
        : undefined,
    };
  }
  if (item.type === "MULTIBUY_PRICE") {
    return {
      ...common,
      multibuyPrice: item.multibuyPrice
        ? {
            product: item.multibuyPrice.product,
            packQty: item.multibuyPrice.packQty,
            packPriceCents: item.multibuyPrice.packPriceCents,
            comparePackQty: item.multibuyPrice.comparePackQty ?? null,
            comparePriceCents: item.multibuyPrice.comparePriceCents ?? null,
            unit: item.multibuyPrice.unit ?? null,
          }
        : undefined,
    };
  }
  return common;
}

// ====== GET: Listen (today/upcoming/weekly/all) ======
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tRaw = (url.searchParams.get("type") || "today").toLowerCase();

    // Alias "daily" → "today", "weekly" bleibt
    const listType: "today" | "upcoming" | "weekly" | "all" =
      tRaw === "upcoming"
        ? "upcoming"
        : tRaw === "weekly"
        ? "weekly"
        : tRaw === "all"
        ? "all"
        : "today";

    const dateParam = parseDateParam(url.searchParams.get("date"));
    const weekParam = parseDateParam(url.searchParams.get("week"));

    const locSingle = url.searchParams.get("location");
    const locMulti = url.searchParams.get("locations");
    const locations: Location[] = locMulti
      ? (locMulti.split(",").map((s) => s.trim()).filter(Boolean) as Location[])
      : locSingle
      ? ([locSingle] as Location[])
      : [];

    const baseDate = dateParam ?? weekParam ?? new Date();
    const dayStart = startOfDayBerlin(baseDate);
    const dayEnd = endOfDayBerlin(baseDate);
    const weekStart = startOfWeekBerlin(weekParam ?? baseDate);
    const weekEnd = endOfWeekBerlin(weekParam ?? baseDate);
    const weekdayToday = weekdayEnumBerlin(baseDate);

    const locationWhere: Prisma.OfferWhereInput =
      locations.length > 0 ? { locations: { hasSome: locations } } : {};

    const activeBase: Prisma.OfferWhereInput = {
      isActive: true,
      ...locationWhere,
    };

    // HEUTE gültige Angebote:
    // - ONE_DAY: date = heute
    // - RECURRING_WEEKDAY: weekday = heute
    // - DATE_RANGE: überlappt heutigen Tag
    const todayWhere: Prisma.OfferWhereInput = {
      ...activeBase,
      OR: [
        { kind: OfferKind.ONE_DAY, date: { gte: dayStart, lte: dayEnd } },
        { kind: OfferKind.RECURRING_WEEKDAY, weekday: weekdayToday },
        {
          kind: OfferKind.DATE_RANGE,
          AND: [{ startDate: { lte: dayEnd } }, { endDate: { gte: dayStart } }],
        },
      ],
    };

    // DEMNÄCHST gültige Angebote (in Zukunft, nicht heute):
    // - ONE_DAY: date > heute
    // - RECURRING_WEEKDAY: anderer Wochentag
    // - DATE_RANGE: Startdatum nach heute
    const upcomingWhere: Prisma.OfferWhereInput = {
      ...activeBase,
      OR: [
        { kind: OfferKind.ONE_DAY, date: { gt: dayEnd } },
        {
          kind: OfferKind.RECURRING_WEEKDAY,
          NOT: { weekday: weekdayToday },
        },
        {
          kind: OfferKind.DATE_RANGE,
          startDate: { gt: dayEnd },
        },
      ],
    };

    // Alte Wochenlogik (DATE_RANGE, die Woche überlappen) - falls du sie später noch nutzt
    const weeklyWhere: Prisma.OfferWhereInput = {
      ...activeBase,
      kind: OfferKind.DATE_RANGE,
      startDate: { lte: weekEnd },
      endDate: { gte: weekStart },
    };

    // Admin-Ansicht: alle Angebote (inkl. inaktiver)
    const allWhere: Prisma.OfferWhereInput =
      listType === "all" ? { ...locationWhere } : {};

    if (listType === "today") {
      const rows = await getPrisma().offer.findMany({
        where: todayWhere,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        include: offerInclude,
      });
      return NextResponse.json({
        type: "today",
        date: dayStart.toISOString(),
        items: rows.map(toDTO),
      });
    }

    if (listType === "upcoming") {
      const rows = await getPrisma().offer.findMany({
        where: upcomingWhere,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        include: offerInclude,
      });
      return NextResponse.json({
        type: "upcoming",
        items: rows.map(toDTO),
      });
    }

    if (listType === "weekly") {
      const rows = await getPrisma().offer.findMany({
        where: weeklyWhere,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        include: offerInclude,
      });
      return NextResponse.json({
        type: "weekly",
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
        items: rows.map(toDTO),
      });
    }

    // ALL
    const rows = await getPrisma().offer.findMany({
      where: allWhere,
      orderBy: [{ createdAt: "desc" }],
      include: offerInclude,
    });
    return NextResponse.json({ type: "all", items: rows.map(toDTO) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// ====== POST: Neues Angebot je Typ ======
export async function POST(req: Request) {
  try {
    const b = (await req.json()) as {
      type: OfferType;
      base: {
        title: string;
        subtitle?: string | null;
        imageUrl?: string | null;
        tags?: string[];
        isActive?: boolean;
        kind: OfferKind;
        weekday?: Weekday | null;
        date?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        locations?: Location[];
        priority?: number;
        minBasketCents?: number | null;
        priceCents?: number | null;
        originalPriceCents?: number | null;
        unit?: string | null;
      };
      payload: unknown;
    };

    if (!b?.type || !Object.values(OfferType).includes(b.type)) {
      return NextResponse.json({ error: "Ungültiger Angebots-Typ" }, { status: 400 });
    }
    if (!b?.base?.title?.trim()) {
      return NextResponse.json({ error: "Titel ist erforderlich." }, { status: 400 });
    }
    if (!b?.base?.kind || !Object.values(OfferKind).includes(b.base.kind)) {
      return NextResponse.json({ error: "Ungültige Angebots-Art (kind)." }, { status: 400 });
    }
    if (b.base.kind === "RECURRING_WEEKDAY" && b.base.weekday == null) {
      return NextResponse.json(
        { error: "weekday fehlt für wöchentliches Angebot." },
        { status: 400 },
      );
    }
    if (b.base.kind === "ONE_DAY" && !b.base.date) {
      return NextResponse.json(
        { error: "date fehlt für Eintages-Angebot." },
        { status: 400 },
      );
    }
    if (b.base.kind === "DATE_RANGE" && (!b.base.startDate || !b.base.endDate)) {
      return NextResponse.json(
        { error: "startDate/endDate fehlen für Zeitraum-Angebot." },
        { status: 400 },
      );
    }

    const slug = await uniqueOfferSlug(b.base.title);

    const baseData: Prisma.OfferCreateInput = {
      slug,
      type: b.type,
      title: b.base.title.trim(),
      subtitle: b.base.subtitle ?? null,
      imageUrl: toStoredPath(b.base.imageUrl),
      tags: b.base.tags ?? [],
      isActive: b.base.isActive ?? true,
      kind: b.base.kind,
      weekday:
        b.base.kind === "RECURRING_WEEKDAY" ? (b.base.weekday as Weekday) : null,
      date:
        b.base.kind === "ONE_DAY"
          ? startOfDayBerlin(new Date(`${b.base.date}T00:00:00.000Z`))
          : null,
      startDate:
        b.base.kind === "DATE_RANGE"
          ? startOfDayBerlin(new Date(`${b.base.startDate}T00:00:00.000Z`))
          : null,
      endDate:
        b.base.kind === "DATE_RANGE"
          ? endOfDayBerlin(new Date(`${b.base.endDate}T00:00:00.000Z`))
          : null,
      locations: Array.isArray(b.base.locations) ? b.base.locations : [],
      priority: typeof b.base.priority === "number" ? b.base.priority : 0,
      minBasketCents:
        b.base.minBasketCents == null ? null : Number(b.base.minBasketCents),
      priceCents:
        b.base.priceCents == null ? null : Number(b.base.priceCents),
      originalPriceCents:
        b.base.originalPriceCents == null
          ? null
          : Number(b.base.originalPriceCents),
      unit: b.base.unit ?? null,
    };

    const created = await getPrisma().$transaction(async (tx) => {
      const createdOffer = await tx.offer.create({ data: baseData });

      if (b.type === "GENERIC") {
        const p = b.payload as {
          body?: string | null;
          ctaLabel?: string | null;
          ctaHref?: string | null;
        };
        await tx.offerGeneric.create({
          data: {
            offerId: createdOffer.id,
            body: p?.body ?? null,
            ctaLabel: p?.ctaLabel ?? null,
            ctaHref: p?.ctaHref ?? null,
          },
        });
      }

      if (b.type === "PRODUCT_NEW") {
        const p = b.payload as {
          productId: string;
          highlightLabel?: string | null;
        };
        if (!p?.productId)
          throw new Error("productId erforderlich für PRODUCT_NEW");
        await tx.offerProductNew.create({
          data: {
            offerId: createdOffer.id,
            productId: p.productId,
            highlightLabel: p.highlightLabel ?? "NEU",
          },
        });
      }

      if (b.type === "PRODUCT_DISCOUNT") {
        const p = b.payload as {
          productId: string;
          priceCents: number;
          originalPriceCents?: number | null;
          unit?: string | null;
        };
        if (!p?.productId || !Number.isFinite(p?.priceCents))
          throw new Error(
            "productId/priceCents erforderlich für PRODUCT_DISCOUNT",
          );
        await tx.offerProductDiscount.create({
          data: {
            offerId: createdOffer.id,
            productId: p.productId,
            priceCents: Number(p.priceCents),
            originalPriceCents:
              p.originalPriceCents == null
                ? null
                : Number(p.originalPriceCents),
            unit: p.unit ?? null,
          },
        });
      }

      if (b.type === "MULTIBUY_PRICE") {
        const p = b.payload as {
          productId: string;
          packQty: number;
          packPriceCents: number;
          comparePackQty?: number | null;
          comparePriceCents?: number | null;
          unit?: string | null;
        };
        if (
          !p?.productId ||
          !Number.isFinite(p?.packQty) ||
          !Number.isFinite(p?.packPriceCents)
        )
          throw new Error(
            "productId/packQty/packPriceCents erforderlich für MULTIBUY_PRICE",
          );
        await tx.offerMultibuyPrice.create({
          data: {
            offerId: createdOffer.id,
            productId: p.productId,
            packQty: Math.max(1, Number(p.packQty)),
            packPriceCents: Number(p.packPriceCents),
            comparePackQty:
              p.comparePackQty == null
                ? null
                : Math.max(1, Number(p.comparePackQty)),
            comparePriceCents:
              p.comparePriceCents == null
                ? null
                : Number(p.comparePriceCents),
            unit: p.unit ?? null,
          },
        });
      }

      return createdOffer;
    });

    const full = await getPrisma().offer.findUnique({
      where: { id: created.id },
      include: offerInclude,
    });

    if (!full) {
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }

    return NextResponse.json(toDTO(full), { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal Error" },
      { status: 500 },
    );
  }
}
