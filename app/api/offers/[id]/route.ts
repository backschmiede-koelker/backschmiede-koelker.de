import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OfferKind, OfferProductRole, Weekday, Location } from "@prisma/client";

// ====== Zeitzone Berlin ======
const TZ = "Europe/Berlin";
const toBerlin = (d: Date) => new Date(new Date(d.toLocaleString("en-US", { timeZone: TZ })).getTime());
const startOfDay = (d: Date) => { const z = toBerlin(d); z.setHours(0,0,0,0); return z; };
const endOfDay   = (d: Date) => { const z = toBerlin(d); z.setHours(23,59,59,999); return z; };

// Slug bleibt hier absichtlich ungenutzt (Slug ist NICHT editierbar in PUT)
function isValidRole(v: any): v is OfferProductRole {
  return Object.values(OfferProductRole).includes(v);
}

/**
 * GET /api/offers/:id
 * (optional, nützlich fürs Debuggen; liefert die Links mit)
 */
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = await prisma.offer.findUnique({
    where: { id: id },
    include: {
      products: {
        include: { product: { select: { id: true, name: true, priceCents: true, unit: true } } },
      },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

/**
 * PUT /api/offers/:id
 * - Slug & imageUrl werden NICHT geändert
 * - products[] ersetzt die bestehenden Links (deleteMany + createMany)
 * - Validierungen:
 *   - kind / Datumskonsistenz
 *   - falls BUNDLE_COMPONENT vorkommt -> priceCents muss gesetzt sein (Set-Preis)
 */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const b = await req.json() as Partial<{
      title: string;
      description: string | null;
      priceCents: number | null;
      originalPriceCents: number | null;
      unit: string | null;
      // imageUrl/slug werden ignoriert
      tags: string[];
      isActive: boolean;
      kind: OfferKind;
      weekday: Weekday | null;
      date: string | null;
      startDate: string | null;
      endDate: string | null;
      locations: Location[];
      priority: number;
      products: Array<{ productId: string; role: OfferProductRole; quantity?: number; perItemPriceCents?: number | null; }>;
    }>;

    if (!b.title?.trim()) return NextResponse.json({ error: "Titel ist erforderlich." }, { status: 400 });
    if (!b.kind || !Object.values(OfferKind).includes(b.kind)) {
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

    // Update-Objekt (Slug & imageUrl bewusst nicht mutierbar)
    const data: any = {
      title: b.title.trim(),
      description: b.description ?? null,
      priceCents: b.priceCents == null ? null : Number(b.priceCents),
      originalPriceCents: b.originalPriceCents == null ? null : Number(b.originalPriceCents),
      unit: b.unit ?? null,
      tags: Array.isArray(b.tags) ? b.tags : [],
      isActive: typeof b.isActive === "boolean" ? b.isActive : undefined,
      kind: b.kind,
      weekday: b.kind === "RECURRING_WEEKDAY" ? (b.weekday as Weekday) : null,
      date: b.kind === "ONE_DAY" ? startOfDay(new Date(`${b.date}T00:00:00.000Z`)) : null,
      startDate: b.kind === "DATE_RANGE" ? startOfDay(new Date(`${b.startDate}T00:00:00.000Z`)) : null,
      endDate: b.kind === "DATE_RANGE" ? endOfDay(new Date(`${b.endDate}T00:00:00.000Z`)) : null,
      locations: Array.isArray(b.locations) ? b.locations : [],
      priority: typeof b.priority === "number" ? b.priority : undefined,
    };

    await prisma.$transaction(async (tx) => {
      await tx.offer.update({ where: { id: id }, data });

      // Links neu setzen
      await tx.offerProduct.deleteMany({ where: { offerId: id } });
      if (products.length > 0) {
        await tx.offerProduct.createMany({
          data: products
            .filter(p => p && p.productId && isValidRole(p.role))
            .map((p) => ({
              offerId: id,
              productId: String(p.productId),
              role: p.role,
              quantity: Math.max(1, Number(p.quantity ?? 1)),
              perItemPriceCents: p.perItemPriceCents == null ? null : Number(p.perItemPriceCents),
            })),
        });
      }
    });

    const updated = await prisma.offer.findUnique({
      where: { id: id },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, priceCents: true, unit: true } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/offers/:id
 * (OfferProduct wird durch onDelete: Cascade automatisch entfernt)
 */
export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await prisma.offer.delete({ where: { id: id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
