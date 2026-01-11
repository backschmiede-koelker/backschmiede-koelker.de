// app/api/about/gallery/[id]/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import { requireAdminOr401 } from "../../_auth";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;

  const b = (await req.json()) as Partial<{
    imageUrl: string | null;
    alt: string | null;
    sortOrder: number;
  }>;

  // If client explicitly tries to "delete" the image, forbid it.
  // Omit imageUrl to keep existing one.
  if ("imageUrl" in b && b.imageUrl === null) {
    return NextResponse.json(
      { error: "imageUrl cannot be null (omit imageUrl to keep existing)" },
      { status: 400 }
    );
  }

  const data: { imageUrl?: string; alt?: string | null; sortOrder?: number } = {};

  // Only update imageUrl if a string is provided
  if (typeof b.imageUrl === "string") {
    const stored = toStoredPath(b.imageUrl);
    if (!stored) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }
    data.imageUrl = stored;
  }

  if (b.alt === null || typeof b.alt === "string") data.alt = b.alt;
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) data.sortOrder = b.sortOrder;

  const updated = await getPrisma().aboutGalleryItem.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;

  try {
    await getPrisma().aboutGalleryItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
