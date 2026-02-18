// app/api/offers/[id]/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { Prisma, OfferKind, Weekday, Location } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import {
  deleteStoredPathIfUnused,
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
  await deleteStoredPathIfUnused(stored);
}

/** GET /api/offers/:id */
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const item = await getPrisma().offer.findUnique({
    where: { id },
    include: offerInclude,
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
      payload?: unknown;
    };

    const current = await getPrisma().offer.findUnique({
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

    const data: Partial<{
      title: string;
      subtitle: string | null;
      imageUrl: string | null;
      tags: string[];
      isActive: boolean;
      kind: OfferKind;
      weekday: Weekday | null;
      date: Date | null;
      startDate: Date | null;
      endDate: Date | null;
      locations: Location[];
      priority: number;
      minBasketCents: number | null;
      priceCents: number | null;
      originalPriceCents: number | null;
      unit: string | null;
    }> = {};
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

    const updated = await getPrisma().offer.update({ where: { id }, data });

    if (current.type === "GENERIC" && b.payload) {
      const p = b.payload as {
        body?: string | null;
        ctaLabel?: string | null;
        ctaHref?: string | null;
      };
      await getPrisma().offerGeneric.update({
        where: { offerId: id },
        data: {
          body: p.body ?? null,
          ctaLabel: p.ctaLabel ?? null,
          ctaHref: p.ctaHref ?? null,
        },
      });
    }
    if (current.type === "PRODUCT_NEW" && b.payload) {
      const p = b.payload as {
        productId?: string;
        highlightLabel?: string | null;
      };
      await getPrisma().offerProductNew.update({
        where: { offerId: id },
        data: {
          productId: p.productId ?? undefined,
          highlightLabel: p.highlightLabel ?? undefined,
        },
      });
    }
    if (current.type === "PRODUCT_DISCOUNT" && b.payload) {
      const p = b.payload as {
        productId?: string;
        priceCents?: number | null;
        originalPriceCents?: number | null;
        unit?: string | null;
      };
      await getPrisma().offerProductDiscount.update({
        where: { offerId: id },
        data: {
          productId: p.productId ?? undefined,
          priceCents:
            p.priceCents != null
              ? Number(p.priceCents)
              : undefined,
          originalPriceCents:
            p.originalPriceCents == null
              ? null
              : Number(p.originalPriceCents),
          unit: p.unit ?? null,
        },
      });
    }
    if (current.type === "MULTIBUY_PRICE" && b.payload) {
      const p = b.payload as {
        productId?: string;
        packQty?: number | null;
        packPriceCents?: number | null;
        comparePackQty?: number | null;
        comparePriceCents?: number | null;
        unit?: string | null;
      };
      await getPrisma().offerMultibuyPrice.update({
        where: { offerId: id },
        data: {
          productId: p.productId ?? undefined,
          packQty:
            p.packQty != null
              ? Math.max(1, Number(p.packQty))
              : undefined,
          packPriceCents:
            p.packPriceCents != null
              ? Number(p.packPriceCents)
              : undefined,
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

    if (
      b.base?.imageUrl !== undefined &&
      prevImageUrl &&
      prevImageUrl !== updated.imageUrl
    ) {
      await deleteAssetIfUnused(prevImageUrl);
    }

    const full = await getPrisma().offer.findUnique({
      where: { id },
      include: offerInclude,
    });

    if (!full) {
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }

    return NextResponse.json(toDTO(full));
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
    const prev = await getPrisma().offer.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await getPrisma().offer.delete({ where: { id } });

    if (prev.imageUrl) await deleteAssetIfUnused(prev.imageUrl);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
