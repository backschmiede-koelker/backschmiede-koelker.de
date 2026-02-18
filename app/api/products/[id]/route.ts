// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { withAdminGuard } from "@/lib/auth-guards";
import { Allergen } from "@/generated/prisma/client";
import { toStoredPath } from "@/app/lib/uploads";
import { deleteStoredPathIfUnused, toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";

function slugify(s: string) {
  return s
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue")
    .replace(/Ä/g,"ae").replace(/Ö/g,"oe").replace(/Ü/g,"ue")
    .replace(/ß/g,"ss")
    .normalize("NFKD").replace(/[^\w\s-]/g,"")
    .toLowerCase().trim().replace(/\s+/g,"-").replace(/-+/g,"-");
}

async function deleteAssetIfUnused(stored?: string | null) {
  await deleteStoredPathIfUnused(stored);
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = await getPrisma().product.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...item, imageUrl: toAbsoluteAssetUrlServer(item.imageUrl) });
}

export const PUT = withAdminGuard(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const body = await req.json() as Partial<{
    name: string;
    slug: string;
    priceCents: number;
    unit: string;
    imageUrl: string | null;
    tags: string[];
    allergens: Allergen[];
    isActive: boolean;
  }>;

  const prev = await getPrisma().product.findUnique({
    where: { id },
    select: { name: true, imageUrl: true },
  });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Partial<{
    name: string;
    slug: string;
    priceCents: number;
    unit: string;
    imageUrl: string | null;
    tags: string[];
    allergens: Allergen[];
    isActive: boolean;
  }> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.slug === "string") data.slug = body.slug.trim();
  if (!body.slug && typeof body.name === "string") data.slug = slugify(body.name);

  if (typeof body.priceCents === "number" && Number.isFinite(body.priceCents)) data.priceCents = body.priceCents;
  if (typeof body.unit === "string") data.unit = body.unit.trim();
  if (typeof body.imageUrl === "string" || body.imageUrl === null) data.imageUrl = toStoredPath(body.imageUrl);
  if (Array.isArray(body.tags)) data.tags = body.tags.map(t => String(t));
  if (Array.isArray(body.allergens)) data.allergens = body.allergens;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  try {
    const updated = await getPrisma().product.update({ where: { id }, data });

    if (body.imageUrl !== undefined && prev.imageUrl && prev.imageUrl !== updated.imageUrl) {
      await deleteAssetIfUnused(prev.imageUrl);
    }

    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
      if (data.slug) {
        const alt = `${data.slug}-${Math.random().toString(36).slice(2,5)}`;
        const updated = await getPrisma().product.update({
          where: { id },
          data: { ...data, slug: alt },
        });
        return NextResponse.json(updated);
      }
      return NextResponse.json({ error: "Slug bereits vergeben" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
});

export const DELETE = withAdminGuard(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  try {
    const prev = await getPrisma().product.findUnique({ where: { id }, select: { imageUrl: true } });
    if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await getPrisma().product.delete({ where: { id } });

    if (prev.imageUrl) await deleteAssetIfUnused(prev.imageUrl);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
});
