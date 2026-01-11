// app/api/about/people/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import { requireAdminOr401 } from "../../_auth";

type PersonKind = "OWNER" | "MANAGER" | "TEAM_MEMBER";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;
  const item = await prisma.aboutPerson.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;
  const b = (await req.json()) as Partial<{
    kind: string;
    name: string;
    roleLabel: string | null;
    shortBio: string | null;
    longBio: string | null;
    avatarUrl: string | null;
    phone: string | null;
    email: string | null;
    instagramHandle: string | null;
    isShownOnAbout: boolean;
    isShownInHero: boolean;
    sortOrder: number;
  }>;

  const data: Partial<{
    kind: PersonKind;
    name: string;
    roleLabel: string | null;
    shortBio: string | null;
    longBio: string | null;
    avatarUrl: string | null;
    phone: string | null;
    email: string | null;
    instagramHandle: string | null;
    isShownOnAbout: boolean;
    isShownInHero: boolean;
    sortOrder: number;
  }> = {};
  if (typeof b.kind === "string") data.kind = b.kind as PersonKind;
  if (typeof b.name === "string") data.name = b.name.trim();
  if (b.roleLabel === null || typeof b.roleLabel === "string") data.roleLabel = b.roleLabel;
  if (b.shortBio === null || typeof b.shortBio === "string") data.shortBio = b.shortBio;
  if (b.longBio === null || typeof b.longBio === "string") data.longBio = b.longBio;
  if (b.avatarUrl === null || typeof b.avatarUrl === "string") data.avatarUrl = toStoredPath(b.avatarUrl);
  if (b.phone === null || typeof b.phone === "string") data.phone = b.phone;
  if (b.email === null || typeof b.email === "string") data.email = b.email;
  if (b.instagramHandle === null || typeof b.instagramHandle === "string") data.instagramHandle = b.instagramHandle;
  if (typeof b.isShownOnAbout === "boolean") data.isShownOnAbout = b.isShownOnAbout;
  if (typeof b.isShownInHero === "boolean") data.isShownInHero = b.isShownInHero;
  if (typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)) data.sortOrder = b.sortOrder;

  const updated = await prisma.aboutPerson.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { id } = await ctx.params;

  try {
    await prisma.aboutPerson.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
