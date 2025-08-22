import { NextResponse } from 'next/server';
import { locations } from '../../data/locations';
import { readPlacesHours, PLACES_REVALIDATE } from '../../lib/places';

export const revalidate = 60 * 60 * 6; // alle 6h revalidieren

async function fetchHours(placeId: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const fields = [
    'opening_hours',
    'current_opening_hours',
    'utc_offset_minutes',
  ].join(',');

  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=${key}`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  const out = await readPlacesHours();
  return NextResponse.json(out, { headers: { 'Cache-Control': `s-maxage=${PLACES_REVALIDATE}` } });
}
