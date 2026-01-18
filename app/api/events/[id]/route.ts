// app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/auth-guards";
import { Location } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import { pathFromStoredPath, safeUnlink, toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";

const ALL_LOCATIONS = new Set(Object.values(Location));

async function deleteAssetIfUnused(stored?: string | null) {
  const s = toStoredPath(stored);
  if (!s) return;

  const [p, n, o, e] = await getPrisma().$transaction([
    getPrisma().product.count({ where: { imageUrl: s } }),
    getPrisma().news.count({ where: { imageUrl: s } }),
    getPrisma().offer.count({ where: { imageUrl: s } }),
    getPrisma().event.count({ where: { imageUrl: s } }),
  ]);

  if (p + n + o + e === 0) await safeUnlink(pathFromStoredPath(s));
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const item = await getPrisma().event.findUnique({
    where: { id },
    select: {
      id: true,
      caption: true,
      description: true,
      imageUrl: true,
      startsAt: true,
      endsAt: true,
      isActive: true,
      locations: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(
    { ...item, imageUrl: toAbsoluteAssetUrlServer(item.imageUrl) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export const PUT = withAdminGuard(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;

  const body = (await req.json()) as Partial<{
    caption: string;
    description: string | null;
    imageUrl: string | null;
    startsAt: string;
    endsAt: string | null;
    isActive: boolean;
    locations: string[];
  }>;

  const prev = await getPrisma().event.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Partial<{
    caption: string;
    description: string | null;
    imageUrl: string | null;
    startsAt: Date;
    endsAt: Date | null;
    isActive: boolean;
    locations: Location[];
  }> = {};
  if (typeof body.caption === "string") data.caption = body.caption.trim();
  if (typeof body.description === "string") data.description = body.description.trim();
  if (body.description === null) data.description = null;

  if (typeof body.startsAt === "string") {
    const d = new Date(body.startsAt);
    if (!Number.isFinite(d.getTime())) return NextResponse.json({ error: "startsAt invalid" }, { status: 400 });
    data.startsAt = d;
  }

  if (typeof body.endsAt === "string") {
    const d = new Date(body.endsAt);
    if (!Number.isFinite(d.getTime())) return NextResponse.json({ error: "endsAt invalid" }, { status: 400 });
    data.endsAt = d;
  }
  if (body.endsAt === null) data.endsAt = null;

  if (typeof body.imageUrl === "string" || body.imageUrl === null) {
    data.imageUrl = toStoredPath(body.imageUrl);
  }

  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  if (Array.isArray(body.locations)) {
    const locationsRaw = body.locations;
    const locations = locationsRaw
      .map((x) => String(x).toUpperCase().trim())
      .filter((x): x is Location => ALL_LOCATIONS.has(x as Location)) as Location[];

    data.locations = locations;
  }

  const updated = await getPrisma().event.update({
    where: { id },
    data,
    select: {
      id: true,
      caption: true,
      description: true,
      imageUrl: true,
      startsAt: true,
      endsAt: true,
      isActive: true,
      locations: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // altes Bild ggf. löschen (nur wenn ungenutzt)
  if (body.imageUrl !== undefined && prev.imageUrl && prev.imageUrl !== updated.imageUrl) {
    await deleteAssetIfUnused(prev.imageUrl);
  }

  return NextResponse.json(
    { ...updated, imageUrl: toAbsoluteAssetUrlServer(updated.imageUrl) },
    { headers: { "Cache-Control": "no-store" } }
  );
});

export const DELETE = withAdminGuard(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;

  const prev = await getPrisma().event.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await getPrisma().event.delete({ where: { id } });

  if (prev.imageUrl) await deleteAssetIfUnused(prev.imageUrl);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
});
