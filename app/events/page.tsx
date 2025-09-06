// /app/events/page.tsx
import EventsList from '../components/events-list';

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Veranstaltungen</h1>
      <p className="text-sm opacity-80">Feiertage und Sonderöffnungen pflegst du zentral in Google Business - die Website zeigt diese automatisch über die Places-API an.</p>
      <EventsList />
    </div>
  );
}