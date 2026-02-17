// app/api/products/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/auth-guards";
import { Prisma, Allergen } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import { toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";
import { toTitleCaseWord } from "@/app/lib/tags";

const DEFAULT_PAGE_LIMIT = 18;
const MAX_PAGE_LIMIT = 50;
type SortKey = "name_asc" | "newest";

function parseBoolParam(value?: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

function parseTagsParam(input?: string | null) {
  if (!input) return [];
  return Array.from(
    new Set(
      input
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

function selectProductForList() {
  return {
    id: true,
    name: true,
    slug: true,
    priceCents: true,
    unit: true,
    imageUrl: true,
    tags: true,
    allergens: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.ProductSelect;
}

function mapProductsWithAbsoluteUrl<T extends { imageUrl: string | null }>(products: T[]) {
  return products.map((item) => ({ ...item, imageUrl: toAbsoluteAssetUrlServer(item.imageUrl) }));
}

function buildSortOrder(sort: SortKey): Prisma.ProductOrderByWithRelationInput[] {
  if (sort === "name_asc") {
    return [{ name: "asc" }, { id: "asc" }];
  }
  return [{ createdAt: "desc" }, { id: "desc" }];
}

function buildWhere({
  onlyActive,
  query,
  tags,
}: {
  onlyActive: boolean;
  query: string;
  tags: string[];
}): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (onlyActive) where.isActive = true;
  if (tags.length > 0) where.tags = { hasSome: tags };

  if (query) {
    const tagNeedles = Array.from(new Set([query, toTitleCaseWord(query)]));
    where.OR = [
      { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
      ...tagNeedles.map((needle) => ({ tags: { has: needle } })),
    ];
  }

  return where;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const onlyActive = parseBoolParam(searchParams.get("active")) || parseBoolParam(searchParams.get("isActive"));
  const query = (searchParams.get("query") || "").trim();
  const tags = parseTagsParam(searchParams.get("tags"));
  const sortParam = searchParams.get("sort");
  const sort: SortKey =
    sortParam === "name_asc" || sortParam === "newest"
      ? sortParam
      : query
        ? "name_asc"
        : "newest";

  const hasSortParam = sortParam === "name_asc" || sortParam === "newest";
  const hasLimitParam = searchParams.has("limit");
  const hasOffsetParam = searchParams.has("offset");
  const includeTagFacet = searchParams.get("includeTagFacet") === "1";

  const limitRaw = Number.parseInt(searchParams.get("limit") || "", 10);
  const offsetRaw = Number.parseInt(searchParams.get("offset") || "0", 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), MAX_PAGE_LIMIT)
    : DEFAULT_PAGE_LIMIT;
  const offset = Number.isFinite(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0;

  const where = buildWhere({ onlyActive, query, tags });
  const legacyMode = !hasLimitParam && !hasOffsetParam && !hasSortParam && tags.length === 0;

  if (legacyMode) {
    const products = await getPrisma().product.findMany({
      where,
      orderBy: query ? { name: "asc" } : { createdAt: "desc" },
      select: selectProductForList(),
    });

    const mapped = mapProductsWithAbsoluteUrl(products);
    return query ? NextResponse.json({ items: mapped }) : NextResponse.json(mapped);
  }

  const products = await getPrisma().product.findMany({
    where,
    orderBy: buildSortOrder(sort),
    skip: offset,
    take: limit + 1,
    select: selectProductForList(),
  });

  const hasMore = products.length > limit;
  const pageItems = hasMore ? products.slice(0, limit) : products;
  const mapped = mapProductsWithAbsoluteUrl(pageItems);

  let availableTags: string[] | undefined;
  if (includeTagFacet) {
    const tagRows = await getPrisma().product.findMany({
      where,
      select: { tags: true },
    });
    const set = new Set<string>();
    tagRows.forEach((row) => {
      row.tags.forEach((tag) => {
        const normalized = tag.trim();
        if (normalized) set.add(normalized);
      });
    });
    availableTags = Array.from(set).sort((a, b) => a.localeCompare(b, "de"));
  }

  return NextResponse.json({
    items: mapped,
    hasMore,
    nextOffset: offset + mapped.length,
    ...(includeTagFacet ? { availableTags: availableTags ?? [] } : {}),
  });
}

function slugify(s: string) {
  return s
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "ae").replace(/Ö/g, "oe").replace(/Ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[^\w\s-]/g, "")
    .toLowerCase().trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export const POST = withAdminGuard(async (req: Request) => {
  const b = (await req.json()) as {
    name: string;
    priceCents: number;
    unit: string;
    imageUrl?: string | null;
    tags?: string[];
    allergens?: Allergen[];
    isActive?: boolean;
  };

  const slug = slugify(b.name);
  try {
    const created = await getPrisma().product.create({
      data: {
        name: b.name.trim(),
        slug,
        priceCents: b.priceCents,
        unit: b.unit.trim(),
        imageUrl: toStoredPath(b.imageUrl),
        tags: b.tags ?? [],
        allergens: b.allergens ?? [],
        isActive: b.isActive ?? true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
      const alt = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
      const created = await getPrisma().product.create({
        data: { ...b, name: b.name.trim(), slug: alt, imageUrl: toStoredPath(b.imageUrl) },
      });
      return NextResponse.json(created, { status: 201 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
});
