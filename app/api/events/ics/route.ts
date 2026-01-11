// app/api/events/ics/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { buildIcsFile } from "@/app/lib/ics";

function addMinutes(iso: string, minutes: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

export async function GET() {
  const now = new Date();

  const events = await getPrisma().event.findMany({
    where: { isActive: true, startsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      caption: true,
      description: true,
      startsAt: true,
      endsAt: true,
      locations: true,
    },
  });

  const locLabel = (locs: ("RECKE" | "METTINGEN")[]) => {
    if (!locs?.length) return undefined;
    const map = { RECKE: "Recke", METTINGEN: "Mettingen" } as const;
    return locs.map((l) => map[l] ?? l).join(" / ");
  };

  const ics = buildIcsFile(
    events.map((e) => {
      const startIso = e.startsAt.toISOString();
      const endIso = (e.endsAt ? e.endsAt.toISOString() : addMinutes(startIso, 60)); // Default 60 min
      return {
        uid: `${e.id}@backschmiede-koelker`,
        title: e.caption,
        start: startIso,
        end: endIso,
        description: e.description ?? undefined,
        location: locLabel(e.locations),
      };
    })
  );

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="backschmiede-termine.ics"',
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
