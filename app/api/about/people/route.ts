// app/api/about/people/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import { requireAdminOr401 } from "../_auth";

type PersonKind = "OWNER" | "MANAGER" | "TEAM_MEMBER";

export async function GET(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const kind = (searchParams.get("kind") || "").trim();

  const kindFilter = kind ? (kind as PersonKind) : undefined;
  const items = await getPrisma().aboutPerson.findMany({
    ...(kindFilter ? { where: { kind: kindFilter } } : {}),
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const b = (await req.json()) as {
    kind?: string;
    name: string;
    roleLabel?: string | null;
    shortBio?: string | null;
    longBio?: string | null;
    avatarUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    instagramHandle?: string | null;
    isShownOnAbout?: boolean;
    isShownInHero?: boolean;
    sortOrder?: number;
  };

  if (!b?.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const kindValue = (b.kind as PersonKind) || "TEAM_MEMBER";
  const created = await getPrisma().aboutPerson.create({
    data: {
      kind: kindValue,
      name: b.name.trim(),
      roleLabel: b.roleLabel ?? null,
      shortBio: b.shortBio ?? null,
      longBio: b.longBio ?? null,
      avatarUrl: toStoredPath(b.avatarUrl) ?? null,
      phone: b.phone ?? null,
      email: b.email ?? null,
      instagramHandle: b.instagramHandle ?? null,
      isShownOnAbout: b.isShownOnAbout ?? true,
      isShownInHero: b.isShownInHero ?? false,
      sortOrder: Number.isFinite(b.sortOrder) ? b.sortOrder : 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
