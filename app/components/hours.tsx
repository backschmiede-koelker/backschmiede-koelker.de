import { readPlacesHours } from '../lib/places';

function WeekTable({ lines }: { lines: string[] }) {
  return (
    <ul className="text-sm leading-6">
      {lines.map((l, i) => (<li key={i}>{l}</li>))}
    </ul>
  );
}

export default async function Hours() {
  const data = await readPlacesHours();
  const mettingen = data.mettingen;
  const recke = data.recke;

  const toLines = (obj: any, fallback: string[]) =>
    obj?.opening_ours?.weekdayDescriptions || obj?.current_opening_hours?.weekdayDescriptions || fallback;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 shadow">
        <h3 className="font-semibold mb-2">Mettingen</h3>
        <WeekTable lines={toLines(mettingen, mettingen.fallback.weekday_text)} />
        <p className="mt-2 text-xs opacity-60">Quelle: {mettingen.source}</p>
      </div>
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 shadow">
        <h3 className="font-semibold mb-2">Recke</h3>
        <WeekTable lines={toLines(recke, recke.fallback.weekday_text)} />
        <p className="mt-2 text-xs opacity-60">Quelle: {recke.source}</p>
      </div>
    </div>
  );
}