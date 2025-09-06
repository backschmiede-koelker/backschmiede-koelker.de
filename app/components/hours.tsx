// /app/components/hours.tsx
import HoursGrid from './hours-grid';
import { readPlacesHours } from '../lib/places';

type PlaceHours = {
  source?: string;
  fallback?: { weekday_text: string[] };
  opening_hours?: { weekdayDescriptions?: string[] };
  current_opening_hours?: { weekdayDescriptions?: string[] };
  opening_ours?: { weekdayDescriptions?: string[] };
};

function normalizeLines(place: PlaceHours | undefined): string[] {
  if (!place) return [];
  return (
    place?.opening_ours?.weekdayDescriptions ||
    place?.opening_hours?.weekdayDescriptions ||
    place?.current_opening_hours?.weekdayDescriptions ||
    place?.fallback?.weekday_text ||
    []
  );
}

export default async function Hours() {
  const data = await readPlacesHours();
  const mettingen = normalizeLines(data?.mettingen as PlaceHours | undefined);
  const recke     = normalizeLines(data?.recke as PlaceHours | undefined);

  return (
    <HoursGrid
      left={{ title: 'Mettingen', lines: mettingen, source: data?.mettingen?.source }}
      right={{ title: 'Recke', lines: recke, source: data?.recke?.source }}
    />
  );
}
