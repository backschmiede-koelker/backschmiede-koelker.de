// app/api/offers/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OfferKind, Weekday, Location } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import {
  pathFromStoredPath,
  safeUnlink,
  toAbsoluteAssetUrlServer,
} from "@/app/lib/uploads.server";

const TZ = "Europe/Berlin";
const toBerlin = (d: Date) =>
  new Date(new Date(d.toLocaleString("en-US", { timeZone: TZ })).getTime());
const startOfDay = (d: Date) => {
  const z = toBerlin(d);
  z.setHours(0, 0, 0, 0);
  return z;
};
const endOfDay = (d: Date) => {
  const z = toBerlin(d);
  z.setHours(23, 59, 59, 999);
  return z;
};

function toDTO(item: any) {
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

    // NEU: Basis-Preisfelder
    priceCents: item.priceCents ?? null,
    originalPriceCents: item.originalPriceCents ?? null,
    unit: item.unit ?? null,
  };

  if (item.type === "GENERIC") {
    return { ...common, generic: item.generic ?? undefined };
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
            originalPriceCents:
              item.productDiscount.originalPriceCents ?? null,
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

/** GET /api/offers/:id */
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const item = await prisma.offer.findUnique({
    where: { id },
    include: {
      generic: true,
      productNew: {
        include: {
          product: {
            select: { id: true, name: true, priceCents: true, unit: true },
          },
        },
      },
      productDiscount: {
        include: {
          product: {
            select: { id: true, name: true, priceCents: true, unit: true },
          },
        },
      },
      multibuyPrice: {
        include: {
          product: {
            select: { id: true, name: true, priceCents: true, unit: true },
          },
        },
      },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toDTO(item));
}

/** PUT /api/offers/:id */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const b = (await req.json()) as {
      base: Partial<{
        title: string;
        subtitle: string | null;
        imageUrl: string | null;
        tags: string[];
        isActive: boolean;
        kind: OfferKind;
        weekday: Weekday | null;
        date: string | null;
        startDate: string | null;
        endDate: string | null;
        locations: Location[];
        priority: number;
        minBasketCents: number | null;
        priceCents: number | null;
        originalPriceCents: number | null;
        unit: string | null;
      }>;
      payload?: any;
    };

    const current = await prisma.offer.findUnique({
      where: { id },
      include: {
        generic: true,
        productNew: true,
        productDiscount: true,
        multibuyPrice: true,
      },
    });
    if (!current)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prevImageUrl = current.imageUrl ?? null;

    const data: any = {};
    if (typeof b.base?.title === "string") data.title = b.base.title.trim();
    if (b.base?.subtitle !== undefined) data.subtitle = b.base.subtitle;
    if (b.base?.imageUrl !== undefined)
      data.imageUrl = toStoredPath(b.base.imageUrl);
    if (Array.isArray(b.base?.tags)) data.tags = b.base.tags;
    if (typeof b.base?.isActive === "boolean") data.isActive = b.base.isActive;

    if (b.base?.kind && !Object.values(OfferKind).includes(b.base.kind)) {
      return NextResponse.json(
        { error: "Ungültige Angebots-Art (kind)." },
        { status: 400 },
      );
    }
    if (b.base?.kind) data.kind = b.base.kind;
    data.weekday =
      data.kind === "RECURRING_WEEKDAY" ? b.base?.weekday ?? null : null;
    data.date =
      data.kind === "ONE_DAY"
        ? b.base?.date
          ? startOfDay(new Date(`${b.base.date}T00:00:00.000Z`))
          : null
        : null;
    data.startDate =
      data.kind === "DATE_RANGE"
        ? b.base?.startDate
          ? startOfDay(new Date(`${b.base.startDate}T00:00:00.000Z`))
          : null
        : null;
    data.endDate =
      data.kind === "DATE_RANGE"
        ? b.base?.endDate
          ? endOfDay(new Date(`${b.base.endDate}T00:00:00.000Z`))
          : null
        : null;

    if (Array.isArray(b.base?.locations)) data.locations = b.base.locations;
    if (typeof b.base?.priority === "number") data.priority = b.base.priority;
    if (b.base?.minBasketCents !== undefined)
      data.minBasketCents =
        b.base.minBasketCents == null
          ? null
          : Number(b.base.minBasketCents);
    if (b.base?.priceCents !== undefined)
      data.priceCents =
        b.base.priceCents == null ? null : Number(b.base.priceCents);
    if (b.base?.originalPriceCents !== undefined)
      data.originalPriceCents =
        b.base.originalPriceCents == null
          ? null
          : Number(b.base.originalPriceCents);
    if (b.base?.unit !== undefined) data.unit = b.base.unit ?? null;

    const updated = await prisma.offer.update({ where: { id }, data });

    if (current.type === "GENERIC" && b.payload) {
      await prisma.offerGeneric.update({
        where: { offerId: id },
        data: {
          body: b.payload.body ?? null,
          ctaLabel: b.payload.ctaLabel ?? null,
          ctaHref: b.payload.ctaHref ?? null,
        },
      });
    }
    if (current.type === "PRODUCT_NEW" && b.payload) {
      await prisma.offerProductNew.update({
        where: { offerId: id },
        data: {
          productId: b.payload.productId ?? undefined,
          highlightLabel: b.payload.highlightLabel ?? undefined,
        },
      });
    }
    if (current.type === "PRODUCT_DISCOUNT" && b.payload) {
      await prisma.offerProductDiscount.update({
        where: { offerId: id },
        data: {
          productId: b.payload.productId ?? undefined,
          priceCents:
            b.payload.priceCents != null
              ? Number(b.payload.priceCents)
              : undefined,
          originalPriceCents:
            b.payload.originalPriceCents == null
              ? null
              : Number(b.payload.originalPriceCents),
          unit: b.payload.unit ?? null,
        },
      });
    }
    if (current.type === "MULTIBUY_PRICE" && b.payload) {
      await prisma.offerMultibuyPrice.update({
        where: { offerId: id },
        data: {
          productId: b.payload.productId ?? undefined,
          packQty:
            b.payload.packQty != null
              ? Math.max(1, Number(b.payload.packQty))
              : undefined,
          packPriceCents:
            b.payload.packPriceCents != null
              ? Number(b.payload.packPriceCents)
              : undefined,
          comparePackQty:
            b.payload.comparePackQty == null
              ? null
              : Math.max(1, Number(b.payload.comparePackQty)),
          comparePriceCents:
            b.payload.comparePriceCents == null
              ? null
              : Number(b.payload.comparePriceCents),
          unit: b.payload.unit ?? null,
        },
      });
    }

    if (
      b.base?.imageUrl !== undefined &&
      prevImageUrl &&
      prevImageUrl !== updated.imageUrl
    ) {
      await deleteAssetIfUnused(prevImageUrl);
    }

    const full = await prisma.offer.findUnique({
      where: { id },
      include: {
        generic: true,
        productNew: {
          include: {
            product: {
              select: { id: true, name: true, priceCents: true, unit: true },
            },
          },
        },
        productDiscount: {
          include: {
            product: {
              select: { id: true, name: true, priceCents: true, unit: true },
            },
          },
        },
        multibuyPrice: {
          include: {
            product: {
              select: { id: true, name: true, priceCents: true, unit: true },
            },
          },
        },
      },
    });

    return NextResponse.json(toDTO(full!));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/** DELETE /api/offers/:id */
export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const prev = await prisma.offer.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.offer.delete({ where: { id } });

    if (prev.imageUrl) await deleteAssetIfUnused(prev.imageUrl);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
