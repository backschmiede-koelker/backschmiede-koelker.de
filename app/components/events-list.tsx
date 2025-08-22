import { events } from '../data/events';
import { fmtDate } from '../lib/time';

export default function EventsList() {
  const sorted = [...events].sort((a,b)=> new Date(a.start).getTime() - new Date(b.start).getTime());
  return (
    <div className="space-y-4">
      {sorted.map(e => (
        <div key={e.id} className="rounded-xl p-4 bg-white dark:bg-zinc-800 shadow">
          <h3 className="font-semibold">{e.title}</h3>
          <p className="text-sm opacity-80">
            {fmtDate(e.start, { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            {e.end && ` – ${fmtDate(e.end, { hour: '2-digit', minute: '2-digit' })}`}
          </p>
          {e.location && <p className="text-sm">📍 {e.location}</p>}
          {e.description && <p className="text-sm mt-1">{e.description}</p>}
        </div>
      ))}
      <a href="/api/ics" className="inline-flex items-center gap-2 text-sm font-medium underline">Kalender abonnieren (ICS)</a>
    </div>
  );
}