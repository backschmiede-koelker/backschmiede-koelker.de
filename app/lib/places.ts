// /app/lib/places.ts
import { locations, type FallbackHours, type LocationKey } from '../data/locations'

export const PLACES_REVALIDATE = 60 * 60 * 6 // 6h

type GooglePlacesHours = {
  regularOpeningHours?: Record<string, unknown>
  currentOpeningHours?: Record<string, unknown>
  utcOffsetMinutes?: number
}

type PlaceHours = {
  label: string
  source: string
  opening_hours: GooglePlacesHours['regularOpeningHours'] | null
  current_opening_hours: GooglePlacesHours['currentOpeningHours'] | null
  fallback: FallbackHours
}

async function fetchHours(placeId: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return null

  const fields = ['regularOpeningHours', 'currentOpeningHours', 'utcOffsetMinutes'].join(',')
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&languageCode=de&regionCode=DE&key=${key}`

  const res = await fetch(url, { next: { revalidate: PLACES_REVALIDATE } })
  if (!res.ok) {
    const txt = await res.text()
    console.error('Places ERROR', res.status, txt)
    return null
  }
  return (await res.json()) as GooglePlacesHours
}

export async function readPlacesHours() {
  const out = {} as Record<LocationKey, PlaceHours>
  const entries = Object.entries(locations) as [LocationKey, (typeof locations)[LocationKey]][]
  for (const [key, cfg] of entries) {
    let data: GooglePlacesHours | null = null
    try {
      data = cfg.placeId ? await fetchHours(cfg.placeId) : null
    } catch {}

    out[key] = {
      label: cfg.label,
      source: data ? 'google' : 'fallback (Öffnungszeiten können abweichen)',
      opening_hours: data?.regularOpeningHours || null,
      current_opening_hours: data?.currentOpeningHours || null,
      fallback: cfg.fallback,
    }
  }
  return out
}
