// app/api/events/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { Prisma, Location } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import { toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";

const ALL_LOCATIONS = new Set(Object.values(Location));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const active = searchParams.get("active");
  const isActiveParam = searchParams.get("isActive");
  const onlyActive =
    active === "1" ||
    active?.toLowerCase() === "true" ||
    isActiveParam === "1" ||
    isActiveParam?.toLowerCase() === "true";

  const range = (searchParams.get("range") || "").toLowerCase(); // "past" | "future" | ""
  const cursorRaw = searchParams.get("cursor");
  const cursor = cursorRaw ? new Date(cursorRaw) : null;

  const takeParam = parseInt(searchParams.get("take") || "", 10);
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 100)
    : undefined;

  const orderParam = (searchParams.get("order") || "asc").toLowerCase();
  const order: "asc" | "desc" = orderParam === "desc" ? "desc" : "asc";

  const query = (searchParams.get("query") || "").trim();
  const now = new Date();

  const where: Prisma.EventWhereInput = {};
  if (onlyActive) where.isActive = true;

  if (query) {
    where.OR = [
      { caption: { contains: query, mode: Prisma.QueryMode.insensitive } },
      { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
    ];
  }

  // Timeline-Mode: future/past paging
  if (range === "future") {
    where.startsAt = {
      gte: now,
      ...(cursor && Number.isFinite(cursor.getTime()) ? { gt: cursor } : {}),
    };

    const events = await getPrisma().event.findMany({
      where,
      orderBy: { startsAt: "asc" },
      ...(take ? { take } : {}),
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

    const mapped = events.map((e) => ({ ...e, imageUrl: toAbsoluteAssetUrlServer(e.imageUrl) }));
    return NextResponse.json(mapped, { headers: { "Cache-Control": "no-store" } });
  }

  if (range === "past") {
    where.startsAt = {
      lt: now,
      ...(cursor && Number.isFinite(cursor.getTime()) ? { lt: cursor } : {}),
    };

    const events = await getPrisma().event.findMany({
      where,
      orderBy: { startsAt: "desc" }, // past: newest -> oldest (für Paging)
      ...(take ? { take } : {}),
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

    const mapped = events.map((e) => ({ ...e, imageUrl: toAbsoluteAssetUrlServer(e.imageUrl) }));
    return NextResponse.json(mapped, { headers: { "Cache-Control": "no-store" } });
  }

  // Default (Admin etc.)
  const events = await getPrisma().event.findMany({
    where,
    orderBy: { startsAt: order },
    ...(take ? { take } : {}),
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

  const mapped = events.map((e) => ({ ...e, imageUrl: toAbsoluteAssetUrlServer(e.imageUrl) }));
  return NextResponse.json(mapped, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const b = (await req.json()) as {
    caption: string;
    description?: string | null;
    imageUrl?: string | null;
    startsAt: string; // ISO
    endsAt?: string | null; // ISO
    isActive?: boolean;
    locations?: string[];
  };

  const caption = String(b.caption ?? "").trim();
  if (!caption) return NextResponse.json({ error: "caption required" }, { status: 400 });

  const startsAt = new Date(b.startsAt);
  if (!Number.isFinite(startsAt.getTime())) {
    return NextResponse.json({ error: "startsAt invalid" }, { status: 400 });
  }

  const endsAt = b.endsAt ? new Date(b.endsAt) : null;
  if (b.endsAt && (!endsAt || !Number.isFinite(endsAt.getTime()))) {
    return NextResponse.json({ error: "endsAt invalid" }, { status: 400 });
  }

  const locationsRaw = Array.isArray(b.locations) ? b.locations : [];
  const locations = locationsRaw
    .map((x) => String(x).toUpperCase().trim())
    .filter((x): x is Location => ALL_LOCATIONS.has(x as Location)) as Location[];

  const created = await getPrisma().event.create({
    data: {
      caption,
      description: b.description ? String(b.description).trim() : null,
      imageUrl: toStoredPath(b.imageUrl),
      startsAt,
      endsAt: endsAt ?? null,
      isActive: b.isActive ?? true,
      locations,
    },
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

  return NextResponse.json(
    { ...created, imageUrl: toAbsoluteAssetUrlServer(created.imageUrl) },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
