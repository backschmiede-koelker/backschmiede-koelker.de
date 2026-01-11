// app/api/about/gallery/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import { requireAdminOr401 } from "../_auth";

export async function GET(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const sectionId = (searchParams.get("sectionId") || "").trim();

  const items = await getPrisma().aboutGalleryItem.findMany({
    ...(sectionId ? { where: { sectionId } } : {}),
    orderBy: [{ sectionId: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const b = (await req.json()) as {
    sectionId: string;
    imageUrl: string; // can be absolute
    alt?: string | null;
    sortOrder?: number;
  };

  const stored = toStoredPath(b.imageUrl);
  if (!b.sectionId || !stored) {
    return NextResponse.json({ error: "sectionId and imageUrl required" }, { status: 400 });
  }

  const created = await getPrisma().aboutGalleryItem.create({
    data: {
      sectionId: b.sectionId,
      imageUrl: stored,
      alt: b.alt ?? null,
      sortOrder: Number.isFinite(b.sortOrder) ? (b.sortOrder as number) : 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
