// app/api/about/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { toAbsoluteAssetUrlServer } from "@/app/lib/uploads.server";

export async function GET() {
  const [sections, people] = await Promise.all([
    getPrisma().aboutSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        stats: { orderBy: { sortOrder: "asc" } },
        values: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
        gallery: { orderBy: { sortOrder: "asc" } },
      },
    }),
    getPrisma().aboutPerson.findMany({
      where: { isShownOnAbout: true },
      orderBy: [
        { sortOrder: "desc" },
        { name: "asc" },
        { id: "asc" },
      ],
    })
  ]);

  const mappedSections = sections.map((s) => ({
    ...s,
    imageUrl: toAbsoluteAssetUrlServer(s.imageUrl),
    gallery: s.gallery.map((g) => ({ ...g, imageUrl: toAbsoluteAssetUrlServer(g.imageUrl) })),
  }));

  const mappedPeople = people.map((p) => ({
    ...p,
    avatarUrl: p.avatarUrl ? toAbsoluteAssetUrlServer(p.avatarUrl) : null,
  }));

  return NextResponse.json({ sections: mappedSections, people: mappedPeople });
}
