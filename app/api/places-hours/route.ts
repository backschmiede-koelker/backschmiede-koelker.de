// /app/api/places-hours/route.ts
import { NextResponse } from 'next/server';
import { readPlacesHours, PLACES_REVALIDATE } from '../../lib/places';

export const revalidate = 21600;

export async function GET() {
  const out = await readPlacesHours();
  return NextResponse.json(out, { headers: { 'Cache-Control': `s-maxage=${PLACES_REVALIDATE}` } });
}
