// /app/api/events/route.ts
import { NextResponse } from "next/server";
import type { EventDto } from "../../types/events";

// TODO: später via Prisma/Postgres befüllen (Admin-Panel). Heute: Dummy.
const dummy: EventDto[] = [
  {
    id: "evt-001",
    title: "Sauerteig-Workshop: Starter & Falten",
    start: new Date(Date.now() + 2 * 86400000).toISOString(),
    end: new Date(Date.now() + 2 * 86400000 + 3 * 3600000).toISOString(),
    location: "Backstube – Hauptstraße 12, 10115 Berlin",
    description: "Lerne, wie du einen aktiven Starter pflegst und luftige Laibe formst.",
    category: "Workshop",
    priceCents: 4900,
    seatsLeft: 5,
    isFeatured: true,
  },
  {
    id: "evt-002",
    title: "Kaffeeverkostung: Herkunft & Röstgrade",
    start: new Date(Date.now() + 5 * 86400000).toISOString(),
    end: new Date(Date.now() + 5 * 86400000 + 2 * 3600000).toISOString(),
    location: "Café-Ecke",
    description: "Single Origins im Vergleich. Sensorik-Basics inkl. kleiner Süßteilchen.",
    category: "Tasting",
    priceCents: 1900,
    seatsLeft: 0,
  },
  {
    id: "evt-003",
    title: "Sonntags-Frühstücksbuffet",
    start: new Date(Date.now() + 6 * 86400000).toISOString(),
    end: new Date(Date.now() + 6 * 86400000 + 4 * 3600000).toISOString(),
    location: "Laden",
    description: "Ofenfrische Brötchen, hausgemachte Marmeladen, Rührei-Station.",
    category: "Frühstück",
    priceCents: 1800,
    seatsLeft: 12,
  },
];

export async function GET() {
  return NextResponse.json({ events: dummy });
}
