// app/api/offers/route.ts
import { NextResponse } from 'next/server';
import { Offer, OfferUpsert, isActiveInWeek } from '../../lib/offers';

// ⚠️ TEMP: In-Memory-Store – nur für Dev/Preview
let STORE: Offer[] = [
  {
    id: 'dinkel-kruste',
    title: 'Dinkel-Kruste',
    price: 3.2,
    unit: 'pro Stück',
    badge: 'NEU',
    description: 'Kräftig ausgebacken, aromatische Kruste.',
    image: '/products/dinkelvollkorn.jpg',
    tags: ['BROT', 'DINKEL'],
    locations: ['BOTH'],
    startDate: '2025-08-18',
    endDate: '2025-08-24',
  },
];

function startOfISOWeek(d: Date) {
  const dt = new Date(d);
  const day = (dt.getDay() + 6) % 7; // Mo=0
  dt.setDate(dt.getDate() - day);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function endOfISOWeek(d: Date) {
  const s = startOfISOWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wk = searchParams.get('week'); // optional: ISO datum innerhalb der gewünschten Woche
  const t = wk ? new Date(wk) : new Date();
  const from = startOfISOWeek(t);
  const to = endOfISOWeek(t);

  const active = STORE.filter(o => isActiveInWeek(o, from, to));
  return NextResponse.json({ from: from.toISOString(), to: to.toISOString(), items: active });
}

export async function POST(req: Request) {
  const body = (await req.json()) as OfferUpsert;

  // TODO: DB-Validation/Schema – hier minimal:
  if (!body.title || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: 'title, startDate, endDate required' }, { status: 400 });
  }

  const id = body.id?.trim() || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  const offer: Offer = {
    id,
    title: body.title,
    price: body.price ?? null,
    unit: body.unit ?? null,
    badge: body.badge ?? null,
    description: body.description ?? null,
    image: body.image ?? null,
    tags: (body.tags ?? []).map(t => t.toUpperCase()),
    locations: body.locations && body.locations.length ? body.locations : ['BOTH'],
    startDate: body.startDate,
    endDate: body.endDate,
  };

  const idx = STORE.findIndex(o => o.id === id);
  if (idx >= 0) STORE[idx] = offer; else STORE.push(offer);

  return NextResponse.json({ ok: true, offer }, { status: 201 });
}
